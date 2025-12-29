<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Rsvp extends Model
{
    protected $fillable = ['event_id', 'user_name', 'user_email', 'status', 'checked_in'];

    // Relación con Evento
    public function event() {
        return $this->belongsTo(Event::class);
    }
}
