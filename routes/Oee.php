<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\OeeDashboardController;
use App\Http\Controllers\Api\StopCodeController;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard/stop-codes', [StopCodeController::class, 'index']);

    Route::prefix('dashboard/oee')->group(function () {
        Route::get('/filters/options', [OeeDashboardController::class, 'filterOptions']);

        Route::get('/line-efficiencies', [OeeDashboardController::class, 'lineEfficiencies']);
        Route::get('/daily', [OeeDashboardController::class, 'dailyOee']);
        Route::get('/line-summary', [OeeDashboardController::class, 'lineSummary']);
        Route::get('/weekly', [OeeDashboardController::class, 'weeklyOee']);
        Route::get('/global', [OeeDashboardController::class, 'globalOee']);

        Route::get('/stop-codes-ranking', [OeeDashboardController::class, 'stopCodesRanking']);
        Route::get('/pareto-stops', [OeeDashboardController::class, 'paretoStops']);
    });
});
