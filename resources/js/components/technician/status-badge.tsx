import { getStatusConfig } from '@/lib/helper';

export default function StatusBadge({ status }: { status: string }) {
    const config = getStatusConfig(status);

    return (
        <span
            className={`badge badge-${status}`}
            style={{
                background: config.bgColor,
                color: config.textColor,
                fontSize: '9px',
                padding: '3px 6px',
                borderRadius: '4px',
                display: 'inline-block',
                fontWeight: '500',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
            }}
        >
            {config.text}
        </span>
    );
}
