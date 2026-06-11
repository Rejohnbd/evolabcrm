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

    // Gallery relationship
    public function galleries(): MorphMany
    {
        return $this->morphMany(Gallery::class, 'galleryable');
    }

    public function exteriorPhotos(): MorphMany
    {
        return $this->galleries()->where('type', 'exterior');
    }

    public function interiorPhotos(): MorphMany
    {
        return $this->galleries()->where('type', 'interior');
    }

    public function damagePhotos(): MorphMany
    {
        return $this->galleries()->where('type', 'damage');
    }

    public function afterPhotos(): MorphMany
    {
        return $this->galleries()->where('type', 'after');
    }

    public function statusHistories(): HasMany
    {
        return $this->hasMany(JobStatusHistory::class, 'assignment_id');
    }

    // Scopes
    public function scopeForShift($query, $shiftId)
    {
        return $query->where('shift_id', $shiftId);
    }
}
