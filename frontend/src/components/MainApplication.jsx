import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
import DailyLifeGallery from './DailyLifeGallery'
import WaterCalculatorWizard from './WaterCalculatorWizard'
import { Calculator } from 'lucide-react'

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

    // Auto-logout Logic
    useEffect(() => {
        if (!user) return;

        // Session timeout duration (15 minutes)
        const TIMEOUT_DURATION = 15 * 60 * 1000;

        let lastActivity = Date.now();
        let intervalId;

        const updateActivity = () => {
            lastActivity = Date.now();
        };

        // Events to monitor
        const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];

        // Add listeners (throttled naturally by just updating a variable)
        events.forEach(event => {
            window.addEventListener(event, updateActivity);
        });

        // Check every minute
        intervalId = setInterval(() => {
            if (Date.now() - lastActivity > TIMEOUT_DURATION) {
                toast.error("Session timed out due to inactivity");
                if (onLogout) onLogout();
            }
        }, 60000);

        return () => {
            events.forEach(event => {
                window.removeEventListener(event, updateActivity);
            });
            if (intervalId) clearInterval(intervalId);
        };
    }, [user, onLogout]);

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
            const response = await axios.post('/api/history', {
                user_id: user.sub,
                item: newItem
            });

            if (response.data.record) {
                setHistory(prev => [...prev, response.data.record]);
            } else {
                // Fallback
                const itemWithDate = { ...newItem, timestamp: new Date().toISOString() }
                setHistory(prev => [...prev, itemWithDate]);
            }
        } catch (error) {
            console.error("Failed to save to history:", error);
            toast.error("Failed to save to cloud history");
        }
    }

    const removeFromHistory = async (itemToRemove) => {
        // Optimistic update
        const oldHistory = [...history];
        const newHistory = history.filter(item => {
            // If we have IDs, use them
            if (item._id && itemToRemove._id) {
                return item._id !== itemToRemove._id;
            }
            // Fallback to timestamp + name
            return item.timestamp !== itemToRemove.timestamp || item.item_name !== itemToRemove.item_name;
        });

        setHistory(newHistory);

        if (!user || !user.sub) {
            localStorage.setItem('waterFootprintHistory', JSON.stringify(newHistory));
            toast.success("Item deleted");
            return;
        }

        if (itemToRemove._id) {
            try {
                await axios.delete('/api/history', {
                    params: { user_id: user.sub, item_id: itemToRemove._id }
                });
                toast.success("Item deleted");
            } catch (error) {
                console.error("Failed to delete:", error);
                toast.error("Failed to delete from cloud");
                setHistory(oldHistory); // Revert
            }
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



    // ... existing helper function ...

    // Updated executeSearch to accept direct query
    const executeSearch = async (query = null) => {
        // use query if passed, otherwise state
        const searchText = typeof query === 'string' ? query : textInput;

        if (!searchText || !searchText.trim()) return;

        // Update state if query was passed directly so UI reflects it
        if (typeof query === 'string') {
            setTextInput(query);
        }

        setLoading(true)
        setResult(null)
        setScannedImage(null)
        try {
            const response = await axios.post('/api/footprint', { text: searchText })
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

    const handleKeySearch = (e) => {
        if (e.key === 'Enter') {
            executeSearch()
        }
    }

    const handleWizardComplete = (val) => {
        const newItem = {
            item_name: "Daily Baseline Estimate",
            water_footprint_liters: val,
            category: "Habit"
        };
        addToHistory(newItem);
        toast.success(t.analysisComplete || "Baseline added!");
        setActiveTab('tracker');
    }

    return (

        <div className="app-wrapper">
            {/* Top Navigation Bar */}
            <header className="main-header">
                <div className="header-left">
                    <div className="logo-section" onClick={() => setActiveTab('scan')}>
                        <Droplets size={24} className="text-primary" />
                        <span className="logo-text">WaterPrint</span>
                    </div>
                </div>

                <nav className="header-tabs">
                    <button
                        className={`nav-item ${activeTab === 'scan' ? 'active' : ''}`}
                        onClick={() => setActiveTab('scan')}
                    >
                        <Scan size={18} />
                        <span>{t.scanTab}</span>
                    </button>
                    <button
                        className={`nav-item ${activeTab === 'tracker' ? 'active' : ''}`}
                        onClick={() => setActiveTab('tracker')}
                    >
                        <LayoutDashboard size={18} />
                        <span>{t.trackerTab}</span>
                    </button>
                    <button
                        className={`nav-item ${activeTab === 'calculator' ? 'active' : ''}`}
                        onClick={() => setActiveTab('calculator')}
                    >
                        <Calculator size={18} />
                        <span>{t.calculatorTab}</span>
                    </button>
                </nav>

                <div className="header-right">
                    <select
                        className="header-lang-select"
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                    >
                        <option value="english">Eng</option>
                        <option value="hindi">Hin</option>
                        <option value="tamil">Tam</option>
                        <option value="telugu">Tel</option>
                        <option value="malayalam">Mal</option>
                        <option value="kannada">Kan</option>
                    </select>

                    <button
                        className="header-icon-btn"
                        onClick={() => setShowHelp(true)}
                        title="Help"
                    >
                        <HelpCircle size={20} />
                    </button>

                    <button
                        className="header-icon-btn"
                        onClick={() => setShowAbout(true)}
                        title="About"
                    >
                        <Info size={20} />
                    </button>

                    {user && (
                        <div className="header-profile">
                            <button
                                className={`profile-btn ${showLogout ? 'active' : ''}`}
                                onClick={() => setShowLogout(!showLogout)}
                                title={user.name}
                            >
                                {user.picture ? (
                                    <img
                                        src={user.picture}
                                        alt="Profile"
                                        className="profile-img"
                                    />
                                ) : (
                                    <User size={20} />
                                )}
                            </button>

                            {showLogout && (
                                <div className="profile-dropdown">
                                    <div className="user-info-mini">
                                        <span className="user-name">{user.name}</span>
                                        <span className="user-email">{user.email}</span>
                                    </div>
                                    <div className="dropdown-divider"></div>
                                    <button
                                        id="logout-btn"
                                        className="dropdown-item danger"
                                        onClick={onLogout}
                                    >
                                        <LogOut size={16} />
                                        <span>{t.logout || "Logout"}</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </header>

            <div className="app-container">
                <div className="mobile-subheader">
                    {user && (
                        <p className="welcome-text">
                            {t.welcomeBack || "Welcome back"}, <span className="text-primary">{user.given_name || user.name}</span>!
                        </p>
                    )}
                </div>

                <AnimatePresence mode="wait">
                    {activeTab === 'scan' && (
                        <motion.div
                            key="scan"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className="search-container">
                                <input
                                    id="search-input"
                                    type="text"
                                    className="search-box"
                                    placeholder={t.searchPlaceholder}
                                    value={textInput}
                                    onChange={(e) => setTextInput(e.target.value)}
                                    onKeyDown={handleKeySearch}
                                />
                                <Search
                                    className="search-icon"
                                    onClick={() => executeSearch()}
                                    style={{ cursor: 'pointer' }}
                                />
                            </div>

                            <Scanner onScan={handleScan} t={t} />

                            {/* Show Daily Life Gallery only when no result is active */}
                            {!result && !loading && (
                                <DailyLifeGallery onSelect={executeSearch} t={t} />
                            )}

                            {loading && (
                                <div id="loading-indicator" style={{ margin: '2rem' }}>
                                    <Loader2 className="spin" size={32} />
                                    <p>{t.analyzing}</p>
                                </div>
                            )}

                            <WaterFootprintCard data={result} language={language} image={scannedImage} t={t} />
                        </motion.div>
                    )}

                    {activeTab === 'tracker' && (
                        <motion.div
                            key="tracker"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <TrackerDashboard
                                history={history}
                                onStart={() => setActiveTab('scan')}
                                onCalculate={() => setActiveTab('calculator')}
                                onDelete={removeFromHistory}
                                t={t}
                            />
                        </motion.div>
                    )}

                    {activeTab === 'calculator' && (
                        <motion.div
                            key="calculator"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <WaterCalculatorWizard onComplete={handleWizardComplete} t={t} />
                        </motion.div>
                    )}
                </AnimatePresence>

                <ChatBot t={t} language={language} />

                <HowToUse isOpen={showHelp} onClose={() => setShowHelp(false)} t={t} />
                <AboutProject isOpen={showAbout} onClose={() => setShowAbout(false)} t={t} />
            </div>
        </div>
    )
}

export default MainApplication
