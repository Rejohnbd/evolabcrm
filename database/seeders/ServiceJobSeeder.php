<?php

namespace Database\Seeders;

use App\Models\ServiceJob;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class ServiceJobSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $demoJobs = [
            [
                'job_id' => 'EVO-2401',
                'customer' => 'M. Khan',
                'phone' => '(416) 555-0142',
                'vehicle' => '2023 BMW X5 M50i',
                'color' => 'Carbon Black',
                'plate' => 'CKHN 482',
                'service' => 'EVO SPEC-2',
                'notes' => 'Pet hair in trunk and rear seats.',
                'source' => 'Retail',
                'priority' => 'normal',
                'due_date' => $this->parseDueDate('Today 4:00 PM'),
                'status' => 'pending',
            ],
            [
                'job_id' => 'EVO-2402',
                'customer' => 'S. Patel',
                'phone' => '(905) 555-0198',
                'vehicle' => '2022 Audi RS6 Avant',
                'color' => 'Nardo Gray',
                'plate' => 'RS6 GTA',
                'service' => 'Stage 1 Paint Correction',
                'notes' => 'Light swirls on hood. Two-stage polish.',
                'source' => 'Retail',
                'priority' => 'high',
                'due_date' => $this->parseDueDate('Today 6:00 PM'),
                'status' => 'pending',
            ],
            [
                'job_id' => 'EVO-2403',
                'customer' => 'Performance Auto',
                'phone' => '(905) 555-0287',
                'vehicle' => '2024 Porsche 911 GT3',
                'color' => 'Shark Blue',
                'plate' => 'GT3 911',
                'service' => '5-Year Ceramic',
                'notes' => 'Dealer prep. Showroom condition.',
                'source' => 'Dealer',
                'priority' => 'high',
                'due_date' => $this->parseDueDate('Tomorrow 10:00 AM'),
                'status' => 'pending',
            ],
            [
                'job_id' => 'EVO-2404',
                'customer' => 'D. Chen',
                'phone' => '(647) 555-0319',
                'vehicle' => '2024 Tesla Model 3',
                'color' => 'Stealth Grey',
                'plate' => 'EV-3PFR',
                'service' => 'EVO SPEC-1',
                'notes' => 'Light maintenance only.',
                'source' => 'Retail',
                'priority' => 'normal',
                'due_date' => $this->parseDueDate('Tomorrow 2:00 PM'),
                'status' => 'pending',
            ],
            [
                'job_id' => 'EVO-2405',
                'customer' => 'Lakeview Motors',
                'phone' => '(905) 555-0156',
                'vehicle' => '2023 Mercedes G63 AMG',
                'color' => 'Obsidian Black',
                'plate' => 'G63 LKV',
                'service' => 'EVO SPEC-2',
                'notes' => 'Pre-delivery prep for new owner.',
                'source' => 'Dealer',
                'priority' => 'normal',
                'due_date' => $this->parseDueDate('Tomorrow 5:00 PM'),
                'status' => 'pending',
            ],
        ];

        foreach ($demoJobs as $jobData) {
            $serviceJob = ServiceJob::create($jobData);
        }
    }
    /**
     * Parse due date string to Carbon instance
     */
    private function parseDueDate(string $dueDateString): Carbon
    {
        $now = Carbon::now();

        // Handle "Today" cases
        if (str_contains($dueDateString, 'Today')) {
            $time = $this->extractTime($dueDateString);
            return $now->setTime($time['hour'], $time['minute'], 0);
        }

        // Handle "Tomorrow" cases
        if (str_contains($dueDateString, 'Tomorrow')) {
            $time = $this->extractTime($dueDateString);
            return $now->addDay()->setTime($time['hour'], $time['minute'], 0);
        }

        // Default to tomorrow if format not recognized
        return $now->addDay()->setTime(17, 0, 0);
    }

    /**
     * Extract hour and minute from time string
     */
    private function extractTime(string $timeString): array
    {
        // Pattern matches times like "4:00 PM", "6:00 PM", "10:00 AM", etc.
        preg_match('/(\d{1,2}):(\d{2})\s*(AM|PM)/i', $timeString, $matches);

        if (count($matches) >= 4) {
            $hour = (int)$matches[1];
            $minute = (int)$matches[2];
            $meridiem = strtoupper($matches[3]);

            // Convert to 24-hour format
            if ($meridiem === 'PM' && $hour !== 12) {
                $hour += 12;
            } elseif ($meridiem === 'AM' && $hour === 12) {
                $hour = 0;
            }

            return ['hour' => $hour, 'minute' => $minute];
        }

        // Default to 5:00 PM if parsing fails
        return ['hour' => 17, 'minute' => 0];
    }
}
