// Initialize the app
let geminiAPI;
let currentSubject = 'mathematics';
let conversationHistory = [];
let learningProgress = {};
let achievements = [];

// DOM Elements
const apiKeyModal = document.getElementById('apiKeyModal');
const apiKeyInput = document.getElementById('apiKeyInput');
const saveApiKeyBtn = document.getElementById('saveApiKey');
const chatMessages = document.getElementById('chatMessages');
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');
const clearChatBtn = document.getElementById('clearChat');
const subjectButtons = document.querySelectorAll('.subject-btn');
const quickActionButtons = document.querySelectorAll('.quick-action-btn');

// Stats elements
const topicCountEl = document.getElementById('topicCount');
const messageCountEl = document.getElementById('messageCount');
const streakCountEl = document.getElementById('streakCount');
const progressListEl = document.getElementById('progressList');
const achievementsListEl = document.getElementById('achievementsList');

// Initialize app on load
document.addEventListener('DOMContentLoaded', () => {
    geminiAPI = new GeminiAPI();

    // Check if API key exists
    if (!geminiAPI.hasApiKey()) {
        showApiKeyModal();
    } else {
        hideApiKeyModal();
        loadAppData();
    }

    setupEventListeners();
    updateStats();
});

// Event Listeners
function setupEventListeners() {
    // API Key setup
    saveApiKeyBtn.addEventListener('click', handleSaveApiKey);
    apiKeyInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSaveApiKey();
        }
    });

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
    subjectButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            subjectButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentSubject = btn.dataset.subject;

            // Add a system message
            addSystemMessage(`Switched to ${btn.textContent.trim()} tutoring mode! 📚`);
        });
    });

    // Quick actions
    quickActionButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const prompt = btn.dataset.prompt;
            messageInput.value = prompt;
            handleSendMessage();
        });
    });

    // Clear chat
    clearChatBtn.addEventListener('click', handleClearChat);
}

// API Key Management
function showApiKeyModal() {
    apiKeyModal.classList.remove('hidden');
    // Pre-fill with current API key if available
    if (geminiAPI && geminiAPI.apiKey) {
        apiKeyInput.value = geminiAPI.apiKey;
    }
}

function hideApiKeyModal() {
    apiKeyModal.classList.add('hidden');
}

async function handleSaveApiKey() {
    const apiKey = apiKeyInput.value.trim();

    if (!apiKey) {
        alert('Please enter your API key');
        return;
    }

    // Save and test the API key
    saveApiKeyBtn.textContent = 'Testing connection...';
    saveApiKeyBtn.disabled = true;

    geminiAPI.saveApiKey(apiKey);

    const testResult = await geminiAPI.testConnection();

    if (testResult.success) {
        hideApiKeyModal();
        loadAppData();
        addSystemMessage('✅ Connected successfully! Ready to help you learn.');
    } else {
        alert(`Connection failed: ${testResult.error}\n\nPlease check your API key and try again.`);
        geminiAPI.saveApiKey(''); // Clear invalid key
    }

    saveApiKeyBtn.textContent = 'Save & Start Learning';
    saveApiKeyBtn.disabled = false;
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
        // Get AI response
        const response = await geminiAPI.generateResponse(message, currentSubject);

        // Remove typing indicator
        typingIndicator.remove();

        // Add AI response
        addMessage(response, 'ai');

        // Update conversation history
        conversationHistory.push({
            role: 'user',
            content: message,
            timestamp: new Date().toISOString()
        });
        conversationHistory.push({
            role: 'ai',
            content: response,
            timestamp: new Date().toISOString()
        });

        // Update progress
        updateLearningProgress(currentSubject);
        checkForAchievements();
        saveAppData();
        updateStats();

    } catch (error) {
        typingIndicator.remove();
        addSystemMessage(`❌ Error: ${error.message}`);
        console.error('Error:', error);
    }

    // Re-enable send button
    sendButton.disabled = false;
    messageInput.focus();
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

    const typing = document.createElement('div');
    typing.className = 'typing-indicator';
    typing.innerHTML = '<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>';

    content.appendChild(typing);
    indicator.appendChild(avatar);
    indicator.appendChild(content);

    chatMessages.appendChild(indicator);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    return indicator;
}

function handleClearChat() {
    if (confirm('Are you sure you want to clear the chat history?')) {
        chatMessages.innerHTML = `
            <div class="welcome-message">
                <div class="welcome-icon">👋</div>
                <h2>Welcome to SovereignMind!</h2>
                <p>I'm your personal AI tutor. Ask me anything about the subjects you're learning.</p>
                <div class="quick-actions">
                    <button class="quick-action-btn" data-prompt="Explain the Pythagorean theorem">
                        📐 Pythagorean Theorem
                    </button>
                    <button class="quick-action-btn" data-prompt="How does photosynthesis work?">
                        🌱 Photosynthesis
                    </button>
                    <button class="quick-action-btn" data-prompt="Teach me about variables in Python">
                        🐍 Python Variables
                    </button>
                </div>
            </div>
        `;

        // Re-attach quick action listeners
        document.querySelectorAll('.quick-action-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const prompt = btn.dataset.prompt;
                messageInput.value = prompt;
                handleSendMessage();
            });
        });

        conversationHistory = [];
        saveAppData();
        updateStats();
    }
}

// Learning Progress
function updateLearningProgress(subject) {
    if (!learningProgress[subject]) {
        learningProgress[subject] = {
            messageCount: 0,
            topicsCovered: new Set(),
            lastActivity: new Date().toISOString()
        };
    }

    learningProgress[subject].messageCount += 1;
    learningProgress[subject].lastActivity = new Date().toISOString();

    // Simple topic extraction (could be improved with NLP)
    const lastUserMessage = conversationHistory.filter(m => m.role === 'user').pop();
    if (lastUserMessage) {
        const words = lastUserMessage.content.toLowerCase().split(' ');
        // Add significant words as topics
        words.filter(w => w.length > 5).forEach(w => {
            learningProgress[subject].topicsCovered.add(w);
        });
    }
}

function checkForAchievements() {
    const totalMessages = conversationHistory.filter(m => m.role === 'user').length;

    // Achievement milestones
    const milestones = [
        { count: 1, title: 'First Steps', desc: 'Asked your first question', icon: '🎯' },
        { count: 5, title: 'Curious Learner', desc: 'Asked 5 questions', icon: '🔍' },
        { count: 10, title: 'Knowledge Seeker', desc: 'Asked 10 questions', icon: '📚' },
        { count: 25, title: 'Dedicated Student', desc: 'Asked 25 questions', icon: '⭐' },
        { count: 50, title: 'Learning Master', desc: 'Asked 50 questions', icon: '🏆' },
    ];

    milestones.forEach(milestone => {
        if (totalMessages === milestone.count) {
            addAchievement(milestone);
        }
    });
}

function addAchievement(achievement) {
    // Check if already exists
    if (achievements.some(a => a.title === achievement.title)) {
        return;
    }

    achievements.push({
        ...achievement,
        unlockedAt: new Date().toISOString()
    });

    // Show notification
    addSystemMessage(`🎉 Achievement Unlocked: ${achievement.title}!`);

    updateAchievementsDisplay();
    saveAppData();
}

function updateAchievementsDisplay() {
    if (achievements.length === 0) {
        achievementsListEl.innerHTML = `
            <div class="achievement-placeholder">
                Start learning to unlock achievements! 🎯
            </div>
        `;
        return;
    }

    achievementsListEl.innerHTML = achievements.slice(-3).reverse().map(achievement => `
        <div class="achievement-badge">
            <div class="achievement-icon">${achievement.icon}</div>
            <div class="achievement-text">
                <div class="achievement-title">${achievement.title}</div>
                <div class="achievement-desc">${achievement.desc}</div>
            </div>
        </div>
    `).join('');
}

// Stats Update
function updateStats() {
    const totalMessages = conversationHistory.filter(m => m.role === 'user').length;
    const totalTopics = Object.values(learningProgress).reduce((sum, prog) => {
        return sum + (prog.topicsCovered ? prog.topicsCovered.size : 0);
    }, 0);

    // Calculate streak (simplified - just check if used today)
    const lastActivity = conversationHistory.length > 0
        ? new Date(conversationHistory[conversationHistory.length - 1].timestamp)
        : null;
    const today = new Date();
    const streak = lastActivity && lastActivity.toDateString() === today.toDateString() ? 1 : 0;

    messageCountEl.textContent = totalMessages;
    topicCountEl.textContent = totalTopics;
    streakCountEl.textContent = `${streak} day${streak !== 1 ? 's' : ''}`;

    updateProgressDisplay();
}

function updateProgressDisplay() {
    const subjects = ['mathematics', 'science', 'programming', 'language', 'history'];

    progressListEl.innerHTML = subjects.map(subject => {
        const progress = learningProgress[subject];
        const messageCount = progress ? progress.messageCount : 0;
        const percentage = Math.min((messageCount / 20) * 100, 100); // 20 messages = 100%

        return `
            <div class="progress-item">
                <span class="progress-topic">${subject.charAt(0).toUpperCase() + subject.slice(1)}</span>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${percentage}%"></div>
                </div>
                <span class="progress-percent">${Math.round(percentage)}%</span>
            </div>
        `;
    }).join('');
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
        lastSaved: new Date().toISOString()
    };

    localStorage.setItem('sovereignmind_data', JSON.stringify(data));
}

function loadAppData() {
    const savedData = localStorage.getItem('sovereignmind_data');

    if (savedData) {
        try {
            const data = JSON.parse(savedData);
            conversationHistory = data.conversationHistory || [];
            achievements = data.achievements || [];

            // Restore learning progress with Sets
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
                // Clear welcome message
                chatMessages.innerHTML = '';

                // Add messages
                conversationHistory.forEach(msg => {
                    addMessage(msg.content, msg.role);
                });
            }

            updateStats();
            updateAchievementsDisplay();
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
