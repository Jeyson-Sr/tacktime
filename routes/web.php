<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {

    return Inertia::render('Home', ['canRegister' => Features::enabled(Features::registration()),]);

})->middleware(['auth', 'verified'])->name('home');


Route::get('/dashboard/oee', function () {
    return Inertia::render('Dashboard/OeeDashboard');
});


require __DIR__.'/settings.php';
require __DIR__.'/api.php';
require __DIR__.'/Oee.php';
