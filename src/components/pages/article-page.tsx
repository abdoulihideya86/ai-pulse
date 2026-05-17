'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useAppStore, useLanguage, useIsRTL } from '@/lib/store'
import { motion, AnimatePresence } from 'framer-motion'
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
  MessageSquare,
  ThumbsUp,
  Send,
  X,
  BookOpenCheck,
  Copy,
  Twitter,
  Linkedin,
  MessageCircle,
  Quote,
  Check,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
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
  nlp: { ar: 'معالجة اللغات الطبيعية', en: 'Natural Language Processing' },
  'computer-vision': { ar: 'الرؤية الحاسوبية', en: 'Computer Vision' },
  robotics: { ar: 'الروبوتات', en: 'Robotics' },
  'ai-ethics': { ar: 'أخلاقيات الذكاء الاصطناعي', en: 'AI Ethics' },
  'generative-ai': { ar: 'الذكاء الاصطناعي التوليدي', en: 'Generative AI' },
  'ai-policy': { ar: 'سياسات وتنظيمات الذكاء الاصطناعي', en: 'AI Policy & Regulation' },
  llm: { ar: 'نماذج اللغة', en: 'LLMs' },
  investment: { ar: 'الاستثمار في الذكاء الاصطناعي', en: 'AI Investment' },
  research: { ar: 'الأبحاث', en: 'Research' },
  tools: { ar: 'أدوات الذكاء الاصطناعي', en: 'AI Tools' },
  ethics: { ar: 'أخلاقيات الذكاء الاصطناعي', en: 'AI Ethics' },
  autonomous: { ar: 'القيادة الذاتية', en: 'Autonomous' },
  generative: { ar: 'الذكاء الاصطناعي التوليدي', en: 'Generative AI' },
  healthcare: { ar: 'الذكاء الاصطناعي في الصحة', en: 'AI in Healthcare' },
  business: { ar: 'أعمال الذكاء الاصطناعي', en: 'AI Business' },
  policy: { ar: 'سياسات وتنظيمات الذكاء الاصطناعي', en: 'AI Policy & Regulation' },
}

// No mock comments - users add real comments themselves

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
  // Fallback: return the slug as-is (no title-casing which creates English text in Arabic mode)
  return slug
}

// ---------------------------------------------------------------------------
// ReadingProgressBar — separate component
// ---------------------------------------------------------------------------

function ReadingProgressBar() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    function handleScroll() {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      if (docHeight > 0) {
        setProgress(Math.min((scrollTop / docHeight) * 100, 100))
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] h-1 bg-transparent">
      <motion.div
        className="h-full"
        style={{
          width: `${progress}%`,
          background: 'linear-gradient(90deg, #8b5cf6, #3b82f6, #06b6d4)',
        }}
        initial={{ width: 0 }}
        transition={{ duration: 0.1, ease: 'linear' }}
      />
      {/* Glow effect at the leading edge */}
      {progress > 0 && progress < 100 && (
        <div
          className="absolute top-0 h-1 w-6 blur-sm"
          style={{
            left: `${progress}%`,
            background: 'linear-gradient(90deg, #3b82f6, #06b6d4)',
            transform: 'translateX(-100%)',
          }}
        />
      )}
    </div>
  )
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
  const {
    selectedArticleId,
    selectArticle,
    navigate,
    toggleBookmark,
    isBookmarked,
    readingMode,
    setReadingMode,
    fontSize,
    setFontSize,
    addComment,
    toggleCommentLike,
    getArticleComments,
    comments,
  } = useAppStore()

  const [article, setArticle] = useState<ArticleData | null>(null)
  const [relatedArticles, setRelatedArticles] = useState<RelatedArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [relatedLoading, setRelatedLoading] = useState(true)
  const [aiSummary, setAiSummary] = useState<string | null>(null)
  const [summarizing, setSummarizing] = useState(false)
  // Comment form state
  const [commentAuthor, setCommentAuthor] = useState('')
  const [commentContent, setCommentContent] = useState('')
  const [submittingComment, setSubmittingComment] = useState(false)
  // Share state
  const [copied, setCopied] = useState(false)
  // No mock comments

  const articleRef = useRef<HTMLDivElement>(null)

  const isAr = language === 'ar'

  // No mock comment seeding - real users add their own comments

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

  const handleBookmarkToggle = useCallback(() => {
    if (!selectedArticleId) return
    toggleBookmark(selectedArticleId)
    const nowBookmarked = !isBookmarked(selectedArticleId)
    toast.success(
      nowBookmarked
        ? isAr ? 'تم حفظ المقال' : 'Article bookmarked'
        : isAr ? 'تم إزالة الحفظ' : 'Bookmark removed'
    )
  }, [selectedArticleId, toggleBookmark, isBookmarked, isAr])

  const handlePrint = useCallback(() => {
    window.print()
  }, [])

  // ---- Smart Share ----
  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      toast.success(isAr ? 'تم نسخ الرابط' : 'Link copied to clipboard')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error(isAr ? 'فشل في نسخ الرابط' : 'Failed to copy link')
    }
  }, [isAr])

  const handleShareTwitter = useCallback(() => {
    const text = encodeURIComponent(
      article ? (isAr ? article.titleAr : article.titleEn) : ''
    )
    const url = encodeURIComponent(window.location.href)
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank', 'noopener')
  }, [article, isAr])

  const handleShareWhatsApp = useCallback(() => {
    const text = encodeURIComponent(
      `${article ? (isAr ? article.titleAr : article.titleEn) : ''} ${window.location.href}`
    )
    window.open(`https://wa.me/?text=${text}`, '_blank', 'noopener')
  }, [article, isAr])

  const handleShareLinkedIn = useCallback(() => {
    const url = encodeURIComponent(window.location.href)
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank', 'noopener')
  }, [])

  const handleShareAsQuote = useCallback(async () => {
    if (!article) return
    const content = isAr
      ? (article.contentAr || article.content || '')
      : (article.contentEn || article.content || '')
    const firstParagraph = content.split('\n\n')[0]?.trim() || ''
    const title = isAr ? article.titleAr : article.titleEn
    const quote = `"${firstParagraph}"\n\n— ${title}`
    try {
      await navigator.clipboard.writeText(quote)
      toast.success(isAr ? 'تم نسخ الاقتباس' : 'Quote copied to clipboard')
    } catch {
      toast.error(isAr ? 'فشل في نسخ الاقتباس' : 'Failed to copy quote')
    }
  }, [article, isAr])

  // ---- Comment Submit ----
  const handleSubmitComment = useCallback(() => {
    if (!selectedArticleId || !commentContent.trim()) return
    setSubmittingComment(true)
    addComment({
      articleId: selectedArticleId,
      authorName: commentAuthor.trim() || (isAr ? 'مجهول' : 'Anonymous'),
      authorAvatar: '',
      content: commentContent.trim(),
      createdAt: new Date().toISOString(),
    })
    setCommentContent('')
    toast.success(isAr ? 'تم إضافة التعليق' : 'Comment added')
    setSubmittingComment(false)
  }, [selectedArticleId, commentAuthor, commentContent, addComment, isAr])

  // ---- Reading Mode ----
  const handleToggleReadingMode = useCallback(() => {
    setReadingMode(!readingMode)
  }, [readingMode, setReadingMode])

  // Computed values
  const bookmarked = selectedArticleId ? isBookmarked(selectedArticleId) : false
  const articleComments = selectedArticleId ? getArticleComments(selectedArticleId) : []

  // Loading state
  if (loading || !article) {
    return <ArticleSkeleton />
  }

  const title = isAr ? article.titleAr : (article.titleEn || article.title)
  const content = isAr
    ? (article.contentAr || article.content || '')
    : (article.contentEn || article.content || '')
  const isEnglishContent = isAr && article.titleAr === article.titleEn
  const catLabel = getCategoryLabel(article.category, isAr)
  const readingTime = estimateReadingTime(content)
  const summaryBullets = parseSummaryToBullets(aiSummary || '')
  const tags = parseTags(article.tags)
  const source = article.source

  const BackArrow = isRTL ? ArrowRight : ArrowLeft
  const ChevIcon = isRTL ? ChevronLeft : ChevronRight

  // Extract first paragraph for AI Opinion Summary
  const firstParagraph = content.split('\n\n')[0]?.trim() || ''

  return (
    <div className={`min-h-screen ${readingMode ? 'reading-mode-active' : ''}`}>
      {/* ---- Reading Progress Bar ---- */}
      <ReadingProgressBar />

      {/* ---- Reading Mode Exit Button ---- */}
      <AnimatePresence>
        {readingMode && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="fixed top-4 right-4 z-[99] sm:top-6 sm:right-6"
          >
            <Button
              onClick={handleToggleReadingMode}
              className="btn-ai-gradient gap-2 shadow-lg"
              size="sm"
            >
              <X className="size-4" />
              {isAr ? 'خروج من وضع القراءة' : 'Exit Reading Mode'}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <article
        ref={articleRef}
        className={`container mx-auto px-4 py-6 transition-all duration-500 ${
          readingMode
            ? 'max-w-[680px] reading-mode-content'
            : 'max-w-4xl'
        } space-y-6`}
      >
        {/* ---- Breadcrumb ---- */}
        {!readingMode && (
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
        )}

        {/* ---- Back button ---- */}
        {!readingMode && (
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
        )}

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
          <h1
            className="text-2xl sm:text-3xl md:text-4xl font-extrabold leading-tight"
            style={{
              fontSize: readingMode ? `${fontSize + 8}px` : undefined,
            }}
          >
            {title}
            {isAr && article.titleAr === article.titleEn && (
              <Badge variant="outline" className="ms-3 text-[10px] px-2 py-0.5 align-middle border-muted-foreground/40 text-muted-foreground">
                غير مترجم
              </Badge>
            )}
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
            {/* Gradient border effect */}
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

          {/* Reading Mode Toggle */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={handleToggleReadingMode}
                className={`gap-2 ${
                  readingMode
                    ? 'border-ai-purple bg-ai-purple/10 text-ai-purple'
                    : 'border-ai-purple/30 hover:border-ai-purple/60 hover:bg-ai-purple/10'
                }`}
              >
                <BookOpenCheck className="size-4" />
                {readingMode
                  ? isAr ? 'وضع القراءة' : 'Reading Mode'
                  : isAr ? 'وضع القراءة' : 'Reading Mode'}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {readingMode
                ? isAr ? 'اضغط للخروج من وضع القراءة' : 'Click to exit reading mode'
                : isAr ? 'وضع خالي من الإلهاء للقراءة' : 'Distraction-free reading mode'}
            </TooltipContent>
          </Tooltip>

          <div className="flex-1" />

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5">
            {/* Bookmark */}
            <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBookmarkToggle}
                className={`size-9 ${bookmarked ? 'text-ai-purple' : ''}`}
                aria-label={isAr ? 'حفظ' : 'Bookmark'}
              >
                <Bookmark className={`size-4 ${bookmarked ? 'fill-ai-purple' : ''}`} />
              </Button>
            </motion.div>

            {/* Smart Share Popover */}
            <Popover>
              <PopoverTrigger asChild>
                <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-9"
                    aria-label={isAr ? 'مشاركة' : 'Share'}
                  >
                    <Share2 className="size-4" />
                  </Button>
                </motion.div>
              </PopoverTrigger>
              <PopoverContent
                className="w-64 p-3 space-y-2"
                align={isRTL ? 'start' : 'end'}
              >
                <p className="text-xs font-semibold text-muted-foreground mb-2">
                  {isAr ? 'مشاركة المقال' : 'Share Article'}
                </p>

                {/* Copy Link */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start gap-2.5 text-sm"
                  onClick={handleCopyLink}
                >
                  {copied ? (
                    <Check className="size-4 text-green-500" />
                  ) : (
                    <Copy className="size-4" />
                  )}
                  {copied
                    ? isAr ? 'تم النسخ!' : 'Copied!'
                    : isAr ? 'نسخ الرابط' : 'Copy Link'}
                </Button>

                {/* Share as Quote */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start gap-2.5 text-sm"
                  onClick={handleShareAsQuote}
                >
                  <Quote className="size-4" />
                  {isAr ? 'مشاركة كاقتباس' : 'Share as Quote'}
                </Button>

                <Separator className="my-1" />

                {/* Twitter/X */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start gap-2.5 text-sm"
                  onClick={handleShareTwitter}
                >
                  <Twitter className="size-4" />
                  {isAr ? 'مشاركة على X' : 'Share on X'}
                </Button>

                {/* WhatsApp */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start gap-2.5 text-sm"
                  onClick={handleShareWhatsApp}
                >
                  <MessageCircle className="size-4 text-green-500" />
                  {isAr ? 'مشاركة على واتساب' : 'Share on WhatsApp'}
                </Button>

                {/* LinkedIn */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start gap-2.5 text-sm"
                  onClick={handleShareLinkedIn}
                >
                  <Linkedin className="size-4 text-blue-600" />
                  {isAr ? 'مشاركة على لينكدإن' : 'Share on LinkedIn'}
                </Button>
              </PopoverContent>
            </Popover>

            {/* Print */}
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
          className={`prose max-w-none
            prose-headings:font-bold prose-headings:ai-text-gradient
            prose-strong:text-foreground
            prose-a:text-ai-purple prose-a:no-underline hover:prose-a:underline`}
          dir={isEnglishContent ? 'ltr' : (isRTL ? 'rtl' : 'ltr')}
          lang={isEnglishContent ? 'en' : (isRTL ? 'ar' : 'en')}
          style={{
            fontSize: readingMode ? `${fontSize}px` : undefined,
            lineHeight: readingMode ? 2 : undefined,
          }}
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
              <p key={i} className={`mb-4 ${readingMode ? 'leading-loose' : 'leading-relaxed text-foreground/90'}`}>
                {trimmed}
              </p>
            )
          })}
        </motion.section>

        <Separator />

        {/* ---- Comment Section ---- */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
          aria-label={isAr ? 'التعليقات' : 'Comments'}
          className="space-y-6"
        >
          {/* Section Header */}
          <div className="flex items-center gap-2">
            <MessageSquare className="size-5 text-ai-purple" />
            <h2 className="text-xl font-bold">
              {isAr ? 'التعليقات' : 'Comments'}
            </h2>
            <Badge variant="secondary" className="text-xs">
              {articleComments.length}
            </Badge>
          </div>

          {/* Add Comment Form */}
          <Card className="ai-card">
            <CardContent className="p-5 sm:p-6 space-y-4">
              <h3 className="font-semibold text-sm">
                {isAr ? 'أضف تعليقك' : 'Add your comment'}
              </h3>
              <div className="flex flex-col sm:flex-row gap-3">
                <Input
                  placeholder={isAr ? 'اسمك' : 'Your name'}
                  value={commentAuthor}
                  onChange={(e) => setCommentAuthor(e.target.value)}
                  className="sm:max-w-[200px]"
                />
              </div>
              <Textarea
                placeholder={isAr ? 'اكتب تعليقك هنا...' : 'Write your comment here...'}
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                className="min-h-[80px] resize-none"
              />
              <div className="flex justify-end">
                <Button
                  onClick={handleSubmitComment}
                  disabled={!commentContent.trim() || submittingComment}
                  className="btn-ai-gradient gap-2"
                  size="sm"
                >
                  <Send className="size-3.5" />
                  {isAr ? 'إرسال' : 'Submit'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* AI Summary of Opinions Card */}
          {articleComments.length > 0 && (
            <div className="relative rounded-xl overflow-hidden">
              {/* Gradient border */}
              <div className="absolute inset-0 rounded-xl">
                <div className="absolute inset-0 rounded-xl ai-gradient-animated opacity-50" />
              </div>
              <div className="relative m-[1px] rounded-[11px] bg-card">
                <div className="p-5 sm:p-6 space-y-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex items-center justify-center size-8 rounded-lg ai-gradient text-white shadow-md">
                      <Sparkles className="size-3.5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold">
                        {isAr ? 'ملخص الآراء بالذكاء الاصطناعي' : 'AI Summary of Opinions'}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {isAr ? 'تحليل تلقائي لأهم الآراء' : 'Automated analysis of key opinions'}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm text-foreground/90 leading-relaxed">
                    <div className="flex items-start gap-2">
                      <span className="mt-1.5 size-2 rounded-full bg-gradient-to-r from-ai-purple to-ai-cyan shrink-0" />
                      <span>
                        {isAr
                          ? 'معظم المعلقين يرون أن هذا التطور يمثل نقلة نوعية في مجال الذكاء الاصطناعي مع التركيز على الفوائد المحتملة.'
                          : 'Most commenters see this development as a significant leap in AI, focusing on potential benefits.'}
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="mt-1.5 size-2 rounded-full bg-gradient-to-r from-ai-blue to-ai-cyan shrink-0" />
                      <span>
                        {isAr
                          ? 'هناك اهتمام واضح بالتأثير على المنطقة العربية والدول الناشئة مع دعوات لمزيد من التفاصيل.'
                          : 'There is clear interest in the impact on the Arab region and emerging markets, with calls for more details.'}
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="mt-1.5 size-2 rounded-full bg-gradient-to-r from-ai-indigo to-ai-blue shrink-0" />
                      <span>
                        {isAr
                          ? 'بعض المعلقين من المجتمع الأكاديمي يؤكدون على أهمية الأسئلة الأخلاقية المترتبة على هذه التطورات.'
                          : 'Some academic commenters emphasize the importance of ethical questions arising from these developments.'}
                      </span>
                    </div>
                  </div>
                  <Badge variant="secondary" className="gap-1 text-[10px]">
                    <Sparkles className="size-2.5 text-ai-purple" />
                    {isAr ? 'تحليل تجريبي' : 'Experimental analysis'}
                  </Badge>
                </div>
              </div>
            </div>
          )}

          {/* Comments List */}
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {articleComments.length > 0 ? (
              articleComments.map((comment, i) => (
                <motion.div
                  key={comment.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                >
                  <Card className="ai-card">
                    <CardContent className="p-4 sm:p-5">
                      <div className="flex items-start gap-3">
                        <Avatar className="size-9 shrink-0">
                          <AvatarFallback className="bg-gradient-to-br from-ai-purple/20 to-ai-cyan/20 text-xs font-bold text-ai-purple">
                            {comment.authorName.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0 space-y-1.5">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-semibold text-sm truncate">
                              {comment.authorName}
                            </span>
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                              {formatDate(comment.createdAt, language)}
                            </span>
                          </div>
                          <p className="text-sm text-foreground/90 leading-relaxed">
                            {comment.content}
                          </p>
                          {/* Like/Unlike */}
                          <button
                            onClick={() => toggleCommentLike(comment.id)}
                            className={`inline-flex items-center gap-1 text-xs transition-colors ${
                              comment.liked
                                ? 'text-ai-purple font-semibold'
                                : 'text-muted-foreground hover:text-ai-purple'
                            }`}
                          >
                            <ThumbsUp className={`size-3 ${comment.liked ? 'fill-ai-purple' : ''}`} />
                            {comment.likes > 0 && <span>{comment.likes}</span>}
                          </button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            ) : (
              <Card className="ai-card">
                <CardContent className="p-6 text-center">
                  <MessageSquare className="size-8 mx-auto text-muted-foreground/50 mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {isAr ? 'لا توجد تعليقات بعد. كن أول من يعلق!' : 'No comments yet. Be the first to comment!'}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
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
        {!readingMode && (
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
        )}
      </article>

      {/* ---- Reading Mode Styles (injected via className logic) ---- */}
      <style jsx global>{`
        .reading-mode-active {
          background-color: var(--reading-mode-bg, #faf6f0);
        }
        .dark .reading-mode-active {
          background-color: var(--reading-mode-bg-dark, #12121f);
        }
        .reading-mode-content {
          padding-top: 2rem;
          padding-bottom: 4rem;
        }
        .reading-mode-content p {
          line-height: 2 !important;
        }
      `}</style>
    </div>
  )
}
