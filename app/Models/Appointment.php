<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Appointment extends Model
{
    const WAITING_FOR_CONFIRMATION = 1;
    const APPOINTMENT_CONFIRMED = 2;

    protected $fillable = [
        'start_time',
        'finish_time',
        'client_id',
        'employee_id',
        'treatment_id',
        'appointment_status_id',
        'confirmation_token',
    ];

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    public function treatment(): BelongsTo
    {
        return $this->belongsTo(Treatment::class);
    }

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }
}
