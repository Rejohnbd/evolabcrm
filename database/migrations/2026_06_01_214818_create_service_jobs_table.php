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
        Schema::create('service_jobs', function (Blueprint $table) {
            $table->id();
            $table->string('job_id')->unique()->index();
            $table->string('customer')->index();
            $table->string('phone')->nullable();
            $table->string('vehicle')->index();
            $table->string('color');
            $table->string('plate')->index();
            $table->string('service')->index();
            $table->text('notes')->nullable();
            $table->enum('source', ['Retail', 'Dealer'])->default('Retail')->index();
            $table->enum('priority', ['normal', 'high'])->default('normal')->index();
            $table->timestamp('due_date')->nullable()->index();
            $table->enum('status', [
                'pending',
                'assigned',
                'in_progress',
                'awaiting_validation',
                'completed',
                'rework'
            ])->default('pending')->index();
            $table->unsignedBigInteger('current_technician_id')->nullable()->index();
            $table->timestamps();

            $table->foreign('current_technician_id', 'fk_sj_current_technician')
                ->references('id')
                ->on('users')
                ->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('service_jobs');
    }
};
