<?php

namespace App\Http\Controllers;

use App\Models\OpeningHour;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class OpeningHourController extends Controller
{
    private const DAYS = ['maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag', 'zondag'];

    /**
     * @return Response
     */
    public function index(): Response
    {
        $records = OpeningHour::select('day', 'opening_time', 'closing_time', 'closed')
            ->get()
            ->keyBy('day');

        $openingOptions = collect(range(0, 19))
            ->flatMap(fn($h) => [$this->formatHour($h, 0), $h < 19 ? $this->formatHour($h, 30) : null])
            ->filter()
            ->values();

        $closingOptions = collect(range(9, 23))
            ->flatMap(fn($h) => [$this->formatHour($h, 0), $h < 23 ? $this->formatHour($h, 30) : null])
            ->filter()
            ->values();

        $openingHours = collect(self::DAYS)->mapWithKeys(function ($day) use ($records) {
            $record = $records[$day] ?? null;

            return [
                $day => [
                    'open' => $record?->opening_time ? substr($record->opening_time, 0, 5) : null,
                    'close' => $record?->closing_time ? substr($record->closing_time, 0, 5) : null,
                    'isClosed' => (bool) ($record?->closed ?? false),
                ],
            ];
        });

        return Inertia::render('opening-hours/index', [
            'openingHours' => $openingHours,
            'openingOptions' => $openingOptions,
            'closingOptions' => $closingOptions,
        ]);
    }

    /**
     * @param Request $request
     * @return RedirectResponse
     */
    public function update(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'openingHours' => 'required|array',
            'openingHours.*.isClosed' => 'required|boolean',
            'openingHours.*.open' => 'nullable|string',
            'openingHours.*.close' => 'nullable|string',
        ]);

        $openingHours = $data['openingHours'];
        $errors = [];

        foreach ($openingHours as $day => $times) {
            if (!in_array($day, self::DAYS, true)) {
                $errors["openingHours.{$day}"] = 'Ongeldige dag.';
                continue;
            }

            if (!$times['isClosed']) {
                if (empty($times['open']) || !$this->isValidTime($times['open'], '00:00', '19:00')) {
                    $errors["openingHours.{$day}.open"] = 'Openingstijd moet tussen 00:00 en 19:00 liggen';
                }

                if (empty($times['close']) || !$this->isValidTime($times['close'], '09:00', '23:00')) {
                    $errors["openingHours.{$day}.close"] = 'Sluitingstijd moet tussen 09:00 en 23:00 liggen';
                }

                if (!empty($times['open']) && !empty($times['close']) &&
                    strtotime($times['open']) >= strtotime($times['close'])) {
                    $errors["openingHours.{$day}.close"] = 'Sluitingstijd moet later zijn dan openingstijd';
                }
            }
        }

        if (!empty($errors)) {
            return back()->withErrors($errors)->withInput();
        }

        try {
            DB::transaction(function () use ($openingHours) {
                foreach ($openingHours as $day => $times) {
                    OpeningHour::updateOrInsert(
                        ['day' => $day],
                        [
                            'opening_time' => $times['isClosed'] ? null : $times['open'],
                            'closing_time' => $times['isClosed'] ? null : $times['close'],
                            'closed' => $times['isClosed'],
                            'updated_at' => now(),
                        ]
                    );
                }
            });

            return redirect()->back()->with('flash.success', 'Openingstijden succesvol opgeslagen');
        } catch (\Throwable $e) {
            Log::error('Fout bij opslaan openingstijden', ['error' => $e->getMessage()]);
            return redirect()->back()->with('flash.error', 'Opslaan is mislukt, probeer het opnieuw');
        }
    }

    /**
     * @param int $hour
     * @param int $minutes
     * @return string
     */
    private function formatHour(int $hour, int $minutes): string
    {
        return sprintf('%02d:%02d', $hour, $minutes);
    }

    /**
     * @param string $time
     * @param string $min
     * @param string $max
     * @return bool
     */
    private function isValidTime(string $time, string $min, string $max): bool
    {
        return strtotime($time) >= strtotime($min) && strtotime($time) <= strtotime($max);
    }
}
