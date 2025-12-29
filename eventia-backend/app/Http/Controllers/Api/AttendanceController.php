<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Rsvp;
use Illuminate\Http\Request;

class AttendanceController extends Controller
{
    public function checkIn(Request $request)
    {
        // Validar que el ID enviado exista en la tabla de rsvps [cite: 16]
        $request->validate(['rsvp_id' => 'required|exists:rsvps,id']);
        
        $rsvp = Rsvp::find($request->rsvp_id);
        
        // Actualizar el estado de asistencia [cite: 17, 27]
        $rsvp->checked_in = true;
        $rsvp->save();

        return response()->json(['message' => 'Check-in exitoso', 'data' => $rsvp], 200);
    }
    public function report($eventId)
{
    // Buscamos el evento, si no existe lanzará un 404 automáticamente
    $event = \App\Models\Event::findOrFail($eventId);

    // Contamos confirmados (todos los RSVPs para este evento)
    $totalConfirmed = \App\Models\Rsvp::where('event_id', $eventId)->count();

    // Contamos presentes (RSVPs con checked_in = true)
    $totalPresent = \App\Models\Rsvp::where('event_id', $eventId)
        ->where('checked_in', true)
        ->count();

    return response()->json([
        'evento' => $event->title,
        'resumen' => [
            'total_confirmados' => $totalConfirmed,
            'total_presentes' => $totalPresent,
            'porcentaje_asistencia' => $totalConfirmed > 0 
                ? round(($totalPresent / $totalConfirmed) * 100, 2) . '%' 
                : '0%'
        ],
        'listado_asistentes' => \App\Models\Rsvp::where('event_id', $eventId)->get()
    ], 200);
}
}