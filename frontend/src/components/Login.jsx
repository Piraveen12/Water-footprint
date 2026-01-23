import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { Droplets, ShieldCheck } from 'lucide-react';
import { jwtDecode } from "jwt-decode";
import toast from 'react-hot-toast';
import { translations } from '../translations';

const Login = ({ onSuccess }) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [language, setLanguage] = useState('english');

    const t = translations[language] || translations['english'];

    const handleGoogleSuccess = (credentialResponse) => {
        setLoading(true);
        try {
            const decoded = jwtDecode(credentialResponse.credential);
            console.log("Logged in user:", decoded);

            onSuccess(decoded);
            toast.success(`${t.welcomeBack || "Welcome back"}, ${decoded.name}!`);
            navigate('/app');
        } catch (error) {
            console.error("Login Failed:", error);
            toast.error("Login failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleError = () => {
        toast.error("Google Sign In was unsuccessful. Try again later.");
    };

    return (
        <div id="login-page" className="login-container" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            padding: '2rem',
            position: 'relative'
        }}>
            {/* Language Selector */}
            <select
                id="login-language-selector"
                className="language-selector"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                style={{
                    position: 'absolute',
                    top: '2rem',
                    right: '2rem'
                }}
            >
                <option value="english">English</option>
                <option value="hindi">Hindi</option>
                <option value="tamil">Tamil</option>
                <option value="telugu">Telugu</option>
                <option value="malayalam">Malayalam</option>
                <option value="kannada">Kannada</option>
            </select>

            <div className="login-card" style={{
                background: 'var(--card-bg)',
                backdropFilter: 'blur(12px)',
                border: '1px solid var(--border)',
                borderRadius: '24px',
                padding: '3rem',
                maxWidth: '450px',
                width: '100%',
                textAlign: 'center',
                boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
            }}>
                <div style={{ marginBottom: '2rem' }}>
                    <div style={{
                        background: 'rgba(34, 211, 238, 0.1)',
                        width: '80px',
                        height: '80px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1.5rem',
                        border: '1px solid rgba(34, 211, 238, 0.2)'
                    }}>
                        <Droplets size={40} style={{ color: 'var(--primary)' }} />
                    </div>
                    <h1 id="login-title">{t.appTitle}</h1>
                    <p className="subtitle" style={{ marginBottom: '2rem' }}>
                        {t.subtitle}
                    </p>
                </div>

                <div id="google-auth-section" className="auth-section" style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                    alignItems: 'center'
                }}>
                    <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={handleGoogleError}
                        theme="filled_black"
                        shape="pill"
                        size="large"
                        width="300"
                        text="signin_with"
                        locale={language} // Attempt to localize the button itself if possible
                    />

                    <div style={{ marginTop: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        <ShieldCheck size={16} />
                        <span>{t.secureAuth || "Secure Authentication"}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
