# 🏗️ SovereignMind Architecture

## 📐 System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER BROWSER                             │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                    React Frontend (Vite)                    │ │
│  │                    Port: 3000                               │ │
│  │                                                              │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │ │
│  │  │  Dashboard   │  │     Chat     │  │   Progress   │     │ │
│  │  │    Page      │  │     Page     │  │     Page     │     │ │
│  │  └──────────────┘  └──────────────┘  └──────────────┘     │ │
│  │                                                              │ │
│  │  ┌────────────────────────────────────────────────────┐    │ │
│  │  │          Zustand Store (Global State)              │    │ │
│  │  │  • Conversations  • Progress  • Achievements       │    │ │
│  │  └────────────────────────────────────────────────────┘    │ │
│  │                                                              │ │
│  │  ┌────────────────────────────────────────────────────┐    │ │
│  │  │          LocalStorage (Persistence)                │    │ │
│  │  └────────────────────────────────────────────────────┘    │ │
│  └──────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 │ HTTP/REST API
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Backend Server (Express)                      │
│                         Port: 5000                               │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                      API Routes                             │ │
│  │  • /api/ai/chat          - AI conversation                 │ │
│  │  • /api/conversations    - Save/load chats                 │ │
│  │  • /api/progress         - Learning progress               │ │
│  │  • /api/achievements     - Unlock badges                   │ │
│  │  • /api/auth             - User authentication             │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                    Controllers                              │ │
│  │  • AI Controller         - Process AI requests             │ │
│  │  • User Controller       - Manage users                    │ │
│  │  • Progress Controller   - Track learning                  │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                 │
                    ┌────────────┴────────────┐
                    │                         │
                    ▼                         ▼
         ┌──────────────────┐      ┌──────────────────┐
         │   MongoDB        │      │  Google Gemini   │
         │   Database       │      │      API         │
         │                  │      │                  │
         │  • Users         │      │  • AI Responses  │
         │  • Conversations │      │  • Chat History  │
         │  • Achievements  │      │                  │
         │  • Progress      │      │                  │
         └──────────────────┘      └──────────────────┘
```

---

## 🔄 Data Flow

### 1. User Asks Question
```
User Input → React Component → Zustand Store → API Call → Express Server
                                                                  │
                                                                  ▼
                                                          Gemini API
                                                                  │
                                                                  ▼
AI Response ← React Component ← Zustand Store ← API Response ← Express Server
```

### 2. Save Progress
```
User Action → Zustand Store → LocalStorage (immediate)
                            → API Call → Express → MongoDB (persistent)
```

### 3. Load Data
```
Page Load → Zustand Store → LocalStorage (fast)
                          → API Call → Express → MongoDB (sync)
```

---

## 🗂️ Component Hierarchy

```
App
├── Header
│   ├── Logo
│   ├── Navigation
│   │   ├── Dashboard Link
│   │   ├── Chat Link
│   │   ├── Progress Link
│   │   └── Settings Link
│   └── Actions
│       ├── Theme Toggle
│       ├── Export Button
│       └── Import Button
│
├── Routes
│   ├── Dashboard
│   │   ├── Stats Grid
│   │   │   ├── Stat Card (Questions)
│   │   │   ├── Stat Card (Topics)
│   │   │   ├── Stat Card (Streak)
│   │   │   ├── Stat Card (Time)
│   │   │   └── Stat Card (Achievements)
│   │   ├── Subjects Grid
│   │   │   └── Subject Card (x6)
│   │   └── Achievements List
│   │       └── Achievement Badge
│   │
│   ├── Chat
│   │   ├── Chat Header
│   │   ├── Messages Container
│   │   │   └── Message Bubble
│   │   └── Chat Input
│   │       ├── Text Area
│   │       └── Send Button
│   │
│   ├── Progress
│   │   ├── Stats Overview
│   │   ├── Subject Progress
│   │   │   └── Progress Bar
│   │   └── Achievement Timeline
│   │
│   └── Settings
│       ├── API Key Input
│       ├── Theme Selector
│       └── Preferences
```

---

## 💾 State Management Flow

```
┌─────────────────────────────────────────────────────────┐
│                   Zustand Store                          │
│                                                           │
│  ┌─────────────────────────────────────────────────┐   │
│  │  State                                           │   │
│  │  • theme: 'dark' | 'light'                      │   │
│  │  • currentConversation: Message[]               │   │
│  │  • learningProgress: { [subject]: Progress }    │   │
│  │  • achievements: Achievement[]                  │   │
│  │  • notes: Note[]                                │   │
│  └─────────────────────────────────────────────────┘   │
│                                                           │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Actions                                         │   │
│  │  • toggleTheme()                                │   │
│  │  • addMessage(message)                          │   │
│  │  • updateProgress(subject)                      │   │
│  │  • addAchievement(achievement)                  │   │
│  │  • exportData()                                 │   │
│  │  • importData(data)                             │   │
│  └─────────────────────────────────────────────────┘   │
│                                                           │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Persistence (Zustand Middleware)               │   │
│  │  • Auto-save to localStorage                    │   │
│  │  • Auto-load on mount                           │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

## 🔐 Authentication Flow (Phase 2)

```
1. User Registration
   ┌─────────┐      ┌─────────┐      ┌──────────┐
   │ Frontend│─────▶│ Backend │─────▶│ MongoDB  │
   └─────────┘      └─────────┘      └──────────┘
        │                │
        │                ▼
        │           Hash Password
        │                │
        │                ▼
        │           Create User
        │                │
        │                ▼
        └───────── JWT Token

2. User Login
   ┌─────────┐      ┌─────────┐      ┌──────────┐
   │ Frontend│─────▶│ Backend │─────▶│ MongoDB  │
   └─────────┘      └─────────┘      └──────────┘
        │                │
        │                ▼
        │           Verify Password
        │                │
        │                ▼
        │           Generate JWT
        │                │
        │                ▼
        └───────── JWT Token
```

---

## 🔗 Solana Integration (Phase 2)

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend                              │
│                                                           │
│  ┌─────────────────────────────────────────────────┐   │
│  │         Wallet Adapter                           │   │
│  │  • Phantom  • Solflare  • Ledger                │   │
│  └─────────────────────────────────────────────────┘   │
│                        │                                  │
│                        ▼                                  │
│  ┌─────────────────────────────────────────────────┐   │
│  │         Solana Web3.js                          │   │
│  │  • Connect Wallet                               │   │
│  │  • Sign Transactions                            │   │
│  │  • Mint NFTs                                    │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│                 Solana Blockchain                        │
│                                                           │
│  ┌─────────────────────────────────────────────────┐   │
│  │         AI Brain NFT                            │   │
│  │  • Metadata: User progress                      │   │
│  │  • Attributes: Achievements                     │   │
│  │  • Owner: User wallet                           │   │
│  └─────────────────────────────────────────────────┘   │
│                                                           │
│  ┌─────────────────────────────────────────────────┐   │
│  │         Achievement Tokens                      │   │
│  │  • SPL Tokens for milestones                    │   │
│  │  • Transferable rewards                         │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

## 📊 Database Schema

```
┌─────────────────────────────────────────────────────────┐
│                      MongoDB                             │
│                                                           │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Users Collection                               │   │
│  │  {                                              │   │
│  │    _id: ObjectId,                               │   │
│  │    email: String,                               │   │
│  │    password: String (hashed),                   │   │
│  │    wallet: String (Solana address),             │   │
│  │    createdAt: Date                              │   │
│  │  }                                              │   │
│  └─────────────────────────────────────────────────┘   │
│                                                           │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Conversations Collection                       │   │
│  │  {                                              │   │
│  │    _id: ObjectId,                               │   │
│  │    userId: ObjectId,                            │   │
│  │    messages: [{                                 │   │
│  │      role: 'user' | 'ai',                       │   │
│  │      content: String,                           │   │
│  │      timestamp: Date,                           │   │
│  │      subject: String                            │   │
│  │    }],                                          │   │
│  │    subject: String,                             │   │
│  │    createdAt: Date                              │   │
│  │  }                                              │   │
│  └─────────────────────────────────────────────────┘   │
│                                                           │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Achievements Collection                        │   │
│  │  {                                              │   │
│  │    _id: ObjectId,                               │   │
│  │    userId: ObjectId,                            │   │
│  │    title: String,                               │   │
│  │    description: String,                         │   │
│  │    icon: String,                                │   │
│  │    unlockedAt: Date,                            │   │
│  │    onChain: Boolean,                            │   │
│  │    txHash: String (Solana)                      │   │
│  │  }                                              │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

## 🚀 Deployment Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Production                            │
│                                                           │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Frontend (Vercel/Netlify)                      │   │
│  │  • Static React build                           │   │
│  │  • CDN distribution                             │   │
│  │  • Auto SSL                                     │   │
│  └─────────────────────────────────────────────────┘   │
│                        │                                  │
│                        ▼                                  │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Backend (Railway/Render)                       │   │
│  │  • Node.js server                               │   │
│  │  • Auto-scaling                                 │   │
│  │  • Environment variables                        │   │
│  └─────────────────────────────────────────────────┘   │
│                        │                                  │
│                        ▼                                  │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Database (MongoDB Atlas)                       │   │
│  │  • Cloud database                               │   │
│  │  • Auto-backup                                  │   │
│  │  • Global distribution                          │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

**This architecture is designed to be:**
- ✅ **Scalable** - Can handle growth
- ✅ **Maintainable** - Clean separation of concerns
- ✅ **Secure** - Best practices implemented
- ✅ **Fast** - Optimized performance
- ✅ **Blockchain-Ready** - Easy Solana integration
