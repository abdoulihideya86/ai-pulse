'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAppStore, useLanguage, useIsRTL } from '@/lib/store'
import { motion } from 'framer-motion'
import {
  Sparkles,
  Eye,
  Clock,
  Bookmark,
  Share2,
  Printer,
  Volume2,
  ArrowLeft,
  ArrowRight,
  Home,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  BookOpen,
  Loader2,
  Zap,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { toast } from 'sonner'

// ---------------------------------------------------------------------------
// Types — matching the real API response shapes
// ---------------------------------------------------------------------------

interface ArticleSource {
  id: string
  name: string
  url: string
  type: string
  reliabilityScore: number
  logo: string | null
  isActive: boolean
}

interface ArticleData {
  id: string
  titleAr: string
  titleEn: string
  summaryAr: string | null
  summaryEn: string | null
  contentAr: string | null
  contentEn: string | null
  imageUrl: string | null
  sourceId: string | null
  category: string
  tags: string // JSON string like '["Gemini","Google"]'
  views: number
  isBreaking: boolean
  isTrending: boolean
  publishedAt: string
  source: ArticleSource | null
  // mapped fields from the API
  title?: string
  summary?: string
  content?: string
}

interface RelatedArticle {
  id: string
  titleAr: string
  titleEn: string
  summaryAr: string | null
  summaryEn: string | null
  category: string
  tags: string
  views: number
  isBreaking: boolean
  isTrending: boolean
  publishedAt: string
  source: ArticleSource | null
  title?: string
  summary?: string
  imageUrl: string | null
}

// ---------------------------------------------------------------------------
// Category label lookup (matches seed data + common slugs)
// ---------------------------------------------------------------------------

const categoryLabels: Record<string, { ar: string; en: string }> = {
  'general-ai': { ar: 'الذكاء الاصطناعي العام', en: 'General AI' },
  'machine-learning': { ar: 'تعلم الآلة', en: 'Machine Learning' },
  nlp: { ar: 'معالجة اللغات الطبيعية', en: 'NLP' },
  'computer-vision': { ar: 'الرؤية الحاسوبية', en: 'Computer Vision' },
  robotics: { ar: 'الروبوتات', en: 'Robotics' },
  'ai-ethics': { ar: 'أخلاقيات الذكاء الاصطناعي', en: 'AI Ethics' },
  llm: { ar: 'نماذج اللغة', en: 'LLMs' },
  investment: { ar: 'الاستثمار', en: 'Investment' },
  research: { ar: 'الأبحاث', en: 'Research' },
  tools: { ar: 'الأدوات', en: 'Tools' },
  ethics: { ar: 'الأخلاقيات', en: 'Ethics' },
  autonomous: { ar: 'القيادة الذاتية', en: 'Autonomous' },
  generative: { ar: 'توليد المحتوى', en: 'Generative AI' },
  healthcare: { ar: 'الصحة', en: 'Healthcare' },
  business: { ar: 'أعمال AI', en: 'AI Business' },
  policy: { ar: 'سياسات وتنظيمات', en: 'Policy & Regulation' },
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function estimateReadingTime(content: string): number {
  const wordsPerMinute = 200
  const words = content.split(/\s+/).length
  return Math.max(1, Math.ceil(words / wordsPerMinute))
}

function formatViews(views: number, lang: string): string {
  if (views >= 1000000) {
    return lang === 'ar'
      ? `${(views / 1000000).toFixed(1)} مليون`
      : `${(views / 1000000).toFixed(1)}M`
  }
  if (views >= 1000) {
    return lang === 'ar'
      ? `${(views / 1000).toFixed(1)} ألف`
      : `${(views / 1000).toFixed(1)}K`
  }
  return views.toString()
}

function formatDate(dateStr: string, lang: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (lang === 'ar') {
    if (diffMins < 1) return 'الآن'
    if (diffMins < 60) return `منذ ${diffMins} دقيقة`
    if (diffHours < 24) return `منذ ${diffHours} ساعة`
    if (diffDays < 7) return `منذ ${diffDays} يوم`
    return date.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })
  }
  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

function parseSummaryToBullets(summary: string): string[] {
  if (!summary) return []
  return summary
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => line.replace(/^[•\-\*]\s*/, '').trim())
    .filter((line) => line.length > 0)
}

function parseTags(tagsStr: string): string[] {
  try {
    return JSON.parse(tagsStr)
  } catch {
    return []
  }
}

function getCategoryLabel(slug: string, isAr: boolean): string {
  const cat = categoryLabels[slug]
  if (cat) return isAr ? cat.ar : cat.en
  // Fallback: convert slug to title
  return slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

// ---------------------------------------------------------------------------
// Loading Skeleton
// ---------------------------------------------------------------------------

function ArticleSkeleton() {
  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl space-y-6">
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-32" />
      </div>
      <div className="space-y-3">
        <Skeleton className="h-5 w-24 skeleton-ai" />
        <Skeleton className="h-10 w-full skeleton-ai" />
        <Skeleton className="h-10 w-3/4 skeleton-ai" />
        <div className="flex items-center gap-4">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
      <div className="rounded-xl p-6 space-y-3 border border-ai-purple/20 bg-card">
        <Skeleton className="h-6 w-40 skeleton-ai" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/5" />
      </div>
      <div className="space-y-4 py-6">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function ArticlePage() {
  const language = useLanguage()
  const isRTL = useIsRTL()
  const { selectedArticleId, selectArticle, navigate } = useAppStore()

  const [article, setArticle] = useState<ArticleData | null>(null)
  const [relatedArticles, setRelatedArticles] = useState<RelatedArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [relatedLoading, setRelatedLoading] = useState(true)
  const [aiSummary, setAiSummary] = useState<string | null>(null)
  const [summarizing, setSummarizing] = useState(false)
  const [bookmarked, setBookmarked] = useState(false)

  const isAr = language === 'ar'

  // Fetch article data
  useEffect(() => {
    if (!selectedArticleId) return

    setLoading(true)
    fetch(`/api/news/${selectedArticleId}?lang=${language}`)
      .then((res) => {
        if (!res.ok) throw new Error('Not found')
        return res.json()
      })
      .then((data) => {
        const art = data.article || data
        setArticle(art)
        // Set AI summary from article data
        const summaryText = isAr ? (art.summaryAr || art.summary) : (art.summaryEn || art.summary)
        setAiSummary(summaryText || null)
      })
      .catch(() => {
        toast.error(isAr ? 'فشل في تحميل المقال' : 'Failed to load article')
      })
      .finally(() => setLoading(false))
  }, [selectedArticleId, language, isAr])

  // Fetch related articles
  useEffect(() => {
    if (!article) return

    setRelatedLoading(true)
    fetch(`/api/news?category=${article.category}&lang=${language}&page=1`)
      .then((res) => res.json())
      .then((data) => {
        // Filter out current article from related
        const filtered = (data.articles || []).filter(
          (a: RelatedArticle) => a.id !== article.id
        )
        setRelatedArticles(filtered.slice(0, 3))
      })
      .catch(() => {
        // silently fail for related articles
      })
      .finally(() => setRelatedLoading(false))
  }, [article, language])

  const handleGenerateSummary = useCallback(async () => {
    if (!selectedArticleId || summarizing) return
    setSummarizing(true)
    try {
      const res = await fetch(`/api/news/${selectedArticleId}/summarize`, { method: 'POST' })
      const data = await res.json()
      if (data.summary) {
        const newSummary = isAr ? data.summary.ar : data.summary.en
        setAiSummary(newSummary)
        toast.success(isAr ? 'تم إنشاء الملخص بنجاح' : 'Summary generated successfully')
      } else if (data.error) {
        toast.error(isAr ? 'فشل في إنشاء الملخص' : 'Failed to generate summary')
      }
    } catch {
      toast.error(isAr ? 'فشل في إنشاء الملخص' : 'Failed to generate summary')
    } finally {
      setSummarizing(false)
    }
  }, [selectedArticleId, summarizing, isAr])

  const handleTTS = useCallback(() => {
    if (!article) return
    const content = isAr
      ? (article.contentAr || article.content || '')
      : (article.contentEn || article.content || '')
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(content)
      utterance.lang = isAr ? 'ar-SA' : 'en-US'
      utterance.rate = 0.9
      window.speechSynthesis.speak(utterance)
      toast.success(isAr ? 'جاري تشغيل الصوت...' : 'Playing audio...', {
        action: {
          label: isAr ? 'إيقاف' : 'Stop',
          onClick: () => window.speechSynthesis.cancel(),
        },
      })
    } else {
      toast.info(isAr ? 'استمع للخبر' : 'Listen to article')
    }
  }, [article, isAr])

  const handleBookmark = useCallback(() => {
    setBookmarked((prev) => !prev)
    toast.success(
      bookmarked
        ? isAr ? 'تم إزالة الحفظ' : 'Bookmark removed'
        : isAr ? 'تم حفظ المقال' : 'Article bookmarked'
    )
  }, [bookmarked, isAr])

  const handleShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: isAr ? article?.titleAr : article?.titleEn,
          url: window.location.href,
        })
      } catch {
        // user cancelled
      }
    } else {
      await navigator.clipboard.writeText(window.location.href)
      toast.success(isAr ? 'تم نسخ الرابط' : 'Link copied to clipboard')
    }
  }, [article, isAr])

  const handlePrint = useCallback(() => {
    window.print()
  }, [])

  // Loading state
  if (loading || !article) {
    return <ArticleSkeleton />
  }

  const title = isAr ? article.titleAr : (article.titleEn || article.title)
  const content = isAr
    ? (article.contentAr || article.content || '')
    : (article.contentEn || article.content || '')
  const catLabel = getCategoryLabel(article.category, isAr)
  const readingTime = estimateReadingTime(content)
  const summaryBullets = parseSummaryToBullets(aiSummary || '')
  const tags = parseTags(article.tags)
  const source = article.source

  const BackArrow = isRTL ? ArrowRight : ArrowLeft
  const ChevIcon = isRTL ? ChevronLeft : ChevronRight

  return (
    <div className="min-h-screen">
      <article className="container mx-auto px-4 py-6 max-w-4xl space-y-6">
        {/* ---- Breadcrumb ---- */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild className="cursor-pointer">
                  <span onClick={() => navigate('home')}>
                    <Home className="size-3.5 inline-block me-1" />
                    {isAr ? 'الرئيسية' : 'Home'}
                  </span>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator>
                <ChevIcon className="size-3.5" />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbLink asChild className="cursor-pointer">
                  <span onClick={() => navigate('home')}>
                    {catLabel}
                  </span>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator>
                <ChevIcon className="size-3.5" />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbPage className="line-clamp-1 max-w-[200px] sm:max-w-[300px]">
                  {title}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </motion.div>

        {/* ---- Back button ---- */}
        <motion.div
          initial={{ opacity: 0, x: isRTL ? 10 : -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-muted-foreground hover:text-foreground"
            onClick={() => {
              selectArticle(null)
              navigate('home')
            }}
          >
            <BackArrow className="size-4" />
            {isAr ? 'العودة للأخبار' : 'Back to News'}
          </Button>
        </motion.div>

        {/* ---- Article Header ---- */}
        <motion.header
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-4"
        >
          {/* Badges row */}
          <div className="flex flex-wrap items-center gap-2">
            {article.isBreaking && (
              <Badge className="badge-ai-gradient gap-1">
                <Zap className="size-3" />
                {isAr ? 'عاجل' : 'Breaking'}
              </Badge>
            )}
            {article.isTrending && (
              <Badge variant="secondary" className="gap-1">
                <Zap className="size-3 text-orange-500" />
                {isAr ? 'رائج' : 'Trending'}
              </Badge>
            )}
            <Badge variant="secondary" className="gap-1">
              <BookOpen className="size-3 text-ai-purple" />
              {catLabel}
            </Badge>
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold leading-tight">
            {title}
          </h1>

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
            {/* Source */}
            {source && (
              <span className="flex items-center gap-1.5">
                <span className="flex items-center justify-center size-6 rounded-md bg-gradient-to-br from-ai-purple/20 to-ai-cyan/20 text-xs font-bold text-ai-purple">
                  {source.name.charAt(0)}
                </span>
                <span className="font-medium text-foreground/80">{source.name}</span>
              </span>
            )}

            <Separator orientation="vertical" className="h-4" />

            {/* Date */}
            <span className="flex items-center gap-1">
              <Clock className="size-3.5" />
              {formatDate(article.publishedAt, language)}
            </span>

            <Separator orientation="vertical" className="h-4" />

            {/* Views */}
            <span className="flex items-center gap-1">
              <Eye className="size-3.5" />
              {formatViews(article.views, language)}
            </span>

            <Separator orientation="vertical" className="h-4" />

            {/* Reading time */}
            <span className="flex items-center gap-1">
              <BookOpen className="size-3.5" />
              {isAr ? `${readingTime} دقيقة قراءة` : `${readingTime} min read`}
            </span>
          </div>

          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              {tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  #{tag}
                </Badge>
              ))}
            </div>
          )}
        </motion.header>

        <Separator />

        {/* ---- AI Smart Summary Card ---- */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          aria-label={isAr ? 'ملخص ذكي' : 'AI Summary'}
        >
          <div className="relative rounded-xl overflow-hidden">
            {/* Gradient border effect — outer glow ring */}
            <div className="absolute inset-0 rounded-xl">
              <div className="absolute inset-0 rounded-xl ai-gradient-animated opacity-70" />
            </div>

            {/* Inner card */}
            <div className="relative m-[1px] rounded-[11px] bg-card">
              <div className="p-5 sm:p-6 space-y-4">
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex items-center justify-center size-9 rounded-lg ai-gradient text-white shadow-md">
                      <Sparkles className="size-4" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold">
                        {isAr ? 'ملخص ذكي' : 'AI Smart Summary'}
                      </h2>
                      <p className="text-xs text-muted-foreground">
                        {isAr ? 'نظرة سريعة على أهم النقاط' : 'Quick overview of key points'}
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="gap-1 text-xs">
                    <Sparkles className="size-3 text-ai-purple" />
                    {isAr ? 'مولّد بالذكاء الاصطناعي' : 'Generated by AI'}
                  </Badge>
                </div>

                {/* Summary bullets or generate button */}
                {summaryBullets.length > 0 ? (
                  <ul className="space-y-2.5">
                    {summaryBullets.map((bullet, i) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0, x: isRTL ? 12 : -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.15 + i * 0.08 }}
                        className="flex items-start gap-2.5"
                      >
                        <span className="mt-1.5 size-2 rounded-full bg-gradient-to-r from-ai-purple to-ai-cyan shrink-0" />
                        <span className="text-sm leading-relaxed text-foreground/90">
                          {bullet}
                        </span>
                      </motion.li>
                    ))}
                  </ul>
                ) : (
                  <div className="flex flex-col items-center py-6 gap-3">
                    <p className="text-sm text-muted-foreground text-center">
                      {isAr
                        ? 'لا يوجد ملخص بعد. اضغط لإنشاء ملخص بالذكاء الاصطناعي'
                        : 'No summary yet. Click to generate an AI summary'}
                    </p>
                    <Button
                      onClick={handleGenerateSummary}
                      disabled={summarizing}
                      className="btn-ai-gradient gap-2"
                    >
                      {summarizing ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Sparkles className="size-4" />
                      )}
                      {summarizing
                        ? isAr ? 'جارٍ الإنشاء...' : 'Generating...'
                        : isAr ? 'إنشاء ملخص' : 'Generate Summary'}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.section>

        {/* ---- TTS + Actions Row ---- */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="flex flex-wrap items-center gap-2"
        >
          {/* TTS Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleTTS}
            className="gap-2 border-ai-purple/30 hover:border-ai-purple/60 hover:bg-ai-purple/10"
          >
            <Volume2 className="size-4 text-ai-purple" />
            {isAr ? 'استمع للخبر' : 'Listen to article'}
          </Button>

          <div className="flex-1" />

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5">
            <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBookmark}
                className={`size-9 ${bookmarked ? 'text-ai-purple' : ''}`}
                aria-label={isAr ? 'حفظ' : 'Bookmark'}
              >
                <Bookmark className={`size-4 ${bookmarked ? 'fill-ai-purple' : ''}`} />
              </Button>
            </motion.div>

            <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="ghost"
                size="icon"
                className="size-9"
                onClick={handleShare}
                aria-label={isAr ? 'مشاركة' : 'Share'}
              >
                <Share2 className="size-4" />
              </Button>
            </motion.div>

            <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="ghost"
                size="icon"
                className="size-9"
                onClick={handlePrint}
                aria-label={isAr ? 'طباعة' : 'Print'}
              >
                <Printer className="size-4" />
              </Button>
            </motion.div>
          </div>
        </motion.div>

        <Separator />

        {/* ---- Full Article Content ---- */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="prose prose-lg dark:prose-invert max-w-none
            prose-headings:font-bold prose-headings:ai-text-gradient
            prose-p:leading-relaxed prose-p:text-foreground/90
            prose-strong:text-foreground
            prose-a:text-ai-purple prose-a:no-underline hover:prose-a:underline"
          dir={isRTL ? 'rtl' : 'ltr'}
          lang={isRTL ? 'ar' : 'en'}
        >
          {content.split('\n\n').map((paragraph, i) => {
            const trimmed = paragraph.trim()
            if (!trimmed) return null

            if (trimmed.startsWith('## ')) {
              return (
                <h2 key={i} className="mt-8 mb-4 text-xl sm:text-2xl">
                  {trimmed.replace('## ', '')}
                </h2>
              )
            }
            if (trimmed.startsWith('### ')) {
              return (
                <h3 key={i} className="mt-6 mb-3 text-lg sm:text-xl">
                  {trimmed.replace('### ', '')}
                </h3>
              )
            }

            if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
              return (
                <p key={i} className="font-semibold">
                  {trimmed.replace(/\*\*/g, '')}
                </p>
              )
            }

            return (
              <p key={i} className="mb-4">
                {trimmed}
              </p>
            )
          })}
        </motion.section>

        <Separator />

        {/* ---- Source Info Card ---- */}
        {source && (
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.25 }}
          >
            <Card className="ai-card">
              <CardContent className="p-5 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  {/* Source logo & name */}
                  <div className="flex items-center gap-3">
                    <span className="flex items-center justify-center size-12 rounded-xl bg-gradient-to-br from-ai-purple/20 to-ai-cyan/20 text-xl font-bold text-ai-purple">
                      {source.name.charAt(0)}
                    </span>
                    <div>
                      <h3 className="font-bold text-base">{source.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        {isAr ? 'مصدر الأخبار' : 'News Source'}
                      </p>
                    </div>
                  </div>

                  <div className="flex-1" />

                  {/* Reliability score */}
                  <div className="space-y-1.5 min-w-[200px]">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1.5 text-muted-foreground">
                        <ShieldCheck className="size-3.5 text-ai-teal" />
                        {isAr ? 'موثوقية المصدر' : 'Source Reliability'}
                      </span>
                      <span className="font-bold text-ai-teal">
                        {Math.round(source.reliabilityScore * 100)}%
                      </span>
                    </div>
                    <Progress
                      value={source.reliabilityScore * 100}
                      className="h-2 [&>[data-slot=progress-indicator]]:progress-ai"
                    />
                  </div>

                  {/* Source URL */}
                  {source.url && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5 text-xs"
                      onClick={() => window.open(source.url, '_blank', 'noopener')}
                    >
                      <ExternalLink className="size-3" />
                      {isAr ? 'زيارة المصدر' : 'Visit Source'}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.section>
        )}

        {/* ---- Related Articles ---- */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Zap className="size-5 text-ai-purple" />
            <h2 className="text-xl font-bold">
              {isAr ? 'أخبار ذات صلة' : 'Related Articles'}
            </h2>
          </div>

          {relatedLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="ai-card">
                  <CardContent className="p-5 space-y-3">
                    <Skeleton className="h-4 w-20 skeleton-ai" />
                    <Skeleton className="h-5 w-full skeleton-ai" />
                    <Skeleton className="h-5 w-3/4 skeleton-ai" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : relatedArticles.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {relatedArticles.map((related, i) => {
                const relTitle = isAr ? related.titleAr : (related.titleEn || related.title)
                const relCategory = getCategoryLabel(related.category, isAr)

                return (
                  <motion.div
                    key={related.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.35 + i * 0.08 }}
                  >
                    <Card
                      className="ai-card group cursor-pointer h-full"
                      onClick={() => {
                        selectArticle(related.id)
                        window.scrollTo({ top: 0, behavior: 'smooth' })
                      }}
                    >
                      <CardContent className="p-5 space-y-3">
                        <div className="flex items-center gap-2">
                          {related.isBreaking && (
                            <Badge className="badge-ai-gradient text-[10px] px-1.5 py-0 gap-0.5">
                              <Zap className="size-2.5" />
                              {isAr ? 'عاجل' : 'Live'}
                            </Badge>
                          )}
                          <Badge variant="secondary" className="text-xs">
                            {relCategory}
                          </Badge>
                        </div>
                        <h3 className="font-bold leading-relaxed line-clamp-2 group-hover:text-primary transition-colors text-sm">
                          {relTitle}
                        </h3>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Eye className="size-3" />
                            {formatViews(related.views, language)}
                          </span>
                          <span>{formatDate(related.publishedAt, language)}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          ) : (
            <Card className="ai-card">
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">
                  {isAr ? 'لا توجد أخبار ذات صلة حالياً' : 'No related articles found'}
                </p>
              </CardContent>
            </Card>
          )}
        </motion.section>
      </article>
    </div>
  )
}
