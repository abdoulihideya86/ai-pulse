'use client'

import {
  useAppStore,
  useLanguage,
  useIsRTL,
  useBookmarkedIds,
  useReadingMode,
  useNotifications,
  usePushNotificationsEnabled,
} from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import { motion } from 'framer-motion'
import {
  BookOpen,
  Bookmark,
  Hash,
  Clock,
  TrendingUp,
  TrendingDown,
  Calendar,
  Star,
  Sparkles,
  Eye,
  Bell,
  BellRing,
  BellOff,
  Newspaper,
  RefreshCw,
  Loader2,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { useState, useEffect, useMemo, useCallback } from 'react'

const CHART_COLORS = ['#8b5cf6', '#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#6366f1']

// Article type for fetched data
interface ArticleData {
  id: string
  titleAr: string
  titleEn: string
  summaryAr: string
  summaryEn: string
  category: string
  views: number
  isBreaking: boolean
  isTrending: boolean
  publishedAt: string
  source: {
    id: string
    name: string
    url: string
    reliabilityScore: number
  }
}

interface StatsData {
  totalArticles: number
  totalSources: number
  totalViews: number
  breakingCount: number
  categoryCounts: Record<string, number>
  lastUpdated: string
}

interface AnalyticsData {
  categoryDistribution: Array<{ category: string; count: number }>
  articlesPerDay: Array<{ date: string; count: number }>
  topSources: Array<{ id: string; name: string; reliabilityScore: number; articleCount: number }>
  trendingTopics: Array<{ tag: string; count: number }>
  totalArticles: number
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

// Category display names
const categoryNames: Record<string, { ar: string; en: string }> = {
  'general-ai': { ar: 'الذكاء الاصطناعي العام', en: 'General AI' },
  'computer-vision': { ar: 'الرؤية الحاسوبية', en: 'Computer Vision' },
  'robotics': { ar: 'الروبوتات', en: 'Robotics' },
  'ai-ethics': { ar: 'أخلاقيات الذكاء الاصطناعي', en: 'AI Ethics' },
  'nlp': { ar: 'معالجة اللغات الطبيعية', en: 'Natural Language Processing' },
  'machine-learning': { ar: 'تعلم الآلة', en: 'Machine Learning' },
  'generative-ai': { ar: 'الذكاء الاصطناعي التوليدي', en: 'Generative AI' },
  'ai-policy': { ar: 'سياسات وتنظيمات الذكاء الاصطناعي', en: 'AI Policy & Regulation' },
}

function DashboardSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-5 w-40" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-48 rounded-xl" />
      <Skeleton className="h-64 rounded-xl" />
      <Skeleton className="h-64 rounded-xl" />
    </div>
  )
}

export function DashboardPage() {
  const language = useLanguage()
  const isRTL = useIsRTL()
  const { selectArticle, setReadingMode, setPushNotificationsEnabled } = useAppStore()
  const bookmarkedIds = useBookmarkedIds()
  const readingMode = useReadingMode()
  const notifications = useNotifications()
  const pushNotificationsEnabled = usePushNotificationsEnabled()

  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<StatsData | null>(null)
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [trendingArticles, setTrendingArticles] = useState<ArticleData[]>([])
  const [refreshing, setRefreshing] = useState(false)

  // Fetch all real data
  const fetchDashboardData = useCallback(async () => {
    try {
      const [statsRes, analyticsRes, trendingRes] = await Promise.allSettled([
        fetch('/api/stats'),
        fetch('/api/analytics/trends'),
        fetch('/api/news/trending?lang=' + language),
      ])

      if (statsRes.status === 'fulfilled' && statsRes.value.ok) {
        const data = await statsRes.value.json()
        setStats(data)
      }

      if (analyticsRes.status === 'fulfilled' && analyticsRes.value.ok) {
        const data = await analyticsRes.value.json()
        setAnalytics(data)
      }

      if (trendingRes.status === 'fulfilled' && trendingRes.value.ok) {
        const data = await trendingRes.value.json()
        setTrendingArticles(data.articles || [])
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [language])

  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  const handleRefresh = useCallback(() => {
    setRefreshing(true)
    fetchDashboardData()
  }, [fetchDashboardData])

  // Derived values
  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  )

  if (loading) return <DashboardSkeleton />

  const today = new Date()
  const dateStr = isRTL
    ? today.toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    : today.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

  // Real stats from API
  const totalArticles = stats?.totalArticles || 0
  const totalSources = stats?.totalSources || 0
  const breakingCount = stats?.breakingCount || 0

  // Real category distribution
  const categoryInterests = useMemo(() => {
    if (!stats?.categoryCounts) return []
    return Object.entries(stats.categoryCounts)
      .map(([slug, count]) => ({
        slug,
        nameAr: categoryNames[slug]?.ar || slug,
        nameEn: categoryNames[slug]?.en || slug,
        count,
        color: CHART_COLORS[Object.keys(stats.categoryCounts).indexOf(slug) % CHART_COLORS.length],
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8)
  }, [stats?.categoryCounts])

  // Real articles per day for chart
  const readingActivity = useMemo(() => {
    if (!analytics?.articlesPerDay) {
      // Generate empty days
      const days: Array<{ day: string; dayEn: string; articles: number }> = []
      const dayNamesAr = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']
      const dayNamesEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
      for (let i = 6; i >= 0; i--) {
        const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
        days.push({
          day: dayNamesAr[date.getDay()],
          dayEn: dayNamesEn[date.getDay()],
          articles: 0,
        })
      }
      return days
    }

    // Take last 7 days from analytics
    const last7 = analytics.articlesPerDay.slice(-7)
    const dayNamesAr = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']
    const dayNamesEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

    return last7.map(d => {
      const date = new Date(d.date)
      return {
        day: dayNamesAr[date.getDay()],
        dayEn: dayNamesEn[date.getDay()],
        articles: d.count,
      }
    })
  }, [analytics?.articlesPerDay])

  // Real recommended articles (from trending)
  const recommendedArticles = trendingArticles.slice(0, 5)

  // Get bookmarked articles from the store (real bookmarks)
  const bookmarkedArticles = useMemo(() => {
    return trendingArticles.filter(a => bookmarkedIds.includes(a.id)).slice(0, 5)
  }, [trendingArticles, bookmarkedIds])

  const statsCards = [
    {
      icon: <Newspaper className="size-5" />,
      value: String(totalArticles),
      labelAr: 'مقال متاح',
      labelEn: 'Articles Available',
      gradient: 'from-ai-purple to-ai-blue',
    },
    {
      icon: <Bookmark className="size-5" />,
      value: String(bookmarkedIds.length),
      labelAr: 'إشارات مرجعية',
      labelEn: 'Bookmarks',
      gradient: 'from-ai-blue to-ai-cyan',
    },
    {
      icon: <Hash className="size-5" />,
      value: String(categoryInterests.length),
      labelAr: 'فئات نشطة',
      labelEn: 'Active Categories',
      gradient: 'from-ai-cyan to-ai-teal',
    },
    {
      icon: <Eye className="size-5" />,
      value: String(totalSources),
      labelAr: 'مصدر أخبار',
      labelEn: 'News Sources',
      gradient: 'from-ai-pink to-ai-purple',
    },
    {
      icon: <BookOpen className="size-5" />,
      value: String(breakingCount),
      labelAr: 'أخبار عاجلة',
      labelEn: 'Breaking News',
      gradient: 'from-red-500 to-orange-500',
    },
    {
      icon: readingMode
        ? <BookOpen className="size-5" />
        : <BookOpen className="size-5" />,
      value: readingMode
        ? isRTL ? 'مفعّل' : 'On'
        : isRTL ? 'معطّل' : 'Off',
      labelAr: 'وضع القراءة',
      labelEn: 'Reading Mode',
      toggle: true,
      toggleValue: readingMode,
      onToggle: (checked: boolean) => setReadingMode(checked),
      gradient: 'from-emerald-500 to-teal-500',
    },
  ]

  const maxCategoryCount = categoryInterests.length > 0 ? categoryInterests[0].count : 1

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="container mx-auto px-4 py-8 space-y-8"
    >
      {/* Welcome Header */}
      <motion.div variants={item} className="space-y-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center size-12 rounded-xl bg-gradient-to-br from-ai-purple to-ai-cyan text-white shadow-lg">
              <Sparkles className="size-6" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">
                {isRTL ? 'لوحة التحكم' : 'Dashboard'}
              </h1>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="size-4" />
                <span className="text-sm">{dateStr}</span>
              </div>
            </div>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors text-sm font-medium"
          >
            <RefreshCw className={`size-4 ${refreshing ? 'animate-spin' : ''}`} />
            {isRTL ? 'تحديث' : 'Refresh'}
          </button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statsCards.map((stat, i) => (
          <motion.div key={i} variants={item}>
            <Card className="ai-card group h-full">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div
                    className={`inline-flex items-center justify-center size-10 rounded-xl bg-gradient-to-br ${stat.gradient} text-white shadow-md relative`}
                  >
                    {stat.icon}
                  </div>
                  {stat.toggle ? (
                    <Switch
                      checked={stat.toggleValue}
                      onCheckedChange={stat.onToggle}
                      className="scale-90"
                    />
                  ) : null}
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {refreshing ? <Loader2 className="size-5 animate-spin" /> : stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {isRTL ? stat.labelAr : stat.labelEn}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Push Notifications Status Bar */}
      <motion.div variants={item}>
        <Card className="ai-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {pushNotificationsEnabled ? (
                  <div className="flex items-center justify-center size-9 rounded-lg bg-emerald-500/15 text-emerald-500">
                    <BellRing className="size-5" />
                  </div>
                ) : (
                  <div className="flex items-center justify-center size-9 rounded-lg bg-muted text-muted-foreground">
                    <BellOff className="size-5" />
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium">
                    {isRTL ? 'إشعارات الدفع' : 'Push Notifications'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {pushNotificationsEnabled
                      ? isRTL
                        ? 'مفعّلة — ستتلقى إشعارات فورية بالأخبار المهمة'
                        : 'Enabled — You\'ll receive instant notifications for important news'
                      : isRTL
                        ? 'معطّلة — فعّلها لتلقي إشعارات فورية بالأخبار المهمة'
                        : 'Disabled — Enable to receive instant notifications for important news'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge
                  variant={pushNotificationsEnabled ? 'default' : 'secondary'}
                  className={
                    pushNotificationsEnabled
                      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 border-emerald-500/20'
                      : ''
                  }
                >
                  {pushNotificationsEnabled
                    ? isRTL ? 'مفعّل' : 'Active'
                    : isRTL ? 'معطّل' : 'Inactive'}
                </Badge>
                <Switch
                  checked={pushNotificationsEnabled}
                  onCheckedChange={setPushNotificationsEnabled}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Your Interests - Based on real category distribution */}
      <motion.div variants={item}>
        <Card className="ai-card">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Star className="size-5 text-ai-purple" />
              {isRTL ? 'توزيع الأخبار حسب الفئة' : 'News by Category'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {categoryInterests.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Newspaper className="size-10 text-muted-foreground/30 mb-3" />
                <p className="text-sm text-muted-foreground">
                  {isRTL ? 'لا توجد بيانات بعد — قم بتحديث الصفحة' : 'No data yet — refresh the page'}
                </p>
              </div>
            ) : (
              <>
                <div className="flex flex-wrap gap-2">
                  {categoryInterests.map((interest) => (
                    <Badge
                      key={interest.slug}
                      variant="secondary"
                      className="px-3 py-1.5 text-sm gap-2 border border-border/50 hover:border-primary/30 transition-colors cursor-default"
                      style={{ borderColor: `${interest.color}30` }}
                    >
                      <span
                        className="size-2 rounded-full shrink-0"
                        style={{ backgroundColor: interest.color }}
                      />
                      {isRTL ? interest.nameAr : interest.nameEn}
                      <span className="text-xs text-muted-foreground">({interest.count})</span>
                    </Badge>
                  ))}
                </div>
                <div className="space-y-3">
                  {categoryInterests.map((interest) => {
                    const percentage = Math.round((interest.count / maxCategoryCount) * 100)
                    return (
                      <div key={interest.slug} className="space-y-1.5">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">
                            {isRTL ? interest.nameAr : interest.nameEn}
                          </span>
                          <span className="text-muted-foreground">{interest.count} {isRTL ? 'مقال' : 'articles'}</span>
                        </div>
                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="h-full rounded-full"
                            style={{
                              background: `linear-gradient(90deg, ${interest.color}, ${interest.color}88)`,
                            }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Articles Activity Chart - Based on real data */}
      <motion.div variants={item}>
        <Card className="ai-card">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <BookOpen className="size-5 text-ai-blue" />
              {isRTL ? 'المقالات المتاحة' : 'Articles Available'}
              <span className="text-sm font-normal text-muted-foreground">
                {isRTL ? '(آخر 7 أيام)' : '(Last 7 days)'}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {readingActivity.every(d => d.articles === 0) ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <Newspaper className="size-10 text-muted-foreground/30 mb-3" />
                  <p className="text-sm text-muted-foreground">
                    {isRTL ? 'في انتظار البيانات — ستظهر المقالات هنا عند جلبها' : 'Waiting for data — articles will appear here when fetched'}
                  </p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={readingActivity} barCategoryGap="20%">
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis
                      dataKey={isRTL ? 'day' : 'dayEn'}
                      tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                      axisLine={{ stroke: 'var(--border)' }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                      width={30}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--card)',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                      }}
                      labelStyle={{ color: 'var(--foreground)', fontWeight: 'bold' }}
                      itemStyle={{ color: 'var(--foreground)' }}
                    />
                    <Bar dataKey="articles" radius={[6, 6, 0, 0]} maxBarSize={40}>
                      {readingActivity.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Bottom Grid: Bookmarks + Recommended */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bookmarked Articles - Real from store */}
        <motion.div variants={item}>
          <Card className="ai-card h-full">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Bookmark className="size-5 text-ai-cyan" />
                {isRTL ? 'المقالات المحفوظة' : 'Bookmarked Articles'}
                <Badge variant="secondary" className="text-xs px-2 py-0.5">
                  {bookmarkedIds.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {bookmarkedArticles.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Bookmark className="size-10 text-muted-foreground/30 mb-3" />
                  <p className="text-sm text-muted-foreground">
                    {isRTL ? 'لم تقم بحفظ أي مقالات بعد' : 'No bookmarked articles yet'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {isRTL ? 'اضغط على أيقونة الحفظ في أي مقال لإضافته هنا' : 'Click the bookmark icon on any article to add it here'}
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {bookmarkedArticles.map((article) => (
                    <motion.div
                      key={article.id}
                      whileHover={{ x: isRTL ? -4 : 4 }}
                      className="group flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => selectArticle(article.id)}
                    >
                      <div className="flex items-center justify-center size-8 rounded-lg bg-gradient-to-br from-ai-cyan/20 to-ai-blue/20 text-ai-cyan shrink-0 mt-0.5">
                        <Bookmark className="size-4" />
                      </div>
                      <div className="flex-1 min-w-0 space-y-1">
                        <h4 className="text-sm font-medium leading-relaxed line-clamp-2 group-hover:text-primary transition-colors">
                          {isRTL ? article.titleAr : article.titleEn}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                            {categoryNames[article.category]?.[isRTL ? 'ar' : 'en'] || article.category}
                          </Badge>
                          <span>{article.source?.name || ''}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Recommended For You - Real trending articles */}
        <motion.div variants={item}>
          <Card className="ai-card h-full">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Sparkles className="size-5 text-ai-purple" />
                {isRTL ? 'موصى لك' : 'Recommended For You'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recommendedArticles.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Sparkles className="size-10 text-muted-foreground/30 mb-3" />
                  <p className="text-sm text-muted-foreground">
                    {isRTL ? 'جارٍ تحميل التوصيات...' : 'Loading recommendations...'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {isRTL ? 'ستظهر المقالات الرائجة هنا تلقائياً' : 'Trending articles will appear here automatically'}
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {recommendedArticles.map((article, i) => (
                    <motion.div
                      key={article.id}
                      whileHover={{ x: isRTL ? -4 : 4 }}
                      className="group flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => selectArticle(article.id)}
                    >
                      <div
                        className="flex items-center justify-center size-8 rounded-lg text-white shrink-0 mt-0.5 text-xs font-bold"
                        style={{ background: CHART_COLORS[i % CHART_COLORS.length] }}
                      >
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0 space-y-1">
                        <h4 className="text-sm font-medium leading-relaxed line-clamp-2 group-hover:text-primary transition-colors">
                          {isRTL ? article.titleAr : article.titleEn}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                            {categoryNames[article.category]?.[isRTL ? 'ar' : 'en'] || article.category}
                          </Badge>
                          <span>{article.source?.name || ''}</span>
                          {article.isTrending && (
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 text-orange-500">
                              {isRTL ? 'رائج' : 'Trending'}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  )
}
