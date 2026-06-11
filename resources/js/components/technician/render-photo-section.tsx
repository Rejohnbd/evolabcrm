import { Photo } from '@/types/checkin';
export default function RenderPhotoSection({
    photos,
    type,
    min,
    title,
    subtitle,
    onAddPhoto,
    onRemovePhoto,
}: {
    photos: Photo[];
    type: 'exterior' | 'interior';
    min: number;
    title: string;
    subtitle: string;
    onAddPhoto: (type: 'exterior' | 'interior') => void;
    onRemovePhoto: (type: 'exterior' | 'interior', index: number) => void;
}) {
    return (
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
                    {type === 'exterior' ? '3.' : '4.'}
                </div>
                <div>
                    <div
                        className="display-font"
                        style={{ fontSize: '14px', letterSpacing: '0.05em' }}
                    >
                        {title}
                    </div>
                    <div
                        style={{
                            fontSize: '11px',
                            color: 'rgba(255,255,255,0.4)',
                            marginTop: '2px',
                        }}
                    >
                        {subtitle}
                    </div>
                </div>
            </div>
            <div
                style={{
                    paddingLeft: '20px',
                    borderLeft: '1px solid rgba(255,255,255,0.1)',
                }}
            >
                {photos.length > 0 && (
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(3, 1fr)',
                            gap: '8px',
                            marginBottom: '8px',
                        }}
                    >
                        {photos.map((photo, i) => (
                            <div
                                key={i}
                                style={{
                                    aspectRatio: '1',
                                    background: 'rgba(255,255,255,0.05)',
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
                                <button
                                    onClick={() => onRemovePhoto(type, i)}
                                    style={{
                                        position: 'absolute',
                                        top: '4px',
                                        right: '4px',
                                        background: 'rgba(0,0,0,0.7)',
                                        borderRadius: '50%',
                                        padding: '4px',
                                        width: '20px',
                                        height: '20px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '10px',
                                        border: 'none',
                                        color: '#fff',
                                        cursor: 'pointer',
                                    }}
                                >
                                    ✕
                                </button>
                            </div>
                        ))}
                    </div>
                )}
                <button
                    onClick={() => onAddPhoto(type)}
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
                        fontSize: '14px',
                        background: 'transparent',
                        cursor: 'pointer',
                    }}
                >
                    📷 Add Photo
                </button>
                <div
                    style={{
                        fontSize: '10px',
                        textAlign: 'center',
                        marginTop: '6px',
                        color: photos.length < min ? '#FB923C' : '#22C55E',
                    }}
                >
                    {photos.length}/{min}{' '}
                    {photos.length >= min ? '✓' : 'minimum'}
                </div>
            </div>
        </section>
    );
}
