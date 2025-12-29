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
    Schema::create('events', function (Blueprint $table) {
        $table->id();
        $table->string('title'); 
        $table->text('description'); 
        $table->dateTime('date_time'); 
        $table->integer('capacity');
        $table->string('modality'); 
        $table->string('location'); 
        $table->text('agenda')->nullable(); 
        $table->boolean('is_cancelled')->default(false); 
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('events');
    }
};
