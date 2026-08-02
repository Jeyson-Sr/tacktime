<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Catálogo de códigos de parada. Solo crea la tabla si no existe
     * (puede venir de un sistema externo ya poblado).
     */
    public function up(): void
    {
        if (Schema::hasTable('cod_stops')) {
            return;
        }

        Schema::create('cod_stops', function (Blueprint $table) {
            $table->id();
            $table->string('codigo')->unique();
            $table->string('detalle')->nullable();
            $table->string('tipo_parada')->nullable();
            $table->string('categoria')->nullable();
            $table->string('causa')->nullable();
            $table->string('recurso_afectado')->nullable();
            $table->string('familia_oee')->nullable();
            $table->string('aplica_tetra')->nullable();
            $table->string('estado')->default('ACTIVO');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        // No-op: cod_stops puede ser una tabla externa preexistente.
    }
};
