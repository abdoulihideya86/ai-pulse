'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Brain,
  Eye,
  Bot,
  Scale,
  Briefcase,
  FlaskConical,
  Wrench,
  Shield,
  Search,
  TrendingUp,
  ArrowLeft,
  ArrowRight,
  Clock,
  Sparkles,
  Newspaper,
  Loader2,
  Flame,
  ChevronDown,
  Cpu,
  Image,
  Bookmark,
  BookmarkCheck,
  Mail,
  Check,
  CheckCircle2,
  ArrowUp,
  Send,
  type LucideIcon,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { useAppStore, useLanguage, useIsRTL } from '@/lib/store'

// ─── Types ───────────────────────────────────────────────────────────────────

interface ArticleSource {
  id: string
  name: string
  url: string
  type: string
  reliabilityScore: number
  logo: string
  isActive: boolean
}

interface Article {
  id: string
  titleAr: string
  titleEn: string
  summaryAr: string
  summaryEn: string
  contentAr: string
  contentEn: string
  title: string
  summary: string
  content: string
  imageUrl: string | null
  sourceId: string
  category: string
  tags: string
  views: number
  isBreaking: boolean
  isTrending: boolean
  publishedAt: string
  createdAt: string
  updatedAt: string
  source: ArticleSource
}

interface NewsResponse {
  articles: Article[]
  total: number
  page: number
  totalPages: number
}

interface TrendingResponse {
  articles: Article[]
}

// ─── Categories ──────────────────────────────────────────────────────────────

interface CategoryDef {
  slug: string
  nameAr: string
  nameEn: string
  icon: LucideIcon
  color: string
}

const categories: CategoryDef[] = [
  { slug: 'general-ai', nameAr: 'النماذج اللغوية', nameEn: 'Large Language Models', icon: Brain, color: '#8b5cf6' },
  { slug: 'computer-vision', nameAr: 'رؤية الحاسوب', nameEn: 'Computer Vision', icon: Eye, color: '#06b6d4' },
  { slug: 'robotics', nameAr: 'الروبوتات', nameEn: 'Robotics', icon: Bot, color: '#10b981' },
  { slug: 'ai-ethics', nameAr: 'أخلاقيات AI', nameEn: 'AI Ethics', icon: Scale, color: '#f59e0b' },
  { slug: 'nlp', nameAr: 'معالجة اللغات الطبيعية', nameEn: 'Natural Language Processing', icon: Cpu, color: '#ef4444' },
  { slug: 'machine-learning', nameAr: 'تعلم الآلة', nameEn: 'Machine Learning', icon: FlaskConical, color: '#6366f1' },
  { slug: 'generative-ai', nameAr: 'أدوات وتطبيقات', nameEn: 'Tools & Apps', icon: Wrench, color: '#ec4899' },
  { slug: 'ai-policy', nameAr: 'سياسات وتنظيمات', nameEn: 'Policy & Regulation', icon: Shield, color: '#14b8a6' },
]

// Breaking news headlines will be fetched dynamically from the API

// ─── Utility Functions ───────────────────────────────────────────────────────

function formatViews(views: number): string {
  if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`
  if (views >= 1000) return `${(views / 1000).toFixed(1)}K`
  return views.toString()
}

function timeAgo(dateStr: string, isAr: boolean): string {
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return isAr ? 'الآن' : 'Just now'
  if (diffMins < 60) return isAr ? `منذ ${diffMins} دقيقة` : `${diffMins}m ago`
  if (diffHours < 24) return isAr ? `منذ ${diffHours} ساعة` : `${diffHours}h ago`
  if (diffDays === 1) return isAr ? 'أمس' : 'Yesterday'
  if (diffDays < 7) return isAr ? `منذ ${diffDays} أيام` : `${diffDays}d ago`
  if (diffDays < 30) return isAr ? `منذ ${Math.floor(diffDays / 7)} أسبوع` : `${Math.floor(diffDays / 7)}w ago`
  return isAr ? `منذ ${Math.floor(diffDays / 30)} شهر` : `${Math.floor(diffDays / 30)}mo ago`
}

function getCategoryBySlug(slug: string): CategoryDef | undefined {
  return categories.find((c) => c.slug === slug)
}

// ─── Sub-Components ──────────────────────────────────────────────────────────

/** Pull-to-Refresh Indicator */
function PullToRefreshIndicator({ language }: { language: 'ar' | 'en' }) {
  const isRTL = language === 'ar'
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    let lastScrollY = window.scrollY
    let hideTimeout: ReturnType<typeof setTimeout>

    const handleScroll = () => {
      const currentScrollY = window.scrollY
      // Show indicator when user is at the very top
      if (currentScrollY <= 0 && lastScrollY > 0) {
        setVisible(true)
        clearTimeout(hideTimeout)
        hideTimeout = setTimeout(() => setVisible(false), 1500)
      }
      lastScrollY = currentScrollY
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', handleScroll)
      clearTimeout(hideTimeout)
    }
  }, [])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-2 pointer-events-none"
        >
          <div className="flex items-center gap-2 px-4 py-2 rounded-b-xl bg-primary text-primary-foreground shadow-lg text-sm font-medium">
            <CheckCircle2 className="size-4" />
            {isRTL ? 'محدّث' : 'Updated'}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/** Breaking News Ticker — now shows real headlines from API */
function BreakingNewsTicker({ language }: { language: 'ar' | 'en' }) {
  const isRTL = language === 'ar'
  const [headlines, setHeadlines] = useState<string[]>([])

  useEffect(() => {
    async function fetchBreaking() {
      try {
        const res = await fetch('/api/news/trending?lang=' + language)
        const data = await res.json()
        const titles = (data.articles || [])
          .filter((a: Article) => a.isBreaking)
          .slice(0, 5)
          .map((a: Article) => isRTL ? a.titleAr : a.titleEn)
        setHeadlines(titles.length > 0 ? titles : (data.articles || []).slice(0, 5).map((a: Article) => isRTL ? a.titleAr : a.titleEn))
      } catch {
        // silently fail
      }
    }
    fetchBreaking()
  }, [language, isRTL])

  if (headlines.length === 0) return null

  return (
    <div className="w-full overflow-hidden bg-destructive/10 border-b border-destructive/20">
      <div className="container mx-auto flex items-center h-10 px-4">
        {/* Breaking badge */}
        <div className="flex items-center gap-2 shrink-0 z-10 pe-4">
          <span className="relative flex size-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75" />
            <span className="relative inline-flex rounded-full size-2.5 bg-destructive" />
          </span>
          <Badge variant="destructive" className="text-xs font-bold uppercase tracking-wider">
            {isRTL ? 'عاجل' : 'BREAKING'}
          </Badge>
        </div>

        {/* Scrolling track */}
        <div className="overflow-hidden flex-1 relative">
          <div className="ai-ticker-track" style={{ '--ticker-duration': '40s' } as React.CSSProperties}>
            {[...headlines, ...headlines].map((headline, i) => (
              <span key={i} className="inline-flex items-center gap-6 mx-6 text-sm font-medium whitespace-nowrap">
                <span className="text-foreground/90">{headline}</span>
                <span className="text-destructive/50">●</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/** Animated Hero Section */
function HeroSection({ language }: { language: 'ar' | 'en' }) {
  const isRTL = language === 'ar'
  const { setSearch } = useAppStore()
  const [searchValue, setSearchValue] = useState('')

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      setSearch(searchValue)
    },
    [searchValue, setSearch]
  )

  const [realStats, setRealStats] = useState<{ value: string; labelAr: string; labelEn: string }[]>([])

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/stats')
        const data = await res.json()
        const stats = [
          { value: String(data.totalSources || 0), labelAr: 'مصدر أخبار', labelEn: 'News Sources' },
          { value: String(data.totalArticles || 0), labelAr: 'مقال متاح', labelEn: 'Articles Available' },
          { value: String(data.breakingCount || 0), labelAr: 'خبر عاجل', labelEn: 'Breaking News' },
          { value: '24/7', labelAr: 'تحديث مستمر', labelEn: 'Continuous Updates' },
        ]
        setRealStats(stats)
      } catch {
        setRealStats([
          { value: '—', labelAr: 'مصدر أخبار', labelEn: 'News Sources' },
          { value: '—', labelAr: 'مقال متاح', labelEn: 'Articles Available' },
          { value: '—', labelAr: 'خبر عاجل', labelEn: 'Breaking News' },
          { value: '24/7', labelAr: 'تحديث مستمر', labelEn: 'Continuous Updates' },
        ])
      }
    }
    fetchStats()
  }, [])

  const stats = realStats.length > 0 ? realStats : [
    { value: '...', labelAr: 'مصدر أخبار', labelEn: 'News Sources' },
    { value: '...', labelAr: 'مقال متاح', labelEn: 'Articles Available' },
    { value: '...', labelAr: 'خبر عاجل', labelEn: 'Breaking News' },
    { value: '24/7', labelAr: 'تحديث مستمر', labelEn: 'Continuous Updates' },
  ]

  return (
    <section className="relative overflow-hidden py-16 md:py-24 lg:py-28 ai-hero-gradient">
      {/* Floating decorative orbs */}
      <motion.div
        className="absolute top-20 start-10 w-64 h-64 rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #8b5cf6, transparent)' }}
        animate={{ y: [0, -20, 0], x: [0, 10, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-10 end-10 w-48 h-48 rounded-full opacity-15 blur-2xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #06b6d4, transparent)' }}
        animate={{ y: [0, 15, 0], x: [0, -8, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute top-1/2 start-1/3 w-32 h-32 rounded-full opacity-10 blur-2xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #ec4899, transparent)' }}
        animate={{ y: [0, -12, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="container mx-auto px-4 text-center space-y-8 relative z-10">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Badge
            variant="secondary"
            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-sm"
          >
            <Sparkles className="size-3.5 text-ai-purple" />
            {isRTL ? 'مدعوم بالذكاء الاصطناعي' : 'AI-Powered News Platform'}
          </Badge>
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="space-y-3"
        >
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold leading-tight">
            <span className="ai-text-gradient">
              {isRTL ? 'نبض الذكاء الاصطناعي' : 'AI Pulse'}
            </span>
            {isRTL && (
              <>
                <br />
                <span className="text-foreground">AI Pulse</span>
              </>
            )}
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {isRTL
              ? 'منصتك المتكاملة لمتابعة أحدث أخبار وتحليلات وتطورات الذكاء الاصطناعي في مكان واحد'
              : 'Your comprehensive platform for following the latest AI news, analytics, and developments all in one place'}
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-xl mx-auto"
        >
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute start-4 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
            <Input
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder={isRTL ? 'ابحث عن أخبار الذكاء الاصطناعي...' : 'Search AI news, tools, trends...'}
              className="h-12 ps-12 pe-4 text-base rounded-xl ai-glass border-ai-purple/20 focus:border-ai-purple/50"
              dir={isRTL ? 'rtl' : 'ltr'}
            />
            <Button
              type="submit"
              size="sm"
              className="absolute end-2 top-1/2 -translate-y-1/2 btn-ai-gradient rounded-lg gap-1.5"
            >
              <Search className="size-3.5" />
              {isRTL ? 'بحث' : 'Search'}
            </Button>
          </form>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-wrap items-center justify-center gap-8 md:gap-12 pt-4"
        >
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              className="text-center"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.4 + i * 0.1 }}
            >
              <div className="text-2xl md:text-3xl font-bold ai-text-gradient">{stat.value}</div>
              <div className="text-sm text-muted-foreground mt-1">
                {isRTL ? stat.labelAr : stat.labelEn}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

/** Category Card */
function CategoryCard({ category, language, onClick, count }: { category: CategoryDef; language: 'ar' | 'en'; onClick: () => void; count: number }) {
  const isRTL = language === 'ar'
  const Icon = category.icon

  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
    >
      <Card
        className="ai-card cursor-pointer group h-full"
        onClick={onClick}
      >
        <CardContent className="p-4 sm:p-6 flex flex-col items-center text-center gap-3">
          <div
            className="flex items-center justify-center size-14 rounded-2xl transition-transform group-hover:scale-110"
            style={{ backgroundColor: `${category.color}20` }}
          >
            <Icon className="size-7" style={{ color: category.color }} />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-sm leading-tight">
              {isRTL ? category.nameAr : category.nameEn}
            </h3>
            <p className="text-xs text-muted-foreground" dir="ltr">
              {isRTL ? category.nameEn : category.nameAr}
            </p>
          </div>
          <Badge variant="secondary" className="text-[10px]" style={{ borderColor: `${category.color}30` }}>
            {count} {isRTL ? 'مقال' : 'articles'}
          </Badge>
        </CardContent>
      </Card>
    </motion.div>
  )
}

/** Categories Grid Section — with real counts from API */
function CategoriesGrid({ language, onCategoryClick }: { language: 'ar' | 'en'; onCategoryClick: (slug: string) => void }) {
  const isRTL = language === 'ar'
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({})

  useEffect(() => {
    async function fetchCounts() {
      try {
        const res = await fetch('/api/stats')
        const data = await res.json()
        setCategoryCounts(data.categoryCounts || {})
      } catch {
        // Keep empty counts
      }
    }
    fetchCounts()
  }, [])

  return (
    <section className="container mx-auto px-4 py-12 md:py-16">
      <div className="text-center mb-10">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h2 className="text-2xl md:text-3xl font-bold mb-3">
            {isRTL ? 'استكشف حسب التصنيف' : 'Explore by Category'}
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            {isRTL
              ? 'تصفح أخبار الذكاء الاصطناعي مصنفة حسب المجال والاهتمام'
              : 'Browse AI news categorized by field and interest'}
          </p>
        </motion.div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
        {categories.map((cat, i) => (
          <motion.div
            key={cat.slug}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
          >
            <CategoryCard
              category={cat}
              language={language}
              onClick={() => onCategoryClick(cat.slug)}
              count={categoryCounts[cat.slug] || 0}
            />
          </motion.div>
        ))}
      </div>
    </section>
  )
}

/** Bookmark Button for Cards */
function BookmarkButton({ articleId }: { articleId: string }) {
  const { toggleBookmark, isBookmarked } = useAppStore()
  const bookmarked = isBookmarked(articleId)

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      e.preventDefault()
      toggleBookmark(articleId)
    },
    [articleId, toggleBookmark]
  )

  return (
    <motion.button
      onClick={handleClick}
      className="relative z-10 flex items-center justify-center size-8 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background shadow-sm border border-border/50 transition-colors"
      whileTap={{ scale: 0.8 }}
      whileHover={{ scale: 1.1 }}
      aria-label={bookmarked ? 'Remove bookmark' : 'Add bookmark'}
    >
      <AnimatePresence mode="wait" initial={false}>
        {bookmarked ? (
          <motion.div
            key="bookmarked"
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 30 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
          >
            <BookmarkCheck className="size-4 text-ai-purple" />
          </motion.div>
        ) : (
          <motion.div
            key="not-bookmarked"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
          >
            <Bookmark className="size-4 text-muted-foreground" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  )
}

/** Trending Article Card */
function TrendingArticleCard({ article, language, index }: { article: Article; language: 'ar' | 'en'; index: number }) {
  const isRTL = language === 'ar'
  const { selectArticle } = useAppStore()
  const category = getCategoryBySlug(article.category)

  return (
    <motion.div
      initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      whileHover={{ y: -3 }}
    >
      <Card
        className="ai-card group cursor-pointer overflow-hidden h-full"
        onClick={() => selectArticle(article.id)}
      >
        {/* Image placeholder */}
        <div className="relative h-40 bg-gradient-to-br from-ai-purple/20 via-ai-blue/10 to-ai-cyan/20 overflow-hidden">
          {article.imageUrl ? (
            <img
              src={article.imageUrl}
              alt={isRTL ? article.titleAr : article.titleEn}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <Newspaper className="size-10 text-muted-foreground/30" />
            </div>
          )}
          {/* Category badge overlay */}
          {category && (
            <Badge
              className="absolute top-3 start-3 text-[10px] font-semibold border-0"
              style={{ backgroundColor: `${category.color}cc`, color: '#fff' }}
            >
              {isRTL ? category.nameAr : category.nameEn}
            </Badge>
          )}
          {/* Breaking indicator */}
          {article.isBreaking && (
            <Badge variant="destructive" className="absolute top-3 end-3 text-[10px] font-bold animate-pulse">
              {isRTL ? 'عاجل' : 'LIVE'}
            </Badge>
          )}
          {/* Bookmark button */}
          <div className="absolute top-3 end-3">
            {!article.isBreaking && <BookmarkButton articleId={article.id} />}
          </div>
          {/* Trending rank */}
          <div className="absolute bottom-2 end-3 flex items-center gap-1 text-xs text-muted-foreground/80 ai-glass rounded-md px-2 py-0.5">
            <Flame className="size-3 text-orange-400" />
            #{index + 1}
          </div>
        </div>

        <CardContent className="p-4 space-y-3">
          <h3 className="font-bold leading-relaxed line-clamp-2 group-hover:text-primary transition-colors text-sm">
            {isRTL ? article.titleAr : article.titleEn}
          </h3>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="size-3" />
              {timeAgo(article.publishedAt, isRTL)}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="size-3" />
              {formatViews(article.views)}
            </span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

/** Trending Today Section */
function TrendingToday({ language }: { language: 'ar' | 'en' }) {
  const isRTL = language === 'ar'
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight

  useEffect(() => {
    async function fetchTrending() {
      try {
        const res = await fetch('/api/news/trending')
        const data: TrendingResponse = await res.json()
        setArticles(data.articles || [])
      } catch {
        // silently fail - articles remain empty
      } finally {
        setLoading(false)
      }
    }
    fetchTrending()
  }, [])

  return (
    <section className="container mx-auto px-4 py-12 md:py-16">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center size-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-lg">
            <TrendingUp className="size-5" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">
              {isRTL ? 'الأكثر رواجاً اليوم' : 'Trending Today'}
            </h2>
            <p className="text-xs text-muted-foreground">
              {isRTL ? 'المقالات الأكثر مشاهدة ومتابعة' : 'Most viewed and followed articles'}
            </p>
          </div>
        </div>
        <Button variant="ghost" className="text-primary gap-1.5">
          {isRTL ? 'عرض الكل' : 'View All'}
          <ArrowIcon className="size-4" />
        </Button>
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="ai-card overflow-hidden">
              <Skeleton className="h-40 w-full rounded-none" />
              <div className="p-4 space-y-3">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </Card>
          ))}
        </div>
      ) : articles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Newspaper className="size-12 text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground">
            {isRTL ? 'لا توجد مقالات رواج حالياً' : 'No trending articles right now'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {articles.map((article, i) => (
            <TrendingArticleCard
              key={article.id}
              article={article}
              language={language}
              index={i}
            />
          ))}
        </div>
      )}
    </section>
  )
}

/** Newsletter Subscription Section */
function NewsletterSection({ language }: { language: 'ar' | 'en' }) {
  const isRTL = language === 'ar'
  const { newsletterSubscribed, setNewsletterSubscribed } = useAppStore()
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (!email.trim()) {
        setError(isRTL ? 'يرجى إدخال البريد الإلكتروني' : 'Please enter your email')
        return
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setError(isRTL ? 'بريد إلكتروني غير صالح' : 'Invalid email address')
        return
      }
      setError('')
      setSubmitting(true)
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setNewsletterSubscribed(true)
      setSubmitting(false)
    },
    [email, isRTL, setNewsletterSubscribed]
  )

  return (
    <section className="container mx-auto px-4 py-12 md:py-16">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.6 }}
      >
        <div className="relative overflow-hidden rounded-2xl md:rounded-3xl">
          {/* Gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-ai-purple via-ai-blue to-ai-cyan opacity-95" />

          {/* Decorative elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
              className="absolute -top-20 -start-20 w-72 h-72 rounded-full bg-white/10 blur-3xl"
              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
              className="absolute -bottom-16 -end-16 w-56 h-56 rounded-full bg-white/10 blur-2xl"
              animate={{ scale: [1.1, 1, 1.1], opacity: [0.2, 0.4, 0.2] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
              className="absolute top-1/2 start-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-white/5 blur-3xl"
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            />
            {/* Dot pattern */}
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                backgroundSize: '24px 24px',
              }}
            />
          </div>

          {/* Content */}
          <div className="relative z-10 px-6 py-10 md:px-12 md:py-14 lg:px-20 lg:py-16">
            <AnimatePresence mode="wait">
              {newsletterSubscribed ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  className="text-center space-y-4"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 15, delay: 0.1 }}
                    className="inline-flex items-center justify-center size-16 rounded-full bg-white/20 backdrop-blur-sm mx-auto"
                  >
                    <CheckCircle2 className="size-8 text-white" />
                  </motion.div>
                  <h3 className="text-2xl md:text-3xl font-bold text-white">
                    {isRTL ? 'شكراً لاشتراكك!' : 'Thank you for subscribing!'}
                  </h3>
                  <p className="text-white/80 max-w-md mx-auto">
                    {isRTL
                      ? 'ستصلك أحدث أخبار الذكاء الاصطناعي مباشرة إلى بريدك الإلكتروني'
                      : "You'll receive the latest AI news directly in your inbox"}
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12"
                >
                  {/* Left: Text content */}
                  <div className="flex-1 text-center lg:text-start space-y-4">
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm text-white text-xs font-medium"
                    >
                      <Mail className="size-3.5" />
                      {isRTL ? 'النشرة البريدية' : 'Newsletter'}
                    </motion.div>
                    <motion.h3
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="text-2xl md:text-3xl lg:text-4xl font-bold text-white leading-tight"
                    >
                      {isRTL
                        ? 'ابقَ على اطلاع بأحدث أخبار AI'
                        : 'Stay Updated with the Latest AI News'}
                    </motion.h3>
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="text-white/75 max-w-lg text-sm md:text-base leading-relaxed"
                    >
                      {isRTL
                        ? 'اشترك في نشرتنا البريدية الأسبوعية واحصل على ملخص أهم أخبار وتطورات الذكاء الاصطناعي مباشرة في بريدك الإلكتروني'
                        : 'Subscribe to our weekly newsletter and get a curated summary of the most important AI news and developments delivered straight to your inbox'}
                    </motion.p>
                  </div>

                  {/* Right: Email form */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="w-full lg:w-auto lg:min-w-[380px]"
                  >
                    <form onSubmit={handleSubmit} className="space-y-3">
                      <div className="flex flex-col sm:flex-row gap-3">
                        <div className="flex-1 relative">
                          <Mail className="absolute start-3.5 top-1/2 -translate-y-1/2 size-4 text-white/50" />
                          <Input
                            value={email}
                            onChange={(e) => {
                              setEmail(e.target.value)
                              setError('')
                            }}
                            placeholder={isRTL ? 'أدخل بريدك الإلكتروني' : 'Enter your email address'}
                            className="h-12 ps-10 pe-4 bg-white/15 backdrop-blur-sm border-white/20 text-white placeholder:text-white/50 focus:border-white/50 focus:ring-white/25 rounded-xl"
                            dir={isRTL ? 'rtl' : 'ltr'}
                            type="email"
                          />
                        </div>
                        <Button
                          type="submit"
                          disabled={submitting}
                          className="h-12 px-6 bg-white text-ai-purple hover:bg-white/90 font-semibold rounded-xl gap-2 shadow-lg shadow-black/20 shrink-0"
                        >
                          {submitting ? (
                            <Loader2 className="size-4 animate-spin" />
                          ) : (
                            <Send className="size-4" />
                          )}
                          {submitting
                            ? isRTL ? 'جارٍ الاشتراك...' : 'Subscribing...'
                            : isRTL ? 'اشترك الآن' : 'Subscribe'}
                        </Button>
                      </div>
                      {error && (
                        <motion.p
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-sm text-red-200"
                        >
                          {error}
                        </motion.p>
                      )}
                      <p className="text-xs text-white/50 text-center lg:text-start">
                        {isRTL
                          ? 'لا نرسل رسائل مزعجة. إلغاء الاشتراك في أي وقت.'
                          : 'No spam, ever. Unsubscribe at any time.'}
                      </p>
                    </form>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </section>
  )
}

/** Latest News Article Card */
function LatestArticleCard({ article, language }: { article: Article; language: 'ar' | 'en' }) {
  const isRTL = language === 'ar'
  const { selectArticle } = useAppStore()
  const category = getCategoryBySlug(article.category)

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -2 }}
    >
      <Card
        className="ai-card group cursor-pointer h-full"
        onClick={() => selectArticle(article.id)}
      >
        <CardContent className="p-4 sm:p-5 space-y-3">
          {/* Category + Breaking + Bookmark + Time */}
          <div className="flex items-center gap-2 flex-wrap">
            {category && (
              <Badge
                className="text-[10px] font-semibold border-0"
                style={{ backgroundColor: `${category.color}20`, color: category.color }}
              >
                {isRTL ? category.nameAr : category.nameEn}
              </Badge>
            )}
            {article.isBreaking && (
              <Badge variant="destructive" className="text-[10px] font-bold">
                {isRTL ? 'عاجل' : 'BREAKING'}
              </Badge>
            )}
            <span className="text-xs text-muted-foreground ms-auto flex items-center gap-1">
              <Clock className="size-3" />
              {timeAgo(article.publishedAt, isRTL)}
            </span>
            <BookmarkButton articleId={article.id} />
          </div>

          {/* Title */}
          <h3 className="font-bold leading-relaxed line-clamp-2 group-hover:text-primary transition-colors">
            {isRTL ? article.titleAr : article.titleEn}
          </h3>

          {/* Summary */}
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
            {isRTL ? article.summaryAr : article.summaryEn}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="font-medium text-foreground/80">
                {article.source?.name || ''}
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Eye className="size-3" />
                {formatViews(article.views)}
              </span>
            </div>
            <span className="text-xs text-primary font-medium group-hover:gap-1.5 flex items-center gap-1 transition-all">
              {isRTL ? 'اقرأ' : 'Read'}
              {isRTL ? <ArrowLeft className="size-3" /> : <ArrowRight className="size-3" />}
            </span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

/** Loading Skeleton Grid */
function LoadingSkeletonGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} className="ai-card">
          <CardContent className="p-4 sm:p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-3 w-12" />
            </div>
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <div className="flex justify-between">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-12" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

/** Latest News Section with Category Tabs + Infinite Scroll */
function LatestNews({ language, initialCategory }: { language: 'ar' | 'en'; initialCategory?: string }) {
  const isRTL = language === 'ar'
  const [activeCategory, setActiveCategory] = useState(initialCategory || 'all')
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [loadingMore, setLoadingMore] = useState(false)

  // Infinite scroll sentinel ref
  const sentinelRef = useRef<HTMLDivElement>(null)
  const [isFetching, setIsFetching] = useState(false)

  const fetchNews = useCallback(async (cat: string, p: number, append = false) => {
    try {
      if (append) {
        setLoadingMore(true)
      } else {
        setLoading(true)
      }
      const url = cat === 'all'
        ? `/api/news?lang=${language}&page=${p}`
        : `/api/news?category=${cat}&lang=${language}&page=${p}`
      const res = await fetch(url)
      const data: NewsResponse = await res.json()
      if (append) {
        setArticles((prev) => [...prev, ...(data.articles || [])])
      } else {
        setArticles(data.articles || [])
      }
      setTotal(data.total || 0)
      setTotalPages(data.totalPages || 0)
    } catch {
      // silently fail
    } finally {
      setLoading(false)
      setLoadingMore(false)
      setIsFetching(false)
    }
  }, [language])

  useEffect(() => {
    setPage(1)
    fetchNews(activeCategory, 1)
  }, [activeCategory, fetchNews])

  // Update category when initialCategory changes
  useEffect(() => {
    if (initialCategory && initialCategory !== activeCategory) {
      setActiveCategory(initialCategory)
    }
  }, [initialCategory, activeCategory])

  const hasMore = page < totalPages

  // IntersectionObserver for infinite scroll
  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel || !hasMore || loading || loadingMore) return

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        if (entry.isIntersecting && hasMore && !loadingMore && !isFetching) {
          setIsFetching(true)
          const nextPage = page + 1
          setPage(nextPage)
          fetchNews(activeCategory, nextPage, true)
        }
      },
      {
        root: null,
        rootMargin: '200px',
        threshold: 0,
      }
    )

    observer.observe(sentinel)

    return () => {
      observer.disconnect()
    }
  }, [hasMore, loading, loadingMore, page, activeCategory, fetchNews, isFetching])

  const tabItems = [
    { value: 'all', labelAr: 'الكل', labelEn: 'All' },
    ...categories.map((c) => ({ value: c.slug, labelAr: c.nameAr, labelEn: c.nameEn })),
  ]

  return (
    <section className="container mx-auto px-4 py-12 md:py-16">
      {/* Section Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="flex items-center justify-center size-10 rounded-xl bg-gradient-to-br from-ai-purple to-ai-blue text-white shadow-lg">
          <Newspaper className="size-5" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">
            {isRTL ? 'أحدث الأخبار' : 'Latest News'}
          </h2>
          <p className="text-xs text-muted-foreground">
            {isRTL ? `${total} مقال متاح` : `${total} articles available`}
          </p>
        </div>
      </div>

      {/* Category Tabs */}
      <Tabs value={activeCategory} onValueChange={setActiveCategory} className="space-y-6">
        <ScrollArea className="w-full">
          <TabsList className="inline-flex h-auto gap-1 p-1 bg-transparent w-max">
            {tabItems.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="text-xs px-3 py-1.5 rounded-lg data-[state=active]:btn-ai-gradient data-[state=active]:text-white data-[state=active]:shadow-md"
              >
                {isRTL ? tab.labelAr : tab.labelEn}
              </TabsTrigger>
            ))}
          </TabsList>
        </ScrollArea>

        <TabsContent value={activeCategory} className="mt-0">
          {loading ? (
            <LoadingSkeletonGrid />
          ) : articles.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Newspaper className="size-12 text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground">
                {isRTL ? 'لا توجد مقالات في هذا التصنيف' : 'No articles found in this category'}
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <AnimatePresence mode="popLayout">
                  {articles.map((article) => (
                    <LatestArticleCard
                      key={article.id}
                      article={article}
                      language={language}
                    />
                  ))}
                </AnimatePresence>
              </div>

              {/* Infinite scroll sentinel & status */}
              <div ref={sentinelRef} className="flex justify-center mt-8 min-h-[48px] items-center">
                {loadingMore && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-2 text-sm text-muted-foreground"
                  >
                    <Loader2 className="size-5 animate-spin text-primary" />
                    {isRTL ? 'جارٍ تحميل المزيد...' : 'Loading more articles...'}
                  </motion.div>
                )}
                {!hasMore && articles.length > 0 && !loadingMore && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-sm text-muted-foreground flex items-center gap-2"
                  >
                    <CheckCircle2 className="size-4 text-muted-foreground/50" />
                    {isRTL ? 'لا مزيد من المقالات' : 'No more articles'}
                  </motion.p>
                )}
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </section>
  )
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function HomePage() {
  const language = useLanguage()
  const isRTL = useIsRTL()
  const { setSearch } = useAppStore()
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined)

  const handleCategoryClick = useCallback(
    (slug: string) => {
      setSelectedCategory(slug)
      setSearch(slug)
      // Scroll to latest news section
      const el = document.getElementById('latest-news')
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    },
    [setSearch]
  )

  return (
    <div className="min-h-screen">
      {/* Pull-to-Refresh Indicator */}
      <PullToRefreshIndicator language={language} />

      {/* 1. Breaking News Ticker */}
      <BreakingNewsTicker language={language} />

      {/* 2. Hero Section */}
      <HeroSection language={language} />

      {/* 3. Categories Grid */}
      <CategoriesGrid language={language} onCategoryClick={handleCategoryClick} />

      {/* 4. Trending Today */}
      <TrendingToday language={language} />

      {/* 5. Newsletter Subscription Section */}
      <NewsletterSection language={language} />

      {/* Section Divider */}
      <div className="container mx-auto px-4">
        <div className="ai-divider-gradient" />
      </div>

      {/* 6. Latest News */}
      <div id="latest-news">
        <LatestNews language={language} initialCategory={selectedCategory} />
      </div>
    </div>
  )
}
