import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import './Dashboard.css'

const Dashboard = ({ wallet }) => {
    const navigate = useNavigate()
    const [profile, setProfile] = useState({
        stats: {
            xp: 0,
            level: 1,
            streak: 1,
            lessonsCompleted: 0
        },
        achievements: []
    })

    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await axios.get('/api/user/profile')
                setProfile(res.data)
                setLoading(false)
            } catch (error) {
                console.error('Error fetching profile:', error)
                setLoading(false)
            }
        }
        fetchProfile()
    }, [])

    // MOCK: 10 XP = 1 $MIND Token
    const tokenBalance = Math.floor(profile.stats.xp / 10)

    const statCards = [
        { icon: '🪙', label: '$MIND Tokens', value: wallet ? tokenBalance : 'LOCKED', color: '#f59e0b' },
        { icon: '✨', label: 'Total XP', value: profile.stats.xp, color: '#14b8a6' },
        { icon: '🆙', label: 'Level', value: profile.stats.level, color: '#06b6d4' },
        { icon: '🔥', label: 'Streak', value: `${profile.stats.streak} day`, color: '#10b981' },
    ]

    const subjects = [
        { id: 'mathematics', name: 'Mathematics', emoji: '📐', color: '#14b8a6' },
        { id: 'science', name: 'Science', emoji: '🔬', color: '#06b6d4' },
        { id: 'programming', name: 'Programming', emoji: '💻', color: '#10b981' },
        { id: 'language', name: 'Language', emoji: '📚', color: '#f59e0b' },
        { id: 'history', name: 'History', emoji: '🏛️', color: '#0d9488' },
        { id: 'general', name: 'General', emoji: '🌟', color: '#5eead4' },
    ]

    // Filter only unlocked achievements for display
    const unlockedAchievements = profile.achievements.filter(a => a.unlocked)

    return (
        <div className="dashboard">
            <div className="dashboard-header">
                <div>
                    <h1>{wallet ? 'Welcome, Sovereign Citizen' : 'Welcome, Guest'} 👋</h1>
                    <p>{wallet ? 'Your neural link is active. Ready to earn knowledge?' : 'Connect your wallet to start earning $MIND tokens.'}</p>
                </div>
                <button className="btn btn-primary" onClick={() => navigate('/chat')}>
                    Open AI Tutor →
                </button>
            </div>

            <div className="next-goal-card">
                <div className="goal-icon">🎯</div>
                <div className="goal-info">
                    <h3>Today's Mission</h3>
                    <p>Complete <strong>Introduction to Algebra</strong> to earn <strong>10 $MIND</strong>.</p>
                </div>
                <button className="goal-btn" onClick={() => navigate('/subject/mathematics')}>Start</button>
            </div>

            <div className="stats-grid">
                {statCards.map((stat, index) => (
                    <div key={index} className="stat-card">
                        <div className="stat-icon" style={{ background: stat.color }}>
                            {stat.icon}
                        </div>
                        <div className="stat-info">
                            <span className="stat-label">{stat.label}</span>
                            <span className="stat-value">{stat.value}</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="dashboard-content">
                <section className="subjects-section">
                    <h2>Your Curriculum</h2>
                    <div className="subjects-grid">
                        {subjects.map((subject) => (
                            <div
                                key={subject.id}
                                className="subject-card"
                                onClick={() => navigate(`/subject/${subject.id}`)}
                            >
                                <div className="subject-emoji">{subject.emoji}</div>
                                <div className="subject-name">{subject.name}</div>
                                <div className="subject-accent" style={{ background: subject.color }} />
                            </div>
                        ))}
                    </div>
                </section>

                <section className="achievements-section">
                    <h2>Achievements 🏆</h2>

                    {loading ? (
                        <div className="empty-state">Loading achievements...</div>
                    ) : unlockedAchievements.length > 0 ? (
                        <div className="achievements-list">
                            {unlockedAchievements.map(ach => (
                                <div key={ach.id} className="achievement-item">
                                    <div className="achievement-icon">{ach.icon}</div>
                                    <div className="achievement-info">
                                        <h3>{ach.title}</h3>
                                        <p>{ach.description}</p>
                                    </div>
                                </div>
                            ))}
                            <div className="achievement-count">
                                +{profile.achievements.length - unlockedAchievements.length} locked
                            </div>
                        </div>
                    ) : (
                        <div className="empty-state">
                            <div style={{ fontSize: '48px' }}>🔒</div>
                            <p>Complete lessons to unlock badges!</p>
                        </div>
                    )}
                </section>
            </div>
        </div >
    )
}

export default Dashboard
