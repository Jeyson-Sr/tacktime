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
        Schema::create('oee_hour_details', function (Blueprint $table) {
            $table->id();

            $table->foreignId('oee_production_id')
                ->constrained('oee_productions')
                ->cascadeOnDelete();

            $table->integer('hour_index');
            $table->string('hour_range');

            $table->decimal('estimado', 10, 2)->default(0);
            $table->decimal('producido', 10, 2)->default(0);

            $table->decimal('minutos_a_justificar', 10, 2)->default(0);
            $table->decimal('minutos_justificados', 10, 2)->default(0);

            $table->string('status')->default('blue');
            $table->boolean('closed')->default(false);

            $table->text('comment_mnf')->nullable();
            $table->text('comment_mantto')->nullable();
            $table->text('comment_calidad')->nullable();

            $table->unique(['oee_production_id', 'hour_index']);

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('oee_hour_details');
    }
};
