import { create } from 'zustand'
import { persist } from 'zustand/middleware'

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

interface Comment {
  id: string
  articleId: string
  authorName: string
  authorAvatar: string
  content: string
  createdAt: string
  likes: number
  liked: boolean
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
  // Bookmarks — persisted
  bookmarkedIds: string[]
  // Reading mode
  readingMode: boolean
  // Font size
  fontSize: number
  // Comments
  comments: Comment[]
  // Newsletter subscribed
  newsletterSubscribed: boolean
  // Push notifications enabled
  pushNotificationsEnabled: boolean
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
  // Bookmarks
  toggleBookmark: (articleId: string) => void
  isBookmarked: (articleId: string) => boolean
  // Reading mode
  setReadingMode: (enabled: boolean) => void
  // Font size
  setFontSize: (size: number) => void
  // Comments
  addComment: (comment: Omit<Comment, 'id' | 'likes' | 'liked'>) => void
  toggleCommentLike: (commentId: string) => void
  getArticleComments: (articleId: string) => Comment[]
  // Newsletter
  setNewsletterSubscribed: (subscribed: boolean) => void
  // Push notifications
  setPushNotificationsEnabled: (enabled: boolean) => void
}

export const useAppStore = create<AppState & AppActions>()(
  persist(
    (set, get) => ({
      // Initial state
      currentPage: 'home',
      language: 'ar',
      theme: 'dark',
      selectedArticleId: null,
      searchQuery: '',
      sidebarOpen: false,
      notifications: [],
      mobileMenuOpen: false,
      bookmarkedIds: [],
      readingMode: false,
      fontSize: 16,
      comments: [],
      newsletterSubscribed: false,
      pushNotificationsEnabled: false,

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

      // Bookmarks
      toggleBookmark: (articleId) => set((state) => ({
        bookmarkedIds: state.bookmarkedIds.includes(articleId)
          ? state.bookmarkedIds.filter((id) => id !== articleId)
          : [...state.bookmarkedIds, articleId],
      })),

      isBookmarked: (articleId) => get().bookmarkedIds.includes(articleId),

      // Reading mode
      setReadingMode: (readingMode) => set({ readingMode }),

      // Font size
      setFontSize: (fontSize) => set({ fontSize }),

      // Comments
      addComment: (comment) => set((state) => ({
        comments: [
          {
            ...comment,
            id: crypto.randomUUID(),
            likes: 0,
            liked: false,
          },
          ...state.comments,
        ],
      })),

      toggleCommentLike: (commentId) => set((state) => ({
        comments: state.comments.map((c) =>
          c.id === commentId
            ? { ...c, liked: !c.liked, likes: c.liked ? c.likes - 1 : c.likes + 1 }
            : c
        ),
      })),

      getArticleComments: (articleId) => get().comments.filter((c) => c.articleId === articleId),

      // Newsletter
      setNewsletterSubscribed: (newsletterSubscribed) => set({ newsletterSubscribed }),

      // Push notifications
      setPushNotificationsEnabled: (pushNotificationsEnabled) => set({ pushNotificationsEnabled }),
    }),
    {
      name: 'ai-pulse-storage',
      partialize: (state) => ({
        bookmarkedIds: state.bookmarkedIds,
        readingMode: state.readingMode,
        fontSize: state.fontSize,
        language: state.language,
        theme: state.theme,
        comments: state.comments,
        newsletterSubscribed: state.newsletterSubscribed,
        pushNotificationsEnabled: state.pushNotificationsEnabled,
      }),
    }
  )
)

// Selectors for optimized re-renders
export const useCurrentPage = () => useAppStore((state) => state.currentPage)
export const useLanguage = () => useAppStore((state) => state.language)
export const useIsRTL = () => useAppStore((state) => state.language === 'ar')
export const useSearchQuery = () => useAppStore((state) => state.searchQuery)
export const useSidebarOpen = () => useAppStore((state) => state.sidebarOpen)
export const useMobileMenuOpen = () => useAppStore((state) => state.mobileMenuOpen)
export const useNotifications = () => useAppStore((state) => state.notifications)
export const useBookmarkedIds = () => useAppStore((state) => state.bookmarkedIds)
export const useReadingMode = () => useAppStore((state) => state.readingMode)
export const useFontSize = () => useAppStore((state) => state.fontSize)
export const usePushNotificationsEnabled = () => useAppStore((state) => state.pushNotificationsEnabled)
