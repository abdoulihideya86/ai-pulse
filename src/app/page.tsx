'use client'

import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { useCurrentPage, useReadingMode } from '@/lib/store'
import { motion, AnimatePresence } from 'framer-motion'
import { HomePage } from '@/components/pages/home-page'
import { ArticlePage } from '@/components/pages/article-page'
import { DashboardPage } from '@/components/pages/dashboard-page'
import { AnalyticsPage } from '@/components/pages/analytics-page'
import { ToolsPage } from '@/components/pages/tools-page'
import { SettingsPage } from '@/components/pages/settings-page'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { BookOpen } from 'lucide-react'
import { useAppStore } from '@/lib/store'

function PageContent() {
  const currentPage = useCurrentPage()
  const readingMode = useReadingMode()
  const { setReadingMode, language } = useAppStore()
  const isAr = language === 'ar'

  // Scroll to top whenever page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [currentPage])

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage />
      case 'article':
        return <ArticlePage />
      case 'dashboard':
        return <DashboardPage />
      case 'analytics':
        return <AnalyticsPage />
      case 'tools':
        return <ToolsPage />
      case 'settings':
        return <SettingsPage />
      default:
        return <HomePage />
    }
  }

  return (
    <main className="flex-1">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPage}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {renderPage()}
        </motion.div>
      </AnimatePresence>

      {/* Exit Reading Mode Floating Button */}
      {readingMode && (
        <div className="reading-mode-exit-btn">
          <Button
            onClick={() => setReadingMode(false)}
            className="btn-ai-gradient gap-2 shadow-2xl rounded-full px-6"
          >
            <BookOpen className="size-4" />
            {isAr ? 'خروج من وضع القراءة' : 'Exit Reading Mode'}
          </Button>
        </div>
      )}
    </main>
  )
}

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <div data-reading-hide>
        <Navigation />
      </div>
      <PageContent />
      <div data-reading-hide>
        <Footer />
      </div>
    </div>
  )
}
