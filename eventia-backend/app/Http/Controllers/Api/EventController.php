<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Event;
use Illuminate\Http\Request;

class EventController extends Controller
{
    // Crear evento 
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'date_time' => 'required|date',
            'capacity' => 'required|integer|min:1',
            'modality' => 'required|string',
            'location' => 'required|string',
        ]);

        $event = Event::create($request->all());
        return response()->json(['message' => 'Evento creado', 'data' => $event], 201);
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
