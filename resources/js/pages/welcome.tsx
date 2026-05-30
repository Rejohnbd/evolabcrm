// resources/js/Pages/EvoLab/Welcome.tsx
import { Head, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import '../../css/welcome.css';

const MANAGER_PASSWORD = 'evolab2026';

export default function Welcome() {
    const [name, setName] = useState('');
    const [role, setRole] = useState<'technician' | 'manager'>('technician');
    const [password, setPassword] = useState('');
    const [passwordError, setPasswordError] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Toggle welcome-active class on mount/unmount to apply scoped dark body styling
    useEffect(() => {
        const htmlElement = document.documentElement;
        const bodyElement = document.body;

        htmlElement.classList.add('welcome-active');
        bodyElement.classList.add('welcome-active');

        return () => {
            htmlElement.classList.remove('welcome-active');
            bodyElement.classList.remove('welcome-active');
        };
    }, []);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!name.trim()) return;

        if (role === 'manager' && password !== MANAGER_PASSWORD) {
            setPasswordError(true);
            return;
        }

        router.post('/evolab/login', {
            name: name.trim(),
            role,
        });
    };

    const isSubmitDisabled = !name.trim() || (role === 'manager' && !password);

    return (
        <div className="welcome-root">
            <Head title="EvoLab Operations">
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link href="https://fonts.googleapis.com/css2?family=Anton&family=Manrope:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
            </Head>

            <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
                <div className="container-tight" style={{ width: "100%" }}>
                    <div style={{ textAlign: "center", marginBottom: "40px" }}>
                        <div className="display-font" style={{ fontSize: "60px", marginBottom: "8px" }}>EVO<span className="red-dot">.</span>LAB</div>
                        <div className="label-tiny">Operations App</div>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                            <div>
                                <label className="label-tiny" style={{ display: "block", marginBottom: "8px", letterSpacing: "0.25em" }}>YOUR NAME</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Adam"
                                    autoComplete="off"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="label-tiny" style={{ display: "block", marginBottom: "8px", letterSpacing: "0.25em" }}>ROLE</label>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                                    <button
                                        type="button"
                                        className="role-btn"
                                        data-role="technician"
                                        onClick={() => {
                                            setRole('technician');
                                            setShowPassword(false);
                                            setPasswordError(false);
                                        }}
                                        style={{
                                            padding: "12px",
                                            borderRadius: "8px",
                                            border: role === 'technician' ? "1px solid #DC2626" : "1px solid rgba(255,255,255,0.1)",
                                            background: role === 'technician' ? "#DC2626" : "rgba(255,255,255,0.05)",
                                            fontSize: "14px",
                                            cursor: "pointer"
                                        }}
                                    >
                                        Technician
                                    </button>
                                    <button
                                        type="button"
                                        className="role-btn"
                                        data-role="manager"
                                        onClick={() => {
                                            setRole('manager');
                                            setShowPassword(true);
                                            setPasswordError(false);
                                        }}
                                        style={{
                                            padding: "12px",
                                            borderRadius: "8px",
                                            border: role === 'manager' ? "1px solid #DC2626" : "1px solid rgba(255,255,255,0.1)",
                                            background: role === 'manager' ? "#DC2626" : "rgba(255,255,255,0.05)",
                                            fontSize: "14px",
                                            cursor: "pointer"
                                        }}
                                    >
                                        🔒 Manager
                                    </button>
                                </div>
                            </div>

                            {showPassword && (
                                <div id="password-section">
                                    <label className="label-tiny" style={{ display: "block", marginBottom: "8px" }}>Manager Password</label>
                                    <input
                                        type="password"
                                        placeholder="••••••••"
                                        autoComplete="off"
                                        value={password}
                                        onChange={(e) => {
                                            setPassword(e.target.value);
                                            setPasswordError(false);
                                        }}
                                    />
                                    {passwordError && (
                                        <div style={{ fontSize: "12px", color: "#EF4444", marginTop: "6px" }}>Incorrect password</div>
                                    )}
                                    <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)", marginTop: "6px" }}>Demo: evolab2026</div>
                                </div>
                            )}

                            <button
                                type="submit"
                                id="login-submit"
                                className="red-btn display-font"
                                disabled={isSubmitDisabled}
                                style={{
                                    padding: "16px",
                                    borderRadius: "12px",
                                    fontSize: "18px",
                                    letterSpacing: "0.15em",
                                    marginTop: "16px",
                                    width: "100%",
                                    cursor: isSubmitDisabled ? "not-allowed" : "pointer",
                                    opacity: isSubmitDisabled ? 0.5 : 1
                                }}
                            >
                                ENTER
                            </button>
                        </div>
                    </form>

                    <div style={{ textAlign: "center", fontSize: "10px", color: "rgba(255,255,255,0.3)", marginTop: "32px", letterSpacing: "0.1em" }}>DEMO BUILD · v0.3</div>
                </div>
            </div>
        </div>
    );
}