import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import './Chat.css'

const Chat = () => {
    const [messages, setMessages] = useState([])
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)
    const [subject, setSubject] = useState('mathematics')
    const messagesEndRef = useRef(null)

    const subjects = [
        { id: 'mathematics', name: 'Mathematics', emoji: '📐' },
        { id: 'science', name: 'Science', emoji: '🔬' },
        { id: 'programming', name: 'Programming', emoji: '💻' },
        { id: 'language', name: 'Language', emoji: '📚' },
        { id: 'history', name: 'History', emoji: '🏛️' },
        { id: 'general', name: 'General', emoji: '🌟' },
    ]

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const sendMessage = async (e) => {
        e.preventDefault()
        if (!input.trim() || loading) return

        const userMessage = {
            role: 'user',
            content: input,
            timestamp: new Date().toISOString()
        }

        setMessages(prev => [...prev, userMessage])
        setInput('')
        setLoading(true)

        try {
            const response = await axios.post('/api/ai/chat', {
                message: input,
                subject: subject
            })

            const aiMessage = {
                role: 'ai',
                content: response.data.response,
                timestamp: new Date().toISOString(),
                agentAction: response.data.agent_action,
                toolUsed: response.data.tool_used
            }

            setMessages(prev => [...prev, aiMessage])
        } catch (error) {
            console.error('Error:', error)
            const errorMessage = {
                role: 'system',
                content: '❌ Error: ' + (error.response?.data?.error || error.message),
                timestamp: new Date().toISOString()
            }
            setMessages(prev => [...prev, errorMessage])
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="chat-page">
            <div className="chat-sidebar">
                <h3>📖 Subjects</h3>
                <div className="subject-list">
                    {subjects.map(sub => (
                        <button
                            key={sub.id}
                            className={`subject-btn ${subject === sub.id ? 'active' : ''}`}
                            onClick={() => setSubject(sub.id)}
                        >
                            <span className="subject-emoji">{sub.emoji}</span>
                            <span className="subject-name">{sub.name}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="chat-main">
                <div className="chat-header">
                    <div className="tutor-info">
                        <div className="tutor-avatar">🤖</div>
                        <div>
                            <h2>AI Tutor</h2>
                            <p className="tutor-status">
                                <span className="status-dot"></span>
                                {subjects.find(s => s.id === subject)?.name} Mode
                            </p>
                        </div>
                    </div>
                </div>

                <div className="chat-messages">
                    {messages.length === 0 && (
                        <div className="welcome-message">
                            <div className="welcome-icon">👋</div>
                            <h2>Welcome to SovereignMind!</h2>
                            <p>Ask me anything about {subjects.find(s => s.id === subject)?.name.toLowerCase()}!</p>
                        </div>
                    )}

                    {messages.map((msg, index) => (
                        <div key={index} className={`message ${msg.role}`}>
                            <div className="message-avatar">
                                {msg.role === 'user' ? '👤' : msg.role === 'ai' ? '🤖' : '⚠️'}
                            </div>
                            <div className="message-content">
                                {msg.toolUsed && (
                                    <div className="agent-badge">
                                        🛠️ Agent Tool: {msg.toolUsed}
                                    </div>
                                )}
                                <div className="message-text">{msg.content}</div>
                                <div className="message-time">
                                    {new Date(msg.timestamp).toLocaleTimeString([], {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </div>
                            </div>
                        </div>
                    ))}

                    {loading && (
                        <div className="message ai">
                            <div className="message-avatar">🤖</div>
                            <div className="message-content">
                                <div className="typing-indicator">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                <form className="chat-input" onSubmit={sendMessage}>
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask your tutor anything..."
                        disabled={loading}
                    />
                    <button type="submit" disabled={loading || !input.trim()}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                </form>
            </div>
        </div>
    )
}

export default Chat
