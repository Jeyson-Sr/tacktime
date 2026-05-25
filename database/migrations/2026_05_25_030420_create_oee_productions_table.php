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
            Schema::create('oee_productions', function (Blueprint $table) {
            $table->id();

            $table->date('fecha');
            $table->string('turno');
            $table->string('linea');

            $table->string('ingeniero')->nullable();
            $table->string('operador')->nullable();

            $table->unsignedBigInteger('sku')->nullable();
            $table->string('descripcion')->nullable();

            $table->string('formato')->nullable();
            $table->string('marca')->nullable();
            $table->string('sabor')->nullable();

            $table->decimal('pallets_por_hora', 10, 2)->default(0);
            $table->decimal('bph', 12, 2)->default(0);

            $table->string('op')->nullable();

            // Para evitar duplicados en el demo
            $table->unique(['fecha', 'turno', 'linea', 'op']);

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('oee_productions');
    }
};
