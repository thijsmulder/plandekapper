<?php

namespace App\Http\Controllers;

use App\Mail\AppointmentConfirmation;
use App\Models\{Appointment, Category, Client, Company, Employee, Treatment};
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Inertia\Inertia;

class BookingController extends Controller
{
    public function index()
    {
        $settings = \App\Models\AppSetting::pluck('setting_value', 'setting_name');

        return Inertia::render('booking/index', [
            'bookingLink' => route('booking'),
            'settings' => [
                'show_prices' => $settings['show_prices'] ?? '0', // Als fallback standaard niet tonen
                'weeks_ahead' => $settings['weeks_ahead'] ?? '4',
            ],
            'categories' => Category::select('id', 'name')
                ->where('id', '!=', 1)
                ->orderBy('id')
                ->get()
                ->push(Category::select('id', 'name')->find(1)),
            'treatments' => Treatment::where('active', true)
                ->whereHas('employees')
                ->select('id', 'name', 'price', 'duration_in_minutes', 'category_id')
                ->get(),
            'employees' => Employee::select('id', 'first_name', 'last_name')
                ->get(),
        ]);
    }

    public function availableTimes(Request $request)
    {
        $request->validate([
            'employeeId' => 'required|integer',
            'date' => 'required|date',
            'treatmentId' => 'required|integer',
        ]);

        // Parse date met juiste timezone en zet naar begin van dag
        $carbonDate = Carbon::createFromFormat('Y-m-d', $request->date, 'Europe/Amsterdam')->startOfDay();

        // Dagnaam in Engels, lowercase, want database verwacht dat waarschijnlijk
        $dayName = strtolower($carbonDate->locale('nl')->dayName);

        $openingHours = \App\Models\OpeningHour::where('day', $dayName)
            ->select('day', 'opening_time', 'closing_time', 'closed')
            ->first();

        if (!$openingHours || $openingHours->closed) {
            return response()->json([]);
        }

        $duration = Treatment::findOrFail($request->treatmentId)->duration_in_minutes ?? 30;

        $start = $carbonDate->copy()->setTimeFromTimeString($openingHours->opening_time);
        $end = $carbonDate->copy()->setTimeFromTimeString($openingHours->closing_time);

        $available = [];

        while ($start->copy()->addMinutes($duration)->lte($end)) {
            $conflict = Appointment::where('employee_id', $request->employeeId)
                ->whereDate('start_time', $carbonDate->toDateString())
                ->where(function ($query) use ($start, $duration) {
                    $query->whereBetween('start_time', [$start, $start->copy()->addMinutes($duration)->subSecond()])
                        ->orWhereBetween('finish_time', [$start->copy()->addSecond(), $start->copy()->addMinutes($duration)]);
                })
                ->exists();

            if (!$conflict) {
                $available[] = $start->format('H:i');
            }

            $start->addMinutes(30);
        }

        return response()->json($available);
    }

    public function availableEmployeesByTreatment(Request $request)
    {
        $request->validate([
            'treatmentId' => 'required|integer|exists:treatments,id',
        ]);

        $treatmentId = $request->treatmentId;

        // Haal alle medewerkers op die deze behandeling kunnen doen
        $employees = Employee::whereHas('treatments', function ($query) use ($treatmentId) {
            $query->where('treatment_id', $treatmentId);
        })->select('id', 'first_name', 'last_name')->get();

        return response()->json($employees);
    }

    public function createAppointment(Request $request)
    {
        $request->validate([
            'name' => 'required|string',
            'email' => 'required|email',
            'employeeId' => 'required|integer',
            'treatmentId' => 'required|integer',
            'date' => 'required|date',
            'time' => 'required|string',
        ]);

        $client = Client::firstOrCreate(
            ['email' => $request->email],
            ['name' => $request->name]
        );

        $start = Carbon::parse("{$request->date} {$request->time}");
        $duration = Treatment::findOrFail($request->treatmentId)->duration_in_minutes ?? 30;
        $finish = $start->copy()->addMinutes($duration);
        $token = Str::uuid();

        $appointment = Appointment::create([
            'start_time' => $start,
            'finish_time' => $finish,
            'client_id' => $client->id,
            'employee_id' => $request->employeeId,
            'treatment_id' => $request->treatmentId,
            'appointment_status_id' => Appointment::WAITING_FOR_CONFIRMATION,
            'confirmation_token' => $token
        ]);

        Mail::to($client->email)->send(new AppointmentConfirmation($appointment, $client, 'Rimmelzwaan'));

        return response()->json(['success' => true, 'step' => 6]);
    }

    public function confirm(string $token)
    {
        $appointment = Appointment::where('confirmation_token', $token)->firstOrFail();
        $appointment->update([
            'appointment_status_id' => 2,
            'confirmation_token' => null,
        ]);

        return redirect()->route('booking.confirmed');
    }
}
