import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY;

console.log('Testing Gemini API...');
console.log('API Key:', API_KEY ? `${API_KEY.substring(0, 10)}...` : 'NOT FOUND');

const models = [
    'gemini-1.5-flash-latest',
    'gemini-1.5-flash',
    'gemini-1.5-pro-latest',
    'gemini-1.5-pro',
    'gemini-pro'
];

async function testModel(model) {
    try {
        const url = `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${API_KEY}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: 'Say hello in one word' }]
                }]
            })
        });

        if (response.ok) {
            const data = await response.json();
            if (data.candidates && data.candidates[0]) {
                console.log(`✅ ${model}: WORKS!`);
                console.log(`   Response: ${data.candidates[0].content.parts[0].text}`);
                return true;
            }
        } else {
            const error = await response.text();
            console.log(`❌ ${model}: FAILED`);
            console.log(`   Error: ${error.substring(0, 100)}`);
        }
    } catch (error) {
        console.log(`❌ ${model}: ERROR - ${error.message}`);
    }
    return false;
}

async function testAll() {
    console.log('\n🔍 Testing all models...\n');

    for (const model of models) {
        const works = await testModel(model);
        if (works) {
            console.log(`\n✨ Found working model: ${model}\n`);
            break;
        }
        console.log('');
    }
}

testAll();
