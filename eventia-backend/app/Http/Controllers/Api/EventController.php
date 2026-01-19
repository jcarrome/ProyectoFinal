<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Event;
use Illuminate\Http\Request;

class EventController extends Controller
{
    // Listar todos los eventos con filtros
    public function index(Request $request)
    {
        $query = Event::where('is_cancelled', false);

        // Filtro por búsqueda de texto (título o descripción)
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Filtro por fecha específica
        if ($request->has('date') && $request->date) {
            $query->whereDate('date_time', $request->date);
        }

        // Filtro por modalidad
        if ($request->has('modality') && $request->modality) {
            $query->where('modality', $request->modality);
        }

        // Filtro por rango de fechas
        if ($request->has('date_from') && $request->date_from) {
            $query->whereDate('date_time', '>=', $request->date_from);
        }
        if ($request->has('date_to') && $request->date_to) {
            $query->whereDate('date_time', '<=', $request->date_to);
        }

        // Ordenar por fecha (próximos eventos primero)
        $query->orderBy('date_time', 'asc');

        $events = $query->get();
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
