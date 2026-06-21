<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BoardList;
use Illuminate\Http\Request;

class ListController extends Controller
{
    public function index()
    {
        return BoardList::with('cards')->get();
    }

    public function store(Request $request)
    {
        return BoardList::create($request->all());
    }

    public function show(string $id)
    {
        return BoardList::with('cards')->findOrFail($id);
    }

    public function update(Request $request, string $id)
    {
        $list = BoardList::findOrFail($id);

        $list->update($request->all());

        return $list;
    }

    public function destroy(string $id)
    {
        BoardList::destroy($id);

        return response()->json(['message' => 'List deleted']);
    }
}