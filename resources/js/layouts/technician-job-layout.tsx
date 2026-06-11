import { Head, router, usePage } from '@inertiajs/react';
import { ReactNode } from 'react';
import '../../css/welcome.css';

interface TechnicianJobLayoutProps {
    children: ReactNode;
}

export default function TechnicianJobLayout({
    children,
}: TechnicianJobLayoutProps) {
    // Get job from page props (passed from controller)
    const { job } = usePage().props as { job?: { id: string } };
    const jobId = job?.id || 'Loading...';

    const handleBack = () => {
        router.get('/technician');
    };

    return (
        <div className="welcome-root">
            <Head title={`Job ${jobId} | EvoLab Operations`}>
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
                <button
                    onClick={handleBack}
                    style={{
                        color: 'rgba(255,255,255,0.6)',
                        fontSize: '14px',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                    }}
                >
                    ← Back
                </button>
                <div className="label-tiny">{jobId}</div>
            </header>
            {children}
        </div>
    );
}
