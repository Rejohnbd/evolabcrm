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
        Schema::create('job_status_histories', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('service_job_id');
            $table->unsignedBigInteger('assignment_id')->nullable();
            $table->enum('old_status', [
                'pending',
                'assigned',
                'in_progress',
                'awaiting_validation',
                'completed',
                'rework'
            ])->index();
            $table->enum('new_status', [
                'pending',
                'assigned',
                'in_progress',
                'awaiting_validation',
                'completed',
                'rework'
            ])->index();
            $table->unsignedBigInteger('changed_by');
            $table->text('notes')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->foreign('service_job_id', 'fk_jsh_service_job_id')
                ->references('id')
                ->on('service_jobs')
                ->onDelete('cascade');

            $table->foreign('assignment_id', 'fk_jsh_assignment_id')
                ->references('id')
                ->on('service_job_assignments')
                ->onDelete('set null');

            $table->foreign('changed_by', 'fk_jsh_changed_by')
                ->references('id')
                ->on('users')
                ->onDelete('cascade');

            $table->index('service_job_id', 'idx_jsh_service_job_id');
            $table->index('assignment_id', 'idx_jsh_assignment_id');
            $table->index('changed_by', 'idx_jsh_changed_by');
            $table->index('created_at', 'idx_jsh_created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('job_status_histories');
    }
};
