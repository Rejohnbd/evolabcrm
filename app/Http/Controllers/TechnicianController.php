<?php

namespace App\Http\Controllers;

use App\Models\ServiceJob;
use App\Models\Shift;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;
use Carbon\Carbon;

class TechnicianController extends Controller
{
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

        // ✅ FIXED: Get completed jobs by current technician using whereHas
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
    public function completeCheckin(Request $request, $jobId)
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

        // Check if job is already in progress
        if (in_array($job->status, ['in_progress', 'awaiting_validation', 'completed'])) {
            return redirect()->route('technician')->with('error', 'This job is already in progress or completed.');
        }

        $request->validate([
            'mileage' => 'required|string',
            'fuelLevel' => 'required|string',
            'keysReceived' => 'required|boolean',
            'keyCount' => 'required|string',
            'exteriorPhotos' => 'required|array|min:1',
            'interiorPhotos' => 'required|array|min:1',
            'damageNotes' => 'nullable|array',
            'personalItems' => 'nullable|string',
            'customerExpectations' => 'nullable|string',
        ]);

        $checkinData = [
            'mileage' => $request->mileage,
            'fuelLevel' => $request->fuelLevel,
            'keysReceived' => $request->keysReceived,
            'keyCount' => $request->keyCount,
            'personalItems' => $request->personalItems,
            'customerExpectations' => $request->customerExpectations,
            'damageNotes' => $request->damageNotes,
            'checked_in_at' => now()->toISOString(),
        ];

        // Create assignment ONLY when checkin is completed
        $assignment = ServiceJobAssignment::create([
            'service_job_id' => $job->id,
            'assigned_to' => $user->id,
            'status' => 'in_progress',
            'assigned_at' => now(),
            'started_at' => now(),
            'checkin_data' => $checkinData,
            'is_current' => true,
        ]);

        // Update job status
        $job->update([
            'status' => 'in_progress',
            'current_technician_id' => $user->id,
        ]);

        // Redirect to job page
        return redirect()->route('technician.job', $job->job_id)
            ->with('success', 'Checkin completed. Job started successfully.');
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
}
