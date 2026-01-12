<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\EventController;
use App\Http\Controllers\Api\RsvpController;
use App\Http\Controllers\Api\AttendanceController;

// Eventos
Route::get('/events', [EventController::class, 'index']);
Route::get('/events/{id}', [EventController::class, 'show']);
Route::post('/events', [EventController::class, 'store']);
Route::put('/events/{id}', [EventController::class, 'update']);
Route::delete('/events/{id}', [EventController::class, 'destroy']);

// RSVP
Route::post('/rsvp', [RsvpController::class, 'store']);

// Asistencia
Route::post('/check-in', [AttendanceController::class, 'checkIn']);
Route::get('/events/{id}/report', [AttendanceController::class, 'report']);