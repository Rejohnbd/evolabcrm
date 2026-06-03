<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Shift extends Model
{
    protected $fillable = [
        'user_id',
        'shift_date',
        'punch_in_at',
        'punch_out_at',
        'total_duration_minutes',
        'overtime_minutes',
        'status',
        // 'punch_in_location',
        // 'punch_out_location',
        'notes',
        'approved_by',
        'approved_at',
    ];

    protected $casts = [
        'shift_date' => 'date',
        'punch_in_at' => 'datetime',
        'punch_out_at' => 'datetime',
        'approved_at' => 'datetime',
    ];

    // Relationships
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeForUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeToday($query)
    {
        return $query->whereDate('shift_date', Carbon::today());
    }


    // Helper Methods
    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    public function punchIn(?string $location = null): void
    {
        $this->update([
            'punch_in_at' => now(),
            'status' => 'active',
            'shift_date' => now()->toDateString(),
            // 'punch_in_location' => $location,
        ]);
    }

    public function punchOut(?string $location = null): void
    {
        $duration = $this->punch_in_at ? now()->diffInMinutes($this->punch_in_at) : 0;
        $overtime = max(0, $duration - 480); // 480 minutes = 8 hours

        $this->update([
            'punch_out_at' => now(),
            'total_duration_minutes' => $duration,
            'overtime_minutes' => $overtime,
            'status' => 'completed',
            // 'punch_out_location' => $location,
        ]);
    }

    public function approve(): void
    {
        $this->update([
            'status' => 'approved',
            'approved_at' => now(),
        ]);
    }

    // Accessors
    public function getFormattedDurationAttribute(): string
    {
        if (!$this->total_duration_minutes) return '00:00';
        $hours = floor($this->total_duration_minutes / 60);
        $minutes = $this->total_duration_minutes % 60;
        return sprintf('%02d:%02d', $hours, $minutes);
    }

    public function getFormattedOvertimeAttribute(): string
    {
        if (!$this->overtime_minutes) return '00:00';
        $hours = floor($this->overtime_minutes / 60);
        $minutes = $this->overtime_minutes % 60;
        return sprintf('%02d:%02d', $hours, $minutes);
    }
}
