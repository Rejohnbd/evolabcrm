import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { Job, ManagerProps } from '@/types/manager';
import JobCard from '@/components/manager/job-card';
import JobDetailModal from '@/components/manager/job-detail-modal';

export default function ManagerDashboard({
    jobs,
    user,
    stats,
    recentJobs,
    now,
}: ManagerProps) {
    const [managerTab, setManagerTab] = useState<
        'review' | 'active' | 'queue' | 'history'
    >('review');
    console.log(jobs);
    const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
    const [selectedJobDetails, setSelectedJobDetails] = useState<Job | null>(
        null,
    );
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);
    const [rejectForm, setRejectForm] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    // Filter jobs based on tab
    const awaiting = jobs.filter((j) => j.status === 'awaiting_validation');
    const inProgress = jobs.filter((j) => j.status === 'in_progress');
    const pending = jobs.filter((j) => j.status === 'pending');
    const completed = jobs.filter((j) => j.status === 'completed');
    const recent =
        recentJobs.length > 0 ? recentJobs : completed.slice(-10).reverse();

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

    // Fetch full job details including photos when modal opens
    const handleOpenModal = (jobId: string) => {
        const job = jobs.find((j) => j.id === jobId);
        if (job) {
            setSelectedJobDetails(job);
            setSelectedJobId(jobId);
        }
    };

    const handleCloseModal = () => {
        setSelectedJobId(null);
        setSelectedJobDetails(null);
        setRejectForm(false);
        setRejectReason('');
    };

    const handleApproveJob = () => {
        if (!selectedJobId) return;
        setIsProcessing(true);

        router.post(
            `/manager-job-validate/${selectedJobId}`,
            { approved: true },
            {
                onSuccess: () => {
                    router.reload();
                    handleCloseModal();
                    setIsProcessing(false);
                },
                onError: () => {
                    alert('Failed to approve job. Please try again.');
                    setIsProcessing(false);
                },
            },
        );
    };

    const handleRejectJob = () => {
        if (!rejectReason.trim()) return;
        if (!selectedJobId) return;
        setIsProcessing(true);

        router.post(
            `/manager-job-validate/${selectedJobId}`,
            {
                approved: false,
                reason: rejectReason,
            },
            {
                onSuccess: () => {
                    router.reload();
                    handleCloseModal();
                    setIsProcessing(false);
                },
                onError: () => {
                    alert('Failed to reject job. Please try again.');
                    setIsProcessing(false);
                },
            },
        );
    };

    const handleQuickApprove = (jobId: string) => {
        setIsProcessing(true);
        router.post(
            `/manager-job-validate/${jobId}`,
            { approved: true },
            {
                onSuccess: () => {
                    router.reload();
                    setIsProcessing(false);
                },
                onError: () => {
                    alert('Failed to approve job.');
                    setIsProcessing(false);
                },
            },
        );
    };

    const handleQuickRework = (jobId: string) => {
        const reason = prompt('Please provide a reason for rework:');
        if (!reason) return;

        setIsProcessing(true);
        router.post(
            `/manager-job-validate/${jobId}`,
            { approved: false, reason },
            {
                onSuccess: () => {
                    router.reload();
                    setIsProcessing(false);
                },
                onError: () => {
                    alert('Failed to send job for rework.');
                    setIsProcessing(false);
                },
            },
        );
    };

    // Use detailed job data if available, otherwise fallback to basic
    const jobToDisplay = selectedJobDetails || selectedJob;

    return (
        <>
            <Head title="Manager Dashboard | EvoLab Operations" />

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
                    <div className="card" style={{ padding: '12px' }}>
                        <div className="stat-label">DONE</div>
                        <div
                            className="stat-value"
                            style={{ color: '#22C55E' }}
                        >
                            {stats.completed}
                        </div>
                    </div>
                    <div className="card" style={{ padding: '12px' }}>
                        <div className="stat-label">ACTIVE</div>
                        <div
                            className="stat-value"
                            style={{ color: '#EF4444' }}
                        >
                            {stats.inProgress}
                        </div>
                    </div>
                    <div className="card" style={{ padding: '12px' }}>
                        <div className="stat-label">REVIEW</div>
                        <div
                            className="stat-value"
                            style={{ color: '#EAB308' }}
                        >
                            {stats.awaiting}
                        </div>
                    </div>
                </div>

                {/* Awaiting Review Alert */}
                {stats.awaiting > 0 && (
                    <div className="alert alert-warning">
                        <span>⚠</span>
                        <div>
                            <strong>{stats.awaiting}</strong> job
                            {stats.awaiting > 1 ? 's' : ''} awaiting review
                        </div>
                    </div>
                )}

                {/* Tab Navigation */}
                <div className="tab-nav">
                    {(['review', 'active', 'queue', 'history'] as const).map(
                        (tab) => (
                            <button
                                key={tab}
                                className={`tab-btn ${managerTab === tab ? 'active' : ''}`}
                                onClick={() => setManagerTab(tab)}
                            >
                                {tab.toUpperCase()}
                                {(tab === 'review' && stats.awaiting > 0) ||
                                (tab === 'active' && stats.inProgress > 0) ||
                                (tab === 'queue' && stats.pending > 0) ||
                                (tab === 'history' && recent.length > 0) ? (
                                    <span className="tab-count">
                                        (
                                        {tab === 'review'
                                            ? stats.awaiting
                                            : tab === 'active'
                                              ? stats.inProgress
                                              : tab === 'queue'
                                                ? stats.pending
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
                    <div className="empty-state">{emptyMsg}</div>
                ) : (
                    <div className="jobs-list">
                        {tabJobs.map((job) => (
                            <JobCard
                                key={job.id}
                                job={job}
                                showActions={managerTab === 'review'}
                                isProcessing={isProcessing}
                                onApprove={handleQuickApprove}
                                onRework={handleQuickRework}
                                onClick={handleOpenModal}
                            />
                        ))}
                    </div>
                )}
            </main>

            {/* Modal for Job Details */}
            {selectedJobId && jobToDisplay && (
                <JobDetailModal
                    job={jobToDisplay}
                    onClose={handleCloseModal}
                    onApprove={handleApproveJob}
                    onReject={(reason) => {
                        setRejectReason(reason);
                        handleRejectJob();
                    }}
                    isProcessing={isLoadingDetails || isProcessing}
                />
            )}

            <style>{`
                .card {
                    background: rgba(255,255,255,0.03);
                    border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 12px;
                }
                .stat-label {
                    font-size: 9px;
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                    color: rgba(255,255,255,0.4);
                }
                .stat-value {
                    font-family: 'Anton', sans-serif;
                    font-size: 30px;
                    margin-top: 4px;
                }
                .alert {
                    background: rgba(234,179,8,0.1);
                    border: 1px solid rgba(234,179,8,0.3);
                    border-radius: 12px;
                    padding: 16px;
                    margin-bottom: 24px;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }
                .alert span:first-child { color: #EAB308; }
                .alert div { font-size: 14px; }
                .tab-nav {
                    display: flex;
                    gap: 4px;
                    margin-bottom: 16px;
                    border-bottom: 1px solid rgba(255,255,255,0.1);
                    overflow-x: auto;
                }
                .tab-btn {
                    padding: 10px 16px;
                    font-size: 11px;
                    letter-spacing: 0.1em;
                    border-bottom: 2px solid transparent;
                    color: rgba(255,255,255,0.4);
                    white-space: nowrap;
                    background: none;
                    border-top: none;
                    border-left: none;
                    border-right: none;
                    cursor: pointer;
                    text-transform: uppercase;
                }
                .tab-btn.active {
                    color: #fff;
                    border-bottom-color: #DC2626;
                }
                .tab-count {
                    color: #EF4444;
                    margin-left: 4px;
                }
                .empty-state {
                    color: rgba(255,255,255,0.3);
                    font-size: 14px;
                    padding: 48px 16px;
                    text-align: center;
                    border: 1px dashed rgba(255,255,255,0.1);
                    border-radius: 12px;
                }
                .jobs-list {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
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
                .container {
                    max-width: 480px;
                    margin: 0 auto;
                    padding: 0 20px;
                }
            `}</style>
        </>
    );
}
