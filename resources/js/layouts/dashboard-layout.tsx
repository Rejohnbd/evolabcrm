// resources/js/Layouts/DashboardLayout.tsx
import { Head, router, usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import '../../css/welcome.css';

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    const { auth } = usePage().props;
    const user = auth?.user;

    console.log('Auth data:', auth);

    // Handle unauthorized access
    useEffect(() => {
        if (!user) {
            // Redirect to login if no user
            router.get('/');
            return;
        }

        // Check if user has valid role
        if (user.role !== 'technician' && user.role !== 'manager') {
            // Redirect to unauthorized page or show error
            console.error('Unauthorized: Invalid role');
            router.get('/');
        }
    }, [user]);

    const handleLogout = async () => {
        console.log('Logging out...');

        router.post(
            '/evolab-logout',
            {},
            {
                onSuccess: () => {
                    console.log('Logout successful');
                    router.get('/');
                },
                onError: (errors) => {
                    console.error('Logout error:', errors);
                },
            },
        );
    };

    // Don't render layout if no user or invalid role
    if (!user || (user.role !== 'technician' && user.role !== 'manager')) {
        return null;
    }

    const isManager = user.role === 'manager';
    const userName = user.name || 'USER';
    const userRole = isManager ? 'MANAGER' : 'TECHNICIAN';

    return (
        <div className="welcome-root">
            <Head title="EvoLab Operations">
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link
                    rel="preconnect"
                    href="https://fonts.gstatic.com"
                    crossOrigin="anonymous"
                />
                <link
                    href="https://fonts.googleapis.com/css2?family=Anton&family=Manrope:wght@300;400;500;600;700;800&display=swap"
                    rel="stylesheet"
                />
            </Head>

            <header className="header">
                <div>
                    <div
                        className="display-font"
                        style={{ fontSize: '24px', lineHeight: '1' }}
                    >
                        EVO<span className="red-dot">.</span>LAB
                    </div>
                    <div className="label-tiny" style={{ marginTop: '4px' }}>
                        {isManager ? '🔒 ' : ''}
                        {userName.toUpperCase()} · {userRole}
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    style={{
                        color: 'rgba(255,255,255,0.4)',
                        padding: '8px',
                        fontSize: '14px',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                    }}
                >
                    ⎋
                </button>
            </header>
            {children}
        </div>
    );
}
