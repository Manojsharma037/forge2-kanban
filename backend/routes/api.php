<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\BoardController;
use App\Http\Controllers\Api\ListController;
use App\Http\Controllers\Api\CardController;
use App\Http\Controllers\Api\TagController;
use App\Http\Controllers\Api\MemberController;

Route::apiResource('boards', BoardController::class);
Route::apiResource('lists', ListController::class);
Route::apiResource('cards', CardController::class);
Route::apiResource('tags', TagController::class);
Route::apiResource('members', MemberController::class);
