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
        Schema::create('oee_stop_details', function (Blueprint $table) {
            $table->id();

            $table->foreignId('oee_hour_detail_id')
                ->constrained('oee_hour_details')
                ->cascadeOnDelete();

            $table->string('frontend_id')->nullable();

            $table->string('codigo');
            $table->string('tipo');
            $table->text('descripcion')->nullable();

            $table->decimal('tiempo_minutos', 10, 2)->default(0);
            $table->integer('frecuencia')->default(1);

            $table->timestamp('registered_at')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('oee_stop_details');
    }
};
