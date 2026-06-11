import RenderPhotoSection from '@/components/technician/render-photo-section';
import { CheckinProps, Photo } from '@/types/checkin';
import { CheckinData } from '@/types/technician';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';

export default function Checkin({
    jobId,
    job,
    existingCheckinData,
}: CheckinProps) {
    const [checkinData, setCheckinData] = useState<CheckinData>({
        mileage: existingCheckinData?.mileage || '',
        fuelLevel: existingCheckinData?.fuelLevel || '50',
        keysReceived: existingCheckinData?.keysReceived ?? null,
        keyCount: existingCheckinData?.keyCount || '1',
        personalItems: existingCheckinData?.personalItems || '',
        exteriorPhotos: existingCheckinData?.exteriorPhotos || [],
        interiorPhotos: existingCheckinData?.interiorPhotos || [],
        damageNotes: existingCheckinData?.damageNotes || [],
        customerExpectations: existingCheckinData?.customerExpectations || '',
    });
    const [isProcessing, setIsProcessing] = useState(false);

    const canFinish =
        checkinData.mileage &&
        checkinData.keysReceived === true &&
        checkinData.exteriorPhotos.length >= 1 &&
        checkinData.interiorPhotos.length >= 1;

    const handleCancel = () => {
        router.get('/technician');
    };

    const handleCompleteCheckin = () => {
        if (!canFinish) return;

        setIsProcessing(true);

        // Create FormData to handle the request
        const formData = new FormData();
        formData.append('mileage', checkinData.mileage);
        formData.append('fuelLevel', checkinData.fuelLevel);
        formData.append('keysReceived', String(checkinData.keysReceived));
        formData.append('keyCount', checkinData.keyCount);
        formData.append('personalItems', checkinData.personalItems);
        formData.append(
            'exteriorPhotos',
            JSON.stringify(checkinData.exteriorPhotos),
        );
        formData.append(
            'interiorPhotos',
            JSON.stringify(checkinData.interiorPhotos),
        );
        formData.append('damageNotes', JSON.stringify(checkinData.damageNotes));
        formData.append(
            'customerExpectations',
            checkinData.customerExpectations,
        );

        router.post(`/technician-checkin/${jobId}`, formData, {
            onSuccess: () => {
                // Redirect handled by controller
            },
            onError: (errors) => {
                console.error('Checkin error:', errors);
                alert('Failed to complete checkin. Please try again.');
                setIsProcessing(false);
            },
        });
    };

    const handleAddPhoto = (type: 'exterior' | 'interior') => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.capture = 'environment';
        input.addEventListener('change', (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (ev) => {
                const photo: Photo = {
                    data: ev.target?.result as string,
                    timestamp: Date.now(),
                };
                setCheckinData((prev) => ({
                    ...prev,
                    [type === 'exterior' ? 'exteriorPhotos' : 'interiorPhotos']:
                        [
                            ...(type === 'exterior'
                                ? prev.exteriorPhotos
                                : prev.interiorPhotos),
                            photo,
                        ],
                }));
            };
            reader.readAsDataURL(file);
        });
        input.click();
    };

    const handleRemovePhoto = (
        type: 'exterior' | 'interior',
        index: number,
    ) => {
        setCheckinData((prev) => ({
            ...prev,
            [type === 'exterior' ? 'exteriorPhotos' : 'interiorPhotos']:
                (type === 'exterior'
                    ? prev.exteriorPhotos
                    : prev.interiorPhotos
                ).filter((_, i) => i !== index),
        }));
    };

    const handleAddDamage = () => {
        const location = prompt('Damage location (e.g., Hood, Left door):');
        if (!location) return;
        const description = prompt('Description of damage:');
        if (!description) return;

        setCheckinData((prev) => ({
            ...prev,
            damageNotes: [
                ...prev.damageNotes,
                { location, description, timestamp: Date.now() },
            ],
        }));
    };

    const handleRemoveDamage = (index: number) => {
        setCheckinData((prev) => ({
            ...prev,
            damageNotes: prev.damageNotes.filter((_, i) => i !== index),
        }));
    };

    return (
        <>
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
                <div
                    style={{
                        marginBottom: '24px',
                        paddingBottom: '20px',
                        borderBottom: '1px solid rgba(255,255,255,0.1)',
                    }}
                >
                    <div className="label-tiny" style={{ marginBottom: '8px' }}>
                        Checking In
                    </div>
                    <div className="display-font" style={{ fontSize: '30px' }}>
                        {job.vehicle}
                    </div>
                    <div
                        style={{
                            fontSize: '14px',
                            color: 'rgba(255,255,255,0.6)',
                            marginTop: '4px',
                        }}
                    >
                        {job.color} · Plate {job.plate}
                    </div>
                    <div
                        style={{
                            fontSize: '14px',
                            color: '#EF4444',
                            marginTop: '8px',
                        }}
                    >
                        {job.service}
                    </div>
                    <div
                        style={{
                            fontSize: '12px',
                            color: 'rgba(255,255,255,0.4)',
                            marginTop: '8px',
                        }}
                    >
                        Customer: {job.customer}
                    </div>
                </div>

                {/* Vehicle Condition */}
                <section style={{ marginBottom: '24px' }}>
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'baseline',
                            gap: '8px',
                            marginBottom: '12px',
                        }}
                    >
                        <div
                            className="display-font"
                            style={{ color: '#DC2626', fontSize: '18px' }}
                        >
                            1.
                        </div>
                        <div>
                            <div
                                className="display-font"
                                style={{ fontSize: '14px' }}
                            >
                                VEHICLE CONDITION
                            </div>
                        </div>
                    </div>
                    <div
                        style={{
                            paddingLeft: '20px',
                            borderLeft: '1px solid rgba(255,255,255,0.1)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '12px',
                        }}
                    >
                        <div>
                            <label
                                className="label-tiny"
                                style={{
                                    display: 'block',
                                    marginBottom: '6px',
                                }}
                            >
                                Odometer (km){' '}
                                <span style={{ color: '#EF4444' }}>*</span>
                            </label>
                            <input
                                type="number"
                                value={checkinData.mileage}
                                onChange={(e) =>
                                    setCheckinData((prev) => ({
                                        ...prev,
                                        mileage: e.target.value,
                                    }))
                                }
                                placeholder="e.g. 45200"
                                style={{
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    color: '#fff',
                                    borderRadius: '8px',
                                    padding: '10px 14px',
                                    width: '100%',
                                }}
                            />
                        </div>
                        <div>
                            <label
                                className="label-tiny"
                                style={{
                                    display: 'block',
                                    marginBottom: '6px',
                                }}
                            >
                                Fuel Level: {checkinData.fuelLevel}%
                            </label>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                step="25"
                                value={checkinData.fuelLevel}
                                onChange={(e) =>
                                    setCheckinData((prev) => ({
                                        ...prev,
                                        fuelLevel: e.target.value,
                                    }))
                                }
                                style={{
                                    width: '100%',
                                    accentColor: '#DC2626',
                                }}
                            />
                        </div>
                    </div>
                </section>

                {/* Keys & Items */}
                <section style={{ marginBottom: '24px' }}>
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'baseline',
                            gap: '8px',
                            marginBottom: '12px',
                        }}
                    >
                        <div
                            className="display-font"
                            style={{ color: '#DC2626', fontSize: '18px' }}
                        >
                            2.
                        </div>
                        <div>
                            <div
                                className="display-font"
                                style={{ fontSize: '14px' }}
                            >
                                KEYS & ITEMS
                            </div>
                        </div>
                    </div>
                    <div
                        style={{
                            paddingLeft: '20px',
                            borderLeft: '1px solid rgba(255,255,255,0.1)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '12px',
                        }}
                    >
                        <div>
                            <label
                                className="label-tiny"
                                style={{
                                    display: 'block',
                                    marginBottom: '6px',
                                }}
                            >
                                Keys Received{' '}
                                <span style={{ color: '#EF4444' }}>*</span>
                            </label>
                            <div
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: '1fr 1fr',
                                    gap: '8px',
                                }}
                            >
                                <button
                                    onClick={() =>
                                        setCheckinData((prev) => ({
                                            ...prev,
                                            keysReceived: true,
                                        }))
                                    }
                                    style={{
                                        padding: '10px',
                                        borderRadius: '8px',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        background:
                                            checkinData.keysReceived === true
                                                ? '#DC2626'
                                                : 'rgba(255,255,255,0.05)',
                                        color: '#fff',
                                        cursor: 'pointer',
                                    }}
                                >
                                    🔑 Yes
                                </button>
                                <button
                                    onClick={() =>
                                        setCheckinData((prev) => ({
                                            ...prev,
                                            keysReceived: false,
                                        }))
                                    }
                                    style={{
                                        padding: '10px',
                                        borderRadius: '8px',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        background:
                                            checkinData.keysReceived === false
                                                ? 'rgba(255,255,255,0.15)'
                                                : 'rgba(255,255,255,0.05)',
                                        color: '#fff',
                                        cursor: 'pointer',
                                    }}
                                >
                                    No
                                </button>
                            </div>
                        </div>
                        {checkinData.keysReceived && (
                            <div>
                                <label
                                    className="label-tiny"
                                    style={{
                                        display: 'block',
                                        marginBottom: '6px',
                                    }}
                                >
                                    Key Count
                                </label>
                                <div
                                    style={{
                                        display: 'grid',
                                        gridTemplateColumns: '1fr 1fr 1fr',
                                        gap: '8px',
                                    }}
                                >
                                    {['1', '2', '3+'].map((n) => (
                                        <button
                                            key={n}
                                            onClick={() =>
                                                setCheckinData((prev) => ({
                                                    ...prev,
                                                    keyCount: n,
                                                }))
                                            }
                                            style={{
                                                padding: '8px',
                                                borderRadius: '8px',
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                background:
                                                    checkinData.keyCount === n
                                                        ? '#DC2626'
                                                        : 'rgba(255,255,255,0.05)',
                                                color: '#fff',
                                                cursor: 'pointer',
                                            }}
                                        >
                                            {n}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                        <div>
                            <label
                                className="label-tiny"
                                style={{
                                    display: 'block',
                                    marginBottom: '6px',
                                }}
                            >
                                Personal Items
                            </label>
                            <textarea
                                value={checkinData.personalItems}
                                onChange={(e) =>
                                    setCheckinData((prev) => ({
                                        ...prev,
                                        personalItems: e.target.value,
                                    }))
                                }
                                placeholder="Sunglasses, child seat, etc."
                                style={{
                                    width: '100%',
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    color: '#fff',
                                    borderRadius: '8px',
                                    padding: '10px 14px',
                                    minHeight: '60px',
                                }}
                            />
                        </div>
                    </div>
                </section>

                {/* Photos Sections */}
                {/* Photos Sections */}
                <RenderPhotoSection
                    photos={checkinData.exteriorPhotos}
                    type="exterior"
                    min={1}
                    title="EXTERIOR PHOTOS"
                    subtitle="Min 1 (front, back, sides)"
                    onAddPhoto={handleAddPhoto}
                    onRemovePhoto={handleRemovePhoto}
                />
                <RenderPhotoSection
                    photos={checkinData.interiorPhotos}
                    type="interior"
                    min={1}
                    title="INTERIOR PHOTOS"
                    subtitle="Seats, dash, trunk"
                    onAddPhoto={handleAddPhoto}
                    onRemovePhoto={handleRemovePhoto}
                />

                {/* Damage Section */}
                <section style={{ marginBottom: '24px' }}>
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'baseline',
                            gap: '8px',
                            marginBottom: '12px',
                        }}
                    >
                        <div
                            className="display-font"
                            style={{ color: '#DC2626', fontSize: '18px' }}
                        >
                            5.
                        </div>
                        <div>
                            <div
                                className="display-font"
                                style={{ fontSize: '14px' }}
                            >
                                PRE-EXISTING DAMAGE
                            </div>
                            <div
                                style={{
                                    fontSize: '11px',
                                    color: 'rgba(255,255,255,0.4)',
                                }}
                            >
                                Document BEFORE work starts
                            </div>
                        </div>
                    </div>
                    <div
                        style={{
                            paddingLeft: '20px',
                            borderLeft: '1px solid rgba(255,255,255,0.1)',
                        }}
                    >
                        {checkinData.damageNotes.map((damage, i) => (
                            <div
                                key={i}
                                style={{
                                    background: 'rgba(249,115,22,0.1)',
                                    border: '1px solid rgba(249,115,22,0.3)',
                                    borderRadius: '8px',
                                    padding: '12px',
                                    display: 'flex',
                                    gap: '12px',
                                    marginBottom: '8px',
                                }}
                            >
                                <div style={{ color: '#FB923C' }}>⚠</div>
                                <div style={{ flex: 1 }}>
                                    <div
                                        style={{
                                            fontWeight: 500,
                                            color: '#fff',
                                        }}
                                    >
                                        {damage.location}
                                    </div>
                                    <div
                                        style={{
                                            fontSize: '12px',
                                            color: 'rgba(255,255,255,0.7)',
                                        }}
                                    >
                                        {damage.description}
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleRemoveDamage(i)}
                                    style={{
                                        color: 'rgba(255,255,255,0.4)',
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                    }}
                                >
                                    ✕
                                </button>
                            </div>
                        ))}
                        <button
                            onClick={handleAddDamage}
                            style={{
                                width: '100%',
                                border: '1px dashed rgba(255,255,255,0.2)',
                                borderRadius: '8px',
                                padding: '16px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                color: 'rgba(255,255,255,0.6)',
                                background: 'transparent',
                                cursor: 'pointer',
                            }}
                        >
                            + Log Damage
                        </button>
                    </div>
                </section>

                {/* Customer Notes */}
                <section style={{ marginBottom: '24px' }}>
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'baseline',
                            gap: '8px',
                            marginBottom: '12px',
                        }}
                    >
                        <div
                            className="display-font"
                            style={{ color: '#DC2626', fontSize: '18px' }}
                        >
                            6.
                        </div>
                        <div>
                            <div
                                className="display-font"
                                style={{ fontSize: '14px' }}
                            >
                                CUSTOMER NOTES
                            </div>
                        </div>
                    </div>
                    <div
                        style={{
                            paddingLeft: '20px',
                            borderLeft: '1px solid rgba(255,255,255,0.1)',
                        }}
                    >
                        <label
                            className="label-tiny"
                            style={{ display: 'block', marginBottom: '6px' }}
                        >
                            Special requests / concerns
                        </label>
                        <textarea
                            value={checkinData.customerExpectations}
                            onChange={(e) =>
                                setCheckinData((prev) => ({
                                    ...prev,
                                    customerExpectations: e.target.value,
                                }))
                            }
                            placeholder="Avoid dash camera, etc."
                            style={{
                                width: '100%',
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                color: '#fff',
                                borderRadius: '8px',
                                padding: '10px 14px',
                                minHeight: '80px',
                            }}
                        />
                    </div>
                </section>

                {/* Submit Button */}
                <button
                    onClick={handleCompleteCheckin}
                    disabled={!canFinish || isProcessing}
                    style={{
                        width: '100%',
                        padding: '16px',
                        borderRadius: '12px',
                        fontSize: '16px',
                        fontFamily: "'Anton', sans-serif",
                        marginTop: '16px',
                        background: canFinish
                            ? '#DC2626'
                            : 'rgba(220,38,38,0.2)',
                        color: canFinish ? '#fff' : 'rgba(255,255,255,0.3)',
                        border: 'none',
                        cursor:
                            canFinish && !isProcessing
                                ? 'pointer'
                                : 'not-allowed',
                    }}
                >
                    {isProcessing ? 'PROCESSING...' : 'COMPLETE & START'}
                </button>
                {!canFinish && (
                    <div
                        style={{
                            fontSize: '11px',
                            color: 'rgba(255,255,255,0.4)',
                            textAlign: 'center',
                            marginTop: '8px',
                        }}
                    >
                        Need: mileage, keys, 1+ exterior, 1+ interior
                    </div>
                )}
            </main>

            {/* <style>{`
                .display-font { font-family: 'Anton', sans-serif; }
                .label-tiny { font-size: 10px; text-transform: uppercase; letter-spacing: 0.25em; color: rgba(255,255,255,0.5); }
                .header { border-bottom: 1px solid rgba(255,255,255,0.1); padding: 16px 20px; display: flex; align-items: center; justify-content: space-between; position: sticky; top: 0; background: rgba(0,0,0,0.95); backdrop-filter: blur(8px); z-index: 40; }
                .container { max-width: 480px; margin: 0 auto; padding: 0 20px; }
            `}</style> */}
        </>
    );
}
