import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Chat from './pages/Chat'
import Progress from './pages/Progress'
import Settings from './pages/Settings'
import SubjectView from './pages/SubjectView'
import './App.css'

function Header({ wallet, onConnect }) {
    const location = useLocation()
    const [theme, setTheme] = useState('dark')

    const toggleTheme = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark'
        setTheme(newTheme)
        document.documentElement.className = newTheme
    }

    return (
        <header className="header">
            <div className="header-content">
                <div className="logo">
                    <div className="logo-icon">🧠</div>
                    <div className="logo-text">
                        <h1>SovereignMind</h1>
                        <p>Your Portable AI Tutor</p>
                    </div>
                </div>

                <nav className="nav">
                    <Link to="/" className={`nav-item ${location.pathname === '/' ? 'active' : ''}`}>
                        🏠 Dashboard
                    </Link>
                    <Link to="/chat" className={`nav-item ${location.pathname === '/chat' ? 'active' : ''}`}>
                        💬 Chat
                    </Link>
                    <Link to="/progress" className={`nav-item ${location.pathname === '/progress' ? 'active' : ''}`}>
                        📊 Progress
                    </Link>
                </nav>

                <div className="header-actions">
                    {wallet ? (
                        <div className="wallet-badge">
                            <span className="dot"></span>
                            {wallet.slice(0, 4)}...{wallet.slice(-4)}
                        </div>
                    ) : (
                        <button className="connect-btn" onClick={onConnect}>
                            ⚡ Connect Wallet
                        </button>
                    )}
                    <button className="theme-btn" onClick={toggleTheme}>
                        {theme === 'dark' ? '☀️' : '🌙'}
                    </button>
                </div>
            </div>
        </header>
    )
}

function App() {
    const [walletAddress, setWalletAddress] = useState(null)

    // Simulate Wallet Connection
    const connectWallet = () => {
        // In Phase 2, this will be real Phantom/Metamask code
        const mockAddress = '0x71C9...89A2'
        setWalletAddress(mockAddress)
        alert("✅ Wallet Connected! Welcome, Sovereign Citizen.")
    }

    return (
        <Router>
            <div className="app dark">
                <Header wallet={walletAddress} onConnect={connectWallet} />
                <div className="container">
                    <Routes>
                        <Route path="/" element={<Dashboard wallet={walletAddress} />} />
                        <Route path="/chat" element={<Chat />} />
                        <Route path="/progress" element={<Progress />} />
                        <Route path="/settings" element={<Settings />} />
                        <Route path="/subject/:id" element={<SubjectView />} />
                    </Routes>
                </div>
            </div>
        </Router>
    )
}

export default App
