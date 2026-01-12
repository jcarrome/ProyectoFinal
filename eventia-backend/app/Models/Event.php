<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Event extends Model
{
    protected $fillable = [
        'title', 'description', 'date_time', 
        'capacity', 'modality', 'location', 
        'agenda', 'is_cancelled'
    ];

    /**
     * Obtener los RSVPs del evento
     */
    public function rsvps(): HasMany
    {
        return $this->hasMany(Rsvp::class);
    }
}
