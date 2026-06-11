<?php

namespace App\Traits;

use App\Models\Gallery;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
// use Intervention\Image\ImageManager;

trait HandlesImageUpload
{
    /**
     * Save base64 image to storage and create gallery record
     */
    protected function saveImage($galleryable, string $base64Image, string $type, int $userId, ?string $description = null): Gallery
    {
        // Decode base64 image
        $imageData = $this->decodeBase64Image($base64Image);

        // Generate unique filename
        $filename = $this->generateUniqueFilename($imageData['extension']);

        // Save original image
        $imagePath = $this->saveOriginalImage($imageData['data'], $filename);

        // Create thumbnail
        $thumbnailPath = $this->createThumbnail($imageData['data'], $filename);

        // Create gallery record
        return Gallery::create([
            'galleryable_id' => $galleryable->id,
            'galleryable_type' => get_class($galleryable),
            'type' => $type,
            'image_path' => $imagePath,
            'thumbnail_path' => $thumbnailPath,
            'original_filename' => $imageData['original_name'] ?? null,
            'file_size' => strlen($imageData['data']),
            'order' => $this->getNextOrder($galleryable, $type),
            'description' => $description,
            'uploaded_by' => $userId,
        ]);
    }

    /**
     * Decode base64 image
     */
    protected function decodeBase64Image(string $base64String): array
    {
        // Check if it's a data URL
        if (preg_match('/^data:image\/(\w+);base64,/', $base64String, $matches)) {
            $extension = $matches[1];
            $imageData = substr($base64String, strpos($base64String, ',') + 1);
            $imageData = base64_decode($imageData);
        } else {
            // Assume it's raw base64
            $imageData = base64_decode($base64String);
            $extension = 'jpg';
        }

        return [
            'data' => $imageData,
            'extension' => $extension,
            'original_name' => null,
        ];
    }

    /**
     * Generate unique filename
     */
    protected function generateUniqueFilename(string $extension): string
    {
        return Str::uuid() . '.' . $extension;
    }

    /**
     * Save original image
     */
    protected function saveOriginalImage(string $imageData, string $filename): string
    {
        $path = 'uploads/images/' . date('Y/m/d');
        $fullPath = $path . '/' . $filename;

        Storage::disk('public')->put($fullPath, $imageData);

        return $fullPath;
    }

    /**
     * Create thumbnail
     */
    protected function createThumbnail(string $imageData, string $filename): string
    {
        $path = 'uploads/thumbnails/' . date('Y/m/d');
        $fullPath = $path . '/' . $filename;

        // Create thumbnail using GD or Imagick
        $img = imagecreatefromstring($imageData);
        if ($img) {
            $width = imagesx($img);
            $height = imagesy($img);
            $thumbWidth = 300;
            $thumbHeight = ($thumbWidth / $width) * $height;

            $thumb = imagecreatetruecolor($thumbWidth, $thumbHeight);
            imagecopyresampled($thumb, $img, 0, 0, 0, 0, $thumbWidth, $thumbHeight, $width, $height);

            // Save thumbnail
            ob_start();
            imagejpeg($thumb, null, 80);
            $thumbData = ob_get_clean();

            Storage::disk('public')->put($fullPath, $thumbData);

            imagedestroy($img);
            imagedestroy($thumb);
        } else {
            // Fallback: just store the original as thumbnail
            Storage::disk('public')->put($fullPath, $imageData);
        }

        return $fullPath;
    }

    /**
     * Get next order number for images
     */
    protected function getNextOrder($galleryable, string $type): int
    {
        $lastImage = Gallery::where('galleryable_id', $galleryable->id)
            ->where('galleryable_type', get_class($galleryable))
            ->where('type', $type)
            ->orderBy('order', 'desc')
            ->first();

        return $lastImage ? $lastImage->order + 1 : 0;
    }

    /**
     * Delete image from storage and database
     */
    protected function deleteImage(Gallery $gallery): bool
    {
        // Delete files from storage
        if (Storage::disk('public')->exists($gallery->image_path)) {
            Storage::disk('public')->delete($gallery->image_path);
        }

        if ($gallery->thumbnail_path && Storage::disk('public')->exists($gallery->thumbnail_path)) {
            Storage::disk('public')->delete($gallery->thumbnail_path);
        }

        // Delete database record
        return $gallery->delete();
    }
}
