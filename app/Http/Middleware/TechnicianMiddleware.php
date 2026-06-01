<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class TechnicianMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Check if user is authenticated
        if (!Auth::check()) {
            return redirect()->route('home');
        }

        $user = Auth::user();

        // Allow only technician and manager roles
        if ($user->role !== 'technician' && $user->role !== 'manager') {
            abort(403, 'Unauthorized access. Only technicians and managers are allowed.');
        }

        return $next($request);
    }
}
