import { esc, formatDuration, statusBadge } from '@/lib/helper';
import { Job } from '@/types/manager';
import { useState } from 'react';

interface JobDetailModalProps {
    job: Job;
    onClose: () => void;
    onApprove: () => void;
    onReject: (reason: string) => void;
    isProcessing?: boolean;
}

export default function JobDetailModal({
    job,
    onClose,
    onApprove,
    onReject,
    isProcessing = false,
}: JobDetailModalProps) {
    const [showRejectForm, setShowRejectForm] = useState(false);
    const [rejectReason, setRejectReason] = useState('');

    const handleRejectSubmit = () => {
        if (!rejectReason.trim()) return;
        onReject(rejectReason);
        setShowRejectForm(false);
        setRejectReason('');
    };

    const handleCancelReject = () => {
        setShowRejectForm(false);
        setRejectReason('');
    };

    const beforePhotos = job.beforePhotos || [];
    const afterPhotos = job.afterPhotos || [];

    return (
        <div id="modal-overlay" className="modal-bg" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '20px',
                    }}
                >
                    <div className="display-font" style={{ fontSize: '22px' }}>
                        JOB DETAIL
                    </div>
                    <button
                        id="close-modal"
                        onClick={onClose}
                        style={{
                            color: 'rgba(255,255,255,0.4)',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '20px',
                        }}
                    >
                        ✕
                    </button>
                </div>

                <div
                    style={{
                        marginBottom: '16px',
                        paddingBottom: '16px',
                        borderBottom: '1px solid rgba(255,255,255,0.1)',
                    }}
                >
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
                    <div className="display-font" style={{ fontSize: '20px' }}>
                        {esc(job.vehicle)}
                    </div>
                    <div
                        style={{
                            fontSize: '14px',
                            color: 'rgba(255,255,255,0.6)',
                        }}
                    >
                        {esc(job.color)} · {esc(job.plate)}
                    </div>
                    <div
                        style={{
                            fontSize: '14px',
                            color: '#EF4444',
                            marginTop: '4px',
                        }}
                    >
                        {esc(job.service)}
                    </div>
                    <div
                        style={{
                            fontSize: '12px',
                            color: 'rgba(255,255,255,0.4)',
                            marginTop: '8px',
                            display: 'flex',
                            gap: '8px',
                            flexWrap: 'wrap',
                            alignItems: 'center',
                        }}
                    >
                        {job.startedBy && <span>By {esc(job.startedBy)}</span>}
                        {job.duration && (
                            <span>· {formatDuration(job.duration)}</span>
                        )}
                        <span
                            className={`badge badge-${job.status}`}
                            style={{
                                background:
                                    job.status === 'in_progress'
                                        ? 'rgba(220,38,38,0.2)'
                                        : job.status === 'awaiting_validation'
                                          ? 'rgba(234,179,8,0.2)'
                                          : job.status === 'completed'
                                            ? 'rgba(34,197,94,0.2)'
                                            : 'rgba(255,255,255,0.1)',
                                color:
                                    job.status === 'in_progress'
                                        ? '#EF4444'
                                        : job.status === 'awaiting_validation'
                                          ? '#EAB308'
                                          : job.status === 'completed'
                                            ? '#22C55E'
                                            : 'rgba(255,255,255,0.6)',
                                padding: '2px 8px',
                                borderRadius: '4px',
                                fontSize: '10px',
                            }}
                        >
                            {statusBadge(job.status)}
                        </span>
                    </div>
                </div>

                {job.checkin && (
                    <div style={{ marginBottom: '16px' }}>
                        <div
                            className="label-tiny"
                            style={{ marginBottom: '8px' }}
                        >
                            Intake
                        </div>
                        <div
                            style={{
                                background: 'rgba(255,255,255,0.03)',
                                borderRadius: '8px',
                                padding: '12px',
                                fontSize: '12px',
                            }}
                        >
                            <div
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: '1fr 1fr',
                                    gap: '8px',
                                }}
                            >
                                <div>
                                    <span
                                        style={{
                                            color: 'rgba(255,255,255,0.4)',
                                        }}
                                    >
                                        Mileage:
                                    </span>{' '}
                                    {esc(job.checkin.mileage)} km
                                </div>
                                <div>
                                    <span
                                        style={{
                                            color: 'rgba(255,255,255,0.4)',
                                        }}
                                    >
                                        Fuel:
                                    </span>{' '}
                                    {esc(job.checkin.fuelLevel)}%
                                </div>
                                <div>
                                    <span
                                        style={{
                                            color: 'rgba(255,255,255,0.4)',
                                        }}
                                    >
                                        Keys:
                                    </span>{' '}
                                    {esc(job.checkin.keyCount)}
                                </div>
                                <div>
                                    <span
                                        style={{
                                            color: 'rgba(255,255,255,0.4)',
                                        }}
                                    >
                                        Damage:
                                    </span>{' '}
                                    {(job.checkin.damageNotes || []).length}
                                </div>
                            </div>
                            {job.checkin.customerExpectations && (
                                <div
                                    style={{
                                        marginTop: '8px',
                                        paddingTop: '8px',
                                        borderTop:
                                            '1px solid rgba(255,255,255,0.1)',
                                        fontStyle: 'italic',
                                    }}
                                >
                                    "{esc(job.checkin.customerExpectations)}"
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {(job.checkin?.damageNotes?.length || 0) > 0 && (
                    <div style={{ marginBottom: '16px' }}>
                        <div
                            className="label-tiny"
                            style={{ color: '#FB923C', marginBottom: '8px' }}
                        >
                            Pre-Existing Damage
                        </div>
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '6px',
                            }}
                        >
                            {job.checkin?.damageNotes?.map((damage, idx) => (
                                <div
                                    key={idx}
                                    style={{
                                        background: 'rgba(249,115,22,0.1)',
                                        border: '1px solid rgba(249,115,22,0.3)',
                                        borderRadius: '8px',
                                        padding: '8px',
                                        fontSize: '12px',
                                    }}
                                >
                                    <div
                                        style={{
                                            fontWeight: 500,
                                            color: '#FB923C',
                                        }}
                                    >
                                        {esc(damage.location)}
                                    </div>
                                    <div
                                        style={{
                                            color: 'rgba(255,255,255,0.7)',
                                            marginTop: '2px',
                                        }}
                                    >
                                        {esc(damage.description)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {beforePhotos.length > 0 && (
                    <div style={{ marginBottom: '16px' }}>
                        <div
                            className="label-tiny"
                            style={{ marginBottom: '8px' }}
                        >
                            Before ({beforePhotos.length})
                        </div>
                        <div
                            className="photo-grid"
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(3, 1fr)',
                                gap: '8px',
                            }}
                        >
                            {beforePhotos.map((photo, idx) => (
                                <div
                                    key={idx}
                                    className="photo-cell"
                                    style={{
                                        aspectRatio: '1',
                                        background: 'rgba(255,255,255,0.05)',
                                        borderRadius: '8px',
                                        overflow: 'hidden',
                                    }}
                                >
                                    <img
                                        src={photo.data}
                                        alt=""
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover',
                                        }}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {afterPhotos.length > 0 && (
                    <div style={{ marginBottom: '24px' }}>
                        <div
                            className="label-tiny"
                            style={{ marginBottom: '8px' }}
                        >
                            After ({afterPhotos.length})
                        </div>
                        <div
                            className="photo-grid"
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(3, 1fr)',
                                gap: '8px',
                            }}
                        >
                            {afterPhotos.map((photo, idx) => (
                                <div
                                    key={idx}
                                    className="photo-cell"
                                    style={{
                                        aspectRatio: '1',
                                        background: 'rgba(255,255,255,0.05)',
                                        borderRadius: '8px',
                                        overflow: 'hidden',
                                    }}
                                >
                                    <img
                                        src={photo.data}
                                        alt=""
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover',
                                        }}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {job.status === 'awaiting_validation' && (
                    <>
                        {!showRejectForm ? (
                            <div
                                id="approve-buttons"
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: '1fr 1fr',
                                    gap: '8px',
                                }}
                            >
                                <button
                                    id="show-reject"
                                    onClick={() => setShowRejectForm(true)}
                                    className="white-btn display-font"
                                    style={{
                                        padding: '12px',
                                        borderRadius: '8px',
                                        fontSize: '14px',
                                        letterSpacing: '0.1em',
                                        background: 'rgba(255,255,255,0.1)',
                                        color: '#fff',
                                        border: 'none',
                                        cursor: 'pointer',
                                    }}
                                >
                                    ✕ REWORK
                                </button>
                                <button
                                    id="approve-job"
                                    onClick={onApprove}
                                    disabled={isProcessing}
                                    className="red-btn display-font"
                                    style={{
                                        padding: '12px',
                                        borderRadius: '8px',
                                        fontSize: '14px',
                                        letterSpacing: '0.1em',
                                        background: '#DC2626',
                                        color: '#fff',
                                        border: 'none',
                                        cursor: isProcessing
                                            ? 'wait'
                                            : 'pointer',
                                        opacity: isProcessing ? 0.7 : 1,
                                    }}
                                >
                                    {isProcessing
                                        ? 'PROCESSING...'
                                        : '✓ APPROVE'}
                                </button>
                            </div>
                        ) : (
                            <div
                                id="reject-form"
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '12px',
                                }}
                            >
                                <textarea
                                    id="reject-reason"
                                    rows={3}
                                    placeholder="What needs to be fixed?"
                                    value={rejectReason}
                                    onChange={(e) =>
                                        setRejectReason(e.target.value)
                                    }
                                    style={{
                                        background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        color: '#fff',
                                        borderRadius: '8px',
                                        padding: '10px',
                                        width: '100%',
                                        fontFamily: 'inherit',
                                    }}
                                />
                                <div
                                    style={{
                                        display: 'grid',
                                        gridTemplateColumns: '1fr 1fr',
                                        gap: '8px',
                                    }}
                                >
                                    <button
                                        id="cancel-reject"
                                        onClick={handleCancelReject}
                                        className="white-btn"
                                        style={{
                                            padding: '12px',
                                            borderRadius: '8px',
                                            fontSize: '14px',
                                            background: 'rgba(255,255,255,0.1)',
                                            color: '#fff',
                                            border: 'none',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        id="confirm-reject"
                                        onClick={handleRejectSubmit}
                                        disabled={
                                            !rejectReason.trim() || isProcessing
                                        }
                                        className="orange-btn display-font"
                                        style={{
                                            padding: '12px',
                                            borderRadius: '8px',
                                            fontSize: '14px',
                                            letterSpacing: '0.1em',
                                            background: '#EA580C',
                                            color: '#fff',
                                            border: 'none',
                                            cursor:
                                                !rejectReason.trim() ||
                                                isProcessing
                                                    ? 'not-allowed'
                                                    : 'pointer',
                                            opacity:
                                                !rejectReason.trim() ||
                                                isProcessing
                                                    ? 0.5
                                                    : 1,
                                        }}
                                    >
                                        {isProcessing
                                            ? 'PROCESSING...'
                                            : 'SEND BACK'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            <style>{`
                .modal-bg {
                    position: fixed;
                    inset: 0;
                    background: rgba(0,0,0,0.9);
                    backdrop-filter: blur(4px);
                    z-index: 50;
                    display: flex;
                    align-items: flex-start;
                    justify-content: center;
                    padding: 16px;
                    overflow-y: auto;
                }
                .modal {
                    background: #09090B;
                    border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 16px;
                    padding: 24px;
                    width: 100%;
                    max-width: 420px;
                    margin-top: 40px;
                }
                .photo-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 8px;
                }
                .photo-cell {
                    aspect-ratio: 1;
                    background: rgba(255,255,255,0.05);
                    border-radius: 8px;
                    overflow: hidden;
                }
                .photo-cell img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
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
                .white-btn {
                    background: rgba(255,255,255,0.1);
                    color: #fff;
                }
                .red-btn {
                    background: #DC2626;
                    color: #fff;
                }
                .orange-btn {
                    background: #EA580C;
                    color: #fff;
                }
            `}</style>
        </div>
    );
}
