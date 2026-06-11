<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Carbon\Carbon;

class JobStatusHistory extends Model
{
    protected $fillable = [
        'service_job_id',
        'assignment_id',
        'shift_id',
        'old_status',
        'new_status',
        'changed_by',
        'notes',
        'metadata',
    ];

    protected $casts = [
        'metadata' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Relationships
    public function serviceJob(): BelongsTo
    {
        return $this->belongsTo(ServiceJob::class, 'service_job_id');
    }

    public function assignment(): BelongsTo
    {
        return $this->belongsTo(ServiceJobAssignment::class, 'assignment_id');
    }

    public function shift(): BelongsTo
    {
        return $this->belongsTo(Shift::class, 'shift_id');
    }

    public function changedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'changed_by');
    }

    // Scopes
    public function scopeForJob($query, $jobId)
    {
        return $query->where('service_job_id', $jobId);
    }

    public function scopeForAssignment($query, $assignmentId)
    {
        return $query->where('assignment_id', $assignmentId);
    }

    public function scopeByUser($query, $userId)
    {
        return $query->where('changed_by', $userId);
    }

    // Helper Methods
    public static function record(
        $serviceJobId,
        $oldStatus,
        $newStatus,
        $changedBy,
        $assignmentId = null,
        $shiftId = null,
        $notes = null,
        $metadata = []
    ): self {
        return self::create([
            'service_job_id' => $serviceJobId,
            'assignment_id' => $assignmentId,
            'shift_id' => $shiftId,
            'old_status' => $oldStatus,
            'new_status' => $newStatus,
            'changed_by' => $changedBy,
            'notes' => $notes,
            'metadata' => $metadata,
        ]);
    }

    // Accessors
    public function getFormattedCreatedAtAttribute(): string
    {
        return $this->created_at ? $this->created_at->format('M j, Y g:i A') : '';
    }

    public function getStatusChangeTextAttribute(): string
    {
        $statusLabels = [
            'pending' => 'Pending',
            'assigned' => 'Assigned',
            'in_progress' => 'In Progress',
            'awaiting_validation' => 'Awaiting Validation',
            'completed' => 'Completed',
            'rework' => 'Rework',
        ];

        $old = $statusLabels[$this->old_status] ?? $this->old_status;
        $new = $statusLabels[$this->new_status] ?? $this->new_status;

        return "Status changed from {$old} to {$new}";
    }
}
