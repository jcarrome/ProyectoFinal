<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Rsvp;
use App\Models\Event;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class RsvpController extends Controller
{
    /**
     * Registrar asistencia a un evento (RSVP)
     * Si hay cupo: confirma directamente
     * Si no hay cupo: agrega a lista de espera
     */
    public function store(Request $request)
    {
        $request->validate([
            'event_id' => 'required|exists:events,id',
            'user_name' => 'required|string|max:255',
            'user_email' => 'required|email|max:255',
        ]);

        $event = Event::findOrFail($request->event_id);

        // Verificar si el evento está cancelado
        if ($event->is_cancelled) {
            return response()->json([
                'message' => 'Este evento ha sido cancelado.'
            ], 400);
        }

        // Verificar si el usuario ya está registrado
        $existingRsvp = Rsvp::where('event_id', $event->id)
            ->where('user_email', $request->user_email)
            ->whereIn('status', [Rsvp::STATUS_CONFIRMADO, Rsvp::STATUS_EN_ESPERA])
            ->first();

        if ($existingRsvp) {
            $statusMessage = $existingRsvp->status === Rsvp::STATUS_EN_ESPERA 
                ? 'Ya estás en la lista de espera para este evento (posición #' . $existingRsvp->waitlist_position . ').'
                : 'Ya tienes una confirmación para este evento.';
            
            return response()->json([
                'message' => $statusMessage,
                'data' => $existingRsvp
            ], 400);
        }

        // Contar confirmados actuales
        $confirmados = Rsvp::where('event_id', $event->id)
            ->where('status', Rsvp::STATUS_CONFIRMADO)
            ->count();

        // Si hay cupo disponible, confirmar directamente
        if ($confirmados < $event->capacity) {
            $rsvp = Rsvp::create([
                'event_id' => $event->id,
                'user_name' => $request->user_name,
                'user_email' => $request->user_email,
                'status' => Rsvp::STATUS_CONFIRMADO,
            ]);

            return response()->json([
                'message' => '¡Registro exitoso! Tu asistencia ha sido confirmada.',
                'data' => $rsvp,
                'cupos_disponibles' => $event->capacity - $confirmados - 1
            ], 201);
        }

        // Si no hay cupo, agregar a lista de espera
        $ultimaPosicion = Rsvp::where('event_id', $event->id)
            ->where('status', Rsvp::STATUS_EN_ESPERA)
            ->max('waitlist_position') ?? 0;

        $rsvp = Rsvp::create([
            'event_id' => $event->id,
            'user_name' => $request->user_name,
            'user_email' => $request->user_email,
            'status' => Rsvp::STATUS_EN_ESPERA,
            'waitlist_position' => $ultimaPosicion + 1,
        ]);

        return response()->json([
            'message' => 'El evento está lleno. Has sido agregado a la lista de espera.',
            'data' => $rsvp,
            'posicion_en_espera' => $rsvp->waitlist_position,
            'en_lista_espera' => true
        ], 201);
    }

    /**
     * Cancelar asistencia (permite liberar cupo y promover de lista de espera)
     */
    public function cancel(Request $request)
    {
        $request->validate([
            'rsvp_id' => 'required_without:user_email',
            'user_email' => 'required_without:rsvp_id|email',
            'event_id' => 'required_with:user_email|exists:events,id',
        ]);

        // Buscar el RSVP por ID o por email+evento
        if ($request->has('rsvp_id')) {
            $rsvp = Rsvp::findOrFail($request->rsvp_id);
        } else {
            $rsvp = Rsvp::where('event_id', $request->event_id)
                ->where('user_email', $request->user_email)
                ->whereIn('status', [Rsvp::STATUS_CONFIRMADO, Rsvp::STATUS_EN_ESPERA])
                ->firstOrFail();
        }

        $estabaConfirmado = $rsvp->status === Rsvp::STATUS_CONFIRMADO;
        $eventId = $rsvp->event_id;

        // Cambiar estado a cancelado
        $rsvp->update(['status' => Rsvp::STATUS_CANCELADO]);

        $promocionado = null;

        // Si estaba confirmado, promover al primero de la lista de espera
        if ($estabaConfirmado) {
            $promocionado = $this->promoverSiguienteEnEspera($eventId);
        }

        $response = [
            'message' => 'Tu asistencia ha sido cancelada correctamente.',
            'data' => $rsvp
        ];

        if ($promocionado) {
            $response['promocion'] = [
                'message' => 'Se ha promovido a alguien de la lista de espera.',
                'usuario_promovido' => $promocionado->user_name
            ];
        }

        return response()->json($response, 200);
    }

    /**
     * Promover al siguiente en la lista de espera
     */
    private function promoverSiguienteEnEspera(int $eventId): ?Rsvp
    {
        $siguienteEnEspera = Rsvp::where('event_id', $eventId)
            ->where('status', Rsvp::STATUS_EN_ESPERA)
            ->orderBy('waitlist_position', 'asc')
            ->first();

        if (!$siguienteEnEspera) {
            return null;
        }

        // Promover a confirmado
        $siguienteEnEspera->update([
            'status' => Rsvp::STATUS_CONFIRMADO,
            'waitlist_position' => null,
            'promoted_at' => now(),
        ]);

        // Reordenar posiciones de los demás en espera
        $this->reordenarListaEspera($eventId);

        // Enviar notificación por correo
        $this->notificarPromocion($siguienteEnEspera);

        return $siguienteEnEspera;
    }

    /**
     * Reordenar la lista de espera después de una promoción
     */
    private function reordenarListaEspera(int $eventId): void
    {
        $enEspera = Rsvp::where('event_id', $eventId)
            ->where('status', Rsvp::STATUS_EN_ESPERA)
            ->orderBy('waitlist_position', 'asc')
            ->get();

        $posicion = 1;
        foreach ($enEspera as $rsvp) {
            $rsvp->update(['waitlist_position' => $posicion]);
            $posicion++;
        }
    }

    /**
     * Notificar por correo al usuario promovido
     */
    private function notificarPromocion(Rsvp $rsvp): void
    {
        try {
            $event = $rsvp->event;
            
            // Log de la notificación (en producción sería un correo real)
            Log::info("NOTIFICACIÓN DE PROMOCIÓN", [
                'usuario' => $rsvp->user_name,
                'email' => $rsvp->user_email,
                'evento' => $event->title,
                'mensaje' => "¡Felicidades! Se ha liberado un cupo y tu asistencia al evento '{$event->title}' ha sido confirmada."
            ]);

            // En producción, descomentar para enviar correo real:
            // Mail::to($rsvp->user_email)->send(new WaitlistPromotionMail($rsvp, $event));

        } catch (\Exception $e) {
            Log::error("Error al notificar promoción: " . $e->getMessage());
        }
    }

    /**
     * Ver estado de lista de espera de un evento
     */
    public function waitlist(int $eventId)
    {
        $event = Event::findOrFail($eventId);
        
        $waitlist = Rsvp::where('event_id', $eventId)
            ->where('status', Rsvp::STATUS_EN_ESPERA)
            ->orderBy('waitlist_position', 'asc')
            ->get(['id', 'user_name', 'user_email', 'waitlist_position', 'created_at']);

        $confirmados = Rsvp::where('event_id', $eventId)
            ->where('status', Rsvp::STATUS_CONFIRMADO)
            ->count();

        return response()->json([
            'evento' => $event->title,
            'capacidad' => $event->capacity,
            'confirmados' => $confirmados,
            'cupos_disponibles' => max(0, $event->capacity - $confirmados),
            'en_lista_espera' => $waitlist->count(),
            'lista_espera' => $waitlist
        ], 200);
    }

    /**
     * Consultar estado de registro por email
     */
    public function status(Request $request)
    {
        $request->validate([
            'event_id' => 'required|exists:events,id',
            'user_email' => 'required|email',
        ]);

        $rsvp = Rsvp::where('event_id', $request->event_id)
            ->where('user_email', $request->user_email)
            ->first();

        if (!$rsvp) {
            return response()->json([
                'message' => 'No se encontró un registro con ese correo para este evento.',
                'registrado' => false
            ], 404);
        }

        $response = [
            'registrado' => true,
            'data' => $rsvp,
            'estado' => $rsvp->status,
        ];

        if ($rsvp->status === Rsvp::STATUS_EN_ESPERA) {
            $response['posicion_en_espera'] = $rsvp->waitlist_position;
        }

        if ($rsvp->promoted_at) {
            $response['promovido_en'] = $rsvp->promoted_at->format('Y-m-d H:i:s');
        }

        return response()->json($response, 200);
    }
}
