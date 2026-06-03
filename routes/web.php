<?php

use App\Http\Controllers\ManagerController;
use App\Http\Controllers\TechnicianController;
use App\Http\Controllers\WelcomeController;
use Illuminate\Support\Facades\Route;

// Route::inertia('/', 'welcome')->name('home');
Route::get('/', [WelcomeController::class, 'index'])->name('home');

// Technician routes
Route::post('/technician-login', [WelcomeController::class, 'technicianLogin'])->name('technician-login');
Route::middleware(['technician'])->group(function () {
    Route::get('/technician', [TechnicianController::class, 'index'])->name('technician');
    Route::post('/technician-shift-toggle', [TechnicianController::class, 'toggleShift'])->name('technician-shift-toggle');
});

// Manager routes
Route::post('/manager-login', [WelcomeController::class, 'managerLogin'])->name('manager-login');
Route::middleware(['manager'])->group(function () {
    Route::get('/manager', [ManagerController::class, 'index'])->name('manager');
});

Route::post('/evolab-logout', [WelcomeController::class, 'logout'])->name('evolab-logout')->middleware('auth');


// Route::prefix('evolab')->group(function () {
//     Route::get('/dashboard', [WelcomeController::class, 'technicianDashboard'])
//         ->name('evolab.dashboard');
//     Route::get('/manager-dashboard', [WelcomeController::class, 'managerDashboard'])
//         ->name('evolab.manager-dashboard');
//     Route::get('/checkin/{jobId}', [WelcomeController::class, 'checkin'])
//         ->name('evolab.checkin');
//     Route::get('/job/{jobId}', [WelcomeController::class, 'jobView'])
//         ->name('evolab.job');
//     Route::post('/complete-job/{jobId}', [WelcomeController::class, 'completeJob'])
//         ->name('evolab.complete-job');
//     Route::post('/logout', [WelcomeController::class, 'logout'])
//         ->name('evolab.logout');
// });

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
});

require __DIR__ . '/settings.php';
