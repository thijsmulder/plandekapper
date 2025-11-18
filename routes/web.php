<?php

use App\Http\Controllers\BookingController;
use App\Http\Controllers\ClientController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\OpeningHourController;
use App\Http\Controllers\TimelineController;
use App\Http\Controllers\TreatmentController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::resource('tijdlijn', TimelineController::class)
        ->names('timeline')
        ->parameters(['tijdlijn' => 'appointment']);

    Route::get('behandelingen/aanmaken', [TreatmentController::class, 'create'])->name('treatments.create');
    Route::get('behandelingen/{treatment}/bewerken', [TreatmentController::class, 'edit'])->name('treatments.edit');
    Route::resource('behandelingen', TreatmentController::class)
        ->except(['create', 'edit'])
        ->names('treatments')
        ->parameters(['behandelingen' => 'treatment']);

    Route::get('medewerkers/aanmaken', [EmployeeController::class, 'create'])->name('employees.create');
    Route::get('medewerkers/{employee}/bewerken', [EmployeeController::class, 'edit'])->name('employees.edit');
    Route::resource('medewerkers', EmployeeController::class)
        ->except(['create', 'edit'])
        ->names('employees')
        ->parameters(['medewerkers' => 'employee']);

    Route::get('klanten/aanmaken', [ClientController::class, 'create'])->name('clients.create');
    Route::get('klanten/{client}/bewerken', [ClientController::class, 'edit'])->name('clients.edit');
    Route::resource('klanten', ClientController::class)
        ->except(['create', 'edit'])
        ->names('clients')
        ->parameters(['klanten' => 'client']);


    Route::get('/openingstijden', [OpeningHourController::class, 'index'])->name('opening-hours.index');
    Route::post('/openingstijden', [OpeningHourController::class, 'update'])->name('opening-hours.update');
});

Route::get('/afspraak', [BookingController::class, 'index'])->name('booking');
Route::post('/afspraak/available-times', [BookingController::class, 'availableTimes'])->name('booking.available-times');
Route::get('/afspraak/employees-by-treatment', [BookingController::class, 'availableEmployeesByTreatment'])->name('booking.employees');
Route::post('/afspraak/create', [BookingController::class, 'createAppointment'])->name('booking.create');
Route::get('/afspraak/bevestig/{token}', [BookingController::class, 'confirm'])->name('booking.confirm');
Route::get('/afspraak/bevestigd', function () {
    return Inertia::render('booking/confirmed');
})->name('booking.confirmed');

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
