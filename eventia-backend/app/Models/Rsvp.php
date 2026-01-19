<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Rsvp extends Model
{
    protected $fillable = [
        'event_id', 
        'user_name', 
        'user_email', 
        'status', 
        'checked_in',
        'waitlist_position',
        'promoted_at'
    ];

    protected $casts = [
        'checked_in' => 'boolean',
        'promoted_at' => 'datetime',
    ];

    // Constantes para estados
    const STATUS_PENDIENTE = 'pendiente';
    const STATUS_CONFIRMADO = 'confirmado';
    const STATUS_CANCELADO = 'cancelado';
    const STATUS_EN_ESPERA = 'en_espera';

    // Relación con Evento
    public function event()
    {
        return $this->belongsTo(Event::class);
    }

    // Scope para obtener confirmados
    public function scopeConfirmados($query)
    {
        return $query->where('status', self::STATUS_CONFIRMADO);
    }

    // Scope para obtener en lista de espera ordenados por posición
    public function scopeEnEspera($query)
    {
        return $query->where('status', self::STATUS_EN_ESPERA)
                     ->orderBy('waitlist_position', 'asc');
    }

    // Verificar si está en lista de espera
    public function estaEnEspera(): bool
    {
        return $this->status === self::STATUS_EN_ESPERA;
    }

    // Verificar si está confirmado
    public function estaConfirmado(): bool
    {
        return $this->status === self::STATUS_CONFIRMADO;
    }
}
