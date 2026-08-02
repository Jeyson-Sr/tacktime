<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;
use App\Http\Controllers\Api\StopCodeController;

$home = function () {
    return Inertia::render('Home', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
};

Route::middleware(['auth', 'verified'])->group(function () use ($home) {
    Route::get('/', $home)->name('home');
    Route::get('/dashboard', $home)->name('dashboard');

    Route::get('/dashboard/oee', function () {
        return Inertia::render('Dashboard/OeeDashboard');
    });

    Route::get('/stop-codes', [StopCodeController::class, 'index']);
});

require __DIR__.'/settings.php';
require __DIR__.'/api.php';
require __DIR__.'/Oee.php';
