<?php

namespace App\Http\Controllers;

use App\Models\JobStatusHistory;
use App\Models\ServiceJob;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ManagerController extends Controller
{
    public function index(): Response
    {
        $user = Auth::user();

        // Get all jobs with their current assignment and technician
        $allJobs = ServiceJob::with([
            'currentAssignment.assignedTo',
            'currentAssignment.galleries'
        ])->orderBy('created_at', 'desc')->get();

        // Format jobs for frontend using the model method
        $formattedJobs = $allJobs->map(fn($job) => $job->formatForFrontend());

        // Get counts for stats
        $awaitingCount = $allJobs->where('status', 'awaiting_validation')->count();
        $inProgressCount = $allJobs->where('status', 'in_progress')->count();
        $pendingCount = $allJobs->where('status', 'pending')->count();
        $completedCount = $allJobs->where('status', 'completed')->count();

        // Get recent completed jobs (last 10)
        $recentCompleted = $allJobs->where('status', 'completed')
            ->take(10)
            ->values();

        return Inertia::render('manager/dashboard', [
            'jobs' => $formattedJobs,
            'user' => [
                'name' => $user->name,
                'role' => $user->role,
            ],
            'stats' => [
                'awaiting' => $awaitingCount,
                'inProgress' => $inProgressCount,
                'pending' => $pendingCount,
                'completed' => $completedCount,
            ],
            'recentJobs' => $recentCompleted->map(fn($job) => $job->formatForFrontend()),
            'now' => now()->timestamp * 1000,
        ]);
    }

    /**
     * Validate (approve/reject) a job
     */
    public function validateJob(Request $request, $jobId)
    {
        $request->validate([
            'approved' => 'required|boolean',
            'reason' => 'required_if:approved,false|nullable|string',
        ]);

        $user = Auth::user();

        $job = ServiceJob::where('job_id', $jobId)->firstOrFail();
        $assignment = $job->currentAssignment;

        if (!$assignment) {
            return back()->with('error', 'No active assignment found for this job.');
        }

        DB::beginTransaction();

        try {
            $oldStatus = $job->status;
            $newStatus = $request->approved ? 'completed' : 'rework';

            // Update assignment
            $assignment->update([
                'status' => $newStatus,
                'validated_by' => $user->id,
                'validated_at' => now(),
                'rejection_reason' => $request->approved ? null : $request->reason,
                'is_current' => $request->approved ? false : true,
            ]);

            // Update job status
            $job->update([
                'status' => $newStatus,
            ]);

            // Record status history
            JobStatusHistory::create([
                'service_job_id' => $job->id,
                'assignment_id' => $assignment->id,
                'old_status' => $oldStatus,
                'new_status' => $newStatus,
                'changed_by' => $user->id,
                'notes' => $request->approved ? 'Job approved by manager' : 'Job rejected and sent back for rework',
                'metadata' => [
                    'validation_notes' => $request->reason,
                    'manager_name' => $user->name,
                ],
            ]);

            DB::commit();

            $message = $request->approved
                ? 'Job approved successfully.'
                : 'Job rejected and sent back for rework.';

            return back()->with('success', $message);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Job validation error: ' . $e->getMessage());
            return back()->with('error', 'Failed to validate job. Please try again.');
        }
    }

    /**
     * Get job details for modal view
     */
    public function getJobDetails($jobId)
    {
        $job = ServiceJob::with([
            'currentAssignment.assignedTo',
            'currentAssignment.galleries',
        ])->where('job_id', $jobId)->firstOrFail();

        $assignment = $job->currentAssignment;

        // Get photos from gallery
        $beforePhotos = collect();
        $afterPhotos = $assignment?->galleries->where('type', 'after')->values() ?? collect();

        // Get before photos from checkin data
        $checkinData = $assignment?->checkin_data;
        if ($checkinData) {
            if (isset($checkinData['exteriorPhotos'])) {
                foreach ($checkinData['exteriorPhotos'] as $photo) {
                    $beforePhotos->push([
                        'data' => $photo['data'],
                        'timestamp' => $photo['timestamp'] ?? now()->timestamp * 1000,
                    ]);
                }
            }
            if (isset($checkinData['interiorPhotos'])) {
                foreach ($checkinData['interiorPhotos'] as $photo) {
                    $beforePhotos->push([
                        'data' => $photo['data'],
                        'timestamp' => $photo['timestamp'] ?? now()->timestamp * 1000,
                    ]);
                }
            }
        }

        $damageNotes = $checkinData['damageNotes'] ?? [];

        return response()->json([
            'job' => $this->formatJobData($job),
            'checkinData' => $checkinData,
            'damageNotes' => $damageNotes,
            'beforePhotos' => $beforePhotos->values()->toArray(),
            'afterPhotos' => $afterPhotos->map(fn($photo) => [
                'id' => $photo->id,
                'data' => asset('storage/' . $photo->image_path),
                'timestamp' => $photo->created_at->timestamp * 1000,
            ]),
            'assignedTo' => $assignment?->assignedTo?->name,
            'startedAt' => $assignment?->started_at?->timestamp * 1000,
            'duration' => $assignment?->duration,
        ]);
    }

    /**
     * Format job data for frontend
     */
    private function formatJobData($job)
    {
        $assignment = $job->currentAssignment;
        $checkinData = $assignment?->checkin_data;

        // Collect before photos from checkin data
        $beforePhotos = [];
        if ($checkinData) {
            if (isset($checkinData['exteriorPhotos']) && is_array($checkinData['exteriorPhotos'])) {
                foreach ($checkinData['exteriorPhotos'] as $photo) {
                    $beforePhotos[] = [
                        'data' => $photo['data'] ?? '',
                        'timestamp' => $photo['timestamp'] ?? now()->timestamp * 1000,
                    ];
                }
            }
            if (isset($checkinData['interiorPhotos']) && is_array($checkinData['interiorPhotos'])) {
                foreach ($checkinData['interiorPhotos'] as $photo) {
                    $beforePhotos[] = [
                        'data' => $photo['data'] ?? '',
                        'timestamp' => $photo['timestamp'] ?? now()->timestamp * 1000,
                    ];
                }
            }
        }

        // Collect after photos from gallery
        $afterPhotos = [];
        if ($assignment) {
            $galleryPhotos = $assignment->galleries()
                ->where('type', 'after')
                ->get();

            foreach ($galleryPhotos as $photo) {
                $afterPhotos[] = [
                    'id' => $photo->id,
                    'data' => asset('storage/' . $photo->image_path),
                    'timestamp' => $photo->created_at->timestamp * 1000,
                ];
            }
        }

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
            'checkin' => $checkinData ? [
                'mileage' => $checkinData['mileage'] ?? null,
                'fuelLevel' => $checkinData['fuelLevel'] ?? null,
                'keysReceived' => $checkinData['keysReceived'] ?? null,
                'keyCount' => $checkinData['keyCount'] ?? null,
                'personalItems' => $checkinData['personalItems'] ?? null,
                'damageNotes' => $checkinData['damageNotes'] ?? [],
                'customerExpectations' => $checkinData['customerExpectations'] ?? null,
            ] : null,
            'beforePhotos' => $beforePhotos,
            'afterPhotos' => $afterPhotos,
        ];
    }
}
