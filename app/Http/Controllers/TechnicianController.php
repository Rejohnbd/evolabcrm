<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;

class TechnicianController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('technician/dashboard', [
            // 
        ]);
    }
}
