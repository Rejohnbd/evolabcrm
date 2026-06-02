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
        Schema::create('shifts', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->date('shift_date')->index();
            $table->timestamp('punch_in_at')->nullable()->index();
            $table->timestamp('punch_out_at')->nullable()->index();
            $table->integer('total_duration_minutes')->nullable();
            $table->integer('overtime_minutes')->default(0);
            $table->enum('status', ['active', 'completed', 'approved'])->default('active')->index();
            $table->string('punch_in_location')->nullable();
            $table->string('punch_out_location')->nullable();
            $table->text('notes')->nullable();
            $table->unsignedBigInteger('approved_by')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->timestamps();

            $table->foreign('user_id', 'fk_shifts_user_id')
                ->references('id')
                ->on('users')
                ->onDelete('cascade');

            $table->foreign('approved_by', 'fk_shifts_approved_by')
                ->references('id')
                ->on('users')
                ->onDelete('set null');

            $table->index(['user_id', 'shift_date'], 'idx_shifts_user_date');
            $table->index(['user_id', 'status'], 'idx_shifts_user_status');
            $table->index('created_at', 'idx_shifts_created_at');
            $table->index('user_id', 'idx_shifts_user_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('shifts');
    }
};
