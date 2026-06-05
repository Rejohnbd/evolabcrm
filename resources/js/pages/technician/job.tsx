import { esc, formatDuration, formatTime } from '@/lib/helper';
import { JobProps, Photo, ProgressNote } from '@/types/job';
import { Head, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';

export default function Job({
    job,
    checkinData,
    afterPhotos: initialAfterPhotos = [],
    progressNotes: initialProgressNotes = [],
    startTime: initialStartTime,
    now: initialNow,
}: JobProps) {
    const [currentNow, setCurrentNow] = useState(initialNow || Date.now());
    const [progressNotes, setProgressNotes] =
        useState<ProgressNote[]>(initialProgressNotes);
    const [afterPhotos, setAfterPhotos] = useState<Photo[]>(initialAfterPhotos);
    const [startTime] = useState(initialStartTime || Date.now());
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentNow(Date.now());
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const elapsed = currentNow - startTime;

    const handleBack = () => {
        router.get('/technician/dashboard');
    };

    const handleAddNote = () => {
        const text = prompt('Add progress note:');
        if (!text) return;

        setIsProcessing(true);

        router.post(
            `/technician/job/${job.id}/note`,
            { text },
            {
                preserveState: true,
                preserveScroll: true,
                onSuccess: () => {
                    router.reload({
                        onSuccess: () => setIsProcessing(false),
                    });
                },
                onError: (errors) => {
                    console.error('Add note error:', errors);
                    alert('Failed to add note. Please try again.');
                    setIsProcessing(false);
                },
            },
        );
    };

    const handleAddPhoto = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.capture = 'environment';

        input.addEventListener('change', (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (ev) => {
                const photoData = ev.target?.result as string;

                setIsProcessing(true);

                router.post(
                    `/technician/job/${job.id}/photo`,
                    { photo: photoData },
                    {
                        preserveState: true,
                        preserveScroll: true,
                        onSuccess: (response) => {
                            router.reload({
                                onSuccess: () => setIsProcessing(false),
                            });
                        },
                        onError: (errors) => {
                            console.error('Add photo error:', errors);
                            alert('Failed to add photo. Please try again.');
                            setIsProcessing(false);
                        },
                    },
                );
            };
            reader.readAsDataURL(file);
        });

        input.click();
    };

    const handleRemovePhoto = (index: number) => {
        // Remove photo (you can implement delete endpoint)
        setAfterPhotos((prev) => prev.filter((_, i) => i !== index));
    };

    const handleCompleteJob = () => {
        if (afterPhotos.length === 0) {
            alert('Please add at least one AFTER photo before completing.');
            return;
        }

        if (
            !confirm(
                'Mark this job as complete? It will be sent to manager for review.',
            )
        ) {
            return;
        }

        setIsProcessing(true);

        router.post(
            `/technician/job/${job.id}/complete`,
            {},
            {
                onSuccess: () => {
                    router.get('/technician/dashboard');
                },
                onError: (errors) => {
                    console.error('Complete job error:', errors);
                    alert('Failed to complete job. Please try again.');
                    setIsProcessing(false);
                },
            },
        );
    };

    return (
        <div className="welcome-root">
            <Head title={`Job ${job.id} | EvoLab Operations`} />

            <header className="header">
                <button
                    onClick={handleBack}
                    style={{
                        color: 'rgba(255,255,255,0.6)',
                        fontSize: '14px',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                    }}
                >
                    ← Back
                </button>
                <div className="label-tiny">{job.id}</div>
            </header>

            <main
                className="container"
                style={{
                    paddingTop: '24px',
                    paddingBottom: '120px',
                    maxWidth: '480px',
                    margin: '0 auto',
                    paddingLeft: '20px',
                    paddingRight: '20px',
                }}
            >
                {/* Job Info */}
                <div style={{ marginBottom: '24px' }}>
                    <div className="label-tiny" style={{ marginBottom: '8px' }}>
                        In Progress
                    </div>
                    <div
                        className="display-font"
                        style={{
                            fontSize: '30px',
                            lineHeight: 1.1,
                            marginBottom: '4px',
                        }}
                    >
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
                            marginTop: '8px',
                            fontWeight: 500,
                        }}
                    >
                        {esc(job.service)}
                    </div>
                </div>

                {/* Job Timer */}
                <div
                    style={{
                        background: 'rgba(220,38,38,0.1)',
                        border: '1px solid rgba(220,38,38,0.4)',
                        borderRadius: '16px',
                        padding: '20px',
                        marginBottom: '24px',
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '8px',
                        }}
                    >
                        <div
                            className="label-tiny"
                            style={{ color: '#EF4444' }}
                        >
                            Job Timer
                        </div>
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
                            <span>RUNNING</span>
                        </div>
                    </div>
                    <div className="display-font" style={{ fontSize: '48px' }}>
                        {formatDuration(elapsed)}
                    </div>
                </div>

                {/* Intake Summary (if available) */}
                {checkinData && (
                    <div
                        style={{
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '12px',
                            padding: '16px',
                            marginBottom: '24px',
                        }}
                    >
                        <div
                            className="label-tiny"
                            style={{ marginBottom: '8px' }}
                        >
                            Intake Summary
                        </div>
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: '12px',
                                fontSize: '14px',
                            }}
                        >
                            <div>
                                <div
                                    style={{
                                        fontSize: '10px',
                                        color: 'rgba(255,255,255,0.4)',
                                    }}
                                >
                                    Mileage
                                </div>
                                <div>{esc(checkinData.mileage)} km</div>
                            </div>
                            <div>
                                <div
                                    style={{
                                        fontSize: '10px',
                                        color: 'rgba(255,255,255,0.4)',
                                    }}
                                >
                                    Fuel
                                </div>
                                <div>{esc(checkinData.fuelLevel)}%</div>
                            </div>
                            <div>
                                <div
                                    style={{
                                        fontSize: '10px',
                                        color: 'rgba(255,255,255,0.4)',
                                    }}
                                >
                                    Keys
                                </div>
                                <div>{esc(checkinData.keyCount)}</div>
                            </div>
                            <div>
                                <div
                                    style={{
                                        fontSize: '10px',
                                        color: 'rgba(255,255,255,0.4)',
                                    }}
                                >
                                    Damage
                                </div>
                                <div>
                                    {checkinData.damageNotes?.length || 0}
                                </div>
                            </div>
                        </div>
                        {checkinData.customerExpectations && (
                            <div
                                style={{
                                    marginTop: '12px',
                                    paddingTop: '12px',
                                    borderTop:
                                        '1px solid rgba(255,255,255,0.1)',
                                }}
                            >
                                <div
                                    style={{
                                        fontSize: '10px',
                                        color: 'rgba(255,255,255,0.4)',
                                    }}
                                >
                                    Customer Notes
                                </div>
                                <div
                                    style={{
                                        fontSize: '12px',
                                        fontStyle: 'italic',
                                    }}
                                >
                                    "{esc(checkinData.customerExpectations)}"
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Progress Log */}
                <section style={{ marginBottom: '24px' }}>
                    <div className="label-tiny" style={{ marginBottom: '8px' }}>
                        Progress Log ({progressNotes.length})
                    </div>
                    <div
                        style={{
                            padding: '12px',
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '12px',
                        }}
                    >
                        {progressNotes.length > 0 && (
                            <div
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '8px',
                                    marginBottom: '12px',
                                }}
                            >
                                {progressNotes.map((note, i) => (
                                    <div
                                        key={i}
                                        style={{
                                            fontSize: '12px',
                                            background:
                                                'rgba(255,255,255,0.05)',
                                            borderRadius: '8px',
                                            padding: '8px 12px',
                                        }}
                                    >
                                        <div
                                            style={{
                                                fontSize: '10px',
                                                color: 'rgba(255,255,255,0.4)',
                                            }}
                                        >
                                            {formatTime(note.timestamp)}{' '}
                                            {note.author && `- ${note.author}`}
                                        </div>
                                        <div style={{ marginTop: '2px' }}>
                                            {esc(note.text)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        <button
                            onClick={handleAddNote}
                            disabled={isProcessing}
                            style={{
                                width: '100%',
                                border: '1px dashed rgba(255,255,255,0.2)',
                                borderRadius: '8px',
                                padding: '10px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                color: 'rgba(255,255,255,0.6)',
                                fontSize: '12px',
                                background: 'transparent',
                                cursor: isProcessing ? 'wait' : 'pointer',
                                opacity: isProcessing ? 0.7 : 1,
                            }}
                        >
                            {isProcessing ? 'PROCESSING...' : '+ Add Note'}
                        </button>
                    </div>
                </section>

                {/* After Photos */}
                <section style={{ marginBottom: '24px' }}>
                    <div className="label-tiny" style={{ marginBottom: '8px' }}>
                        After Photos ({afterPhotos.length})
                    </div>
                    <div
                        style={{
                            padding: '12px',
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '12px',
                        }}
                    >
                        {afterPhotos.length > 0 && (
                            <div
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(3, 1fr)',
                                    gap: '8px',
                                    marginBottom: '8px',
                                }}
                            >
                                {afterPhotos.map((photo, i) => (
                                    <div
                                        key={i}
                                        style={{
                                            aspectRatio: '1',
                                            background:
                                                'rgba(255,255,255,0.05)',
                                            borderRadius: '8px',
                                            overflow: 'hidden',
                                            position: 'relative',
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
                        )}
                        <button
                            onClick={handleAddPhoto}
                            disabled={isProcessing}
                            style={{
                                width: '100%',
                                border: '1px dashed rgba(255,255,255,0.2)',
                                borderRadius: '8px',
                                padding: '10px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                color: 'rgba(255,255,255,0.6)',
                                fontSize: '12px',
                                background: 'transparent',
                                cursor: isProcessing ? 'wait' : 'pointer',
                                opacity: isProcessing ? 0.7 : 1,
                            }}
                        >
                            📷 Add Photo
                        </button>
                    </div>
                </section>

                {/* Complete Button */}
                <button
                    onClick={handleCompleteJob}
                    disabled={isProcessing || afterPhotos.length === 0}
                    style={{
                        width: '100%',
                        padding: '16px',
                        borderRadius: '12px',
                        fontSize: '16px',
                        letterSpacing: '0.15em',
                        fontFamily: "'Anton', sans-serif",
                        background:
                            afterPhotos.length === 0
                                ? 'rgba(220,38,38,0.5)'
                                : '#DC2626',
                        color: '#fff',
                        border: 'none',
                        cursor:
                            afterPhotos.length === 0 || isProcessing
                                ? 'not-allowed'
                                : 'pointer',
                        opacity: isProcessing ? 0.7 : 1,
                    }}
                >
                    {isProcessing ? 'PROCESSING...' : 'MARK COMPLETE'}
                </button>
                <div
                    style={{
                        fontSize: '11px',
                        color: 'rgba(255,255,255,0.4)',
                        textAlign: 'center',
                        marginTop: '8px',
                    }}
                >
                    Goes to manager for validation
                </div>
            </main>

            <style>{`
                @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
                .pulse-dot { width: 6px; height: 6px; border-radius: 50%; background: #EF4444; animation: pulse 2s infinite; }
                .display-font { font-family: 'Anton', sans-serif; letter-spacing: 0.01em; }
                .label-tiny { font-size: 10px; text-transform: uppercase; letter-spacing: 0.25em; color: rgba(255,255,255,0.5); }
                .header { border-bottom: 1px solid rgba(255,255,255,0.1); padding: 16px 20px; display: flex; align-items: center; justify-content: space-between; position: sticky; top: 0; background: rgba(0,0,0,0.95); backdrop-filter: blur(8px); z-index: 40; }
                .container { max-width: 480px; margin: 0 auto; padding: 0 20px; }
            `}</style>
        </div>
    );
}
