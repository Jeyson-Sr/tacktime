<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\OeeProductionController;

Route::middleware(['auth', 'verified'])->prefix('oee')->group(function () {
    Route::post('/sync', [OeeProductionController::class, 'sync']);

    Route::get('/productions', [OeeProductionController::class, 'index']);
    Route::get('/productions/{id}', [OeeProductionController::class, 'show']);

    Route::get('/charts/oee-by-line', [OeeProductionController::class, 'oeeByLine']);
});
