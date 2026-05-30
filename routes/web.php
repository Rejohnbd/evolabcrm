<?php

use App\Http\Controllers\WelcomeController;
use Illuminate\Support\Facades\Route;

// Route::inertia('/', 'welcome')->name('home');
Route::get('/', [WelcomeController::class, 'index'])->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
});

require __DIR__ . '/settings.php';
