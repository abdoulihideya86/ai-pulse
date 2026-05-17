'use client'

import { useAppStore, type Page } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  Brain,
  Search,
  Sun,
  Moon,
  Menu,
  Home,
  Newspaper,
  BarChart3,
  Wrench,
  LayoutDashboard,
  X,
  Bell,
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useCallback } from 'react'

const navItems: { page: Page; labelAr: string; labelEn: string; icon: React.ReactNode }[] = [
  { page: 'home', labelAr: 'الرئيسية', labelEn: 'Home', icon: <Home className="size-4" /> },
  { page: 'dashboard', labelAr: 'الأخبار', labelEn: 'News', icon: <Newspaper className="size-4" /> },
  { page: 'analytics', labelAr: 'التحليلات', labelEn: 'Analytics', icon: <BarChart3 className="size-4" /> },
  { page: 'tools', labelAr: 'الأدوات', labelEn: 'Tools', icon: <Wrench className="size-4" /> },
  { page: 'dashboard', labelAr: 'لوحة التحكم', labelEn: 'Dashboard', icon: <LayoutDashboard className="size-4" /> },
]

function NavLinks({
  currentPage,
  language,
  navigate,
  orientation = 'horizontal',
}: {
  currentPage: Page
  language: 'ar' | 'en'
  navigate: (page: Page) => void
  orientation?: 'horizontal' | 'vertical'
}) {
  return (
    <nav
      className={
        orientation === 'horizontal'
          ? 'hidden md:flex items-center gap-1'
          : 'flex flex-col gap-1 p-4'
      }
      role="navigation"
      aria-label={language === 'ar' ? 'التنقل الرئيسي' : 'Main navigation'}
    >
      {navItems.map((item) => {
        const isActive = currentPage === item.page
        return (
          <Button
            key={`${item.page}-${item.labelAr}`}
            variant="ghost"
            size={orientation === 'horizontal' ? 'sm' : 'default'}
            onClick={() => navigate(item.page)}
            className={`relative gap-2 ${
              orientation === 'vertical' ? 'justify-start text-base py-3' : ''
            } ${isActive ? 'text-primary font-bold nav-ai-active' : 'text-muted-foreground'}`}
            aria-current={isActive ? 'page' : undefined}
          >
            {item.icon}
            <span>{language === 'ar' ? item.labelAr : item.labelEn}</span>
            {isActive && orientation === 'horizontal' && (
              <motion.div
                layoutId="nav-indicator"
                className="absolute bottom-0 start-0 end-0 h-0.5 bg-gradient-to-r from-ai-purple to-ai-cyan rounded-full"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
          </Button>
        )
      })}
    </nav>
  )
}

export function Navigation() {
  const { currentPage, language, navigate, toggleMobileMenu, mobileMenuOpen, setMobileMenuOpen, notifications } = useAppStore()
  const { theme, setTheme } = useTheme()
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const { setSearch } = useAppStore()

  const unreadCount = notifications.filter((n) => !n.read).length

  const handleLanguageToggle = useCallback(() => {
    navigate(currentPage)
    useAppStore.setState({ language: language === 'ar' ? 'en' : 'ar' })
  }, [language, currentPage, navigate])

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      setSearch(searchValue)
    },
    [searchValue, setSearch]
  )

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="sticky top-0 z-50 w-full"
    >
      {/* Glassmorphism navbar using AI Pulse brand tokens */}
      <div className="ai-glass border-b border-ai-purple/10">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 gap-4">
          {/* Logo */}
          <motion.div
            className="flex items-center gap-2 shrink-0"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              variant="ghost"
              onClick={() => navigate('home')}
              className="gap-2 p-1.5 hover:bg-transparent"
              aria-label={language === 'ar' ? 'نبض الذكاء الاصطناعي - الصفحة الرئيسية' : 'AI Pulse - Home'}
            >
              <div className="relative flex items-center justify-center size-9 rounded-lg ai-gradient">
                <Brain className="size-5 text-white" />
              </div>
              <span className="text-xl font-bold ai-text-gradient">
                AI Pulse
              </span>
            </Button>
          </motion.div>

          {/* Desktop Navigation */}
          <NavLinks
            currentPage={currentPage}
            language={language}
            navigate={navigate}
            orientation="horizontal"
          />

          {/* Right side actions */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Search */}
            <AnimatePresence>
              {searchOpen ? (
                <motion.form
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 220, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handleSearch}
                  className="overflow-hidden hidden sm:flex items-center"
                >
                  <Input
                    autoFocus
                    placeholder={language === 'ar' ? 'ابحث...' : 'Search...'}
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    className="h-8 text-sm"
                    dir={language === 'ar' ? 'rtl' : 'ltr'}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-8 ms-1"
                    onClick={() => {
                      setSearchOpen(false)
                      setSearchValue('')
                      setSearch('')
                    }}
                    aria-label={language === 'ar' ? 'إغلاق البحث' : 'Close search'}
                  >
                    <X className="size-4" />
                  </Button>
                </motion.form>
              ) : null}
            </AnimatePresence>

            {!searchOpen && (
              <Button
                variant="ghost"
                size="icon"
                className="size-9 hidden sm:inline-flex"
                onClick={() => setSearchOpen(true)}
                aria-label={language === 'ar' ? 'بحث' : 'Search'}
              >
                <Search className="size-4" />
              </Button>
            )}

            {/* Mobile search toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="size-9 sm:hidden"
              onClick={() => setSearchOpen((prev) => !prev)}
              aria-label={language === 'ar' ? 'بحث' : 'Search'}
            >
              <Search className="size-4" />
            </Button>

            {/* Notifications */}
            <Button
              variant="ghost"
              size="icon"
              className="size-9 relative"
              aria-label={
                language === 'ar'
                  ? `الإشعارات ${unreadCount > 0 ? `(${unreadCount} غير مقروء)` : ''}`
                  : `Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`
              }
            >
              <Bell className="size-4" />
              {unreadCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-0.5 -end-0.5 size-4 p-0 flex items-center justify-center text-[10px]"
                >
                  {unreadCount}
                </Badge>
              )}
            </Button>

            {/* Language Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLanguageToggle}
              className="text-xs font-semibold px-2 h-9"
              aria-label={
                language === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'
              }
            >
              {language === 'ar' ? 'EN' : 'عربي'}
            </Button>

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="size-9"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              aria-label={
                theme === 'dark'
                  ? language === 'ar'
                    ? 'الوضع الفاتح'
                    : 'Light mode'
                  : language === 'ar'
                    ? 'الوضع الداكن'
                    : 'Dark mode'
              }
            >
              <AnimatePresence mode="wait">
                {theme === 'dark' ? (
                  <motion.div
                    key="sun"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Sun className="size-4" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="moon"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Moon className="size-4" />
                  </motion.div>
                )}
              </AnimatePresence>
            </Button>

            {/* User Avatar */}
            <Avatar className="size-9 cursor-pointer border-2 border-transparent hover:border-primary transition-colors">
              <AvatarFallback className="ai-gradient text-white text-xs font-bold">
                AP
              </AvatarFallback>
            </Avatar>

            {/* Mobile Menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-9 md:hidden"
                  aria-label={language === 'ar' ? 'فتح القائمة' : 'Open menu'}
                >
                  <Menu className="size-5" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side={language === 'ar' ? 'right' : 'left'}
                className="w-72 p-0"
              >
                <SheetTitle className="sr-only">
                  {language === 'ar' ? 'القائمة الرئيسية' : 'Main Menu'}
                </SheetTitle>
                <div className="flex flex-col h-full">
                  {/* Mobile header */}
                  <div className="flex items-center gap-2 p-4 border-b border-ai-purple/10">
                    <div className="flex items-center justify-center size-8 rounded-lg ai-gradient">
                      <Brain className="size-4 text-white" />
                    </div>
                    <span className="text-lg font-bold ai-text-gradient">
                      AI Pulse
                    </span>
                  </div>

                  {/* Mobile nav links */}
                  <NavLinks
                    currentPage={currentPage}
                    language={language}
                    navigate={navigate}
                    orientation="vertical"
                  />

                  {/* Mobile search */}
                  <div className="p-4 mt-auto border-t border-ai-purple/10">
                    <form onSubmit={handleSearch}>
                      <div className="relative">
                        <Search className="absolute start-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input
                          placeholder={language === 'ar' ? 'ابحث عن أخبار الذكاء الاصطناعي...' : 'Search AI news...'}
                          value={searchValue}
                          onChange={(e) => setSearchValue(e.target.value)}
                          className="ps-9"
                          dir={language === 'ar' ? 'rtl' : 'ltr'}
                        />
                      </div>
                    </form>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Mobile search bar (expandable) */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="sm:hidden border-t border-ai-purple/10 overflow-hidden"
            >
              <form onSubmit={handleSearch} className="p-3">
                <div className="relative">
                  <Search className="absolute start-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    autoFocus
                    placeholder={language === 'ar' ? 'ابحث عن أخبار الذكاء الاصطناعي...' : 'Search AI news...'}
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    className="ps-9"
                    dir={language === 'ar' ? 'rtl' : 'ltr'}
                  />
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  )
}
