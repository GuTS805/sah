import { create } from 'zustand'

export const useStore = create((set, get) => ({
    // Theme
    theme: localStorage.getItem('theme') || 'dark',
    toggleTheme: () => {
        const newTheme = get().theme === 'dark' ? 'light' : 'dark'
        localStorage.setItem('theme', newTheme)
        set({ theme: newTheme })
    },

    // Current subject
    currentSubject: 'mathematics',
    setSubject: (subject) => set({ currentSubject: subject }),

    // Achievements
    achievements: [],
    addAchievement: (achievement) => set((state) => ({
        achievements: [...state.achievements, achievement]
    })),

    // Stats
    getStats: () => ({
        totalQuestions: 0,
        topicsMastered: 0,
        achievementCount: get().achievements.length,
        studyMinutes: 0,
        streak: 1
    }),

    // Export data
    exportData: () => ({
        achievements: get().achievements,
        theme: get().theme,
        exportDate: new Date().toISOString()
    }),

    // Import data
    importData: (data) => set({
        achievements: data.achievements || [],
        theme: data.theme || 'dark'
    })
}))
