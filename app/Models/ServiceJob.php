<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Carbon\Carbon;

class ServiceJob extends Model
{
    protected $fillable = [
        'job_id',
        'customer',
        'phone',
        'vehicle',
        'color',
        'plate',
        'service',
        'notes',
        'source',
        'priority',
        'due_date',
        'status',
        'current_technician_id',
    ];

    protected $casts = [
        'due_date' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // ADD THIS RELATIONSHIP - HasMany assignments
    public function assignments(): HasMany
    {
        return $this->hasMany(ServiceJobAssignment::class, 'service_job_id');
    }

    // Get current active assignment
    public function currentAssignment(): HasOne
    {
        return $this->hasOne(ServiceJobAssignment::class, 'service_job_id')
            ->where('is_current', true);
    }

    // Get the current technician
    public function currentTechnician(): BelongsTo
    {
        return $this->belongsTo(User::class, 'current_technician_id');
    }

    // Galleries relationship (polymorphic)
    public function galleries(): MorphMany
    {
        return $this->morphMany(Gallery::class, 'galleryable');
    }

    // Helper methods for photos
    public function beforePhotos(): MorphMany
    {
        return $this->galleries()->where('type', 'before');
    }

    public function afterPhotos(): MorphMany
    {
        return $this->galleries()->where('type', 'after');
    }

    // Scopes
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeAssigned($query)
    {
        return $query->where('status', 'assigned');
    }

    public function scopeInProgress($query)
    {
        return $query->where('status', 'in_progress');
    }

    public function scopeForTechnician($query, $technicianId)
    {
        return $query->where('current_technician_id', $technicianId);
    }

    public function statusHistories(): HasMany
    {
        return $this->hasMany(JobStatusHistory::class, 'service_job_id');
    }

    // Format job data for frontend
    public function formatForFrontend()
    {
        $assignment = $this->currentAssignment;

        return [
            'id' => $this->job_id,
            'customer' => $this->customer,
            'phone' => $this->phone,
            'vehicle' => $this->vehicle,
            'color' => $this->color,
            'plate' => $this->plate,
            'service' => $this->service,
            'notes' => $this->notes,
            'source' => $this->source,
            'status' => $this->status,
            'priority' => $this->priority,
            'dueDate' => $this->due_date ? Carbon::parse($this->due_date)->format('M j, g:i A') : 'No due date',
            'startedBy' => $assignment?->assignedTo?->name,
            'startedAt' => $assignment?->started_at?->timestamp * 1000,
            'duration' => $assignment?->duration,
            'rejectionReason' => $assignment?->rejection_reason,
        ];
    }
}
