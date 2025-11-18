<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Employee extends Model
{
    use SoftDeletes;

    protected $fillable = ['first_name', 'infix', 'last_name', 'email', 'phone'];

    public function appointments()
    {
        return $this->hasMany(Appointment::class);
    }

    public function treatments()
    {
        return $this->belongsToMany(Treatment::class, 'employee_treatments')->withTimestamps();
    }
}
