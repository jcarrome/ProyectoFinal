<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Rsvp;
use App\Models\Event;
use Illuminate\Http\Request;

class RsvpController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'event_id' => 'required|exists:events,id',
            'user_name' => 'required|string',
            'user_email' => 'required|email',
        ]);

        $event = Event::findOrFail($request->event_id);

        // Validar si aún hay cupo
        $count = Rsvp::where('event_id', $event->id)->where('status', 'confirmado')->count();

        if ($count >= $event->capacity) {
            return response()->json(['message' => 'Lo sentimos, el cupo para este evento está lleno.'], 400);
        }

        $rsvp = Rsvp::create($request->all());

        return response()->json([
            'message' => 'Registro (RSVP) exitoso',
            'data' => $rsvp
        ], 201);
    }
}
