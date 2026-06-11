import { esc, formatDuration } from '@/lib/helper';
import { Job } from '@/types/manager';

interface JobCardProps {
    job: Job;
    showActions?: boolean;
    isProcessing?: boolean;
    onApprove?: (jobId: string) => void;
    onRework?: (jobId: string) => void;
    onClick?: (jobId: string) => void;
}

export default function JobCard({
    job,
    showActions = false,
    isProcessing = false,
    onApprove,
    onRework,
    onClick,
}: JobCardProps) {
    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'in_progress':
                return {
                    background: 'rgba(220,38,38,0.2)',
                    color: '#EF4444',
                    text: 'IN PROGRESS',
                };
            case 'awaiting_validation':
                return {
                    background: 'rgba(234,179,8,0.2)',
                    color: '#EAB308',
                    text: 'PENDING REVIEW',
                };
            case 'completed':
                return {
                    background: 'rgba(34,197,94,0.2)',
                    color: '#22C55E',
                    text: 'APPROVED',
                };
            case 'rework':
                return {
                    background: 'rgba(249,115,22,0.2)',
                    color: '#F97316',
                    text: 'REWORK',
                };
            default:
                return {
                    background: 'rgba(255,255,255,0.1)',
                    color: 'rgba(255,255,255,0.6)',
                    text: 'PENDING',
                };
        }
    };

    const statusStyle = getStatusStyle(job.status);

    return (
        <div
            className="mgr-job-card card card-hover"
            onClick={() => onClick?.(job.id)}
            style={{
                textAlign: 'left',
                width: '100%',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                padding: '16px',
                transition: 'border-color 0.2s',
            }}
            onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor =
                    'rgba(255,255,255,0.2)';
            }}
            onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor =
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
                    {/* Badges Row */}
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
                                    background: 'rgba(220,38,38,0.2)',
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
                                    background: 'rgba(249,115,22,0.2)',
                                    color: '#FB923C',
                                    fontSize: '9px',
                                    padding: '3px 6px',
                                    borderRadius: '4px',
                                }}
                            >
                                PRIORITY
                            </span>
                        )}
                        <span
                            className={`badge badge-${job.status}`}
                            style={{
                                background: statusStyle.background,
                                color: statusStyle.color,
                                fontSize: '9px',
                                padding: '3px 6px',
                                borderRadius: '4px',
                            }}
                        >
                            {statusStyle.text}
                        </span>
                    </div>

                    {/* Vehicle Name */}
                    <div
                        className="display-font"
                        style={{ fontSize: '16px', lineHeight: 1.2 }}
                    >
                        {esc(job.vehicle)}
                    </div>

                    {/* Service and Technician */}
                    <div
                        style={{
                            fontSize: '11px',
                            color: 'rgba(255,255,255,0.4)',
                            marginTop: '4px',
                        }}
                    >
                        {esc(job.service)}{' '}
                        {job.startedBy && `· ${esc(job.startedBy)}`}
                        {job.duration && ` · ${formatDuration(job.duration)}`}
                    </div>
                </div>

                {/* Chevron Icon */}
                <div
                    style={{ color: 'rgba(255,255,255,0.4)', fontSize: '20px' }}
                >
                    ›
                </div>
            </div>

            {/* Action Buttons */}
            {showActions && job.status === 'awaiting_validation' && (
                <div
                    className="card-actions"
                    style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '8px',
                        marginTop: '4px',
                    }}
                >
                    <button
                        className="quick-rework"
                        onClick={(e) => {
                            e.stopPropagation();
                            onRework?.(job.id);
                        }}
                        disabled={isProcessing}
                        style={{
                            padding: '10px',
                            borderRadius: '8px',
                            fontSize: '12px',
                            letterSpacing: '0.1em',
                            border: '1px solid rgba(255,255,255,0.1)',
                            background: 'rgba(255,255,255,0.1)',
                            color: '#fff',
                            cursor: isProcessing ? 'wait' : 'pointer',
                            opacity: isProcessing ? 0.7 : 1,
                        }}
                    >
                        ✕ REWORK
                    </button>
                    <button
                        className="quick-approve"
                        onClick={(e) => {
                            e.stopPropagation();
                            onApprove?.(job.id);
                        }}
                        disabled={isProcessing}
                        style={{
                            padding: '10px',
                            borderRadius: '8px',
                            fontSize: '12px',
                            letterSpacing: '0.1em',
                            background: '#DC2626',
                            color: '#fff',
                            border: 'none',
                            cursor: isProcessing ? 'wait' : 'pointer',
                            opacity: isProcessing ? 0.7 : 1,
                        }}
                    >
                        ✓ APPROVE
                    </button>
                </div>
            )}
        </div>
    );
}
