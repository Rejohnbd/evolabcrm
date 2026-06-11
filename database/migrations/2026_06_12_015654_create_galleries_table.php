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
        Schema::create('galleries', function (Blueprint $table) {
            $table->id();

            // Polymorphic relationship
            $table->unsignedBigInteger('galleryable_id');
            $table->string('galleryable_type'); // App\Models\ServiceJobAssignment

            // Image type
            $table->enum('type', [
                'exterior',
                'interior',
                'damage',
                'before',
                'after',
                'signature'
            ])->default('before')->index();

            // Image paths
            $table->string('image_path');
            $table->string('thumbnail_path')->nullable();
            $table->string('original_filename')->nullable();
            $table->integer('file_size')->nullable(); // in bytes

            // Metadata
            $table->integer('order')->default(0);
            $table->text('description')->nullable();
            $table->json('metadata')->nullable(); // location, gps, device info

            // User who uploaded
            $table->unsignedBigInteger('uploaded_by');

            $table->timestamps();

            // Foreign keys
            $table->foreign('uploaded_by', 'fk_galleries_uploaded_by')
                ->references('id')
                ->on('users')
                ->onDelete('cascade');

            // Indexes
            $table->index(['galleryable_id', 'galleryable_type'], 'idx_galleries_polymorphic');
            $table->index('type', 'idx_galleries_type');
            $table->index('uploaded_by', 'idx_galleries_uploaded_by');
            $table->index('created_at', 'idx_galleries_created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('galleries');
    }
};
