<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Board;
use Illuminate\Http\Request;

class BoardController extends Controller
{
    public function index()
    {
        return Board::with(['lists.cards.tags'])->get();
    }

    public function store(Request $request)
    {
        $board = Board::create([
            'name' => $request->name,
            'description' => $request->description
        ]);

        return response()->json($board, 201);
    }

    public function show(string $id)
    {
        return Board::with([
            'lists.cards.tags',
            'lists.cards.assignedMember',
            'members',
            'tags'
        ])->findOrFail($id);
    }

    public function update(Request $request, string $id)
    {
        $board = Board::findOrFail($id);

        $board->update($request->all());

        return $board;
    }

    public function destroy(string $id)
    {
        Board::destroy($id);

        return response()->json([
            'message' => 'Board deleted'
        ]);
    }
}