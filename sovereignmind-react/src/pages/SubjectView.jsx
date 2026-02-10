import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import './SubjectView.css'

const SubjectView = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const [lessons, setLessons] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedLesson, setSelectedLesson] = useState(null)
    const [aiExplanation, setAiExplanation] = useState('')
    const [explaining, setExplaining] = useState(false)
    const [toast, setToast] = useState(null)

    // Capitalize subject for display
    const subjectName = id.charAt(0).toUpperCase() + id.slice(1)

    useEffect(() => {
        fetchLessons()
    }, [id])

    const fetchLessons = async () => {
        try {
            const res = await axios.get(`/api/lessons/${id}`)
            setLessons(res.data.lessons)
            setLoading(false)
        } catch (error) {
            console.error('Error fetching lessons:', error)
            setLoading(false)
        }
    }

    const startLesson = (lesson) => {
        setSelectedLesson(lesson)
        // Use static content immediately!
        setAiExplanation(lesson.content)
    }

    const askAI = async () => {
        if (!selectedLesson) return
        setExplaining(true)
        try {
            const res = await axios.post('/api/ai/chat', {
                message: `Explain ${selectedLesson.title} in more detail with examples.`,
                subject: id
            })
            // Append AI explanation
            setAiExplanation(prev => prev + '\n\n---\n\n🤖 **AI Tutor Extra:**\n' + res.data.response)
        } catch (error) {
            console.error('AI Error', error)
        } finally {
            setExplaining(false)
        }
    }

    const completeLesson = async () => {
        if (!selectedLesson) return

        try {
            const res = await axios.post('/api/lessons/complete', {
                subject: id,
                lessonId: selectedLesson.id
            })

            if (res.data.success) {
                // Refresh lessons to update status
                fetchLessons()

                // Close modal
                setSelectedLesson(null)
                setAiExplanation('')

                // Show achievement alert if any
                if (res.data.newAchievements.length > 0) {
                    setToast({
                        title: '🏆 Achievement Unlocked!',
                        message: res.data.newAchievements[0].title
                    })
                    setTimeout(() => setToast(null), 3500)
                }
            }
        } catch (error) {
            console.error('Error completing lesson:', error)
        }
    }

    if (loading) return <div className="loading">Loading curriculum...</div>

    return (
        <div className="subject-view">
            <div className="subject-header">
                <button className="back-btn" onClick={() => navigate('/')}>← Back</button>
                <h1>{subjectName} Curriculum</h1>
                <p>Master these topics to become a pro!</p>
            </div>

            <div className="lessons-grid">
                {lessons.map((lesson, index) => (
                    <div key={lesson.id} className={`lesson-card ${lesson.completed ? 'completed' : ''}`}>
                        <div className="lesson-number">{index + 1}</div>
                        <div className="lesson-info">
                            <h3>{lesson.title}</h3>
                            <p>{lesson.description}</p>
                            <div className="lesson-meta">
                                <span className="xp-badge">✨ {lesson.xp} XP</span>
                                {lesson.completed && <span className="status-badge">✅ Completed</span>}
                            </div>
                        </div>
                        <button
                            className="start-btn"
                            onClick={() => startLesson(lesson)}
                            disabled={lesson.completed}
                        >
                            {lesson.completed ? 'Review' : 'Start Lesson'}
                        </button>
                    </div>
                ))}
            </div>

            {selectedLesson && (
                <div className="lesson-modal-overlay">
                    <div className="lesson-modal">
                        <div className="modal-header">
                            <h2>{selectedLesson.title}</h2>
                            <button className="close-btn" onClick={() => setSelectedLesson(null)}>×</button>
                        </div>
                        <div className="modal-content">
                            <div className="lesson-text">
                                {aiExplanation.split('\n').map((line, i) => {
                                    if (line.trim().startsWith('###')) {
                                        return <h3 key={i}>{line.replace('###', '')}</h3>
                                    }
                                    if (line.trim().startsWith('**')) {
                                        return <p key={i}><strong>{line.replace(/\*\*/g, '')}</strong></p>
                                    }
                                    return <p key={i}>{line}</p>
                                })}
                            </div>

                            {explaining && <div className="ai-loading">
                                <div className="spinner"></div>
                                <p>🤖 AI Tutor is elaborating...</p>
                            </div>}

                            {!explaining && (
                                <button className="ask-ai-btn" onClick={askAI}>
                                    ✨ Ask AI to Explain More
                                </button>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button className="complete-btn" onClick={completeLesson} disabled={explaining}>
                                ✅ Complete Lesson & Collect XP
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default SubjectView
