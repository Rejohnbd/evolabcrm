import { Head, router, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { formatDuration, formatTime, esc } from '@/lib/helper';
import { Job, TechnicianDashboardProps } from '@/types/technician';
import MyJobCard from '@/components/technician/my-job-card';
import JobCard from '@/components/technician/job-card';
import RecentJobCard from '@/components/technician/recent-job-card';

export default function TechnicianDashboard({
    pendingJobs = [],
    myJobs = [],
    completedJobs = [],
    activeJob: initialActiveJob,
    shift: initialShift,
    now: initialNow,
}: TechnicianDashboardProps) {
    const { auth } = usePage().props;
    const user = auth?.user;
    const [currentNow, setCurrentNow] = useState(initialNow || Date.now());
    const [isPunchedIn, setIsPunchedIn] = useState(
        initialShift?.punched_in || false,
    );
    const [punchTime, setPunchTime] = useState(
        initialShift?.punch_time || null,
    );
    const [activeJob, setActiveJob] = useState(initialActiveJob || null);
    const [isProcessing, setIsProcessing] = useState(false);

    // Update clock every second
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentNow(Date.now());
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    // Sync with props when they change (after page reload)
    useEffect(() => {
        setIsPunchedIn(initialShift?.punched_in || false);
        setPunchTime(initialShift?.punch_time || null);
        setActiveJob(initialActiveJob || null);
    }, [initialShift, initialActiveJob]);

    const elapsed = isPunchedIn && punchTime ? currentNow - punchTime : 0;

    const handlePunch = () => {
        if (isProcessing) return; // Prevent double clicks

        setIsProcessing(true);

        router.post(
            '/technician-shift-toggle',
            {},
            {
                preserveState: true,
                preserveScroll: true,
                onSuccess: () => {
                    // Reload to get fresh data from server
                    router.reload({
                        onSuccess: () => {
                            setIsProcessing(false);
                        },
                        onError: () => {
                            setIsProcessing(false);
                        },
                    });
                },
                onError: (errors) => {
                    console.error('Punch error:', errors);
                    alert('Failed to toggle shift. Please try again.');
                    setIsProcessing(false);
                },
            },
        );
    };

    const handleCheckInJob = (jobId: string) => {
        if (activeJob) return;
        if (!isPunchedIn) {
            alert('Please punch in before starting a job.');
            return;
        }

        // Directly navigate to checkin page
        // The checkin page will handle creating the assignment
        router.get(`/technician-checkin/${jobId}`);
    };

    const handleResumeJob = (job: Job) => {
        if (job.status === 'in_progress') {
            router.get(`/technician/job/${job.id}`);
        } else if (
            job.status === 'awaiting_validation' ||
            job.status === 'rework'
        ) {
            router.get(`/technician/checkin/${job.id}`);
        } else if (job.status === 'assigned') {
            router.get(`/technician/checkin/${job.id}`);
        }
    };

    const hasActiveJob = !!activeJob;

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
                        border: `1px solid ${isPunchedIn ? 'rgba(220,38,38,0.4)' : 'rgba(255,255,255,0.1)'}`,
                        background: isPunchedIn
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
                        {isPunchedIn && (
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    color: '#EF4444',
                                    fontSize: '12px',
                                }}
                            >
                                <div className="pulse-dot"></div>
                                <span>ACTIVE</span>
                            </div>
                        )}
                    </div>

                    {isPunchedIn ? (
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
                                Punched in at {formatTime(punchTime)}
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
                        disabled={isProcessing}
                        style={{
                            width: '100%',
                            marginTop: '16px',
                            padding: '12px',
                            borderRadius: '12px',
                            letterSpacing: '0.15em',
                            fontSize: '14px',
                            fontFamily: "'Anton', sans-serif",
                            background: isPunchedIn
                                ? 'rgba(255,255,255,0.1)'
                                : '#DC2626',
                            color: '#fff',
                            border: 'none',
                            cursor: isProcessing ? 'wait' : 'pointer',
                            opacity: isProcessing ? 0.7 : 1,
                        }}
                    >
                        {isProcessing
                            ? 'PROCESSING...'
                            : isPunchedIn
                              ? 'PUNCH OUT'
                              : 'PUNCH IN'}
                    </button>
                </section>

                {/* Active Job Section */}
                {activeJob && (
                    <button
                        onClick={() => handleResumeJob(activeJob)}
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

                {/* My Jobs Section (Assigned to me) */}
                {myJobs.length > 0 && (
                    <section style={{ marginBottom: '32px' }}>
                        <div
                            className="label-tiny"
                            style={{ marginBottom: '12px' }}
                        >
                            My Jobs ({myJobs.length})
                        </div>
                        {myJobs.map((job) => (
                            <MyJobCard
                                key={job.id}
                                job={job}
                                onResume={handleResumeJob}
                            />
                        ))}
                    </section>
                )}

                {/* Job Queue Section (Pending Jobs) */}
                <section style={{ marginBottom: '32px' }}>
                    <div
                        className="label-tiny"
                        style={{ marginBottom: '12px' }}
                    >
                        Available Jobs ({pendingJobs.length})
                    </div>
                    {pendingJobs.length === 0 ? (
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
                            No jobs available.
                        </div>
                    ) : (
                        pendingJobs.map((job) => (
                            <JobCard
                                key={job.id}
                                job={job}
                                hasActiveJob={hasActiveJob}
                                onStart={handleCheckInJob}
                            />
                        ))
                    )}
                </section>

                {/* Completed Jobs Section */}
                {completedJobs.length > 0 && (
                    <section>
                        <div
                            className="label-tiny"
                            style={{ marginBottom: '12px' }}
                        >
                            Recently Completed ({completedJobs.length})
                        </div>
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '8px',
                            }}
                        >
                            {completedJobs.map((job) => (
                                <RecentJobCard key={job.id} job={job} />
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
                .pulse-dot {
                    width: 6px;
                    height: 6px;
                    border-radius: 50%;
                    background: #EF4444;
                    animation: pulse 2s infinite;
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
