import { Head, router } from '@inertiajs/react';
import '../../css/welcome.css';

interface CheckinLayoutProps {
    children: React.ReactNode;
    title?: string;
    onBack?: () => void;
}

export default function CheckinLayout({
    children,
    title = 'VEHICLE INTAKE',
    onBack,
}: CheckinLayoutProps) {
    const handleBack = () => {
        if (onBack) {
            onBack();
        } else {
            router.get('/technician');
        }
    };

    return (
        <div className="welcome-root">
            <Head title={`${title} | EvoLab Operations`}>
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
                    ← Cancel
                </button>
                <div className="label-tiny">{title}</div>
                <div style={{ width: '48px' }}></div>
            </header>
            {children}
        </div>
    );
}
