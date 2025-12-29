<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
{
    Schema::create('rsvps', function (Blueprint $table) {
        $table->id();
        // Relación con la tabla de eventos de Daniel
        $table->foreignId('event_id')->constrained()->onDelete('cascade');
        $table->string('user_name'); // Nombre del asistente
        $table->string('user_email'); // Correo para la invitación
        $table->enum('status', ['pendiente', 'confirmado', 'cancelado'])->default('confirmado');
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rsvps');
    }
};
