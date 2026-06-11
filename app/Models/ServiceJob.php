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

    // Assignments relationship
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

    // Galleries relationship (polymorphic) - for images directly on ServiceJob
    public function galleries(): MorphMany
    {
        return $this->morphMany(Gallery::class, 'galleryable');
    }

    // Get before photos (from ServiceJob level)
    public function beforePhotos(): MorphMany
    {
        return $this->galleries()->where('type', 'before');
    }

    // Get after photos (from ServiceJob level)
    public function afterPhotos(): MorphMany
    {
        return $this->galleries()->where('type', 'after');
    }

    // Get photos from the current assignment (where most photos are stored)
    public function getAssignmentPhotos(): array
    {
        $assignment = $this->currentAssignment;

        if (!$assignment) {
            return [
                'exteriorPhotos' => [],
                'interiorPhotos' => [],
                'damagePhotos' => [],
                'afterPhotos' => [],
            ];
        }

        return [
            'exteriorPhotos' => $assignment->exteriorPhotos,
            'interiorPhotos' => $assignment->interiorPhotos,
            'damagePhotos' => $assignment->damagePhotos,
            'afterPhotos' => $assignment->afterPhotos,
        ];
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

    public function scopeAwaitingValidation($query)
    {
        return $query->where('status', 'awaiting_validation');
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    public function scopeRework($query)
    {
        return $query->where('status', 'rework');
    }

    // Status history
    public function statusHistories(): HasMany
    {
        return $this->hasMany(JobStatusHistory::class, 'service_job_id');
    }

    // Format job data for frontend
    public function formatForFrontend()
    {
        $assignment = $this->currentAssignment;
        $checkinData = $assignment?->checkin_data;

        // Get photos from assignment gallery (not from checkin_data)
        $exteriorPhotos = [];
        $interiorPhotos = [];
        $afterPhotos = [];

        if ($assignment) {
            // Get exterior photos from gallery
            $exteriorPhotos = $assignment->galleries()
                ->where('type', 'exterior')
                ->get()
                ->map(fn($photo) => [
                    'id' => $photo->id,
                    'data' => $photo->image_url, // Using accessor
                    'timestamp' => $photo->created_at->timestamp * 1000,
                ])
                ->toArray();

            // Get interior photos from gallery
            $interiorPhotos = $assignment->galleries()
                ->where('type', 'interior')
                ->get()
                ->map(fn($photo) => [
                    'id' => $photo->id,
                    'data' => $photo->image_url,
                    'timestamp' => $photo->created_at->timestamp * 1000,
                ])
                ->toArray();

            // Get after photos from gallery
            $afterPhotos = $assignment->galleries()
                ->where('type', 'after')
                ->get()
                ->map(fn($photo) => [
                    'id' => $photo->id,
                    'data' => $photo->image_url,
                    'timestamp' => $photo->created_at->timestamp * 1000,
                ])
                ->toArray();
        }

        // For backward compatibility, also check checkin_data for photos
        if ($checkinData && empty($exteriorPhotos)) {
            if (isset($checkinData['exteriorPhotos'])) {
                $exteriorPhotos = $checkinData['exteriorPhotos'];
            }
            if (isset($checkinData['interiorPhotos'])) {
                $interiorPhotos = $checkinData['interiorPhotos'];
            }
        }

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
            'checkin' => $checkinData ? [
                'mileage' => $checkinData['mileage'] ?? null,
                'fuelLevel' => $checkinData['fuelLevel'] ?? null,
                'keysReceived' => $checkinData['keysReceived'] ?? null,
                'keyCount' => $checkinData['keyCount'] ?? null,
                'personalItems' => $checkinData['personalItems'] ?? null,
                'damageNotes' => $checkinData['damageNotes'] ?? [],
                'customerExpectations' => $checkinData['customerExpectations'] ?? null,
            ] : null,
            'beforePhotos' => [...$exteriorPhotos, ...$interiorPhotos],
            'afterPhotos' => $afterPhotos,
        ];
    }
}
