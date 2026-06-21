<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Card;
use Illuminate\Http\Request;

class CardController extends Controller
{
    public function index()
    {
        return Card::with([
            'tags',
            'assignedMember'
        ])->orderBy('position')->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'list_id'            => 'required|exists:lists,id',
            'title'              => 'required|string|max:255',
            'description'        => 'nullable|string',
            'assigned_member_id' => 'nullable|exists:members,id',
            'due_date'           => 'nullable|date',
            'position'           => 'nullable|integer',
            'tag_ids'            => 'nullable|array',
            'tag_ids.*'          => 'integer|exists:tags,id',
        ]);

        $card = Card::create($data);

        if ($request->has('tag_ids')) {
            $card->tags()->sync($request->input('tag_ids', []));
        }

        return response()->json($card->load(['tags', 'assignedMember']), 201);
    }

    public function show(string $id)
    {
        return Card::with([
            'tags',
            'assignedMember'
        ])->findOrFail($id);
    }

    public function update(Request $request, string $id)
    {
        $card = Card::findOrFail($id);

        $data = $request->validate([
            'list_id'            => 'sometimes|exists:lists,id',
            'title'              => 'sometimes|string|max:255',
            'description'        => 'nullable|string',
            'assigned_member_id' => 'nullable|exists:members,id',
            'due_date'           => 'nullable|date',
            'position'           => 'nullable|integer',
            'tag_ids'            => 'nullable|array',
            'tag_ids.*'          => 'integer|exists:tags,id',
        ]);

        $card->update($data);

        if ($request->has('tag_ids')) {
            $card->tags()->sync($request->input('tag_ids', []));
        }

        return $card->load(['tags', 'assignedMember']);
    }

    public function destroy(string $id)
    {
        Card::destroy($id);

        return response()->json([
            'message' => 'Card deleted'
        ]);
    }
}
