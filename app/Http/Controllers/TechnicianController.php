<?php

namespace App\Http\Controllers;

use App\Models\ServiceJob;
use App\Models\Shift;
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
            ->map(function ($job) {
                return $this->formatJobData($job);
            });

        // Get jobs assigned to current technician
        $myJobs = ServiceJob::where('current_technician_id', $user->id)
            ->whereIn('status', ['assigned', 'in_progress', 'awaiting_validation', 'rework'])
            ->orderBy('priority', 'desc')
            ->orderBy('due_date', 'asc')
            ->get()
            ->map(function ($job) {
                return $this->formatJobData($job);
            });


        // Get completed jobs by current technician
        // $completedJobs = ServiceJob::whereHas('assignments', function ($query) use ($user) {
        //     $query->where('assigned_to', $user->id)
        //         ->where('status', 'completed');
        // })
        //     ->orderBy('updated_at', 'desc')
        //     ->limit(10)
        //     ->get()
        //     ->map(function ($job) {
        //         $data = $this->formatJobData($job);
        //         // Add assignment specific data
        //         $assignment = $job->assignments()->where('assigned_to', Auth::id())->first();
        //         if ($assignment) {
        //             $data['duration'] = $assignment->duration;
        //             $data['completed_at'] = $assignment->completed_at;
        //         }
        //         return $data;
        //     });

        // Get current active job (in progress or awaiting validation)
        $activeJob = ServiceJob::where('current_technician_id', $user->id)
            ->whereIn('status', ['in_progress', 'awaiting_validation'])
            ->first();

        $activeJobData = $activeJob ? $this->formatJobData($activeJob) : null;

        // Get or create today's shift
        // $shift = Shift::firstOrCreate(
        //     [
        //         'user_id' => $user->id,
        //         'shift_date' => Carbon::today()->toDateString(),
        //     ],
        //     [
        //         'status' => 'active',
        //     ]
        // );

        // Get shift status for frontend
        // $shiftData = [
        //     'punched_in' => $shift->punch_in_at !== null && $shift->punch_out_at === null,
        //     'punch_time' => $shift->punch_in_at ? $shift->punch_in_at->timestamp * 1000 : null,
        //     'punch_in_at' => $shift->punch_in_at,
        //     'punch_out_at' => $shift->punch_out_at,
        //     'total_duration' => $shift->total_duration_minutes,
        // ];

        return Inertia::render('technician/dashboard', [
            'pendingJobs' => $pendingJobs,
            'myJobs' => $myJobs,
            // 'completedJobs' => $completedJobs,
            'activeJob' => $activeJobData,
            // 'shift' => $shiftData,
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
}
