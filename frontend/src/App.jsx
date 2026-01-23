import { useState, useEffect } from 'react'
import axios from 'axios'
import { Toaster, toast } from 'react-hot-toast'
import Scanner from './components/Scanner'
import WaterFootprintCard from './components/WaterFootprintCard'
import ChatBot from './components/ChatBot'
import TrackerDashboard from './components/TrackerDashboard'
import HowToUse from './components/HowToUse'
import AboutProject from './components/AboutProject'
import { translations } from './translations'
import './App.css'
import { Droplets, Search, Loader2, LayoutDashboard, Scan, HelpCircle, Info } from 'lucide-react'

function App() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [language, setLanguage] = useState('english')
  const [textInput, setTextInput] = useState('')
  const [scannedImage, setScannedImage] = useState(null)
  const [history, setHistory] = useState([])
  const [activeTab, setActiveTab] = useState('scan')
  const [showHelp, setShowHelp] = useState(false)
  const [showAbout, setShowAbout] = useState(false)

  // Helper to get text based on language (default to English if key missing)
  const t = translations[language] || translations['english'];

  useEffect(() => {
    const saved = localStorage.getItem('waterFootprintHistory')
    if (saved) {
      setHistory(JSON.parse(saved))
    }
  }, [])

  const addToHistory = (newItem) => {
    const itemWithDate = { ...newItem, timestamp: new Date().toISOString() }
    const newHistory = [...history, itemWithDate]
    setHistory(newHistory)
    localStorage.setItem('waterFootprintHistory', JSON.stringify(newHistory))
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
        toast.error("Could not find that item.")
      } finally {
        setLoading(false)
      }
    }
  }

  return (
    <>
      <select
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

      <button
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
      </div>

      <div className="tab-nav" style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <button
          className={`tab-btn ${activeTab === 'scan' ? 'active' : ''}`}
          onClick={() => setActiveTab('scan')}
        >
          <Scan size={18} /> {t.scanTab}
        </button>
        <button
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
            <div style={{ margin: '2rem' }}>
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

      <Toaster position="bottom-center" toastOptions={{
        style: {
          background: '#1e293b',
          color: '#fff',
          border: '1px solid rgba(255,255,255,0.1)'
        }
      }} />
    </>
  )
}

export default App
