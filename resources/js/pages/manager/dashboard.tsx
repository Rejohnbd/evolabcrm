import { Head } from '@inertiajs/react';
import { useState } from 'react';
// import '../../../css/welcome.css';
import { esc } from '@/lib/helper';

interface Job {
    id: string;
    customer: string;
    phone: string;
    vehicle: string;
    color: string;
    plate: string;
    service: string;
    notes: string;
    source: 'Retail' | 'Dealer';
    status:
        | 'pending'
        | 'in_progress'
        | 'awaiting_validation'
        | 'completed'
        | 'rework';
    priority: 'normal' | 'high';
    dueDate: string;
    startedBy?: string;
    startedAt?: number;
    completedAt?: number;
    duration?: number;
    validatedAt?: number;
    validatedBy?: string;
    rejectionReason?: string;
    checkin?: {
        mileage?: string;
        fuelLevel?: string;
        keysReceived?: boolean;
        keyCount?: string;
        personalItems?: string;
        damageNotes?: Array<{ location: string; description: string }>;
        customerExpectations?: string;
    };
    beforePhotos?: Array<{ data: string; timestamp: number }>;
    afterPhotos?: Array<{ data: string; timestamp: number }>;
    progressNotes?: Array<{ text: string; timestamp: number }>;
}

interface User {
    name: string;
    role: 'manager';
}

interface ManagerProps {
    user?: User;
    jobs?: Job[];
}

const DEMO_JOBS: Job[] = [
    {
        id: 'EVO-2401',
        customer: 'M. Khan',
        phone: '(416) 555-0142',
        vehicle: '2023 BMW X5 M50i',
        color: 'Carbon Black',
        plate: 'CKHN 482',
        service: 'EVO SPEC-2',
        notes: 'Pet hair in trunk and rear seats.',
        source: 'Retail',
        status: 'pending',
        priority: 'normal',
        dueDate: 'Today 4:00 PM',
    },
    {
        id: 'EVO-2402',
        customer: 'S. Patel',
        phone: '(905) 555-0198',
        vehicle: '2022 Audi RS6 Avant',
        color: 'Nardo Gray',
        plate: 'RS6 GTA',
        service: 'Stage 1 Paint Correction',
        notes: 'Light swirls on hood. Two-stage polish.',
        source: 'Retail',
        status: 'awaiting_validation',
        priority: 'high',
        dueDate: 'Today 6:00 PM',
        startedBy: 'Adam',
        startedAt: Date.now() - 3600000,
        duration: 3600000,
    },
    {
        id: 'EVO-2403',
        customer: 'Performance Auto',
        phone: '(905) 555-0287',
        vehicle: '2024 Porsche 911 GT3',
        color: 'Shark Blue',
        plate: 'GT3 911',
        service: '5-Year Ceramic',
        notes: 'Dealer prep. Showroom condition.',
        source: 'Dealer',
        status: 'in_progress',
        priority: 'high',
        dueDate: 'Tomorrow 10:00 AM',
        startedBy: 'Sarah',
    },
    {
        id: 'EVO-2404',
        customer: 'D. Chen',
        phone: '(647) 555-0319',
        vehicle: '2024 Tesla Model 3',
        color: 'Stealth Grey',
        plate: 'EV-3PFR',
        service: 'EVO SPEC-1',
        notes: 'Light maintenance only.',
        source: 'Retail',
        status: 'completed',
        priority: 'normal',
        dueDate: 'Today 2:00 PM',
        startedBy: 'Adam',
        completedAt: Date.now(),
        duration: 1800000,
    },
];

export default function ManagerDashboard({
    user = { name: 'Manager', role: 'manager' },
    jobs: initialJobs,
}: ManagerProps) {
    const [jobs, setJobs] = useState<Job[]>(initialJobs || DEMO_JOBS);
    const [managerTab, setManagerTab] = useState<
        'review' | 'active' | 'queue' | 'history'
    >('review');
    const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
    const [rejectForm, setRejectForm] = useState(false);
    const [rejectReason, setRejectReason] = useState('');

    const awaiting = jobs.filter((j) => j.status === 'awaiting_validation');
    const inProgress = jobs.filter((j) => j.status === 'in_progress');
    const pending = jobs.filter((j) => j.status === 'pending');
    const completed = jobs.filter((j) => j.status === 'completed').length;
    const recent = jobs
        .filter((j) => j.status === 'completed' || j.status === 'rework')
        .slice(-10)
        .reverse();

    let tabJobs: Job[] = [];
    let emptyMsg = '';

    if (managerTab === 'review') {
        tabJobs = awaiting;
        emptyMsg = 'Nothing to review.';
    } else if (managerTab === 'active') {
        tabJobs = inProgress;
        emptyMsg = 'Nothing in progress.';
    } else if (managerTab === 'queue') {
        tabJobs = pending;
        emptyMsg = 'Queue is empty.';
    } else if (managerTab === 'history') {
        tabJobs = recent;
        emptyMsg = 'No history yet.';
    }

    const selectedJob = selectedJobId
        ? jobs.find((j) => j.id === selectedJobId)
        : null;

    const handleApproveJob = () => {
        setJobs(
            jobs.map((j) =>
                j.id === selectedJobId
                    ? { ...j, status: 'completed', validatedBy: user.name }
                    : j,
            ),
        );
        setSelectedJobId(null);
        setRejectForm(false);
        setRejectReason('');
    };

    const handleRejectJob = () => {
        if (!rejectReason.trim()) return;
        setJobs(
            jobs.map((j) =>
                j.id === selectedJobId
                    ? {
                          ...j,
                          status: 'rework',
                          rejectionReason: rejectReason,
                      }
                    : j,
            ),
        );
        setSelectedJobId(null);
        setRejectForm(false);
        setRejectReason('');
    };

    const handleQuickApprove = (jobId: string) => {
        setJobs(
            jobs.map((j) =>
                j.id === jobId ? { ...j, status: 'completed' } : j,
            ),
        );
    };

    const handleQuickRework = (jobId: string) => {
        setJobs(
            jobs.map((j) => (j.id === jobId ? { ...j, status: 'rework' } : j)),
        );
    };

    // const handleLogout = () => {
    //     router.post('/evolab/logout');
    // };

    const handleResetDemo = () => {
        setJobs(DEMO_JOBS);
        setSelectedJobId(null);
    };

    return (
        <>
            <Head title="Manager | EvoLab Operations" />

            <main
                className="container"
                style={{
                    paddingTop: '24px',
                    paddingBottom: '80px',
                    maxWidth: '480px',
                    margin: '0 auto',
                    paddingLeft: '20px',
                    paddingRight: '20px',
                }}
            >
                {/* Stats Section */}
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr 1fr',
                        gap: '8px',
                        marginBottom: '24px',
                    }}
                >
                    <div
                        className="card"
                        style={{
                            padding: '12px',
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '12px',
                        }}
                    >
                        <div
                            style={{
                                fontSize: '9px',
                                textTransform: 'uppercase',
                                letterSpacing: '0.1em',
                                color: 'rgba(255,255,255,0.4)',
                            }}
                        >
                            DONE
                        </div>
                        <div
                            className="display-font"
                            style={{
                                fontSize: '30px',
                                color: '#22C55E',
                                marginTop: '4px',
                            }}
                        >
                            {completed}
                        </div>
                    </div>
                    <div
                        className="card"
                        style={{
                            padding: '12px',
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '12px',
                        }}
                    >
                        <div
                            style={{
                                fontSize: '9px',
                                textTransform: 'uppercase',
                                letterSpacing: '0.1em',
                                color: 'rgba(255,255,255,0.4)',
                            }}
                        >
                            ACTIVE
                        </div>
                        <div
                            className="display-font"
                            style={{
                                fontSize: '30px',
                                color: '#EF4444',
                                marginTop: '4px',
                            }}
                        >
                            {inProgress.length}
                        </div>
                    </div>
                    <div
                        className="card"
                        style={{
                            padding: '12px',
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '12px',
                        }}
                    >
                        <div
                            style={{
                                fontSize: '9px',
                                textTransform: 'uppercase',
                                letterSpacing: '0.1em',
                                color: 'rgba(255,255,255,0.4)',
                            }}
                        >
                            REVIEW
                        </div>
                        <div
                            className="display-font"
                            style={{
                                fontSize: '30px',
                                color: '#EAB308',
                                marginTop: '4px',
                            }}
                        >
                            {awaiting.length}
                        </div>
                    </div>
                </div>

                {/* Awaiting Review Alert */}
                {awaiting.length > 0 && (
                    <div
                        style={{
                            background: 'rgba(234,179,8,0.1)',
                            border: '1px solid rgba(234,179,8,0.3)',
                            borderRadius: '12px',
                            padding: '16px',
                            marginBottom: '24px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                        }}
                    >
                        <span style={{ color: '#EAB308' }}>⚠</span>
                        <div style={{ fontSize: '14px' }}>
                            <span style={{ fontWeight: 600 }}>
                                {awaiting.length} job
                                {awaiting.length > 1 ? 's' : ''}
                            </span>
                            <span style={{ color: 'rgba(255,255,255,0.7)' }}>
                                {' '}
                                awaiting review
                            </span>
                        </div>
                    </div>
                )}

                {/* Tab Navigation */}
                <div
                    style={{
                        display: 'flex',
                        gap: '4px',
                        marginBottom: '16px',
                        borderBottom: '1px solid rgba(255,255,255,0.1)',
                        overflowX: 'auto',
                    }}
                >
                    {(['review', 'active', 'queue', 'history'] as const).map(
                        (tab) => (
                            <button
                                key={tab}
                                onClick={() => setManagerTab(tab)}
                                style={{
                                    padding: '10px 16px',
                                    fontSize: '11px',
                                    letterSpacing: '0.1em',
                                    borderBottom:
                                        managerTab === tab
                                            ? '2px solid #DC2626'
                                            : '2px solid transparent',
                                    color:
                                        managerTab === tab
                                            ? '#fff'
                                            : 'rgba(255,255,255,0.4)',
                                    whiteSpace: 'nowrap',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    textTransform: 'uppercase',
                                }}
                            >
                                {tab === 'review'
                                    ? 'REVIEW'
                                    : tab === 'active'
                                      ? 'ACTIVE'
                                      : tab === 'queue'
                                        ? 'QUEUE'
                                        : 'HISTORY'}
                                {(tab === 'review' && awaiting.length > 0) ||
                                (tab === 'active' && inProgress.length > 0) ||
                                (tab === 'queue' && pending.length > 0) ||
                                (tab === 'history' && recent.length > 0) ? (
                                    <span
                                        style={{
                                            color: '#EF4444',
                                            marginLeft: '4px',
                                        }}
                                    >
                                        (
                                        {tab === 'review'
                                            ? awaiting.length
                                            : tab === 'active'
                                              ? inProgress.length
                                              : tab === 'queue'
                                                ? pending.length
                                                : recent.length}
                                        )
                                    </span>
                                ) : null}
                            </button>
                        ),
                    )}
                </div>

                {/* Tab Content */}
                {tabJobs.length === 0 ? (
                    <div
                        style={{
                            color: 'rgba(255,255,255,0.3)',
                            fontSize: '14px',
                            padding: '48px 16px',
                            textAlign: 'center',
                            border: '1px dashed rgba(255,255,255,0.1)',
                            borderRadius: '12px',
                        }}
                    >
                        {emptyMsg}
                    </div>
                ) : (
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px',
                        }}
                    >
                        {tabJobs.map((job) => (
                            <div
                                key={job.id}
                                className="card"
                                onClick={() => setSelectedJobId(job.id)}
                                style={{
                                    textAlign: 'left',
                                    width: '100%',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '12px',
                                    padding: '16px',
                                    background: 'rgba(255,255,255,0.03)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '12px',
                                    transition: 'border-color 0.2s',
                                }}
                                onMouseEnter={(e) => {
                                    (
                                        e.currentTarget as HTMLElement
                                    ).style.borderColor =
                                        'rgba(255,255,255,0.2)';
                                }}
                                onMouseLeave={(e) => {
                                    (
                                        e.currentTarget as HTMLElement
                                    ).style.borderColor =
                                        'rgba(255,255,255,0.1)';
                                }}
                            >
                                <div
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'flex-start',
                                        gap: '12px',
                                    }}
                                >
                                    <div style={{ minWidth: 0, flex: 1 }}>
                                        <div
                                            style={{
                                                fontSize: '10px',
                                                color: 'rgba(255,255,255,0.4)',
                                                letterSpacing: '0.05em',
                                                marginBottom: '4px',
                                            }}
                                        >
                                            {esc(job.id)}
                                        </div>
                                        <div
                                            className="display-font"
                                            style={{
                                                fontSize: '18px',
                                                lineHeight: 1.2,
                                            }}
                                        >
                                            {esc(job.vehicle)}
                                        </div>
                                        <div
                                            style={{
                                                fontSize: '11px',
                                                color: 'rgba(255,255,255,0.4)',
                                                marginTop: '4px',
                                            }}
                                        >
                                            {esc(job.color)} · {esc(job.plate)}
                                        </div>
                                    </div>
                                </div>
                                <div
                                    style={{
                                        fontSize: '12px',
                                        color: '#EF4444',
                                        fontWeight: 500,
                                    }}
                                >
                                    {esc(job.service)}
                                </div>
                                <div
                                    style={{
                                        fontSize: '11px',
                                        color: 'rgba(255,255,255,0.5)',
                                    }}
                                >
                                    {esc(job.customer)}
                                </div>
                                {job.status === 'awaiting_validation' && (
                                    <div
                                        style={{
                                            display: 'grid',
                                            gridTemplateColumns: '1fr 1fr',
                                            gap: '8px',
                                            marginTop: '4px',
                                        }}
                                    >
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleQuickRework(job.id);
                                            }}
                                            style={{
                                                background:
                                                    'rgba(255,255,255,0.1)',
                                                color: '#fff',
                                                padding: '8px',
                                                borderRadius: '6px',
                                                fontSize: '12px',
                                                border: 'none',
                                                cursor: 'pointer',
                                            }}
                                        >
                                            ✕ REWORK
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleQuickApprove(job.id);
                                            }}
                                            style={{
                                                background: '#DC2626',
                                                color: '#fff',
                                                padding: '8px',
                                                borderRadius: '6px',
                                                fontSize: '12px',
                                                border: 'none',
                                                cursor: 'pointer',
                                            }}
                                        >
                                            ✓ APPROVE
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Demo Tools */}
                <div
                    style={{
                        marginTop: '32px',
                        paddingTop: '24px',
                        borderTop: '1px solid rgba(255,255,255,0.1)',
                    }}
                >
                    <div className="label-tiny" style={{ marginBottom: '8px' }}>
                        Demo Tools
                    </div>
                    <button
                        onClick={handleResetDemo}
                        style={{
                            width: '100%',
                            background: 'rgba(255,255,255,0.1)',
                            color: '#fff',
                            padding: '12px',
                            borderRadius: '8px',
                            fontSize: '14px',
                            border: 'none',
                            cursor: 'pointer',
                        }}
                    >
                        Reset Demo Data
                    </button>
                </div>
            </main>

            {/* <style>{`
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
                .pulse {
                    animation: pulse 2s infinite;
                }
                .card {
                    background: rgba(255,255,255,0.03);
                    border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 12px;
                }
                .display-font {
                    font-family: 'Anton', sans-serif;
                    letter-spacing: 0.01em;
                }
                .label-tiny {
                    font-size: 10px;
                    text-transform: uppercase;
                    letter-spacing: 0.25em;
                    color: rgba(255,255,255,0.5);
                }
                .red-dot {
                    color: #DC2626;
                }
                .header {
                    border-bottom: 1px solid rgba(255,255,255,0.1);
                    padding: 16px 20px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    position: sticky;
                    top: 0;
                    background: rgba(0,0,0,0.95);
                    backdrop-filter: blur(8px);
                    z-index: 40;
                }
                .container {
                    max-width: 480px;
                    margin: 0 auto;
                    padding: 0 20px;
                }
            `}</style> */}
        </>
    );
}
