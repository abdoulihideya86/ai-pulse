import { create } from 'zustand'

export type Page = 'home' | 'article' | 'dashboard' | 'analytics' | 'tools' | 'settings'
export type Language = 'ar' | 'en'

interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  read: boolean
  createdAt: Date
}

interface AppState {
  // Navigation
  currentPage: Page
  // Language
  language: Language
  // Theme
  theme: 'light' | 'dark' | 'system'
  // Selected article
  selectedArticleId: string | null
  // Search
  searchQuery: string
  // Sidebar
  sidebarOpen: boolean
  // Notifications
  notifications: Notification[]
  // Mobile menu
  mobileMenuOpen: boolean
}

interface AppActions {
  navigate: (page: Page) => void
  setLanguage: (language: Language) => void
  setTheme: (theme: 'light' | 'dark' | 'system') => void
  selectArticle: (articleId: string | null) => void
  setSearch: (query: string) => void
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  toggleMobileMenu: () => void
  setMobileMenuOpen: (open: boolean) => void
  addNotification: (notification: Omit<Notification, 'id' | 'read' | 'createdAt'>) => void
  markNotificationRead: (id: string) => void
  clearNotifications: () => void
}

export const useAppStore = create<AppState & AppActions>((set) => ({
  // Initial state
  currentPage: 'home',
  language: 'ar',
  theme: 'dark',
  selectedArticleId: null,
  searchQuery: '',
  sidebarOpen: false,
  notifications: [],
  mobileMenuOpen: false,

  // Actions
  navigate: (page) => set({ currentPage: page, mobileMenuOpen: false }),

  setLanguage: (language) => set({ language }),

  setTheme: (theme) => set({ theme }),

  selectArticle: (articleId) => set({
    selectedArticleId: articleId,
    currentPage: articleId ? 'article' : 'home',
  }),

  setSearch: (searchQuery) => set({ searchQuery }),

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),

  toggleMobileMenu: () => set((state) => ({ mobileMenuOpen: !state.mobileMenuOpen })),
  setMobileMenuOpen: (mobileMenuOpen) => set({ mobileMenuOpen }),

  addNotification: (notification) => set((state) => ({
    notifications: [
      {
        ...notification,
        id: crypto.randomUUID(),
        read: false,
        createdAt: new Date(),
      },
      ...state.notifications,
    ],
  })),

  markNotificationRead: (id) => set((state) => ({
    notifications: state.notifications.map((n) =>
      n.id === id ? { ...n, read: true } : n
    ),
  })),

  clearNotifications: () => set({ notifications: [] }),
}))

// Selectors for optimized re-renders
export const useCurrentPage = () => useAppStore((state) => state.currentPage)
export const useLanguage = () => useAppStore((state) => state.language)
export const useIsRTL = () => useAppStore((state) => state.language === 'ar')
export const useSearchQuery = () => useAppStore((state) => state.searchQuery)
export const useSidebarOpen = () => useAppStore((state) => state.sidebarOpen)
export const useMobileMenuOpen = () => useAppStore((state) => state.mobileMenuOpen)
export const useNotifications = () => useAppStore((state) => state.notifications)
