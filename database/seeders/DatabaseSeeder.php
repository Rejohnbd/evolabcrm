<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        User::factory()->create([
            'name' => 'Admin',
            'role' => 'admin',
            'email' => 'admin@mail.com',
            'password' => Hash::make("password"),
        ]);

        User::factory()->create([
            'name' => 'Manager',
            'role' => 'manager',
            'email' => null,
            'password' => Hash::make("evolab2026"),
        ]);

        User::factory()->create([
            'name' => 'Technician',
            'role' => 'technician',
            'email' => null,
            'password' => null,
        ]);
    }
}
