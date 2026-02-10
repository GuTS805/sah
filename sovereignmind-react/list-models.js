import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY;

console.log('Fetching available models...\n');

async function listModels() {
    try {
        const url = `https://generativelanguage.googleapis.com/v1/models?key=${API_KEY}`;

        const response = await fetch(url);

        if (response.ok) {
            const data = await response.json();
            console.log('✅ Available models:\n');
            data.models.forEach(model => {
                if (model.name.includes('gemini')) {
                    console.log(`  - ${model.name}`);
                    console.log(`    Display: ${model.displayName}`);
                    console.log(`    Methods: ${model.supportedGenerationMethods?.join(', ')}\n`);
                }
            });
        } else {
            const error = await response.text();
            console.log('❌ Error:', error);
        }
    } catch (error) {
        console.log('❌ Error:', error.message);
    }
}

listModels();
