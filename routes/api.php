<?php

use ArchitectureCible\Presentation\Http\Controllers\Api\AuthController;
use ArchitectureCible\Presentation\Http\Controllers\Api\NoteController;
use ArchitectureCible\Presentation\Http\Controllers\Api\TagController;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->group(function () {
    Route::post('login', [AuthController::class, 'login'])->middleware('throttle:5,1');
    Route::post('logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
    Route::get('user', [AuthController::class, 'user'])->middleware('auth:sanctum');
});

Route::middleware('auth:sanctum')->group(function () {
    Route::get('notes', [NoteController::class, 'index']);
    Route::post('notes', [NoteController::class, 'store']);
    Route::put('notes/{noteId}', [NoteController::class, 'update']);
    Route::delete('notes/{noteId}', [NoteController::class, 'destroy']);
    Route::get('tags', [TagController::class, 'index']);
    Route::post('tags', [TagController::class, 'store']);
});


