<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Event;
use Illuminate\Http\Request;

class EventController extends Controller
{
    // Listar todos los eventos
    public function index()
    {
        $events = Event::where('is_cancelled', false)->get();
        return response()->json(['data' => $events], 200);
    }

    // Obtener evento específico con sus RSVPs
    public function show($id)
    {
        $event = Event::with('rsvps')->findOrFail($id);
        return response()->json(['data' => $event, 'rsvps' => $event->rsvps], 200);
    }

    // Crear evento 
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'date_time' => 'required|date_format:Y-m-d H:i',
            'capacity' => 'required|integer|min:1',
            'modality' => 'required|string|in:Presencial,Virtual,Híbrido',
            'location' => 'required|string',
        ], [
            'date_time.date_format' => 'El formato de fecha no es válido',
            'modality.in' => 'La modalidad debe ser Presencial, Virtual o Híbrido',
        ]);

        $event = Event::create($validated);
        return response()->json(['message' => 'Evento creado correctamente', 'data' => $event], 201);
    }

    // Editar evento 
    public function update(Request $request, $id)
    {
        $event = Event::findOrFail($id);
        $event->update($request->all());
        return response()->json(['message' => 'Evento actualizado', 'data' => $event], 200);
    }

    // Cancelar evento 
    public function destroy($id)
    {
        $event = Event::findOrFail($id);
        $event->update(['is_cancelled' => true]);
        return response()->json(['message' => 'Evento marcado como cancelado'], 200);
    }
}
