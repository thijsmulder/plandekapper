<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    public function treatments()
    {
        return $this->hasMany(Treatment::class);
    }
}
