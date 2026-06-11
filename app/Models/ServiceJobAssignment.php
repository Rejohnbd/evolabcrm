<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\Relations\HasMany;


class ServiceJobAssignment extends Model
{
    protected $fillable = [
        'service_job_id',
        'assigned_to',
        'shift_id',
        'status',
        'assigned_at',
        'started_at',
        'completed_at',
        'duration',
        'validated_by',
        'validated_at',
        'rejection_reason',
        'validation_notes',
        'checkin_data',
        'progress_notes',
        'is_current',
    ];

    protected $casts = [
        'assigned_at' => 'datetime',
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
        'validated_at' => 'datetime',
        'checkin_data' => 'array',
        'progress_notes' => 'array',
        'is_current' => 'boolean',
    ];

    public function serviceJob(): BelongsTo
    {
        return $this->belongsTo(ServiceJob::class);
    }

    public function assignedTo(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function shift(): BelongsTo
    {
        return $this->belongsTo(Shift::class, 'shift_id');
    }

    public function validatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'validated_by');
    }

    // Galleries relationship for images
    public function galleries(): MorphMany
    {
        return $this->morphMany(Gallery::class, 'galleryable');
    }

    // Get exterior photos from assignment
    public function exteriorPhotos()
    {
        return $this->galleries()->where('type', 'exterior');
    }

    // Get interior photos from assignment
    public function interiorPhotos()
    {
        return $this->galleries()->where('type', 'interior');
    }

    // Get damage photos from assignment
    public function damagePhotos()
    {
        return $this->galleries()->where('type', 'damage');
    }

    // Get after photos from assignment
    public function afterPhotos()
    {
        return $this->galleries()->where('type', 'after');
    }

    public function statusHistories(): HasMany
    {
        return $this->hasMany(JobStatusHistory::class, 'assignment_id');
    }
}
