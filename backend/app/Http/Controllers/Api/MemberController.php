<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Member;
use Illuminate\Http\Request;

class MemberController extends Controller
{
    public function index(Request $request)
    {
        return Member::query()
            ->when($request->board_id, fn ($q, $boardId) =>
                $q->whereHas('boards', fn ($b) => $b->where('boards.id', $boardId)))
            ->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|email|unique:members,email',
            'board_id' => 'nullable|exists:boards,id',
        ]);

        $member = Member::create([
            'name'  => $data['name'],
            'email' => $data['email'],
        ]);

        if ($request->board_id) {
            $member->boards()->syncWithoutDetaching([$request->board_id]);
        }

        return response()->json($member, 201);
    }

    public function show(string $id)
    {
        return Member::with('boards')->findOrFail($id);
    }

    public function update(Request $request, string $id)
    {
        $member = Member::findOrFail($id);

        $data = $request->validate([
            'name'  => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:members,email,' . $member->id,
        ]);

        $member->update($data);

        return $member;
    }

    public function destroy(string $id)
    {
        Member::destroy($id);

        return response()->json(['message' => 'Member deleted']);
    }
}
