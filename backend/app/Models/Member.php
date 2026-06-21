<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Member extends Model
{
    protected $fillable = [
        'name',
        'email'
    ];

    public function boards()
    {
        return $this->belongsToMany(Board::class);
    }

    public function assignedCards()
    {
        return $this->hasMany(Card::class, 'assigned_member_id');
    }
}