<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\EventController; // Asegúrate de que esta línea coincida con tu carpeta
use App\Http\Controllers\Api\RsvpController;
use App\Http\Controllers\Api\AttendanceController;

Route::get('/events/{id}/report', [AttendanceController::class, 'report']);
Route::post('/events', [EventController::class, 'store']);
Route::put('/events/{id}', [EventController::class, 'update']);
Route::delete('/events/{id}', [EventController::class, 'destroy']);
Route::post('/rsvp', [RsvpController::class, 'store']);
Route::post('/check-in', [AttendanceController::class, 'checkIn']);
Route::get('/events/{id}/report', [AttendanceController::class, 'report']);