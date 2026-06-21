<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Card extends Model
{
    protected $fillable = [
        'list_id',
        'title',
        'description',
        'assigned_member_id',
        'due_date',
        'position'
    ];

    public function list()
    {
        return $this->belongsTo(BoardList::class);
    }

    public function assignedMember()
    {
        return $this->belongsTo(Member::class, 'assigned_member_id');
    }

    public function tags()
    {
        return $this->belongsToMany(Tag::class);
    }
}