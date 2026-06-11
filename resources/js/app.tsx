import { createInertiaApp } from '@inertiajs/react';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { initializeTheme } from '@/hooks/use-appearance';
import AppLayout from '@/layouts/app-layout';
import AuthLayout from '@/layouts/auth-layout';
import SettingsLayout from '@/layouts/settings/layout';
import DashboardLayout from './layouts/dashboard-layout';
import CheckinLayout from './layouts/checkin-layout';
import TechnicianJobLayout from './layouts/technician-job-layout';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

const EVOLAB_PAGES = [
    'technician',
    'technician/dashboard',
    // 'technician/checkin',
    'manager',
    'manager/dashboard',
];

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    layout: (name) => {
        switch (true) {
            case name === 'welcome':
                return null;
            case EVOLAB_PAGES.includes(name):
                return DashboardLayout;
            case name === 'technician/checkin':
                return CheckinLayout;
            case name === 'technician/job':
                return TechnicianJobLayout;
            case name.startsWith('auth/'):
                return AuthLayout;
            case name.startsWith('settings/'):
                return [AppLayout, SettingsLayout];
            default:
                return AppLayout;
        }
    },
    strictMode: true,
    withApp(app) {
        return (
            <TooltipProvider delayDuration={0}>
                {app}
                <Toaster />
            </TooltipProvider>
        );
    },
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on load...
initializeTheme();
