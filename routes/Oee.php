<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\OeeDashboardController;
use App\Http\Controllers\Api\StopCodeController;



Route::get('/dashboard/stop-codes', [StopCodeController::class, 'index']);

Route::prefix('dashboard/oee')->group(function () {
    Route::get('/line-efficiencies', [OeeDashboardController::class, 'lineEfficiencies']);
    Route::get('/daily', [OeeDashboardController::class, 'dailyOee']);
    Route::get('/line-summary', [OeeDashboardController::class, 'lineSummary']);
    Route::get('/weekly', [OeeDashboardController::class, 'weeklyOee']);
    Route::get('/global', [OeeDashboardController::class, 'globalOee']);
});