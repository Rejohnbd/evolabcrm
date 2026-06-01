<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class WelcomeController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('welcome');
    }

    public function technicianLogin(Request $request)
    {
        $request->validate([
            'name' => 'required|string',
            'role' => 'required|in:technician',
        ]);

        $name = trim($request->name);
        $user = User::whereRaw('LOWER(name) = ?', [strtolower($name)])
            ->where('role', 'technician')
            ->first();

        if (!$user) {
            return back()->withErrors([
                'name' => 'Technician not found. Please check the name and try again.'
            ])->onlyInput('name');
        }

        Auth::login($user);

        // Regenerate session to prevent session fixation
        $request->session()->regenerate();


        return redirect()->route('technician');
    }

    // public function technicianDashboard(Request $request): Response
    // {
    //     // Get or initialize session data
    //     $shift = [
    //         'punchedIn' => $request->session()->get('shift.punched_in', false),
    //         'punchTime' => $request->session()->get('shift.punch_time'),
    //     ];

    //     $user = [
    //         'name' => $request->session()->get('user.name', 'Adam'),
    //         'role' => 'technician',
    //     ];

    //     return Inertia::render('technician', [
    //         'shift' => $shift,
    //         'user' => $user,
    //     ]);
    // }

    // public function technician(Request $request): Response
    // {
    //     // Get or initialize session data
    //     $shift = [
    //         'punchedIn' => $request->session()->get('shift.punched_in', false),
    //         'punchTime' => $request->session()->get('shift.punch_time'),
    //     ];

    //     $user = [
    //         'name' => $request->session()->get('user.name', 'Adam'),
    //         'role' => 'technician',
    //     ];

    //     return Inertia::render('technician', [
    //         'shift' => $shift,
    //         'user' => $user,
    //     ]);
    // }

    // public function checkin(Request $request, string $jobId): Response
    // {
    //     // Get or initialize session data
    //     $shift = [
    //         'punchedIn' => $request->session()->get('shift.punched_in', false),
    //         'punchTime' => $request->session()->get('shift.punch_time'),
    //     ];

    //     $user = [
    //         'name' => $request->session()->get('user.name', 'Adam'),
    //         'role' => 'technician',
    //     ];

    //     return Inertia::render('checkin', [
    //         'shift' => $shift,
    //         'user' => $user,
    //         'jobId' => $jobId,
    //     ]);
    // }

    // public function jobView(Request $request, string $jobId): Response
    // {
    //     // Get or initialize session data
    //     $shift = [
    //         'punchedIn' => $request->session()->get('shift.punched_in', false),
    //         'punchTime' => $request->session()->get('shift.punch_time'),
    //     ];

    //     $user = [
    //         'name' => $request->session()->get('user.name', 'Adam'),
    //         'role' => 'technician',
    //     ];

    //     return Inertia::render('job', [
    //         'shift' => $shift,
    //         'user' => $user,
    //         'jobId' => $jobId,
    //     ]);
    // }

    // public function completeJob(Request $request, string $jobId): void
    // {
    //     // Mark job as complete and redirect to dashboard
    //     redirect('/evolab/dashboard')->send();
    // }

    // public function manager(Request $request): Response
    // {
    //     // Get or initialize session data
    //     $user = [
    //         'name' => $request->session()->get('user.name', 'Manager'),
    //         'role' => 'manager',
    //     ];

    //     return Inertia::render('manager', [
    //         'user' => $user,
    //     ]);
    // }

    // public function managerDashboard(Request $request): Response
    // {
    //     // Get or initialize session data
    //     $user = [
    //         'name' => $request->session()->get('user.name', 'Manager'),
    //         'role' => 'manager',
    //     ];

    //     return Inertia::render('manager', [
    //         'user' => $user,
    //     ]);
    // }

    public function logout(Request $request)
    {
        Auth::logout();
        // Invalidate and regenerate session
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        return redirect()->route('home');
    }
}
