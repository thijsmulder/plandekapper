<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\Employee;
use App\Models\OpeningHour;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class TimelineController extends Controller
{
    use AuthorizesRequests;

    public function index(Request $request)
    {
        $this->authorize('viewAny', Appointment::class);

        $date = $request->input('date', now()->toDateString());
        $carbonDate = Carbon::parse($date)->locale('nl');

        $startOfDay = $carbonDate->copy()->startOfDay();
        $endOfDay = $carbonDate->copy()->endOfDay();

        $dayName = strtolower($carbonDate->dayName);

        $openingHours = OpeningHour::where('day', $dayName)
            ->select('day', 'opening_time', 'closing_time', 'closed')
            ->first();

        $employees = Employee::select('id', 'first_name')
            ->with(['appointments' => function ($query) use ($startOfDay, $endOfDay) {
                $query->select('id', 'employee_id', 'client_id', 'treatment_id', 'start_time', 'finish_time', 'appointment_status_id')
                    ->whereBetween('start_time', [$startOfDay, $endOfDay])
                    ->with([
                        'treatment' => fn($q) => $q->withTrashed()->select('id', 'name', 'duration_in_minutes'),
                        'client:id,name,email',
                    ]);
            }])
            ->get();

        return Inertia::render('timeline/index', [
            'employees' => $employees,
            'selectedDate' => $date,
            'openingHours' => $openingHours,
        ]);
    }

    public function destroy(Appointment $appointment)
    {
        $this->authorize('delete', $appointment);

        try {
            $appointment->delete();
            return redirect()->back()->with('flash.success', 'Afspraak succesvol verwijderd');
        } catch (\Exception $e) {
            Log::error($e->getMessage());
            return redirect()->back()->with('flash.error', 'Er is iets misgegaan bij het verwijderen');
        }
    }
}
