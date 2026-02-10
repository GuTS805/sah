import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// AI Agent Tools/Functions
const agentTools = {
    // Tool 1: Search Wikipedia
    searchWikipedia: async (query) => {
        try {
            const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`;
            const response = await fetch(url);
            const data = await response.json();
            return data.extract || 'No information found.';
        } catch (error) {
            return 'Failed to search Wikipedia.';
        }
    },

    // Tool 2: Calculate Math
    calculate: (expression) => {
        try {
            // Safe eval for basic math
            const result = Function('"use strict"; return (' + expression + ')')();
            return `Result: ${result}`;
        } catch (error) {
            return 'Invalid mathematical expression.';
        }
    },

    // Tool 3: Get Current Time/Date
    getCurrentTime: () => {
        const now = new Date();
        return `Current date and time: ${now.toLocaleString()}`;
    },

    // Tool 4: Generate Quiz
    generateQuiz: (subject, difficulty = 'medium') => {
        const quizzes = {
            mathematics: [
                { q: 'What is 15 × 12?', a: '180' },
                { q: 'Solve: 2x + 5 = 15', a: 'x = 5' },
                { q: 'What is the area of a circle with radius 5?', a: '78.54' }
            ],
            science: [
                { q: 'What is the chemical symbol for water?', a: 'H2O' },
                { q: 'How many planets are in our solar system?', a: '8' },
                { q: 'What is the speed of light?', a: '299,792,458 m/s' }
            ]
        };
        const subjectQuizzes = quizzes[subject] || quizzes.mathematics;
        const randomQuiz = subjectQuizzes[Math.floor(Math.random() * subjectQuizzes.length)];
        return `Quiz Question: ${randomQuiz.q}\n(Answer: ${randomQuiz.a})`;
    },

    // Tool 5: Save Note
    saveNote: (content) => {
        // In production, save to database
        return `✅ Note saved: "${content.substring(0, 50)}..."`;
    },

    // Tool 6: Create Study Plan
    createStudyPlan: (subject, duration) => {
        return `📚 ${duration}-day study plan for ${subject}:
Day 1-2: Fundamentals and basics
Day 3-4: Core concepts and theory
Day 5-6: Practice problems
Day 7: Review and quiz`;
    }
};

// AI Agent Decision Making
async function aiAgentDecision(userMessage, subject) {
    const message = userMessage.toLowerCase();

    // Agent decides which tool to use based on user intent
    if (message.includes('search') || message.includes('look up') || message.includes('find information')) {
        const query = userMessage.replace(/search|look up|find information about/gi, '').trim();
        const result = await agentTools.searchWikipedia(query);
        return {
            action: 'search_wikipedia',
            tool_used: 'Wikipedia Search',
            result: result
        };
    }

    if (message.includes('calculate') || message.includes('solve')) {
        const expression = userMessage.replace(/calculate|solve|what is/gi, '').trim();
        // Only run if the remaining string looks like math (numbers, operators)
        if (/^[\d+\-*/().\s]+$/.test(expression)) {
            const result = agentTools.calculate(expression);
            return {
                action: 'calculate',
                tool_used: 'Calculator',
                result: result
            };
        }
    }

    if (message.includes('time') || message.includes('date') || message.includes('today')) {
        const result = agentTools.getCurrentTime();
        return {
            action: 'get_time',
            tool_used: 'Clock',
            result: result
        };
    }

    if (message.includes('quiz') || message.includes('test me')) {
        const result = agentTools.generateQuiz(subject);
        return {
            action: 'generate_quiz',
            tool_used: 'Quiz Generator',
            result: result
        };
    }

    if (message.includes('save note') || message.includes('remember this')) {
        const result = agentTools.saveNote(userMessage);
        return {
            action: 'save_note',
            tool_used: 'Note Saver',
            result: result
        };
    }

    if (message.includes('study plan') || message.includes('learning plan')) {
        const result = agentTools.createStudyPlan(subject, 7);
        return {
            action: 'create_plan',
            tool_used: 'Study Planner',
            result: result
        };
    }

    // No tool needed - use AI for conversation
    return null;
}

// Routes
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'SovereignMind AI Agent API is running',
        timestamp: new Date().toISOString(),
        agent_tools: Object.keys(agentTools)
    });
});

// AI Agent Chat endpoint
app.post('/api/ai/chat', async (req, res) => {
    try {
        const { message, subject } = req.body;

        // Step 1: Agent decides if it needs to use a tool
        const agentDecision = await aiAgentDecision(message, subject);

        if (agentDecision) {
            // Agent used a tool - return tool result
            res.json({
                success: true,
                response: `🤖 **AI Agent Action**\n\n**Tool Used:** ${agentDecision.tool_used}\n\n**Result:**\n${agentDecision.result}`,
                agent_action: agentDecision.action,
                tool_used: agentDecision.tool_used,
                timestamp: new Date().toISOString()
            });
        } else {
            // Step 2: No tool needed - use Gemini AI for conversation
            const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

            // Enhanced system prompts for AI Agent
            const systemPrompts = {
                mathematics: `You are an AI Agent tutor for mathematics. You can explain concepts step-by-step, solve problems, and help students learn. You also have special tools available: Wikipedia Search, Calculator, Quiz Generator, Study Planner, and Note Saver. Be helpful and mention these capabilities when relevant.`,
                science: `You are an AI Agent tutor for science. You can explain scientific concepts clearly and help students understand. You also have special tools: Wikipedia Search, Calculator, Quiz Generator, Study Planner, and Note Saver. Be engaging and mention your agent capabilities.`,
                programming: `You are an AI Agent tutor for programming. You can explain code concepts, help debug, and provide clear examples. You also have tools: Wikipedia Search, Calculator, Quiz Generator, Study Planner, and Note Saver. Provide clear code examples.`,
                general: `You are an AI Agent tutor. You have special capabilities:
- Search Wikipedia: Ask me to "search [topic]"
- Calculate: Ask me to "calculate [expression]"
- Quiz: Ask me to "quiz me"
- Study Plan: Ask me to "create study plan"
- Save Notes: Ask me to "save note [content]"
Be helpful and proactive about suggesting these tools!`
            };

            const systemPrompt = systemPrompts[subject] || systemPrompts.general;
            const fullPrompt = `${systemPrompt}\n\nStudent question: ${message}`;

            // Try multiple model endpoints until one works
            const models = [
                'models/gemini-2.5-flash',
                'models/gemini-2.5-flash-latest',
                'gemini-2.5-flash'
            ];

            let lastError = null;

            for (const model of models) {
                try {
                    const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1/${model}:generateContent?key=${GEMINI_API_KEY}`;

                    const response = await fetch(GEMINI_API_URL, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            contents: [{
                                parts: [{
                                    text: fullPrompt
                                }]
                            }],
                            generationConfig: {
                                temperature: 0.7,
                                maxOutputTokens: 1024,
                            }
                        })
                    });

                    if (response.ok) {
                        const data = await response.json();

                        if (data.candidates && data.candidates.length > 0) {
                            const aiResponse = data.candidates[0].content.parts[0].text;

                            return res.json({
                                success: true,
                                response: aiResponse,
                                agent_action: 'conversation',
                                tool_used: 'Gemini AI',
                                model_used: model,
                                timestamp: new Date().toISOString()
                            });
                        }
                    }

                    lastError = await response.text();
                } catch (error) {
                    lastError = error.message;
                    continue;
                }
            }

            // If all models failed, return a helpful error
            throw new Error(`All Gemini models failed. Last error: ${lastError}. Please check your API key.`);
        }

    } catch (error) {
        console.error('Error in AI Agent:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'AI Agent failed to process request'
        });
    }
});

// Get available agent tools
app.get('/api/agent/tools', (req, res) => {
    res.json({
        success: true,
        tools: [
            { name: 'Wikipedia Search', command: 'search [topic]', description: 'Search Wikipedia for information' },
            { name: 'Calculator', command: 'calculate [expression]', description: 'Perform mathematical calculations' },
            { name: 'Clock', command: 'what time is it', description: 'Get current date and time' },
            { name: 'Quiz Generator', command: 'quiz me', description: 'Generate practice questions' },
            { name: 'Note Saver', command: 'save note [content]', description: 'Save important information' },
            { name: 'Study Planner', command: 'create study plan', description: 'Generate a learning roadmap' }
        ]
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        error: 'AI Agent encountered an error!'
    });
});

// --- MOCK DATABASE ---

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_FILE = path.join(__dirname, 'db.json');

function loadData() {
    try {
        if (fs.existsSync(DB_FILE)) {
            return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
        }
    } catch (e) { console.error('Error loading data:', e); return null; }
    return null;
}

function saveData() {
    try {
        fs.writeFileSync(DB_FILE, JSON.stringify({ lessonsData, userAchievements, userStats }, null, 2));
    } catch (e) { console.error('Error saving data:', e); }
}

const savedData = loadData();

// 1. Lessons Data
let lessonsData = savedData?.lessonsData || {
    mathematics: [
        {
            id: 'm1',
            title: 'Introduction to Algebra',
            description: 'Variables, equations, and basic operations',
            completed: false,
            xp: 100,
            content: `**Algebra** is the branch of mathematics that uses letters (variables) to represent numbers.
            
### 1. Variables
A variable is a symbol (usually a letter like x or y) used to represent a number that we don't know yet.
Example: In x + 2 = 5, x is the variable.

### 2. Expressions
An expression is a combination of numbers, variables, and operators.
Example: 3x + 4 is an expression.

### 3. Equations
An equation says that two things are equal. It will have an equals sign "=" like this:
x + 2 = 6

To solve it, we do the opposite operation to isolate x:
x = 6 - 2
x = 4`,
            keyPoints: ['Use letters for unknown numbers', 'Perform inverse operations to solve', 'Keep equations balanced']
        },
        {
            id: 'm2',
            title: 'Geometry Basics',
            description: 'Points, lines, angles, and shapes',
            completed: false,
            xp: 100,
            content: `**Geometry** is all about shapes and their properties.

### 1. Basic Elements
- **Point:** A precise location in space.
- **Line:** Straight path extending in both directions forever.
- **Segment:** Part of a line with two endpoints.
- **Ray:** Starts at a point and goes on forever one way.

### 2. Angles
Measured in degrees (°).
- **Acute:** Less than 90°
- **Right:** Exactly 90°
- **Obtuse:** More than 90°
- **Straight:** Exactly 180°

### 3. Polygons
Closed shapes with straight sides:
- Triangle (3 sides)
- Quadrilateral (4 sides)
- Pentagon (5 sides)`,
            keyPoints: ['Points define location', 'Angles measure turn', 'Polygons are closed shapes']
        },
        {
            id: 'm3',
            title: 'Calculus I',
            description: 'Limits, derivatives, and integrals',
            completed: false,
            xp: 150,
            content: `**Calculus** is the study of continuous change.

### 1. Limits
What happens to a function as inputs get super close to a value?
lim(x→2) of x² is 4.

### 2. Derivatives (Rate of Change)
Tells you the slope of a curve at any single point.
If position is f(t), velocity is f'(t).

### 3. Integrals (Area Under Curve)
Adds up infinitely many small pieces to find a total amount.
Used to find areas, volumes, and totals.`,
            keyPoints: ['Change is constant', 'Derivatives = Slope', 'Integrals = Area']
        }
    ],
    science: [
        {
            id: 's1',
            title: 'The Scientific Method',
            description: 'Hypothesis, experiment, and analysis',
            completed: false,
            xp: 100,
            content: `The **Scientific Method** is a process for experimentation.

### Steps:
1. **Observation:** Notice something interesting.
2. **Question:** Ask "Why does that happen?"
3. **Hypothesis:** Make an educated guess (prediction).
4. **Experiment:** Test your hypothesis fairly.
5. **Analysis:** Look at the data.
6. **Conclusion:** Was your hypothesis right?

This cycle is how we discover truth about the universe!`,
            keyPoints: ['Observe and Question', 'Test with Experiments', 'Analyze Data']
        },
        {
            id: 's2',
            title: 'Physics: Motion',
            description: 'Velocity, acceleration, and Newton\'s laws',
            completed: false,
            xp: 120,
            content: `**Newton's Laws of Motion** govern how things move.

### 1. Law of Inertia
An object at rest stays at rest, and an object in motion stays in motion, unless acted on by a force.

### 2. F = ma
Force equals mass times acceleration.
Pushing a heavy truck is harder than pushing a bike!

### 3. Action-Reaction
For every action, there is an equal and opposite reaction.
Push a wall, and the wall pushes back on you.`,
            keyPoints: ['Inertia resists change', 'Force = Mass × Acceleration', 'Equal/Opposite reactions']
        },
        {
            id: 's3',
            title: 'Biology: Cells',
            description: 'Structure and function of living cells',
            completed: false,
            xp: 120,
            content: `**Cells** are the building blocks of life.

### 1. Cell Theory
- All living things are made of cells.
- Cells come from other cells.

### 2. Parts of a Cell
- **Nucleus:** The brain (holds DNA).
- **Mitochondria:** Powerhouse (makes energy).
- **Cell Membrane:** The skin (protects inside).
- **Cytoplasm:** Jelly-like filler.

### 3. Plant vs Animal
Plant cells have rigid **Cell Walls** and **Chloroplasts** for making food from sunlight!`,
            keyPoints: ['Basic unit of life', 'Organelles do specific jobs', 'Plants have cell walls']
        }
    ],
    programming: [
        {
            id: 'p1',
            title: 'Python Basics',
            description: 'Variables, loops, and functions',
            completed: false,
            xp: 100,
            content: `**Python** is a powerful and readable language.

### 1. Variables
Storage boxes for data.
\`\`\`python
name = "Alice"
age = 25
\`\`\`

### 2. Loops
Repeat code automatically.
\`\`\`python
# Prints 0 to 4
for i in range(5):
    print(i)
\`\`\`

### 3. Functions
Reusable blocks of code.
\`\`\`python
def greet(name):
    return "Hello " + name

print(greet("Bob"))
\`\`\``,
            keyPoints: ['Readable syntax', 'Variables store data', 'Loops repeat actions']
        },
        {
            id: 'p2',
            title: 'Web Development',
            description: 'HTML, CSS, and JavaScript Fundamentals',
            completed: false,
            xp: 150,
            content: `**Web Development** builds the internet!

### 1. HTML (Structure)
The skeleton of the page.
\`<h1>Hello World</h1>\`

### 2. CSS (Style)
The makeup/appearance.
\`h1 { color: blue; }\`

### 3. JavaScript (Action)
 The brain/logic.
\`document.querySelector('h1').innerText = 'Hi!';\``,
            keyPoints: ['HTML = Structure', 'CSS = Style', 'JS = Logic']
        },
        {
            id: 'p3',
            title: 'Data Structures',
            description: 'Arrays, lists, trees, and graphs',
            completed: false,
            xp: 200,
            content: `**Data Structures** organize information efficiently.

### 1. Arrays / Lists
Ordered collection of items.
\`list = [1, 2, 3]\`
Fast to access by index.

### 2. Stacks & Queues
- **Stack:** LIFO (Last In, First Out) like plates.
- **Queue:** FIFO (First In, First Out) like a line.

### 3. Trees
Hierarchical structure (like folders on PC).
Identify root, branches, and leaves.`,
            keyPoints: ['Organize data efficiently', 'Access speed matters', 'Choose right structure']
        }
    ],
    history: [
        {
            id: 'h1',
            title: 'Ancient Civilizations',
            description: 'Mesopotamia, Egypt, and Indus Valley',
            completed: false,
            xp: 100,
            content: `**Ancient Civilizations** formed near rivers.

### 1. Mesopotamia
- "Land between rivers" (Tigris & Euphrates).
- Invented writing (Cuneiform) and the wheel.

### 2. Ancient Egypt
- Nile River valley.
- Known for Pyramids, Pharaohs, and Hieroglyphs.

### 3. Indus Valley
- Advanced city planning (Harappa & Mohenjo-Daro).
- Had drainage and water systems!`,
            keyPoints: ['Rivers = Life', 'Writing developed', 'Agriculture started']
        },
        {
            id: 'h2',
            title: 'The Renaissance',
            description: 'Art, science, and culture rebirth',
            completed: false,
            xp: 120,
            content: `The **Renaissance** (14th-17th century) means "Rebirth".

### 1. Art
Da Vinci (Mona Lisa) and Michelangelo (David) focused on realism and perspective.

### 2. Science
Galileo and Copernicus proved the Earth revolves around the Sun (Heliocentrism).

### 3. Humanism
Shift from focusing only on religion to human potential and achievement.`,
            keyPoints: ['Rebirth of culture', 'Scientific revolution', 'Focus on human potential']
        },
        {
            id: 'h3',
            title: 'World War II',
            description: 'Global conflict and its aftermath',
            completed: false,
            xp: 150,
            content: `**WWII** (1939-1945) was the deadliest conflict in history.

### 1. The Sides
- **Allies:** USA, UK, USSR, France.
- **Axis:** Germany, Japan, Italy.

### 2. Key Events
- **1939:** Germany invades Poland.
- **1941:** Pearl Harbor (USA joins).
- **1944:** D-Day (Normandy invasion).
- **1945:** Atomic bombs & war ends.

### 3. Aftermath
- United Nations formed.
- Cold War began.`,
            keyPoints: ['Global scale', 'Nuclear age began', 'United Nations formed']
        }
    ],
    language: [
        {
            id: 'l1',
            title: 'Grammar Essentials',
            description: 'Nouns, verbs, and sentence structure',
            completed: false,
            xp: 100,
            content: `**Grammar** is the rulebook of language.

### 1. Parts of Speech
- **Noun:** Person, place, thing (Cat, London).
- **Verb:** Action (Run, Is, Think).
- **Adjective:** Describes noun (Blue, Fast).

### 2. Sentence Structure
- Subject + Verb + Object.
- "The cat (S) ate (V) the fish (O)."

### 3. Punctuation
- Period (.) stops.
- Comma (,) pauses.
- Question mark (?) asks.`,
            keyPoints: ['Parts of speech', 'S-V-O structure', 'Punctuation matters']
        },
        {
            id: 'l2',
            title: 'Creative Writing',
            description: 'Storytelling techniques and character',
            completed: false,
            xp: 120,
            content: `**Creative Writing** is painting with words.

### 1. Show, Don't Tell
- **Tell:** He was angry.
- **Show:** He slammed his fist, his face turning red.

### 2. Plot Arc
- Exposition (Start)
- Rising Action
- Climax (Peak)
- Falling Action
- Resolution (End)

### 3. Character
Give them goals, flaws, and distinct voices.`,
            keyPoints: ['Show dont tell', 'Story arc structure', 'Deep characters']
        },
        {
            id: 'l3',
            title: 'Public Speaking',
            description: 'Rhetoric and persuasion',
            completed: false,
            xp: 150,
            content: `**Public Speaking** is about connection.

### 1. The 3 Ps
- **Prepare:** Know your content.
- **Practice:** Rehearse out loud.
- **Present:** Eye contact and body language.

### 2. Rhetoric (Aristotle)
- **Ethos:** Credibility.
- **Pathos:** Emotion.
- **Logos:** Logic/Data.

### 3. Hook
Start with a story, fact, or question to grab attention immediately.`,
            keyPoints: ['Practice is key', 'Ethos/Pathos/Logos', 'Engage audience']
        }
    ],
    general: [
        {
            id: 'g1',
            title: 'Critical Thinking',
            description: 'Analyzing arguments and logic',
            completed: false,
            xp: 100,
            content: `**Critical Thinking** is thinking about thinking.

### 1. Question Assumptions
Don't just accept things. Ask "How do we know this is true?"

### 2. Analyze Arguments
- **Premise:** The reasons given.
- **Conclusion:** The point being made.
Does the premise actually support the conclusion?

### 3. Biases
Be aware of Confirmation Bias (only seeing what you agree with) and Survivorship Bias.`,
            keyPoints: ['Question everything', 'Check evidence', 'Spot biases']
        },
        {
            id: 'g2',
            title: 'Financial Literacy',
            description: 'Budgeting, saving, and investing',
            completed: false,
            xp: 120,
            content: `**Financial Literacy** means money management.

### 1. Budgeting (50/30/20 Rule)
- 50% Needs (Rent, Food).
- 30% Wants (Fun, Hobbies).
- 20% Savings/Debt.

### 2. Compound Interest
"Standard interest is linear; Compound is exponential."
Investing early makes your money grow money!

### 3. Assets vs Liabilities
- **Asset:** Puts money in pocket (Stock, Rental).
- **Liability:** Takes money out (Car loan, Credit debt).`,
            keyPoints: ['Spend less than earn', 'Compound interest', 'Buy assets']
        },
        {
            id: 'g3',
            title: 'Time Management',
            description: 'Productivity and flow state',
            completed: false,
            xp: 100,
            content: `**Time Management** is life management.

### 1. Pomodoro Technique
- Work 25 minutes.
- Break 5 minutes.
- Repeat.

### 2. Eisenhower Matrix
Sort tasks by:
- **Urgent & Important:** Do now.
- **Important but Not Urgent:** Schedule it.
- **Urgent but Not Important:** Delegate.
- **Neither:** Delete.

### 3. Flow State
Deep work where you lose track of time. Needs high challenge + high skill match.`,
            keyPoints: ['Prioritize tasks', 'Focus blocks', 'Minimize distractions']
        }
    ]
};

// 2. User Achievements
let userAchievements = savedData?.userAchievements || [
    { id: 'a1', title: 'First Step', description: 'Joined SovereignMind', icon: '🚀', unlocked: true },
    { id: 'a2', title: 'Math Whiz', description: 'Complete a Math lesson', icon: '📐', unlocked: false },
    { id: 'a3', title: 'Code Master', description: 'Complete a Programming lesson', icon: '💻', unlocked: false },
    { id: 'a4', title: 'Historian', description: 'Complete a History lesson', icon: '📜', unlocked: false },
    { id: 'a5', title: 'Polymath', description: 'Complete 5 lessons total', icon: '🧠', unlocked: false },
    { id: 'a6', title: 'Dedicated', description: 'Login 3 days in a row', icon: '🔥', unlocked: false }
];

// 3. User Stats
let userStats = savedData?.userStats || {
    xp: 0,
    level: 1,
    streak: 1,
    lessonsCompleted: 0
};

// --- NEW ROUTES ---

// Get Lessons for a Subject
app.get('/api/lessons/:subject', (req, res) => {
    const { subject } = req.params;
    const lessons = lessonsData[subject] || [];
    res.json({ success: true, lessons });
});

// Complete a Lesson
app.post('/api/lessons/complete', (req, res) => {
    const { subject, lessonId } = req.body;
    const lessons = lessonsData[subject];

    if (!lessons) return res.status(404).json({ success: false, error: 'Subject not found' });

    const lesson = lessons.find(l => l.id === lessonId);
    if (!lesson) return res.status(404).json({ success: false, error: 'Lesson not found' });

    if (!lesson.completed) {
        lesson.completed = true;
        userStats.lessonsCompleted++;
        userStats.xp += lesson.xp;

        // Level up logic?
        if (userStats.xp >= userStats.level * 500) {
            userStats.level++;
        }

        // Check Achievements
        const newUnlocks = [];

        function unlock(id) {
            const ach = userAchievements.find(a => a.id === id);
            if (ach && !ach.unlocked) {
                ach.unlocked = true;
                newUnlocks.push(ach);
            }
        }

        if (subject === 'mathematics') unlock('a2');
        if (subject === 'programming') unlock('a3');
        if (subject === 'history') unlock('a4');
        if (userStats.lessonsCompleted >= 5) unlock('a5');

        saveData(); // <--- Save progress!

        res.json({
            success: true,
            message: 'Lesson completed!',
            xpGained: lesson.xp,
            newAchievements: newUnlocks,
            stats: userStats
        });
    } else {
        res.json({ success: true, message: 'Already completed', stats: userStats });
    }
});

// Get User Profile (Stats + Achievements)
app.get('/api/user/profile', (req, res) => {
    res.json({
        success: true,
        stats: userStats,
        achievements: userAchievements
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🤖 AI Agent Server running on http://localhost:${PORT}`);

    console.log(`📡 API available at http://localhost:${PORT}/api`);
    console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
    console.log(`🛠️  Agent Tools: http://localhost:${PORT}/api/agent/tools`);
});

export default app;
