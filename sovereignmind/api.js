// API Configuration
const GEMINI_API_ENDPOINT = 'https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash-latest-exp:generateContent';

// Default API key for development (you can change this)
const DEFAULT_API_KEY = 'AIzaSyB0A9-JsRa0Qq1PiiuDUvx0nXleS1SSmuc';

class GeminiAPI {
    constructor() {
        this.apiKey = this.loadApiKey();
    }

    loadApiKey() {
        // Try localStorage first, then fall back to default
        const savedKey = localStorage.getItem('gemini_api_key');
        return savedKey || DEFAULT_API_KEY;
    }

    saveApiKey(key) {
        localStorage.setItem('gemini_api_key', key);
        this.apiKey = key;
    }

    hasApiKey() {
        return this.apiKey && this.apiKey.length > 0;
    }

    async generateResponse(prompt, subject = 'general') {
        if (!this.hasApiKey()) {
            throw new Error('API key not configured');
        }

        // Create a system prompt based on the subject
        const systemPrompt = this.getSystemPrompt(subject);
        const fullPrompt = `${systemPrompt}\n\nStudent question: ${prompt}`;

        try {
            const response = await fetch(GEMINI_API_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-goog-api-key': this.apiKey
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: fullPrompt
                        }]
                    }],
                    generationConfig: {
                        temperature: 0.7,
                        topK: 40,
                        topP: 0.95,
                        maxOutputTokens: 1024,
                    },
                    safetySettings: [
                        {
                            category: "HARM_CATEGORY_HARASSMENT",
                            threshold: "BLOCK_MEDIUM_AND_ABOVE"
                        },
                        {
                            category: "HARM_CATEGORY_HATE_SPEECH",
                            threshold: "BLOCK_MEDIUM_AND_ABOVE"
                        },
                        {
                            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                            threshold: "BLOCK_MEDIUM_AND_ABOVE"
                        },
                        {
                            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                            threshold: "BLOCK_MEDIUM_AND_ABOVE"
                        }
                    ]
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('API Error:', errorData);

                if (response.status === 400 && errorData.error?.message?.includes('API_KEY_INVALID')) {
                    throw new Error('Invalid API key. Please check your Google Gemini API key.');
                }

                throw new Error(`API request failed: ${errorData.error?.message || response.statusText}`);
            }

            const data = await response.json();

            if (!data.candidates || data.candidates.length === 0) {
                throw new Error('No response generated. Please try again.');
            }

            const text = data.candidates[0].content.parts[0].text;
            return text;

        } catch (error) {
            console.error('Error calling Gemini API:', error);
            throw error;
        }
    }

    getSystemPrompt(subject) {
        const prompts = {
            mathematics: `You are an expert mathematics tutor. Your role is to:
- Explain mathematical concepts clearly and step-by-step
- Use examples to illustrate concepts
- Break down complex problems into manageable parts
- Encourage critical thinking
- Be patient and supportive
- Use proper mathematical notation when helpful
Keep your responses concise but thorough.`,

            science: `You are an expert science tutor. Your role is to:
- Explain scientific concepts using real-world examples
- Break down complex topics into simple terms
- Use analogies to make concepts relatable
- Encourage curiosity and experimentation
- Connect concepts to everyday life
- Be enthusiastic about science
Keep your responses engaging and educational.`,

            programming: `You are an expert programming tutor. Your role is to:
- Explain programming concepts with clear examples
- Provide code snippets when helpful
- Teach best practices and clean code principles
- Debug and explain errors patiently
- Encourage problem-solving skills
- Use simple language for complex topics
Keep your responses practical and hands-on.`,

            language: `You are an expert language tutor. Your role is to:
- Explain grammar rules clearly with examples
- Help with vocabulary and usage
- Provide context for language learning
- Correct mistakes gently and constructively
- Encourage practice and conversation
- Make learning fun and engaging
Keep your responses supportive and educational.`,

            history: `You are an expert history tutor. Your role is to:
- Explain historical events with context
- Connect past events to present day
- Use storytelling to make history engaging
- Provide multiple perspectives on events
- Encourage critical thinking about sources
- Make history relatable and interesting
Keep your responses informative and engaging.`,

            general: `You are a helpful AI tutor. Your role is to:
- Answer questions clearly and accurately
- Provide explanations that are easy to understand
- Encourage learning and curiosity
- Be patient and supportive
- Adapt to the student's level
Keep your responses helpful and educational.`
        };

        return prompts[subject] || prompts.general;
    }

    // Test the API connection
    async testConnection() {
        try {
            const response = await this.generateResponse('Hello! Can you hear me?', 'general');
            return { success: true, message: response };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
}

// Export for use in app.js
window.GeminiAPI = GeminiAPI;
