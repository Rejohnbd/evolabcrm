import { esc } from '@/lib/helper';
import { Job } from '@/types/technician';
import StatusBadge from './status-badge';

export default function MyJobCard({
    job,
    onResume,
}: {
    job: Job;
    onResume: (job: Job) => void;
}) {
    const priorityBorder =
        job.priority === 'high' ? '#DC2626' : 'rgba(255,255,255,0.2)';
    const isInProgress = job.status === 'in_progress';
    const isAwaiting = job.status === 'awaiting_validation';
    const isRework = job.status === 'rework';

    let buttonText = '▶ RESUME';
    let buttonColor = '#DC2626';

    if (isRework) {
        buttonText = '⚠️ FIX REWORK';
        buttonColor = '#F97316';
    } else if (isAwaiting) {
        buttonText = '📋 VIEW';
        buttonColor = '#EAB308';
    }

    return (
        <div
            className="card"
            style={{
                borderLeft: `4px solid ${priorityBorder}`,
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
                        <StatusBadge status={job.status} />
                    </div>
                    <div
                        className="display-font"
                        style={{ fontSize: '18px', lineHeight: 1.2 }}
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

            {job.rejectionReason && (
                <div
                    style={{
                        fontSize: '11px',
                        color: '#F97316',
                        fontStyle: 'italic',
                        marginBottom: '12px',
                    }}
                >
                    ⚠️ {esc(job.rejectionReason)}
                </div>
            )}

            <button
                onClick={() => onResume(job)}
                style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    letterSpacing: '0.1em',
                    fontFamily: "'Anton', sans-serif",
                    background: buttonColor,
                    color: '#fff',
                    cursor: 'pointer',
                    border: 'none',
                }}
            >
                {buttonText}
            </button>
        </div>
    );
}
