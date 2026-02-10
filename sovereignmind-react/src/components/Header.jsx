import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
    Home,
    MessageSquare,
    TrendingUp,
    Settings,
    Moon,
    Sun,
    Download,
    Upload
} from 'lucide-react'
import { useStore } from '../store/useStore'
import './Header.css'

const Header = () => {
    const location = useLocation()
    const { theme, toggleTheme, exportData } = useStore()

    const handleExport = () => {
        const data = exportData()
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `sovereignmind-backup-${new Date().toISOString().split('T')[0]}.json`
        a.click()
        URL.revokeObjectURL(url)
    }

    const handleImport = (e) => {
        const file = e.target.files[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result)
                useStore.getState().importData(data)
                alert('✅ Data imported successfully!')
                window.location.reload()
            } catch (error) {
                alert('❌ Error importing data: ' + error.message)
            }
        }
        reader.readAsText(file)
    }

    const navItems = [
        { path: '/', icon: Home, label: 'Dashboard' },
        { path: '/chat', icon: MessageSquare, label: 'Chat' },
        { path: '/progress', icon: TrendingUp, label: 'Progress' },
        { path: '/settings', icon: Settings, label: 'Settings' },
    ]

    return (
        <motion.header
            className="header"
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
        >
            <div className="header-content">
                <div className="logo">
                    <motion.div
                        className="logo-icon"
                        animate={{
                            y: [0, -10, 0],
                        }}
                        transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: 'easeInOut'
                        }}
                    >
                        🧠
                    </motion.div>
                    <div className="logo-text">
                        <h1>SovereignMind</h1>
                        <p>Your Portable AI Tutor</p>
                    </div>
                </div>

                <nav className="nav">
                    {navItems.map((item) => {
                        const Icon = item.icon
                        const isActive = location.pathname === item.path

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`nav-item ${isActive ? 'active' : ''}`}
                            >
                                <Icon size={20} />
                                <span>{item.label}</span>
                                {isActive && (
                                    <motion.div
                                        className="active-indicator"
                                        layoutId="activeNav"
                                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                    />
                                )}
                            </Link>
                        )
                    })}
                </nav>

                <div className="header-actions">
                    <button
                        className="icon-btn"
                        onClick={handleExport}
                        title="Export Data"
                    >
                        <Download size={20} />
                    </button>

                    <label className="icon-btn" title="Import Data">
                        <Upload size={20} />
                        <input
                            type="file"
                            accept=".json"
                            onChange={handleImport}
                            style={{ display: 'none' }}
                        />
                    </label>

                    <button
                        className="icon-btn"
                        onClick={toggleTheme}
                        title="Toggle Theme"
                    >
                        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                    </button>
                </div>
            </div>
        </motion.header>
    )
}

export default Header
