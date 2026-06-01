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
            $table->string('customer');
            $table->string('phone')->nullable();
            $table->string('vehicle');
            $table->string('color');
            $table->string('plate');
            $table->string('service');
            $table->text('notes')->nullable();
            $table->enum('source', ['Retail', 'Dealer'])->default('Retail')->index();
            $table->enum('priority', ['normal', 'high'])->default('normal')->index();
            $table->timestamp('due_date')->nullable()->index();
            // Current status - for fast queries
            $table->enum('status', [
                'pending',           // Waiting for assignment
                'assigned',          // Assigned to technician but not started
                'in_progress',       // Technician working on it
                'awaiting_validation', // Ready for manager review
                'completed',         // Approved by manager
                'rework'             // Sent back for corrections
            ])->default('pending')->index();

            // Current assignment (denormalized for performance)
            // $table->foreignId('current_assignment_id')->nullable()
            //     ->constrained('service_job_assignments')->onDelete('set null');
            $table->foreignId('current_technician_id')->nullable()
                ->constrained('users')->onDelete('set null');
            $table->timestamps();
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
