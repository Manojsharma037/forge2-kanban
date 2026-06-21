<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json([
        'name'    => 'Forge Kanban API',
        'status'  => 'ok',
        'docs'    => 'https://github.com/Manojsharma037/forge2-kanban',
        'endpoints' => [
            'boards'  => '/api/boards',
            'lists'   => '/api/lists',
            'cards'   => '/api/cards',
            'tags'    => '/api/tags',
            'members' => '/api/members',
        ],
    ]);
});
