import { useState, useEffect } from 'react'
import axios from 'axios'
import { Toaster, toast } from 'react-hot-toast'
import Scanner from './Scanner'
import WaterFootprintCard from './WaterFootprintCard'
import ChatBot from './ChatBot'
import TrackerDashboard from './TrackerDashboard'
import HowToUse from './HowToUse'
import AboutProject from './AboutProject'
import { translations } from '../translations'
import '../App.css'
import { Droplets, Search, Loader2, LayoutDashboard, Scan, HelpCircle, Info, LogOut, User } from 'lucide-react'

function MainApplication({ user, onLogout }) {
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState(null)
    const [language, setLanguage] = useState('english')
    const [textInput, setTextInput] = useState('')
    const [scannedImage, setScannedImage] = useState(null)
    const [history, setHistory] = useState([])
    const [activeTab, setActiveTab] = useState('scan')
    const [showHelp, setShowHelp] = useState(false)
    const [showAbout, setShowAbout] = useState(false)
    const [showLogout, setShowLogout] = useState(false)

    // Helper to get text based on language (default to English if key missing)
    const t = translations[language] || translations['english'];

    useEffect(() => {
        // Fetch history from backend if user is logged in
        if (user && user.sub) {
            fetchHistory(user.sub);
        } else {
            // Fallback to local storage
            const saved = localStorage.getItem('waterFootprintHistory')
            if (saved) {
                setHistory(JSON.parse(saved))
            }
        }
    }, [user])

    const fetchHistory = async (userId) => {
        try {
            const response = await axios.get('/api/history', {
                params: { user_id: userId }
            });
            // Mongo returns list of objects, we need a list.
            setHistory(response.data);
        } catch (error) {
            console.error("Failed to fetch history:", error);
            // Optionally fallback to local storage on error, but better to just show error or empty
        }
    }

    const addToHistory = async (newItem) => {
        if (!user || !user.sub) {
            // Fallback to local storage logic for non-logged in or basic usage
            const itemWithDate = { ...newItem, timestamp: new Date().toISOString() }
            const newHistory = [...history, itemWithDate]
            setHistory(newHistory)
            localStorage.setItem('waterFootprintHistory', JSON.stringify(newHistory))
            return;
        }

        try {
            await axios.post('/api/history', {
                user_id: user.sub,
                item: newItem
            });
            // Re-fetch or manually update state
            const itemWithDate = { ...newItem, timestamp: new Date().toISOString() }
            setHistory(prev => [...prev, itemWithDate]);
        } catch (error) {
            console.error("Failed to save to history:", error);
            toast.error("Failed to save to cloud history");
        }
    }

    const handleScan = async (imageSrc) => {
        if (!imageSrc) return
        setLoading(true)
        setResult(null)

        const formData = new FormData()

        // Check if it's a file or base64 string
        if (imageSrc instanceof File) {
            setScannedImage(URL.createObjectURL(imageSrc))
            formData.append('image', imageSrc)
        } else {
            setScannedImage(imageSrc)
            // Convert base64 to blob
            const blob = await (await fetch(imageSrc)).blob()
            formData.append('image', blob, 'scan.jpg')
        }

        try {
            const response = await axios.post('/api/footprint', formData)
            setResult(response.data)
            addToHistory(response.data)
            toast.success(t.analysisComplete)
        } catch (error) {
            console.error("Error analyzing image:", error)
            toast.error(error.response?.data?.error || "Failed to analyze image. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    const handleTextSearch = async (e) => {
        if (e.key === 'Enter' && textInput.trim()) {
            setLoading(true)
            setResult(null)
            setScannedImage(null)
            try {
                const response = await axios.post('/api/footprint', { text: textInput })
                setResult(response.data)
                addToHistory(response.data)
                toast.success(t.foundIt)
            } catch (error) {
                console.error("Error searching:", error)
                toast.error(error.response?.data?.error || "Could not find that item.")
            } finally {
                setLoading(false)
            }
        }
    }

    return (
        <>
            <select
                id="language-selector"
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

            {/* Logout Button */}
            {/* Profile & Logout Button */}
            {user && (
                <div style={{
                    position: 'absolute',
                    top: '1.5rem',
                    right: '10rem', // Positioned to the left of language selector
                    zIndex: 100
                }}>
                    <button
                        onClick={() => setShowLogout(!showLogout)}
                        style={{
                            background: 'rgba(255,255,255,0.1)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            color: 'white',
                            padding: '0.5rem',
                            borderRadius: '50%',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '40px',
                            height: '40px'
                        }}
                        title={user.name}
                    >
                        {user.picture ? (
                            <img
                                src={user.picture}
                                alt="Profile"
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    borderRadius: '50%',
                                    objectFit: 'cover'
                                }}
                            />
                        ) : (
                            <User size={20} />
                        )}
                    </button>

                    {showLogout && (
                        <button
                            id="logout-btn"
                            onClick={onLogout}
                            style={{
                                position: 'absolute',
                                top: '110%',
                                right: 0,
                                background: 'rgba(30, 30, 30, 0.9)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                color: 'white',
                                padding: '0.5rem 1rem',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                fontSize: '0.9rem',
                                whiteSpace: 'nowrap',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                                backdropFilter: 'blur(10px)'
                            }}
                        >
                            <LogOut size={16} />
                            <span>{t.logout || "Logout"}</span>
                        </button>
                    )}
                </div>
            )}

            <button
                id="help-btn"
                className="help-btn"
                onClick={() => setShowHelp(true)}
                style={{
                    position: 'absolute',
                    top: '1.5rem',
                    left: '1.5rem',
                    background: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: 'white',
                    padding: '0.5rem',
                    borderRadius: '50%',
                    cursor: 'pointer'
                }}
            >
                <HelpCircle size={20} />
            </button>

            <button
                id="info-btn"
                className="info-btn"
                onClick={() => setShowAbout(true)}
                style={{
                    position: 'absolute',
                    top: '1.5rem',
                    left: '4.5rem',
                    background: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: 'white',
                    padding: '0.5rem',
                    borderRadius: '50%',
                    cursor: 'pointer'
                }}
            >
                <Info size={20} />
            </button>

            <div className="hero">
                <Droplets size={64} style={{ color: 'var(--primary)', marginBottom: '1rem' }} />
                <h1>{t.appTitle}</h1>
                <p className="subtitle">{t.subtitle}</p>

                {user && (
                    <p id="user-greeting" style={{ marginTop: '-2rem', marginBottom: '2rem', color: 'var(--primary)' }}>
                        {t.welcomeBack || "Welcome back"}, {user.given_name || user.name}!
                    </p>
                )}
            </div>

            <div className="tab-nav" style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <button
                    id="scan-tab-btn"
                    className={`tab-btn ${activeTab === 'scan' ? 'active' : ''}`}
                    onClick={() => setActiveTab('scan')}
                >
                    <Scan size={18} /> {t.scanTab}
                </button>
                <button
                    id="tracker-tab-btn"
                    className={`tab-btn ${activeTab === 'tracker' ? 'active' : ''}`}
                    onClick={() => setActiveTab('tracker')}
                >
                    <LayoutDashboard size={18} /> {t.trackerTab}
                </button>
            </div>

            {activeTab === 'scan' ? (
                <>
                    <div className="search-container">
                        <input
                            id="search-input"
                            type="text"
                            className="search-box"
                            placeholder={t.searchPlaceholder}
                            value={textInput}
                            onChange={(e) => setTextInput(e.target.value)}
                            onKeyDown={handleTextSearch}
                        />
                        <Search className="search-icon" />
                    </div>

                    <Scanner onScan={handleScan} t={t} />

                    {loading && (
                        <div id="loading-indicator" style={{ margin: '2rem' }}>
                            <Loader2 className="spin" size={32} />
                            <p>{t.analyzing}</p>
                        </div>
                    )}

                    <WaterFootprintCard data={result} language={language} image={scannedImage} t={t} />
                </>
            ) : (
                <TrackerDashboard history={history} onStart={() => setActiveTab('scan')} t={t} />
            )}

            <ChatBot t={t} />

            <HowToUse isOpen={showHelp} onClose={() => setShowHelp(false)} t={t} />
            <AboutProject isOpen={showAbout} onClose={() => setShowAbout(false)} t={t} />
        </>
    )
}

export default MainApplication
