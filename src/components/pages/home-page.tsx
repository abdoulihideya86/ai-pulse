'use client'

import { useState, useEffect, useCallback } from 'react'
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

// ─── Breaking News Headlines ─────────────────────────────────────────────────

const breakingHeadlines = [
  { ar: 'إطلاق GPT-5: ثورة جديدة في النماذج اللغوية الكبيرة', en: 'GPT-5 Launch: A New Revolution in Large Language Models' },
  { ar: 'جوجل تطلق نموذج Gemini 2.0 الجديد بقدرات مذهلة', en: 'Google Launches New Gemini 2.0 Model with Amazing Capabilities' },
  { ar: 'الاتحاد الأوروبي يصدر قانون الذكاء الاصطناعي الجديد', en: 'EU Issues New AI Act Regulation' },
  { ar: 'نموذج رؤية حاسوبية جديد يحقق دقة غير مسبوقة', en: 'New Computer Vision Model Achieves Unprecedented Accuracy' },
  { ar: 'روبوتات جديدة قادرة على التعلم بالملاحظة فقط', en: 'New Robots Capable of Learning by Observation Only' },
]

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

/** Breaking News Ticker */
function BreakingNewsTicker({ language }: { language: 'ar' | 'en' }) {
  const isRTL = language === 'ar'
  const headlines = breakingHeadlines.map((h) => (isRTL ? h.ar : h.en))

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
            {/* Duplicate content for seamless loop */}
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

  const stats = [
    { value: '500+', labelAr: 'مصدر أخبار', labelEn: 'News Sources' },
    { value: '1M+', labelAr: 'مقال شهرياً', labelEn: 'Monthly Articles' },
    { value: '50+', labelAr: 'أداة AI', labelEn: 'AI Tools' },
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

/** Categories Grid Section */
function CategoriesGrid({ language, onCategoryClick }: { language: 'ar' | 'en'; onCategoryClick: (slug: string) => void }) {
  const isRTL = language === 'ar'

  // Predefined counts for each category
  const categoryCounts: Record<string, number> = {
    'general-ai': 245,
    'computer-vision': 189,
    'robotics': 134,
    'ai-ethics': 98,
    'nlp': 312,
    'machine-learning': 267,
    'generative-ai': 156,
    'ai-policy': 87,
  }

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
          {/* Category + Breaking + Time */}
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

/** Latest News Section with Category Tabs */
function LatestNews({ language, initialCategory }: { language: 'ar' | 'en'; initialCategory?: string }) {
  const isRTL = language === 'ar'
  const [activeCategory, setActiveCategory] = useState(initialCategory || 'all')
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [loadingMore, setLoadingMore] = useState(false)

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

  const handleLoadMore = () => {
    const nextPage = page + 1
    setPage(nextPage)
    fetchNews(activeCategory, nextPage, true)
  }

  const hasMore = page < totalPages

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

              {/* Load More */}
              {hasMore && (
                <div className="flex justify-center mt-8">
                  <Button
                    variant="outline"
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    className="gap-2 min-w-[160px]"
                  >
                    {loadingMore ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <ChevronDown className="size-4" />
                    )}
                    {loadingMore
                      ? isRTL ? 'جارٍ التحميل...' : 'Loading...'
                      : isRTL ? 'تحميل المزيد' : 'Load More'}
                  </Button>
                </div>
              )}
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
      {/* 1. Breaking News Ticker */}
      <BreakingNewsTicker language={language} />

      {/* 2. Hero Section */}
      <HeroSection language={language} />

      {/* 3. Categories Grid */}
      <CategoriesGrid language={language} onCategoryClick={handleCategoryClick} />

      {/* 4. Trending Today */}
      <TrendingToday language={language} />

      {/* Section Divider */}
      <div className="container mx-auto px-4">
        <div className="ai-divider-gradient" />
      </div>

      {/* 5. Latest News */}
      <div id="latest-news">
        <LatestNews language={language} initialCategory={selectedCategory} />
      </div>
    </div>
  )
}
