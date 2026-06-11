<?php

namespace App\Http\Controllers;

use App\Models\Gallery;
use App\Models\JobStatusHistory;
use App\Models\ServiceJob;
use App\Models\ServiceJobAssignment;
use App\Models\Shift;
use App\Traits\HandlesImageUpload;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class TechnicianController extends Controller
{
    use HandlesImageUpload;

    public function index(): Response
    {
        $user = Auth::user();

        // Get all pending jobs (not assigned to anyone yet)
        $pendingJobs = ServiceJob::where('status', 'pending')
            ->orderBy('priority', 'desc')
            ->orderBy('created_at', 'asc')
            ->get()
            ->map(fn($job) => $this->formatJobData($job));

        // Get jobs assigned to current technician
        $myJobs = ServiceJob::where('current_technician_id', $user->id)
            ->whereIn('status', ['assigned', 'in_progress', 'awaiting_validation', 'rework'])
            ->orderBy('priority', 'desc')
            ->orderBy('due_date', 'asc')
            ->get()
            ->map(fn($job) => $this->formatJobData($job));

        //Get completed jobs by current technician using whereHas
        $completedJobs = ServiceJob::whereHas('assignments', function ($query) use ($user) {
            $query->where('assigned_to', $user->id)
                ->where('status', 'completed');
        })
            ->orderBy('updated_at', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($job) use ($user) {
                $data = $this->formatJobData($job);
                // Add assignment specific data
                $assignment = $job->assignments()
                    ->where('assigned_to', $user->id)
                    ->where('status', 'completed')
                    ->first();
                if ($assignment) {
                    $data['duration'] = $assignment->duration;
                    $data['completed_at'] = $assignment->completed_at;
                }
                return $data;
            });

        // Get current active job (in progress or awaiting validation)
        $activeJob = ServiceJob::where('current_technician_id', $user->id)
            ->whereIn('status', ['in_progress', 'awaiting_validation'])
            ->first();

        $activeJobData = $activeJob ? $this->formatJobData($activeJob) : null;

        // Get today's active shift
        $shift = Shift::where('user_id', $user->id)
            ->whereDate('shift_date', Carbon::today())
            ->where('status', 'active')
            ->first();

        $shiftData = [
            'punched_in' => $shift && $shift->punch_in_at !== null && $shift->punch_out_at === null,
            'punch_time' => $shift && $shift->punch_in_at ? $shift->punch_in_at->timestamp * 1000 : null,
            'punch_in_at' => $shift ? $shift->punch_in_at : null,
            'punch_out_at' => $shift ? $shift->punch_out_at : null,
            'total_duration' => $shift ? $shift->total_duration_minutes : null,
        ];

        return Inertia::render('technician/dashboard', [
            'pendingJobs' => $pendingJobs,
            'myJobs' => $myJobs,
            'completedJobs' => $completedJobs,
            'activeJob' => $activeJobData,
            'shift' => $shiftData,
            'now' => now()->timestamp * 1000,
        ]);
    }

    /**
     * Toggle shift (punch in / punch out)
     */
    public function toggleShift(Request $request)
    {
        $user = Auth::user();
        $today = Carbon::today()->toDateString();

        // Find active shift
        $activeShift = Shift::where('user_id', $user->id)
            ->whereDate('shift_date', $today)
            ->where('status', 'active')
            ->first();

        if ($activeShift) {
            // Punch Out
            $punchIn = Carbon::parse($activeShift->punch_in_at);
            $punchOut = Carbon::now();

            // Calculate absolute difference in minutes
            $duration = abs($punchIn->diffInMinutes($punchOut));
            $overtime = max(0, $duration - 480);

            // Update shift with calculated values
            $activeShift->update([
                'punch_out_at' => $punchOut,
                'total_duration_minutes' => $duration,
                'overtime_minutes' => $overtime,
                // 'punch_out_location' => $request->input('location'),
                'status' => 'completed',
            ]);

            return redirect()->back()->with('success', "Punched out successfully. Total duration: {$duration} minutes");
        }

        // Check for existing shift today
        $existingShift = Shift::where('user_id', $user->id)
            ->whereDate('shift_date', $today)
            ->first();

        if ($existingShift && $existingShift->status === 'completed') {
            // Create a new shift for the same day (multiple shifts allowed)
            $shift = Shift::create([
                'user_id' => $user->id,
                'shift_date' => $today,
                'punch_in_at' => now(),
                'status' => 'active',
                // 'punch_in_location' => $request->input('location'),
            ]);

            return redirect()->back()->with('success', 'Punched in successfully (Multiple shift)');
        }

        if (!$existingShift) {
            // First shift of the day
            $shift = Shift::create([
                'user_id' => $user->id,
                'shift_date' => $today,
                'punch_in_at' => now(),
                'status' => 'active',
                // 'punch_in_location' => $request->input('location'),
            ]);

            return redirect()->back()->with('success', 'Punched in successfully');
        }

        return redirect()->back()->with('error', 'Unable to process shift toggle');
    }


    // Show Checkin Page
    public function showCheckin($jobId)
    {
        $user = Auth::user();

        // Check if technician is punched in
        $shift = Shift::where('user_id', $user->id)
            ->whereDate('shift_date', Carbon::today())
            ->where('status', 'active')
            ->first();

        if (!$shift || $shift->punch_in_at === null) {
            return redirect()->route('technician')->with('error', 'Please punch in before starting a job.');
        }

        $job = ServiceJob::where('job_id', $jobId)->firstOrFail();

        // Check if job is already assigned to someone else
        if ($job->status !== 'pending' && $job->current_technician_id !== $user->id) {
            return redirect()->route('technician')->with('error', 'This job is already assigned to another technician.');
        }

        // Check if job is already in progress or completed
        if (in_array($job->status, ['in_progress', 'awaiting_validation', 'completed'])) {
            return redirect()->route('technician')->with('error', 'This job is already in progress or completed.');
        }

        // Simply return the checkin view without creating assignment
        return Inertia::render('technician/checkin', [
            'jobId' => $job->job_id,
            'job' => [
                'id' => $job->job_id,
                'customer' => $job->customer,
                'vehicle' => $job->vehicle,
                'color' => $job->color,
                'plate' => $job->plate,
                'service' => $job->service,
            ],
        ]);
    }

    // Complete Checkin and Start Job Progress
    public function completeCheckin(Request $request)
    {
        // Validation for file uploads
        $request->validate([
            'jobId' => 'required|exists:service_jobs,job_id',
            'mileage' => 'required|string',
            'fuelLevel' => 'required|string',
            'keysReceived' => 'required|in:0,1',
            'keyCount' => 'required|string',
            'exteriorPhotos.*' => 'image|mimes:jpeg,png,jpg|max:5120',
            'interiorPhotos.*' => 'image|mimes:jpeg,png,jpg|max:5120',
            'damageNotes' => 'nullable|string',
            'personalItems' => 'nullable|string',
            'customerExpectations' => 'nullable|string',
        ]);

        $user = Auth::user();

        // Check if technician is punched in
        $shift = Shift::where('user_id', $user->id)
            ->whereDate('shift_date', Carbon::today())
            ->where('status', 'active')
            ->first();

        if (!$shift || $shift->punch_in_at === null) {
            return redirect()->route('technician')->with('error', 'Please punch in before starting a job.');
        }

        DB::beginTransaction();

        try {
            $job = ServiceJob::where('job_id', $request->jobId)
                ->lockForUpdate()
                ->firstOrFail();

            $oldStatus = $job->status;

            if ($job->status !== 'pending' && $job->current_technician_id !== $user->id) {
                DB::rollBack();
                return redirect()->route('technician')->with('error', 'This job is already assigned to another technician.');
            }

            if (in_array($job->status, ['in_progress', 'awaiting_validation', 'completed'])) {
                DB::rollBack();
                return redirect()->route('technician')->with('error', 'This job is already in progress or completed.');
            }

            $damageNotes = [];
            if ($request->filled('damageNotes')) {
                $damageNotes = json_decode($request->damageNotes, true) ?? [];
            }

            $checkinData = [
                'mileage' => $request->mileage,
                'fuelLevel' => $request->fuelLevel,
                'keysReceived' => $request->keysReceived === '1',
                'keyCount' => $request->keyCount,
                'personalItems' => $request->personalItems ?? '',
                'customerExpectations' => $request->customerExpectations ?? '',
                'damageNotes' => $damageNotes,
                'checked_in_at' => now()->toISOString(),
            ];

            // Create assignment with shift_id
            $assignment = ServiceJobAssignment::create([
                'service_job_id' => $job->id,
                'assigned_to' => $user->id,
                'shift_id' => $shift->id,  // ADD shift_id
                'status' => 'in_progress',
                'assigned_at' => now(),
                'started_at' => now(),
                'checkin_data' => $checkinData,
                'is_current' => true,
            ]);

            // Save photos...
            if ($request->hasFile('exteriorPhotos')) {
                foreach ($request->file('exteriorPhotos') as $photo) {
                    $this->saveUploadedFile($assignment, $photo, 'exterior', $user->id);
                }
            }

            if ($request->hasFile('interiorPhotos')) {
                foreach ($request->file('interiorPhotos') as $photo) {
                    $this->saveUploadedFile($assignment, $photo, 'interior', $user->id);
                }
            }

            $job->update([
                'status' => 'in_progress',
                'current_technician_id' => $user->id,
            ]);


            JobStatusHistory::record(
                serviceJobId: $job->id,
                oldStatus: $oldStatus,
                newStatus: 'in_progress',
                changedBy: $user->id,
                assignmentId: $assignment->id,
                shiftId: $shift->id,
                notes: 'Job checked in and started by technician',
                metadata: [
                    'checkin_data' => [
                        'mileage' => $request->mileage,
                        'fuel_level' => $request->fuelLevel,
                        'keys_received' => $request->keysReceived === '1',
                    ],
                    'technician_name' => $user->name,
                    'shift_id' => $shift->id,
                    'shift_date' => $shift->shift_date,
                ]
            );

            DB::commit();

            return redirect()->route('technician-job', $job->job_id)
                ->with('success', 'Checkin completed. Job started successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Checkin error: ' . $e->getMessage());
            return back()->with('error', 'Failed to complete checkin. Please try again.');
        }
    }

    public function showJob($jobId)
    {
        $user = Auth::user();

        $job = ServiceJob::where('job_id', $jobId)
            ->where('current_technician_id', $user->id)
            ->firstOrFail();

        $assignment = $job->currentAssignment;

        // Get after photos from gallery
        $afterPhotos = $assignment ? $assignment->galleries()->where('type', 'after')->get() : collect();

        // Get progress notes
        $progressNotes = $assignment ? ($assignment->progress_notes ?? []) : [];

        // Get checkin data
        $checkinData = $assignment ? $assignment->checkin_data : null;

        return Inertia::render('technician/job', [
            'job' => [
                'id' => $job->job_id,
                'customer' => $job->customer,
                'vehicle' => $job->vehicle,
                'color' => $job->color,
                'plate' => $job->plate,
                'service' => $job->service,
                'status' => $job->status,
            ],
            'checkinData' => $checkinData,
            'afterPhotos' => $afterPhotos->map(function ($photo) {
                return [
                    'id' => $photo->id,
                    'data' => Storage::url($photo->image_path),
                    'timestamp' => $photo->created_at->timestamp * 1000,
                ];
            }),
            'progressNotes' => $progressNotes,
            'startTime' => $assignment && $assignment->started_at ? $assignment->started_at->timestamp * 1000 : now()->timestamp * 1000,
            'now' => now()->timestamp * 1000,
        ]);
    }
    /**
     * Format job data for frontend
     */
    private function formatJobData($job)
    {
        $assignment = $job->currentAssignment;

        return [
            'id' => $job->job_id,
            'customer' => $job->customer,
            'phone' => $job->phone,
            'vehicle' => $job->vehicle,
            'color' => $job->color,
            'plate' => $job->plate,
            'service' => $job->service,
            'notes' => $job->notes,
            'source' => $job->source,
            'status' => $job->status,
            'priority' => $job->priority,
            'dueDate' => $job->due_date ? Carbon::parse($job->due_date)->format('M j, g:i A') : 'No due date',
            'startedBy' => $assignment?->assignedTo?->name,
            'startedAt' => $assignment?->started_at?->timestamp * 1000,
            'duration' => $assignment?->duration,
            'rejectionReason' => $assignment?->rejection_reason,
        ];
    }

    /**
     * Save uploaded file to storage
     */
    private function saveUploadedFile($assignment, $file, string $type, int $userId): ?Gallery
    {
        try {
            // Generate unique filename
            $filename = Str::uuid() . '.' . $file->getClientOriginalExtension();

            // Store original image
            $imagePath = $file->storeAs('uploads/images/' . date('Y/m/d'), $filename, 'public');

            // Create thumbnail
            $thumbnailPath = $this->createThumbnailFromFile($file, $filename);

            // Create gallery record
            return Gallery::create([
                'galleryable_id' => $assignment->id,
                'galleryable_type' => ServiceJobAssignment::class,
                'type' => $type,
                'image_path' => $imagePath,
                'thumbnail_path' => $thumbnailPath,
                'original_filename' => $file->getClientOriginalName(),
                'file_size' => $file->getSize(),
                'uploaded_by' => $userId,
            ]);
        } catch (\Exception $e) {
            Log::error('Error saving file: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Create thumbnail from uploaded file
     */
    private function createThumbnailFromFile($file, string $filename): string
    {
        $path = 'uploads/thumbnails/' . date('Y/m/d');
        $fullPath = $path . '/' . $filename;

        // Get image data
        $imageData = file_get_contents($file->getRealPath());

        // Create thumbnail using GD
        $img = imagecreatefromstring($imageData);
        if ($img) {
            $width = imagesx($img);
            $height = imagesy($img);
            $thumbWidth = 300;
            $thumbHeight = intval(($thumbWidth / $width) * $height);

            $thumb = imagecreatetruecolor($thumbWidth, $thumbHeight);
            imagecopyresampled($thumb, $img, 0, 0, 0, 0, $thumbWidth, $thumbHeight, $width, $height);

            // Save thumbnail as JPEG
            ob_start();
            imagejpeg($thumb, null, 80);
            $thumbData = ob_get_clean();

            Storage::disk('public')->put($fullPath, $thumbData);

            imagedestroy($img);
            imagedestroy($thumb);
        } else {
            // Fallback: store original as thumbnail
            Storage::disk('public')->put($fullPath, $imageData);
        }

        return $fullPath;
    }


    public function addAfterPhoto(Request $request, $jobId)
    {
        $request->validate([
            'photo' => 'required|string',
        ]);

        $user = Auth::user();

        $job = ServiceJob::where('job_id', $jobId)
            ->where('current_technician_id', $user->id)
            ->firstOrFail();

        $assignment = $job->currentAssignment;

        DB::beginTransaction();

        try {
            $gallery = $this->saveImage($assignment, $request->photo, 'after', $user->id);

            DB::commit();

            return response()->json([
                'success' => true,
                'photo' => [
                    'id' => $gallery->id,
                    'data' => Storage::url($gallery->image_path),
                    'timestamp' => now()->timestamp * 1000,
                ]
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Add photo error: ' . $e->getMessage());
            return response()->json(['success' => false, 'error' => 'Failed to add photo'], 500);
        }
    }

    // Get photos for assignment
    public function getPhotos($assignmentId, $type = null)
    {
        $query = Gallery::where('galleryable_id', $assignmentId)
            ->where('galleryable_type', ServiceJobAssignment::class);

        if ($type) {
            $query->where('type', $type);
        }

        $photos = $query->orderBy('order', 'asc')->get();

        return $photos->map(function ($photo) {
            return [
                'id' => $photo->id,
                'data' => Storage::url($photo->image_path),
                'thumbnail' => Storage::url($photo->thumbnail_path),
                'type' => $photo->type,
                'timestamp' => $photo->created_at->timestamp * 1000,
            ];
        });
    }

    // Delete a photo
    public function deletePhoto($photoId)
    {
        $user = Auth::user();

        $photo = Gallery::where('id', $photoId)
            ->where('uploaded_by', $user->id)
            ->firstOrFail();

        DB::beginTransaction();

        try {
            $this->deleteImage($photo);
            DB::commit();

            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'error' => 'Failed to delete photo'], 500);
        }
    }
}
