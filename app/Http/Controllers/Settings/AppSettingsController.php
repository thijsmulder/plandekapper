<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\AppSetting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AppSettingsController extends Controller
{
    public function edit(): Response
    {
        $settings = AppSetting::whereIn('setting_name', ['show_prices', 'weeks_ahead'])
            ->pluck('setting_value', 'setting_name');

        return Inertia::render('settings/app-settings', [
            'show_prices' => (int) $settings['show_prices'] ?? 0,
            'weeks_ahead' => (int) $settings['weeks_ahead'] ?? 4,
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'show_prices' => ['required', 'in:0,1'],
            'weeks_ahead' => ['required', 'integer', 'min:1', 'max:8'],
        ]);

        foreach ($validated as $key => $value) {
            AppSetting::updateOrCreate(
                ['setting_name' => $key],
                ['setting_value' => $value]
            );
        }

        return back()->with('success', 'Instellingen opgeslagen.');
    }
}
