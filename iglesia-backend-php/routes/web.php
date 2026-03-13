<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PublicController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\MediaController;

// ==================== PUBLIC ROUTES (Frontend) ====================
Route::prefix('public')->group(function () {
    Route::get('/config/home', [PublicController::class, 'getHomeConfig']);
    Route::get('/config/contact', [PublicController::class, 'getContactConfig']);
    Route::get('/config/layout', [PublicController::class, 'getLayoutConfig']);
    Route::get('/config/ministries', [PublicController::class, 'getMinistriesConfig']);
    Route::get('/config/ministries/{id}', [PublicController::class, 'getMinistryDetail']);
    Route::get('/config/meeting-days', [PublicController::class, 'getMeetingDaysConfig']);
    Route::get('/events/upcoming', [PublicController::class, 'getUpcomingEvents']);
    Route::get('/events/calendar', [PublicController::class, 'getCalendarEvents']);
});

// ==================== AUTH ====================
Route::prefix('auth')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/users', [AuthController::class, 'createUser'])->middleware('jwt.auth');
});

// ==================== MEDIA (Protected) ====================
Route::prefix('admin/media')->middleware('jwt.auth')->group(function () {
    Route::get('/', [MediaController::class, 'listMedia']);
    Route::post('/upload', [MediaController::class, 'uploadMedia']);
    Route::post('/upload-icon', [MediaController::class, 'uploadMedia']);
    Route::delete('/{id}', [MediaController::class, 'deleteMedia']);
});
