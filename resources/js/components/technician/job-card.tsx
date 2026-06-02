import { esc } from '@/lib/helper';
import { Job } from '@/types/technician';

export default function JobCard({
    job,
    hasActiveJob,
    onStart,
}: {
    job: Job;
    hasActiveJob: boolean;
    onStart: (id: string) => void;
}) {
    const priorityBorder =
        job.priority === 'high' ? '#DC2626' : 'rgba(255,255,255,0.2)';

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
                onClick={() => onStart(job.id)}
                disabled={hasActiveJob}
                style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    letterSpacing: '0.1em',
                    fontFamily: "'Anton', sans-serif",
                    background: hasActiveJob
                        ? 'rgba(255,255,255,0.1)'
                        : '#DC2626',
                    color: hasActiveJob ? 'rgba(255,255,255,0.3)' : '#fff',
                    cursor: hasActiveJob ? 'not-allowed' : 'pointer',
                    border: 'none',
                }}
            >
                {hasActiveJob
                    ? 'FINISH ACTIVE JOB FIRST'
                    : '▶ CHECK IN VEHICLE'}
            </button>
        </div>
    );
}
