<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {

    return Inertia::render('Home', ['canRegister' => Features::enabled(Features::registration()),]);

})->middleware(['auth', 'verified'])->name('home');

require __DIR__.'/settings.php';
