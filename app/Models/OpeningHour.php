<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OpeningHour extends Model
{
    protected $fillable = [
        'opening_time',
        'closing_time',
        'closed'
    ];
}
