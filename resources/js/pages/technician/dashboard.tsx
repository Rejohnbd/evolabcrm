import { Head, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
// import '../../../css/welcome.css';
import { formatDuration, formatTime, statusBadge, esc } from '@/lib/helper';

// ============= TYPES =============
interface Photo {
    data: string;
    timestamp: number;
}

interface DamageNote {
    location: string;
    description: string;
    timestamp: number;
}

interface CheckinData {
    mileage: string;
    fuelLevel: string;
    keysReceived: boolean | null;
    keyCount: string;
    personalItems: string;
    exteriorPhotos: Photo[];
    interiorPhotos: Photo[];
    damageNotes: DamageNote[];
    customerExpectations: string;
}

interface ProgressNote {
    text: string;
    timestamp: number;
}

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
    checkin?: CheckinData;
    beforePhotos?: Photo[];
    afterPhotos?: Photo[];
    progressNotes?: ProgressNote[];
}

interface ShiftState {
    punchedIn: boolean;
    punchTime: number | null;
}

interface User {
    name: string;
    role: 'technician' | 'manager';
}

// ============= DEMO DATA =============
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
        status: 'pending',
        priority: 'high',
        dueDate: 'Today 6:00 PM',
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
        status: 'pending',
        priority: 'high',
        dueDate: 'Tomorrow 10:00 AM',
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
        status: 'pending',
        priority: 'normal',
        dueDate: 'Tomorrow 2:00 PM',
    },
    {
        id: 'EVO-2405',
        customer: 'Lakeview Motors',
        phone: '(905) 555-0156',
        vehicle: '2023 Mercedes G63 AMG',
        color: 'Obsidian Black',
        plate: 'G63 LKV',
        service: 'EVO SPEC-2',
        notes: 'Pre-delivery prep for new owner.',
        source: 'Dealer',
        status: 'pending',
        priority: 'normal',
        dueDate: 'Tomorrow 5:00 PM',
    },
];

// ============= MAIN COMPONENT =============
interface TechnicianProps {
    shift?: ShiftState;
    user?: User;
    jobs?: Job[];
    activeJob?: Job | null;
}

export default function TechnicianDashboard({
    shift: initialShift,
    user: initialUser,
    jobs: initialJobs,
    activeJob: initialActiveJob,
}: TechnicianProps = {}) {
    const [user] = useState<User>(
        initialUser || { name: 'Adam', role: 'technician' },
    );
    const [jobs, setJobs] = useState<Job[]>(initialJobs || DEMO_JOBS);
    const [shift, setShift] = useState<ShiftState>(
        initialShift || {
            punchedIn: false,
            punchTime: null,
        },
    );
    const [activeJob, setActiveJob] = useState<Job | null>(
        initialActiveJob || null,
    );
    const [currentNow, setCurrentNow] = useState(Date.now());

    // Update clock every second
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentNow(Date.now());
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const pending = jobs.filter((j) => j.status === 'pending');
    const myCompleted = jobs.filter(
        (j) =>
            (j.status === 'completed' ||
                j.status === 'awaiting_validation' ||
                j.status === 'rework') &&
            j.startedBy === user?.name,
    );
    const rework = jobs.filter(
        (j) => j.status === 'rework' && j.startedBy === user?.name,
    );
    const elapsed =
        shift.punchedIn && shift.punchTime ? currentNow - shift.punchTime : 0;

    const handlePunch = () => {
        setShift({
            punchedIn: !shift.punchedIn,
            punchTime: !shift.punchedIn ? Date.now() : null,
        });
    };

    const handleStartJob = (jobId: string) => {
        if (activeJob) return;
        if (!shift.punchedIn) {
            alert('Punch in before starting a job.');
            return;
        }

        const job = jobs.find((j) => j.id === jobId);
        if (job) {
            const updatedJob: Job = {
                ...job,
                status: 'in_progress',
                startedAt: Date.now(),
                startedBy: user.name,
                checkin: {
                    mileage: '',
                    fuelLevel: '50',
                    keysReceived: null,
                    keyCount: '1',
                    personalItems: '',
                    exteriorPhotos: [],
                    interiorPhotos: [],
                    damageNotes: [],
                    customerExpectations: '',
                },
                beforePhotos: [],
                afterPhotos: [],
                progressNotes: [],
            };
            setActiveJob(updatedJob);
            setJobs(jobs.map((j) => (j.id === jobId ? updatedJob : j)));

            // Navigate to checkin
            router.get(`/evolab/checkin/${jobId}`);
        }
    };

    const handleResumeJob = () => {
        if (activeJob) {
            if (activeJob.status === 'in_progress') {
                router.get(`/evolab/job/${activeJob.id}`);
            } else {
                router.get(`/evolab/checkin/${activeJob.id}`);
            }
        }
    };

    const handleLogout = () => {
        router.post('/evolab/logout');
    };

    return (
        <div className="welcome-root">
            <Head title="Dashboard | EvoLab Operations">
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

            {/* <header className="header">
                <div>
                    <div
                        className="display-font"
                        style={{ fontSize: '24px', lineHeight: '1' }}
                    >
                        EVO<span className="red-dot">.</span>LAB
                    </div>
                    <div className="label-tiny" style={{ marginTop: '4px' }}>
                        {esc((user?.name || 'USER').toUpperCase())} · TECHNICIAN
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
            </header> */}

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
                {/* Shift Section */}
                <section
                    style={{
                        borderRadius: '16px',
                        border: `1px solid ${shift.punchedIn ? 'rgba(220,38,38,0.4)' : 'rgba(255,255,255,0.1)'}`,
                        background: shift.punchedIn
                            ? 'rgba(220,38,38,0.1)'
                            : 'rgba(255,255,255,0.03)',
                        padding: '20px',
                        marginBottom: '24px',
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '12px',
                        }}
                    >
                        <div className="label-tiny">Shift</div>
                        {shift.punchedIn && (
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    color: '#EF4444',
                                    fontSize: '12px',
                                }}
                            >
                                <div
                                    style={{
                                        width: '6px',
                                        height: '6px',
                                        borderRadius: '50%',
                                        background: '#EF4444',
                                        animation: 'pulse 2s infinite',
                                    }}
                                ></div>
                                <span>ACTIVE</span>
                            </div>
                        )}
                    </div>

                    {shift.punchedIn ? (
                        <>
                            <div
                                className="display-font"
                                style={{
                                    fontSize: '36px',
                                    lineHeight: 1,
                                    marginBottom: '4px',
                                }}
                            >
                                {formatDuration(elapsed)}
                            </div>
                            <div
                                style={{
                                    fontSize: '12px',
                                    color: 'rgba(255,255,255,0.5)',
                                }}
                            >
                                Punched in at {formatTime(shift.punchTime)}
                            </div>
                        </>
                    ) : (
                        <div
                            className="display-font"
                            style={{
                                fontSize: '22px',
                                color: 'rgba(255,255,255,0.4)',
                                marginBottom: '4px',
                            }}
                        >
                            NOT PUNCHED IN
                        </div>
                    )}

                    <button
                        onClick={handlePunch}
                        style={{
                            width: '100%',
                            marginTop: '16px',
                            padding: '12px',
                            borderRadius: '12px',
                            letterSpacing: '0.15em',
                            fontSize: '14px',
                            fontFamily: "'Anton', sans-serif",
                            background: shift.punchedIn
                                ? 'rgba(255,255,255,0.1)'
                                : '#DC2626',
                            color: '#fff',
                            border: 'none',
                            cursor: 'pointer',
                        }}
                    >
                        {shift.punchedIn ? 'PUNCH OUT' : 'PUNCH IN'}
                    </button>
                </section>

                {/* Active Job Section */}
                {activeJob && (
                    <button
                        onClick={handleResumeJob}
                        style={{
                            width: '100%',
                            borderRadius: '16px',
                            padding: '16px',
                            marginBottom: '24px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            textAlign: 'left',
                            background: '#DC2626',
                            color: '#fff',
                            border: 'none',
                            cursor: 'pointer',
                        }}
                    >
                        <div style={{ minWidth: 0, flex: 1 }}>
                            <div
                                className="label-tiny"
                                style={{
                                    color: 'rgba(255,255,255,0.7)',
                                    marginBottom: '4px',
                                }}
                            >
                                {activeJob.status === 'in_progress'
                                    ? 'Active Job'
                                    : 'Continue Check-In'}
                            </div>
                            <div
                                className="display-font"
                                style={{ fontSize: '20px' }}
                            >
                                {esc(activeJob.vehicle)}
                            </div>
                            <div
                                style={{
                                    fontSize: '12px',
                                    color: 'rgba(255,255,255,0.7)',
                                    marginTop: '4px',
                                }}
                            >
                                {esc(activeJob.service)}
                                {activeJob.startedAt &&
                                    ` · ${formatDuration(currentNow - activeJob.startedAt)}`}
                            </div>
                        </div>
                        <div style={{ fontSize: '24px' }}>›</div>
                    </button>
                )}

                {/* Rework Section */}
                {rework.length > 0 && (
                    <div
                        style={{
                            background: 'rgba(249,115,22,0.1)',
                            border: '1px solid rgba(249,115,22,0.3)',
                            borderRadius: '12px',
                            padding: '16px',
                            marginBottom: '24px',
                        }}
                    >
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                color: '#FB923C',
                                fontSize: '14px',
                                fontWeight: 600,
                                marginBottom: '8px',
                            }}
                        >
                            ⚠️ {rework.length} Job{rework.length > 1 ? 's' : ''}{' '}
                            Sent Back
                        </div>
                        {rework.map((job) => (
                            <div
                                key={job.id}
                                style={{
                                    fontSize: '12px',
                                    color: 'rgba(255,255,255,0.7)',
                                    marginTop: '8px',
                                }}
                            >
                                <div style={{ fontWeight: 500, color: '#fff' }}>
                                    {esc(job.vehicle)}
                                </div>
                                <div
                                    style={{
                                        fontStyle: 'italic',
                                        marginTop: '2px',
                                    }}
                                >
                                    "{esc(job.rejectionReason || '')}"
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Job Queue Section */}
                <section style={{ marginBottom: '32px' }}>
                    <div
                        className="label-tiny"
                        style={{ marginBottom: '12px' }}
                    >
                        Job Queue ({pending.length})
                    </div>
                    {pending.length === 0 ? (
                        <div
                            style={{
                                color: 'rgba(255,255,255,0.3)',
                                fontSize: '14px',
                                padding: '32px',
                                textAlign: 'center',
                                border: '1px dashed rgba(255,255,255,0.1)',
                                borderRadius: '12px',
                            }}
                        >
                            No jobs in queue.
                        </div>
                    ) : (
                        pending.map((job) => (
                            <div
                                key={job.id}
                                className="card"
                                style={{
                                    borderLeft: `4px solid ${job.priority === 'high' ? '#DC2626' : 'rgba(255,255,255,0.2)'}`,
                                    marginBottom: '8px',
                                    background: 'rgba(255,255,255,0.03)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '12px',
                                    padding: '16px',
                                }}
                            >
                                <div
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'flex-start',
                                        gap: '12px',
                                        marginBottom: '8px',
                                    }}
                                >
                                    <div style={{ minWidth: 0, flex: 1 }}>
                                        <div
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                marginBottom: '4px',
                                                flexWrap: 'wrap',
                                            }}
                                        >
                                            <div
                                                style={{
                                                    fontSize: '10px',
                                                    color: 'rgba(255,255,255,0.4)',
                                                    letterSpacing: '0.05em',
                                                }}
                                            >
                                                {esc(job.id)}
                                            </div>
                                            {job.source === 'Dealer' && (
                                                <span
                                                    className="badge badge-dealer"
                                                    style={{
                                                        background:
                                                            'rgba(220,38,38,0.2)',
                                                        color: '#EF4444',
                                                        fontSize: '9px',
                                                        padding: '3px 6px',
                                                        borderRadius: '4px',
                                                    }}
                                                >
                                                    DEALER
                                                </span>
                                            )}
                                            {job.priority === 'high' && (
                                                <span
                                                    className="badge badge-priority"
                                                    style={{
                                                        background:
                                                            'rgba(249,115,22,0.2)',
                                                        color: '#FB923C',
                                                        fontSize: '9px',
                                                        padding: '3px 6px',
                                                        borderRadius: '4px',
                                                    }}
                                                >
                                                    PRIORITY
                                                </span>
                                            )}
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
                                        marginBottom: '4px',
                                    }}
                                >
                                    {esc(job.service)}
                                </div>
                                <div
                                    style={{
                                        fontSize: '11px',
                                        color: 'rgba(255,255,255,0.5)',
                                        marginBottom: '8px',
                                    }}
                                >
                                    {esc(job.customer)}
                                </div>
                                {job.notes && (
                                    <div
                                        style={{
                                            fontSize: '11px',
                                            color: 'rgba(255,255,255,0.4)',
                                            fontStyle: 'italic',
                                            marginBottom: '12px',
                                        }}
                                    >
                                        "{esc(job.notes)}"
                                    </div>
                                )}
                                <div
                                    style={{
                                        fontSize: '10px',
                                        color: 'rgba(255,255,255,0.4)',
                                        marginBottom: '12px',
                                    }}
                                >
                                    Due: {esc(job.dueDate)}
                                </div>
                                <button
                                    onClick={() => handleStartJob(job.id)}
                                    disabled={!!activeJob}
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        borderRadius: '8px',
                                        fontSize: '13px',
                                        letterSpacing: '0.1em',
                                        fontFamily: "'Anton', sans-serif",
                                        background: activeJob
                                            ? 'rgba(255,255,255,0.1)'
                                            : '#DC2626',
                                        color: activeJob
                                            ? 'rgba(255,255,255,0.3)'
                                            : '#fff',
                                        cursor: activeJob
                                            ? 'not-allowed'
                                            : 'pointer',
                                        border: 'none',
                                    }}
                                >
                                    {activeJob
                                        ? 'FINISH ACTIVE JOB FIRST'
                                        : '▶ CHECK IN VEHICLE'}
                                </button>
                            </div>
                        ))
                    )}
                </section>

                {/* My Recent Section */}
                {myCompleted.length > 0 && (
                    <section>
                        <div
                            className="label-tiny"
                            style={{ marginBottom: '12px' }}
                        >
                            My Recent ({myCompleted.length})
                        </div>
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '8px',
                            }}
                        >
                            {myCompleted.map((job) => (
                                <div
                                    key={job.id}
                                    className="card"
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: '12px 16px',
                                    }}
                                >
                                    <div style={{ minWidth: 0, flex: 1 }}>
                                        <div style={{ fontSize: '14px' }}>
                                            {esc(job.vehicle)}
                                        </div>
                                        <div
                                            style={{
                                                fontSize: '11px',
                                                color: 'rgba(255,255,255,0.4)',
                                                marginTop: '2px',
                                            }}
                                        >
                                            {esc(job.service)}
                                            {job.duration &&
                                                ` · ${formatDuration(job.duration)}`}
                                        </div>
                                    </div>
                                    <span
                                        className={`badge badge-${job.status}`}
                                        style={{
                                            background:
                                                job.status === 'completed'
                                                    ? 'rgba(34,197,94,0.2)'
                                                    : job.status === 'rework'
                                                      ? 'rgba(249,115,22,0.2)'
                                                      : 'rgba(234,179,8,0.2)',
                                            color:
                                                job.status === 'completed'
                                                    ? '#22C55E'
                                                    : job.status === 'rework'
                                                      ? '#F97316'
                                                      : '#EAB308',
                                            fontSize: '9px',
                                            padding: '3px 6px',
                                            borderRadius: '4px',
                                        }}
                                    >
                                        {statusBadge(job.status)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
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
        </div>
    );
}
