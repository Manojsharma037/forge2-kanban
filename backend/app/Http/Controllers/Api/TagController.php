<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Tag;
use Illuminate\Http\Request;

class TagController extends Controller
{
    public function index(Request $request)
    {
        return Tag::query()
            ->when($request->board_id, fn ($q, $boardId) => $q->where('board_id', $boardId))
            ->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'board_id' => 'required|exists:boards,id',
            'name'     => 'required|string|max:255',
            'color'    => 'nullable|string|max:32',
        ]);

        return response()->json(Tag::create($data), 201);
    }

    public function show(string $id)
    {
        return Tag::findOrFail($id);
    }

    public function update(Request $request, string $id)
    {
        $tag = Tag::findOrFail($id);

        $data = $request->validate([
            'name'  => 'sometimes|string|max:255',
            'color' => 'nullable|string|max:32',
        ]);

        $tag->update($data);

        return $tag;
    }

    public function destroy(string $id)
    {
        Tag::destroy($id);

        return response()->json(['message' => 'Tag deleted']);
    }
}
