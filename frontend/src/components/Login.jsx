import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { Droplets, ShieldCheck } from 'lucide-react';
import { jwtDecode } from "jwt-decode";
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
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
        <div className="login-page">
            {/* Language Selector */}
            <div className="language-wrapper">
                <select
                    id="login-language-selector"
                    className="language-selector"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                >
                    <option value="english">English</option>
                    <option value="hindi">Hindi</option>
                    <option value="tamil">Tamil</option>
                    <option value="telugu">Telugu</option>
                    <option value="malayalam">Malayalam</option>
                    <option value="kannada">Kannada</option>
                </select>
            </div>

            <motion.div
                className="login-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
            >
                <div className="login-header">
                    <div className="icon-wrapper">
                        <Droplets size={40} className="primary-icon" />
                    </div>
                    <h1 id="login-title" className="main-title">{t.appTitle}</h1>
                    <p className="subtitle">
                        {t.subtitle}
                    </p>
                </div>

                <div id="google-auth-section" className="auth-section">
                    <div className="google-btn-wrapper">
                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={handleGoogleError}
                            theme="filled_black"
                            shape="pill"
                            size="large"
                            width="300"
                            text="signin_with"
                            locale={language}
                        />
                    </div>

                    <div className="secure-badge">
                        <ShieldCheck size={16} />
                        <span>{t.secureAuth || "Secure Authentication"}</span>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
