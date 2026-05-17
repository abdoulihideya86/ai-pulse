'use client'

import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { useCurrentPage } from '@/lib/store'
import { motion, AnimatePresence } from 'framer-motion'
import { HomePage } from '@/components/pages/home-page'
import { ArticlePage } from '@/components/pages/article-page'
import { DashboardPage } from '@/components/pages/dashboard-page'
import { AnalyticsPage } from '@/components/pages/analytics-page'
import { ToolsPage } from '@/components/pages/tools-page'
import { SettingsPage } from '@/components/pages/settings-page'

function PageContent() {
  const currentPage = useCurrentPage()

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
    </main>
  )
}

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <PageContent />
      <Footer />
    </div>
  )
}
