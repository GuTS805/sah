// Initialize the app
let geminiAPI;
let currentSubject = 'mathematics';
let conversationHistory = [];
let learningProgress = {};
let achievements = [];
let notes = [];
let studyStartTime = Date.now();
let totalStudyTime = 0;

// DOM Elements
const chatMessages = document.getElementById('chatMessages');
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');
const clearChatBtn = document.getElementById('clearChat');
const subjectCards = document.querySelectorAll('.subject-card');
const promptButtons = document.querySelectorAll('.prompt-btn');

// Stats elements
const totalQuestionsEl = document.getElementById('totalQuestions');
const topicsMasteredEl = document.getElementById('topicsMastered');
const learningStreakEl = document.getElementById('learningStreak');
const studyTimeEl = document.getElementById('studyTime');
const achievementCountEl = document.getElementById('achievementCount');
const achievementsListEl = document.getElementById('achievementsList');
const currentSubjectEl = document.getElementById('currentSubject');

// Buttons
const themeToggleBtn = document.getElementById('themeToggle');
const exportDataBtn = document.getElementById('exportData');
const importDataBtn = document.getElementById('importData');
const settingsBtn = document.getElementById('settingsBtn');
const saveSettingsBtn = document.getElementById('saveSettings');
const startQuizBtn = document.getElementById('startQuiz');
const viewNotesBtn = document.getElementById('viewNotes');
const viewProgressBtn = document.getElementById('viewProgress');
const saveConversationBtn = document.getElementById('saveConversation');
const attachNoteBtn = document.getElementById('attachNote');

// Initialize app on load
document.addEventListener('DOMContentLoaded', () => {
    geminiAPI = new GeminiAPI();
    loadAppData();
    setupEventListeners();
    updateAllStats();
    startStudyTimer();

    // Load theme preference
    const savedTheme = localStorage.getItem('theme') || 'dark';
    if (savedTheme === 'light') {
        document.body.classList.add('light-theme');
        document.querySelector('.theme-icon').textContent = '☀️';
    }
});

// Event Listeners
function setupEventListeners() {
    // Message sending
    sendButton.addEventListener('click', handleSendMessage);
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    });

    // Auto-resize textarea
    messageInput.addEventListener('input', () => {
        messageInput.style.height = 'auto';
        messageInput.style.height = messageInput.scrollHeight + 'px';
    });

    // Subject selection
    subjectCards.forEach(card => {
        card.addEventListener('click', () => {
            subjectCards.forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            currentSubject = card.dataset.subject;
            currentSubjectEl.textContent = card.querySelector('.subject-name').textContent + ' Mode';
            addSystemMessage(`Switched to ${card.querySelector('.subject-name').textContent} tutoring mode! 📚`);
        });
    });

    // Quick prompts
    promptButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const prompt = btn.dataset.prompt;
            messageInput.value = prompt;
            handleSendMessage();
        });
    });

    // Header actions
    themeToggleBtn.addEventListener('click', toggleTheme);
    exportDataBtn.addEventListener('click', exportData);
    importDataBtn.addEventListener('click', () => document.getElementById('importFileInput').click());
    document.getElementById('importFileInput').addEventListener('change', importData);
    settingsBtn.addEventListener('click', () => openModal('settingsModal'));
    saveSettingsBtn.addEventListener('click', saveSettings);

    // Quick actions
    startQuizBtn.addEventListener('click', startQuiz);
    viewNotesBtn.addEventListener('click', () => openModal('notesModal'));
    viewProgressBtn.addEventListener('click', showProgressReport);

    // Chat actions
    clearChatBtn.addEventListener('click', handleClearChat);
    saveConversationBtn.addEventListener('click', saveConversation);
    attachNoteBtn.addEventListener('click', () => {
        const lastMessage = conversationHistory[conversationHistory.length - 1];
        if (lastMessage) {
            saveNote(lastMessage.content);
        }
    });
}

// Message Handling
async function handleSendMessage() {
    const message = messageInput.value.trim();

    if (!message) return;

    // Clear input
    messageInput.value = '';
    messageInput.style.height = 'auto';

    // Remove welcome message if present
    const welcomeMsg = document.querySelector('.welcome-message');
    if (welcomeMsg) {
        welcomeMsg.remove();
    }

    // Add user message
    addMessage(message, 'user');

    // Show typing indicator
    const typingIndicator = showTypingIndicator();

    // Disable send button
    sendButton.disabled = true;

    try {
        // Simulate AI response for now (since API might not work)
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Remove typing indicator
        typingIndicator.remove();

        // Generate mock response
        const response = generateMockResponse(message, currentSubject);

        // Add AI response
        addMessage(response, 'ai');

        // Update conversation history
        conversationHistory.push({
            role: 'user',
            content: message,
            timestamp: new Date().toISOString(),
            subject: currentSubject
        });
        conversationHistory.push({
            role: 'ai',
            content: response,
            timestamp: new Date().toISOString(),
            subject: currentSubject
        });

        // Update progress
        updateLearningProgress(currentSubject);
        checkForAchievements();
        saveAppData();
        updateAllStats();

    } catch (error) {
        typingIndicator.remove();
        addSystemMessage(`❌ Error: ${error.message}`);
        console.error('Error:', error);
    }

    // Re-enable send button
    sendButton.disabled = false;
    messageInput.focus();
}

// Mock AI Response (for demo purposes)
function generateMockResponse(question, subject) {
    const responses = {
        mathematics: [
            "Great question! Let me explain this step by step...",
            "In mathematics, this concept is fundamental. Here's how it works...",
            "Let's break this down into simpler parts..."
        ],
        science: [
            "That's a fascinating scientific question! Let me explain...",
            "From a scientific perspective, this involves several key concepts...",
            "Great observation! The science behind this is quite interesting..."
        ],
        programming: [
            "Good question! In programming, we approach this by...",
            "Let me show you how to solve this with code...",
            "This is a common programming challenge. Here's the solution..."
        ],
        language: [
            "Excellent question about language! Let me clarify...",
            "In this language context, the rule is...",
            "That's a great example to learn from..."
        ],
        history: [
            "That's an important historical event! Let me provide context...",
            "From a historical perspective, this period was significant because...",
            "Great question about history! Here's what happened..."
        ],
        general: [
            "That's an interesting question! Let me help you understand...",
            "I'd be happy to explain this concept...",
            "Great question! Here's what you need to know..."
        ]
    };

    const subjectResponses = responses[subject] || responses.general;
    const randomResponse = subjectResponses[Math.floor(Math.random() * subjectResponses.length)];

    return `${randomResponse}\n\n${question.includes('?') ? 'To answer your question' : 'Regarding your query'}: This is a detailed explanation that would normally come from the AI. Since we're in demo mode, this is a placeholder response. The actual AI would provide comprehensive, subject-specific tutoring here.\n\nWould you like me to elaborate on any specific part?`;
}

function addMessage(text, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;

    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.textContent = type === 'user' ? '👤' : '🤖';

    const content = document.createElement('div');
    content.className = 'message-content';

    const messageText = document.createElement('div');
    messageText.className = 'message-text';
    messageText.textContent = text;

    const time = document.createElement('div');
    time.className = 'message-time';
    time.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    content.appendChild(messageText);
    content.appendChild(time);

    messageDiv.appendChild(avatar);
    messageDiv.appendChild(content);

    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function addSystemMessage(text) {
    const messageDiv = document.createElement('div');
    messageDiv.style.cssText = `
        text-align: center;
        padding: 12px;
        margin: 8px 0;
        background: var(--bg-tertiary);
        border-radius: var(--border-radius-sm);
        color: var(--text-secondary);
        font-size: 13px;
        border: 1px solid var(--border-color);
    `;
    messageDiv.textContent = text;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function showTypingIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'message ai';
    indicator.id = 'typing-indicator';

    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.textContent = '🤖';

    const content = document.createElement('div');
    content.className = 'message-content';
    content.innerHTML = '<div style="display: flex; gap: 4px; padding: 8px;"><div style="width: 8px; height: 8px; background: var(--primary); border-radius: 50%; animation: typingBounce 1.4s ease-in-out infinite;"></div><div style="width: 8px; height: 8px; background: var(--primary); border-radius: 50%; animation: typingBounce 1.4s ease-in-out 0.2s infinite;"></div><div style="width: 8px; height: 8px; background: var(--primary); border-radius: 50%; animation: typingBounce 1.4s ease-in-out 0.4s infinite;"></div></div>';

    indicator.appendChild(avatar);
    indicator.appendChild(content);

    chatMessages.appendChild(indicator);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    return indicator;
}

function handleClearChat() {
    if (confirm('Are you sure you want to clear the chat history?')) {
        location.reload();
    }
}

// Learning Progress
function updateLearningProgress(subject) {
    if (!learningProgress[subject]) {
        learningProgress[subject] = {
            messageCount: 0,
            topicsCovered: new Set(),
            lastActivity: new Date().toISOString(),
            progress: 0
        };
    }

    learningProgress[subject].messageCount += 1;
    learningProgress[subject].lastActivity = new Date().toISOString();
    learningProgress[subject].progress = Math.min((learningProgress[subject].messageCount / 20) * 100, 100);

    // Update subject card progress
    const subjectCard = document.querySelector(`[data-subject="${subject}"]`);
    if (subjectCard) {
        subjectCard.querySelector('.subject-progress').textContent = Math.round(learningProgress[subject].progress) + '%';
    }
}

function checkForAchievements() {
    const totalMessages = conversationHistory.filter(m => m.role === 'user').length;

    const milestones = [
        { count: 1, title: 'First Steps', desc: 'Asked your first question', icon: '🎯' },
        { count: 5, title: 'Curious Learner', desc: 'Asked 5 questions', icon: '🔍' },
        { count: 10, title: 'Knowledge Seeker', desc: 'Asked 10 questions', icon: '📚' },
        { count: 25, title: 'Dedicated Student', desc: 'Asked 25 questions', icon: '⭐' },
        { count: 50, title: 'Learning Master', desc: 'Asked 50 questions', icon: '🏆' },
        { count: 100, title: 'Century Club', desc: 'Asked 100 questions', icon: '💯' },
    ];

    milestones.forEach(milestone => {
        if (totalMessages === milestone.count) {
            addAchievement(milestone);
        }
    });
}

function addAchievement(achievement) {
    if (achievements.some(a => a.title === achievement.title)) {
        return;
    }

    achievements.push({
        ...achievement,
        unlockedAt: new Date().toISOString()
    });

    addSystemMessage(`🎉 Achievement Unlocked: ${achievement.title}!`);
    updateAchievementsDisplay();
    saveAppData();
}

function updateAchievementsDisplay() {
    if (achievements.length === 0) {
        achievementsListEl.innerHTML = '<div class="achievement-placeholder">Start learning to unlock! 🎯</div>';
        return;
    }

    achievementsListEl.innerHTML = achievements.slice(-3).reverse().map(achievement => `
        <div class="achievement-item">
            <div class="achievement-icon">${achievement.icon}</div>
            <div class="achievement-info">
                <div class="achievement-title">${achievement.title}</div>
                <div class="achievement-desc">${achievement.desc}</div>
            </div>
        </div>
    `).join('');
}

// Stats Update
function updateAllStats() {
    const totalMessages = conversationHistory.filter(m => m.role === 'user').length;
    const totalTopics = Object.keys(learningProgress).length;

    totalQuestionsEl.textContent = totalMessages;
    topicsMasteredEl.textContent = totalTopics;
    achievementCountEl.textContent = achievements.length;
    studyTimeEl.textContent = Math.floor(totalStudyTime / 60) + ' min';

    // Calculate streak
    const today = new Date().toDateString();
    const hasActivityToday = conversationHistory.some(m =>
        new Date(m.timestamp).toDateString() === today
    );
    learningStreakEl.textContent = hasActivityToday ? '1 day' : '0 days';
}

function startStudyTimer() {
    setInterval(() => {
        totalStudyTime = Math.floor((Date.now() - studyStartTime) / 1000);
        studyTimeEl.textContent = Math.floor(totalStudyTime / 60) + ' min';
    }, 60000); // Update every minute
}

// Theme Toggle
function toggleTheme() {
    document.body.classList.toggle('light-theme');
    const isLight = document.body.classList.contains('light-theme');
    document.querySelector('.theme-icon').textContent = isLight ? '☀️' : '🌙';
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
}

// Data Export/Import
function exportData() {
    const data = {
        conversationHistory,
        learningProgress: Object.fromEntries(
            Object.entries(learningProgress).map(([key, value]) => [
                key,
                {
                    ...value,
                    topicsCovered: Array.from(value.topicsCovered || [])
                }
            ])
        ),
        achievements,
        notes,
        totalStudyTime,
        exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sovereignmind-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    addSystemMessage('✅ Data exported successfully!');
}

function importData(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = JSON.parse(e.target.result);
            conversationHistory = data.conversationHistory || [];
            achievements = data.achievements || [];
            notes = data.notes || [];
            totalStudyTime = data.totalStudyTime || 0;

            learningProgress = Object.fromEntries(
                Object.entries(data.learningProgress || {}).map(([key, value]) => [
                    key,
                    {
                        ...value,
                        topicsCovered: new Set(value.topicsCovered || [])
                    }
                ])
            );

            saveAppData();
            location.reload();
        } catch (error) {
            alert('Error importing data: ' + error.message);
        }
    };
    reader.readAsText(file);
}

// Settings
function saveSettings() {
    const apiKey = document.getElementById('apiKeyInput').value.trim();
    if (apiKey) {
        geminiAPI.saveApiKey(apiKey);
    }

    const responseStyle = document.getElementById('responseStyle').value;
    localStorage.setItem('responseStyle', responseStyle);

    const soundEffects = document.getElementById('soundEffects').checked;
    localStorage.setItem('soundEffects', soundEffects);

    closeModal('settingsModal');
    addSystemMessage('✅ Settings saved!');
}

// Notes
function saveNote(content) {
    const note = {
        id: Date.now(),
        content: content.substring(0, 200),
        subject: currentSubject,
        timestamp: new Date().toISOString()
    };

    notes.push(note);
    saveAppData();
    addSystemMessage('📝 Note saved!');
}

function showNotes() {
    const notesList = document.getElementById('notesList');

    if (notes.length === 0) {
        notesList.innerHTML = '<div class="empty-state"><span class="empty-icon">📝</span><p>No notes yet.</p></div>';
        return;
    }

    notesList.innerHTML = notes.reverse().map(note => `
        <div class="note-item">
            <div class="note-header">
                <span class="note-title">${note.subject}</span>
                <span class="note-date">${new Date(note.timestamp).toLocaleDateString()}</span>
            </div>
            <div class="note-content">${note.content}</div>
        </div>
    `).join('');
}

// Progress Report
function showProgressReport() {
    const report = document.getElementById('progressReport');

    const totalQuestions = conversationHistory.filter(m => m.role === 'user').length;
    const subjectsStudied = Object.keys(learningProgress).length;

    report.innerHTML = `
        <div style="padding: 20px;">
            <h3 style="margin-bottom: 20px; font-size: 24px;">📊 Your Learning Journey</h3>
            
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 24px;">
                <div style="background: var(--bg-tertiary); padding: 20px; border-radius: 12px;">
                    <div style="font-size: 32px; font-weight: 700; color: var(--primary);">${totalQuestions}</div>
                    <div style="color: var(--text-secondary); font-size: 14px;">Total Questions</div>
                </div>
                <div style="background: var(--bg-tertiary); padding: 20px; border-radius: 12px;">
                    <div style="font-size: 32px; font-weight: 700; color: var(--secondary);">${subjectsStudied}</div>
                    <div style="color: var(--text-secondary); font-size: 14px;">Subjects Studied</div>
                </div>
                <div style="background: var(--bg-tertiary); padding: 20px; border-radius: 12px;">
                    <div style="font-size: 32px; font-weight: 700; color: var(--success);">${achievements.length}</div>
                    <div style="color: var(--text-secondary); font-size: 14px;">Achievements</div>
                </div>
                <div style="background: var(--bg-tertiary); padding: 20px; border-radius: 12px;">
                    <div style="font-size: 32px; font-weight: 700; color: var(--warning);">${Math.floor(totalStudyTime / 60)}</div>
                    <div style="color: var(--text-secondary); font-size: 14px;">Minutes Studied</div>
                </div>
            </div>
            
            <h4 style="margin-bottom: 12px;">Subject Progress</h4>
            ${Object.entries(learningProgress).map(([subject, data]) => `
                <div style="margin-bottom: 16px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                        <span style="text-transform: capitalize;">${subject}</span>
                        <span style="color: var(--primary); font-weight: 600;">${Math.round(data.progress)}%</span>
                    </div>
                    <div style="height: 8px; background: var(--bg-tertiary); border-radius: 4px; overflow: hidden;">
                        <div style="height: 100%; width: ${data.progress}%; background: linear-gradient(90deg, var(--primary), var(--secondary)); transition: width 0.6s ease;"></div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;

    openModal('progressModal');
}

// Quiz System
function startQuiz() {
    addSystemMessage('🎯 Quiz feature coming soon! This will test your knowledge on the current subject.');
}

// Conversation Save
function saveConversation() {
    const conversation = conversationHistory.map(m =>
        `[${m.role.toUpperCase()}]: ${m.content}`
    ).join('\n\n');

    const blob = new Blob([conversation], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `conversation-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);

    addSystemMessage('💾 Conversation saved!');
}

// Modal Functions
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.remove('hidden');

    if (modalId === 'notesModal') {
        showNotes();
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.add('hidden');
}

// Data Persistence
function saveAppData() {
    const data = {
        conversationHistory,
        learningProgress: Object.fromEntries(
            Object.entries(learningProgress).map(([key, value]) => [
                key,
                {
                    ...value,
                    topicsCovered: Array.from(value.topicsCovered || [])
                }
            ])
        ),
        achievements,
        notes,
        totalStudyTime,
        lastSaved: new Date().toISOString()
    };

    localStorage.setItem('sovereignmind_v2_data', JSON.stringify(data));
}

function loadAppData() {
    const savedData = localStorage.getItem('sovereignmind_v2_data');

    if (savedData) {
        try {
            const data = JSON.parse(savedData);
            conversationHistory = data.conversationHistory || [];
            achievements = data.achievements || [];
            notes = data.notes || [];
            totalStudyTime = data.totalStudyTime || 0;

            learningProgress = Object.fromEntries(
                Object.entries(data.learningProgress || {}).map(([key, value]) => [
                    key,
                    {
                        ...value,
                        topicsCovered: new Set(value.topicsCovered || [])
                    }
                ])
            );

            // Restore chat messages
            if (conversationHistory.length > 0) {
                chatMessages.innerHTML = '';
                conversationHistory.forEach(msg => {
                    addMessage(msg.content, msg.role);
                });
            }

            updateAllStats();
            updateAchievementsDisplay();

            // Update subject progress
            Object.keys(learningProgress).forEach(subject => {
                const card = document.querySelector(`[data-subject="${subject}"]`);
                if (card) {
                    card.querySelector('.subject-progress').textContent =
                        Math.round(learningProgress[subject].progress) + '%';
                }
            });
        } catch (error) {
            console.error('Error loading saved data:', error);
        }
    }
}

// Auto-save every 30 seconds
setInterval(() => {
    if (conversationHistory.length > 0) {
        saveAppData();
    }
}, 30000);

// Add typing animation for better UX
const style = document.createElement('style');
style.textContent = `
    @keyframes typingBounce {
        0%, 60%, 100% { transform: translateY(0); }
        30% { transform: translateY(-8px); }
    }
`;
document.head.appendChild(style);
