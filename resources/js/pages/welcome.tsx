import { Head, Link, usePage } from '@inertiajs/react';
import { dashboard, login } from '@/routes';
import { useEffect } from 'react';
import '../../css/welcome.css';

export default function Welcome() {
    const { auth } = usePage().props;

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

    return (
        <div className="welcome-root">
            <Head title="Welcome to EvoLab CRM">
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
                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                        <div>
                            <label className="label-tiny" style={{ display: "block", marginBottom: "8px", letterSpacing: "0.25em" }}>YOUR NAME</label>
                            <input id="login-name" type="text" placeholder="e.g. Adam" autoComplete="off" />
                        </div>
                        <div>
                            <label className="label-tiny" style={{ display: "block", marginBottom: "8px", letterSpacing: "0.25em" }}>ROLE</label>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                                <button className="role-btn" data-role="technician" style={{ padding: "12px", borderRadius: "8px", border: "1px solid #DC2626", background: "#DC2626", fontSize: "14px" }}>Technician</button>
                                <button className="role-btn" data-role="manager" style={{ padding: "12px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)", fontSize: "14px" }}>🔒 Manager</button>
                            </div>
                        </div>
                        <div id="password-section" className="hidden">
                            <label className="label-tiny" style={{ display: "block", marginBottom: "8px" }}>Manager Password</label>
                            <input id="login-password" type="password" placeholder="••••••••" autoComplete="off" />
                            <div id="pw-error" className="hidden" style={{ fontSize: "12px", color: "#EF4444", marginTop: "6px" }}>Incorrect password</div>
                            <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)", marginTop: "6px" }}>Demo: evolab2026</div>
                        </div>
                        <button id="login-submit" className="red-btn display-font" style={{ padding: "16px", borderRadius: "12px", fontSize: "18px", letterSpacing: "0.15em", marginTop: "16px" }} disabled>ENTER</button>
                    </div>
                    <div style={{ textAlign: "center", fontSize: "10px", color: "rgba(255,255,255,0.3)", marginTop: "32px", letterSpacing: "0.1em" }}>DEMO BUILD · v0.3</div>
                </div>
            </div>
        </div>
    );
}
