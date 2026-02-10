# 🚀 Quick Start Guide - SovereignMind Full-Stack React

## ⚡ Get Started in 5 Minutes!

### Step 1: Install Dependencies
```bash
cd sovereignmind-react
npm install
```

This will install:
- React, React Router, Zustand
- Express, MongoDB, Mongoose
- Solana Web3.js, Wallet Adapters
- Framer Motion, Lucide Icons
- And more...

### Step 2: Run Setup Script
```bash
node setup.js
```

This creates:
- All necessary directories
- `.env` file with default values
- `.gitignore` file

### Step 3: Start the Application

#### Option A: Run Both (Recommended)
```bash
npm run dev:all
```

This starts:
- Frontend on `http://localhost:3000`
- Backend on `http://localhost:5000`

#### Option B: Run Separately
```bash
# Terminal 1: Backend
npm run server

# Terminal 2: Frontend
npm run dev
```

### Step 4: Open in Browser
```
http://localhost:3000
```

---

## 📋 What's Included

### ✅ Frontend (React + Vite)
- Modern React 18 with hooks
- Vite for lightning-fast HMR
- Zustand for state management
- Framer Motion for animations
- Responsive design
- Light/Dark theme

### ✅ Backend (Node.js + Express)
- RESTful API
- MongoDB integration
- Mock AI responses
- CORS enabled
- Error handling

### ✅ Features
- 🎨 Beautiful UI with glassmorphic design
- 💬 AI chat interface
- 📊 Progress tracking
- 🏆 Achievement system
- 📝 Notes functionality
- 💾 Export/Import data
- 🌓 Theme toggle

---

## 🎯 Current Status

### ✅ What Works Now
1. **Frontend**
   - React app with routing
   - State management with Zustand
   - Theme toggle
   - All UI components

2. **Backend**
   - Express server running
   - API endpoints ready
   - Mock AI responses
   - MongoDB connection (optional)

3. **Features**
   - Chat interface
   - Subject selection
   - Progress tracking
   - Achievements
   - Notes
   - Data export/import

### 🔜 To Be Completed
1. **Full Components**
   - Need to create all React components
   - Dashboard, Chat, Progress, Settings pages
   - Individual UI components

2. **Database Integration**
   - MongoDB models
   - CRUD operations
   - User authentication

3. **AI Integration**
   - Replace mock responses with real Gemini API
   - Implement proper error handling

4. **Solana (Phase 2)**
   - Wallet connection
   - NFT minting
   - On-chain storage

---

## 📁 Project Structure

```
sovereignmind-react/
├── src/                    # Frontend React code
│   ├── components/         # React components
│   ├── pages/             # Page components
│   ├── store/             # Zustand store
│   ├── services/          # API services
│   ├── App.jsx            # Main app component
│   └── main.jsx           # Entry point
├── server/                # Backend Node.js code
│   ├── index.js           # Express server
│   ├── routes/            # API routes
│   ├── models/            # MongoDB models
│   └── middleware/        # Express middleware
├── public/                # Static assets
├── package.json           # Dependencies
├── vite.config.js         # Vite configuration
└── .env                   # Environment variables
```

---

## 🛠️ Development Workflow

### Making Changes

#### Frontend Changes
1. Edit files in `src/`
2. Changes auto-reload (HMR)
3. See updates instantly

#### Backend Changes
1. Edit files in `server/`
2. Server auto-restarts (nodemon)
3. Test API endpoints

### Testing API
```bash
# Test health endpoint
curl http://localhost:5000/api/health

# Test chat endpoint
curl -X POST http://localhost:5000/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello","subject":"general"}'
```

---

## 🎨 Customization

### Change Theme Colors
Edit `src/index.css`:
```css
:root {
  --primary: #6366f1;  /* Change this */
  --secondary: #8b5cf6; /* And this */
}
```

### Add New Subject
Edit `src/store/useStore.js`:
```javascript
const subjects = [
  'mathematics',
  'science',
  'programming',
  'your-new-subject'  // Add here
]
```

### Modify API Responses
Edit `server/index.js`:
```javascript
const mockResponses = {
  'your-subject': 'Your custom response...'
}
```

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3000
npx kill-port 3000

# Kill process on port 5000
npx kill-port 5000
```

### Dependencies Not Installing
```bash
# Clear cache
npm cache clean --force

# Delete and reinstall
rm -rf node_modules package-lock.json
npm install
```

### MongoDB Not Connecting
- Make sure MongoDB is installed
- Start MongoDB: `mongod`
- Or use MongoDB Atlas (cloud)
- Update `.env` with connection string

### Vite Build Errors
```bash
# Clear Vite cache
rm -rf node_modules/.vite
npm run dev
```

---

## 📦 Building for Production

### Frontend
```bash
npm run build
```

Output: `dist/` folder

### Deploy Frontend
```bash
# Vercel
vercel deploy

# Netlify
netlify deploy

# Or any static hosting
```

### Deploy Backend
```bash
# Railway
railway up

# Render
# Push to GitHub and connect

# Heroku
git push heroku main
```

---

## 🔮 Next Steps

### Immediate (Do Now)
1. ✅ Run `npm install`
2. ✅ Run `node setup.js`
3. ✅ Run `npm run dev:all`
4. ✅ Open `http://localhost:3000`
5. ✅ Test the app!

### Short Term (This Week)
1. 🔨 Complete all React components
2. 🔨 Implement database models
3. 🔨 Add user authentication
4. 🔨 Integrate real Gemini API
5. 🔨 Add more features

### Long Term (Phase 2)
1. 🚀 Solana wallet integration
2. 🚀 NFT minting
3. 🚀 On-chain achievements
4. 🚀 Token rewards
5. 🚀 Cross-platform sync

---

## 💡 Tips

### Development
- Use React DevTools for debugging
- Check browser console for errors
- Use Postman to test API endpoints
- Keep backend terminal open to see logs

### Best Practices
- Commit often
- Write descriptive commit messages
- Test before pushing
- Keep `.env` secret
- Document your changes

### Performance
- Use React.memo for expensive components
- Lazy load routes
- Optimize images
- Minimize bundle size

---

## 📚 Learning Resources

### React
- [React Docs](https://react.dev)
- [React Router](https://reactrouter.com)
- [Zustand](https://zustand-demo.pmnd.rs)

### Backend
- [Express Guide](https://expressjs.com/en/guide/routing.html)
- [MongoDB Tutorial](https://www.mongodb.com/docs/manual/tutorial/)
- [Mongoose Docs](https://mongoosejs.com/docs/)

### Solana
- [Solana Cookbook](https://solanacookbook.com)
- [Wallet Adapter](https://github.com/solana-labs/wallet-adapter)
- [Metaplex](https://docs.metaplex.com)

---

## 🎉 You're Ready!

Run these commands and start building:

```bash
cd sovereignmind-react
npm install
node setup.js
npm run dev:all
```

Then open `http://localhost:3000` and enjoy! 🚀

---

**Questions? Issues? Check the main README.md or create an issue on GitHub!**
