<?php

use App\Http\Controllers\Settings\AppSettingsController;
use App\Http\Controllers\Settings\PasswordController;
use App\Http\Controllers\Settings\ProfileController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware('auth')->group(function () {
    Route::redirect('instellingen', 'instellingen/profiel');

    Route::get('instellingen/app', [AppSettingsController::class, 'edit'])->name('app.edit');
    Route::put('instellingen/app', [AppSettingsController::class, 'update'])->name('app.update');

    Route::get('instellingen/profiel', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('instellingen/profiel', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('instellingen/profiel', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('instellingen/wachtwoord', [PasswordController::class, 'edit'])->name('password.edit');
    Route::put('instellingen/wachtwoord', [PasswordController::class, 'update'])->name('password.update');

    Route::get('instellingen/weergave', function () {
        return Inertia::render('settings/appearance');
    })->name('appearance');
});
