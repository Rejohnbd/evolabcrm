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
        Schema::create('service_job_assignments', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('service_job_id');
            $table->unsignedBigInteger('assigned_to');
            $table->unsignedBigInteger('shift_id')->nullable();
            $table->enum('status', [
                'pending',
                'assigned',
                'in_progress',
                'awaiting_validation',
                'completed',
                'rework'
            ])->default('pending')->index();
            $table->timestamp('assigned_at')->nullable()->index();
            $table->timestamp('started_at')->nullable()->index();
            $table->timestamp('completed_at')->nullable()->index();
            $table->integer('duration')->nullable();
            $table->unsignedBigInteger('validated_by')->nullable();
            $table->timestamp('validated_at')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->text('validation_notes')->nullable();
            $table->json('checkin_data')->nullable();
            $table->json('progress_notes')->nullable();
            $table->boolean('is_current')->default(false)->index();
            $table->timestamps();

            $table->foreign('service_job_id', 'fk_sja_service_job_id')
                ->references('id')
                ->on('service_jobs')
                ->onDelete('cascade');

            $table->foreign('assigned_to', 'fk_sja_assigned_to')
                ->references('id')
                ->on('users')
                ->onDelete('cascade');

            $table->foreign('shift_id', 'fk_sja_shift_id')
                ->references('id')
                ->on('shifts')
                ->onDelete('set null');

            $table->foreign('validated_by', 'fk_sja_validated_by')
                ->references('id')
                ->on('users')
                ->onDelete('set null');

            $table->index(['service_job_id', 'is_current'], 'idx_sja_service_job_current');
            $table->index(['assigned_to', 'status'], 'idx_sja_assigned_status');
            $table->index('shift_id', 'idx_sja_shift_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('service_job_assignments');
    }
};
