<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Primero, modificamos el enum para incluir 'en_espera'
        // En SQLite no podemos modificar el enum directamente, así que recreamos la columna
        
        Schema::table('rsvps', function (Blueprint $table) {
            // Agregar columna para posición en lista de espera
            $table->integer('waitlist_position')->nullable()->after('status');
            // Agregar timestamp para cuando fue promovido de lista de espera
            $table->timestamp('promoted_at')->nullable()->after('waitlist_position');
        });

        // Cambiar el tipo de la columna status para incluir 'en_espera'
        // SQLite requiere un approach diferente
        DB::statement("CREATE TABLE rsvps_new (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            event_id INTEGER NOT NULL,
            user_name VARCHAR(255) NOT NULL,
            user_email VARCHAR(255) NOT NULL,
            status VARCHAR(20) DEFAULT 'confirmado' CHECK(status IN ('pendiente', 'confirmado', 'cancelado', 'en_espera')),
            checked_in BOOLEAN DEFAULT 0,
            waitlist_position INTEGER,
            promoted_at TIMESTAMP,
            created_at TIMESTAMP,
            updated_at TIMESTAMP,
            FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
        )");

        DB::statement("INSERT INTO rsvps_new (id, event_id, user_name, user_email, status, checked_in, waitlist_position, promoted_at, created_at, updated_at) 
                       SELECT id, event_id, user_name, user_email, status, checked_in, waitlist_position, promoted_at, created_at, updated_at FROM rsvps");

        DB::statement("DROP TABLE rsvps");
        DB::statement("ALTER TABLE rsvps_new RENAME TO rsvps");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('rsvps', function (Blueprint $table) {
            $table->dropColumn(['waitlist_position', 'promoted_at']);
        });
    }
};
