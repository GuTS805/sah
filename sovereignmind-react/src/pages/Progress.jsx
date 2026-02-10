import { useState, useEffect } from 'react'
import axios from 'axios'
import './Progress.css'

const Progress = () => {
    const [profile, setProfile] = useState({
        stats: { xp: 0, level: 1, streak: 1, lessonsCompleted: 0 },
        achievements: []
    })
    const [lessons, setLessons] = useState({})
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            const profileRes = await axios.get('/api/user/profile')
            setProfile(profileRes.data)

            // Fetch all subjects' lessons
            const subjects = ['mathematics', 'science', 'programming', 'history', 'language', 'general']
            const lessonsData = {}

            for (const subject of subjects) {
                const res = await axios.get(`/api/lessons/${subject}`)
                lessonsData[subject] = res.data.lessons
            }

            setLessons(lessonsData)
            setLoading(false)
        } catch (error) {
            console.error('Error fetching progress:', error)
            setLoading(false)
        }
    }

    // Calculate subject progress
    const subjectProgress = Object.entries(lessons).map(([subject, subjectLessons]) => {
        const completed = subjectLessons.filter(l => l.completed).length
        const total = subjectLessons.length
        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0

        const subjectMeta = {
            mathematics: { emoji: '📐', color: '#14b8a6', name: 'Mathematics' },
            science: { emoji: '🔬', color: '#06b6d4', name: 'Science' },
            programming: { emoji: '💻', color: '#10b981', name: 'Programming' },
            history: { emoji: '🏛️', color: '#0d9488', name: 'History' },
            language: { emoji: '📚', color: '#f59e0b', name: 'Language' },
            general: { emoji: '🌟', color: '#5eead4', name: 'General' }
        }

        return {
            subject,
            ...subjectMeta[subject],
            completed,
            total,
            percentage
        }
    })

    // Mock XP History (last 7 days)
    const xpHistory = [
        { day: 'Mon', xp: Math.max(0, profile.stats.xp - 600) },
        { day: 'Tue', xp: Math.max(0, profile.stats.xp - 500) },
        { day: 'Wed', xp: Math.max(0, profile.stats.xp - 350) },
        { day: 'Thu', xp: Math.max(0, profile.stats.xp - 200) },
        { day: 'Fri', xp: Math.max(0, profile.stats.xp - 100) },
        { day: 'Sat', xp: Math.max(0, profile.stats.xp - 50) },
        { day: 'Sun', xp: profile.stats.xp }
    ]

    const maxXp = Math.max(...xpHistory.map(d => d.xp), 100)

    if (loading) return <div className="progress-page loading">Loading your progress...</div>

    return (
        <div className="progress-page">
            <div className="progress-header">
                <h1>📊 Progress & Analytics</h1>
                <p>Track your learning journey and achievements</p>
            </div>

            {/* Stats Overview */}
            <div className="stats-overview">
                <div className="stat-item">
                    <div className="stat-icon" style={{ background: '#14b8a6' }}>📈</div>
                    <div className="stat-details">
                        <span className="stat-value">{profile.stats.xp}</span>
                        <span className="stat-label">Total XP Earned</span>
                    </div>
                </div>
                <div className="stat-item">
                    <div className="stat-icon" style={{ background: '#06b6d4' }}>🎯</div>
                    <div className="stat-details">
                        <span className="stat-value">{profile.stats.lessonsCompleted}</span>
                        <span className="stat-label">Lessons Completed</span>
                    </div>
                </div>
                <div className="stat-item">
                    <div className="stat-icon" style={{ background: '#10b981' }}>🔥</div>
                    <div className="stat-details">
                        <span className="stat-value">{profile.stats.streak}</span>
                        <span className="stat-label">Day Streak</span>
                    </div>
                </div>
                <div className="stat-item">
                    <div className="stat-icon" style={{ background: '#f59e0b' }}>🏆</div>
                    <div className="stat-details">
                        <span className="stat-value">{profile.achievements.filter(a => a.unlocked).length}</span>
                        <span className="stat-label">Achievements</span>
                    </div>
                </div>
            </div>

            {/* XP Growth Chart */}
            <div className="chart-card">
                <h2>🚀 XP Growth (Last 7 Days)</h2>
                <div className="chart">
                    {xpHistory.map((day, i) => (
                        <div key={i} className="chart-bar">
                            <div
                                className="bar"
                                style={{
                                    height: `${(day.xp / maxXp) * 100}%`,
                                    background: 'linear-gradient(to top, #6366f1, #8b5cf6)'
                                }}
                            >
                                <span className="bar-value">{day.xp}</span>
                            </div>
                            <span className="bar-label">{day.day}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Subject Breakdown */}
            <div className="subject-breakdown">
                <h2>📚 Subject Progress</h2>
                <div className="subjects-list">
                    {subjectProgress.map((subject) => (
                        <div key={subject.subject} className="subject-progress-item">
                            <div className="subject-header">
                                <span className="subject-emoji">{subject.emoji}</span>
                                <div className="subject-info">
                                    <h3>{subject.name}</h3>
                                    <p>{subject.completed} / {subject.total} lessons</p>
                                </div>
                                <span className="subject-percentage">{subject.percentage}%</span>
                            </div>
                            <div className="progress-bar">
                                <div
                                    className="progress-fill"
                                    style={{
                                        width: `${subject.percentage}%`,
                                        background: subject.color
                                    }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Achievement Timeline */}
            <div className="achievement-timeline">
                <h2>🏆 Achievement Timeline</h2>
                {profile.achievements.filter(a => a.unlocked).length > 0 ? (
                    <div className="timeline">
                        {profile.achievements.filter(a => a.unlocked).map((ach, index) => (
                            <div key={ach.id} className="timeline-item">
                                <div className="timeline-dot" />
                                <div className="timeline-content">
                                    <span className="timeline-icon">{ach.icon}</span>
                                    <div className="timeline-info">
                                        <h3>{ach.title}</h3>
                                        <p>{ach.description}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="empty-timeline">
                        <div className="empty-icon">🔒</div>
                        <p>Complete lessons to unlock achievements!</p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Progress
