<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Board extends Model
{
    protected $fillable = [
        'name',
        'description'
    ];

    public function lists()
    {
        return $this->hasMany(BoardList::class, 'board_id')->orderBy('position');
    }

    public function tags()
    {
        return $this->hasMany(Tag::class);
    }

    public function members()
    {
        return $this->belongsToMany(Member::class);
    }
}