#!/usr/bin/env node

/**
 * SovereignMind Full-Stack Setup Script
 * This script creates all necessary files for the React + Node.js app
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Setting up SovereignMind Full-Stack Application...\n');

// Create directory structure
const directories = [
    'src/components',
    'src/pages',
    'src/services',
    'src/hooks',
    'src/utils',
    'src/assets',
    'server/routes',
    'server/models',
    'server/middleware',
    'server/controllers',
    'public'
];

directories.forEach(dir => {
    const fullPath = path.join(__dirname, dir);
    if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
        console.log(`✅ Created: ${dir}`);
    }
});

console.log('\n📝 Creating configuration files...\n');

// .env template
const envTemplate = `# Frontend
VITE_API_URL=http://localhost:5000
VITE_GEMINI_API_KEY=AIzaSyB0A9-JsRa0Qq1PiiuDUvx0nXleS1SSmuc

# Backend
PORT=5000
MONGODB_URI=mongodb://localhost:27017/sovereignmind
JWT_SECRET=your_super_secret_jwt_key_change_in_production
GEMINI_API_KEY=AIzaSyB0A9-JsRa0Qq1PiiuDUvx0nXleS1SSmuc
NODE_ENV=development
`;

fs.writeFileSync('.env', envTemplate);
console.log('✅ Created .env file');

// .gitignore
const gitignore = `# Dependencies
node_modules/
.pnp
.pnp.js

# Testing
coverage/

# Production
build/
dist/

# Misc
.DS_Store
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*
lerna-debug.log*

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
Thumbs.db
`;

fs.writeFileSync('.gitignore', gitignore);
console.log('✅ Created .gitignore');

console.log('\n✨ Setup complete!');
console.log('\n📋 Next steps:');
console.log('1. npm install');
console.log('2. Start MongoDB: mongod');
console.log('3. npm run dev:all');
console.log('\n🎉 Happy coding!\n');
