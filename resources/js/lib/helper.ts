/**
 * Format milliseconds to HH:MM:SS
 */
export function formatDuration(ms: number | undefined): string {
    if (!ms || ms < 0) return '00:00:00';
    const s = Math.floor(ms / 1000);
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

/**
 * Format timestamp to time string (e.g., "2:30 PM")
 */
export function formatTime(ts: number | null): string {
    if (!ts) return '';
    return new Date(ts).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
    });
}

/**
 * Escape HTML special characters
 */
export function esc(str: string | null | undefined): string {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

/**
 * Get status badge text
 */
export function getStatusText(status: string): string {
    const labels: Record<string, string> = {
        pending: 'PENDING',
        in_progress: 'IN PROGRESS',
        awaiting_validation: 'PENDING REVIEW',
        completed: 'APPROVED',
        rework: 'REWORK',
    };
    return labels[status] || 'PENDING';
}

/**
 * Get Status Badge
 */
export function statusBadge(status: string): string {
    const labels: Record<string, string> = {
        pending: 'PENDING',
        in_progress: 'IN PROGRESS',
        awaiting_validation: 'PENDING REVIEW',
        completed: 'APPROVED',
        rework: 'REWORK',
    };
    return labels[status] || 'PENDING';
}

export function getStatusConfig(status: string): {
    text: string;
    bgColor: string;
    textColor: string;
} {
    const configs: Record<string, { bgColor: string; textColor: string }> = {
        pending: {
            bgColor: 'rgba(255,255,255,0.1)',
            textColor: 'rgba(255,255,255,0.6)',
        },
        assigned: {
            bgColor: 'rgba(59,130,246,0.2)',
            textColor: '#60A5FA',
        },
        in_progress: {
            bgColor: 'rgba(220,38,38,0.2)',
            textColor: '#EF4444',
        },
        awaiting_validation: {
            bgColor: 'rgba(234,179,8,0.2)',
            textColor: '#EAB308',
        },
        completed: {
            bgColor: 'rgba(34,197,94,0.2)',
            textColor: '#22C55E',
        },
        rework: {
            bgColor: 'rgba(249,115,22,0.2)',
            textColor: '#F97316',
        },
    };

    const config = configs[status] || configs.pending;
    return {
        text: getStatusText(status),
        bgColor: config.bgColor,
        textColor: config.textColor,
    };
}