<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Support\Facades\Storage;

class Gallery extends Model
{
    protected $table = 'galleries';

    protected $fillable = [
        'galleryable_id',
        'galleryable_type',
        'type',
        'image_path',
        'thumbnail_path',
        'original_filename',
        'file_size',
        'order',
        'description',
        'metadata',
        'uploaded_by',
    ];

    protected $casts = [
        'metadata' => 'array',
        'order' => 'integer',
        'file_size' => 'integer',
    ];

    // Relationships
    public function galleryable(): MorphTo
    {
        return $this->morphTo();
    }

    public function uploadedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    // Accessors
    public function getImageUrlAttribute(): string
    {
        return Storage::url($this->image_path);
    }

    public function getThumbnailUrlAttribute(): string
    {
        return $this->thumbnail_path ? Storage::url($this->thumbnail_path) : $this->image_url;
    }

    // Scopes
    public function scopeExterior($query)
    {
        return $query->where('type', 'exterior');
    }

    public function scopeInterior($query)
    {
        return $query->where('type', 'interior');
    }

    public function scopeDamage($query)
    {
        return $query->where('type', 'damage');
    }

    public function scopeAfter($query)
    {
        return $query->where('type', 'after');
    }
}
