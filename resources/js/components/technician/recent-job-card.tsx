import { esc, formatDuration } from '@/lib/helper';
import { Job } from '@/types/technician';
import StatusBadge from './status-badge';

export default function RecentJobCard({ job }: { job: Job }) {
    return (
        <div
            className="card"
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
            }}
        >
            <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: '14px' }}>{esc(job.vehicle)}</div>
                <div
                    style={{
                        fontSize: '11px',
                        color: 'rgba(255,255,255,0.4)',
                        marginTop: '2px',
                    }}
                >
                    {esc(job.service)}
                    {job.duration && ` · ${formatDuration(job.duration)}`}
                </div>
            </div>
            <StatusBadge status={job.status} />
        </div>
    );
}
