<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Illuminate\Support\Collection;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * @return Response
     */
    public function index(): Response
    {
        return Inertia::render('dashboard', [
            'getAppointmentsNextWeek' => $this->getAppointmentsNextWeek(),
        ]);
    }

    /**
     * Get the count appointments for the next week
     * @return Collection
     */
    private function getAppointmentsNextWeek(): Collection
    {
        Carbon::setLocale('nl');

        $now = Carbon::now()->startOfDay();
        $dates = [];

        for ($i = 0; $i < 7; $i++) {
            $date = $now->copy()->addDays($i);
            $dates[$date->toDateString()] = $date;
        }

        $counts = DB::table('appointments')
            ->whereBetween('start_time', [$now, $now->copy()->addDays(6)->endOfDay()])
            ->selectRaw('DATE(start_time) as date, COUNT(*) as count')
            ->groupBy('date')
            ->pluck('count', 'date');

        // Resultaat opbouwen zonder extra objecten
        return collect($dates)->map(function (Carbon $date, string $key) use ($counts) {
            return [
                'day' => $date->translatedFormat('D'),
                'date' => $key,
                'count' => $counts[$key] ?? 0,
            ];
        })->values(); // Zorg voor een nette array zonder keys
    }
}
