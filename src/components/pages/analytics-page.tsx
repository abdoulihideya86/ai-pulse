'use client'

import { useLanguage, useIsRTL } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import {
  TrendingUp,
  PieChart as PieChartIcon,
  Building2,
  Cloud,
  BarChart3,
  RefreshCw,
  Loader2,
  Newspaper,
} from 'lucide-react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { useState, useEffect, useCallback } from 'react'

const CHART_COLORS = ['#8b5cf6', '#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#6366f1']

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

interface AnalyticsData {
  categoryDistribution: Array<{ category: string; count: number }>
  articlesPerDay: Array<{ date: string; count: number }>
  topSources: Array<{ id: string; name: string; reliabilityScore: number; logo: string; articleCount: number }>
  trendingTopics: Array<{ tag: string; count: number }>
  totalArticles: number
  period: string
}

interface StatsData {
  totalArticles: number
  totalSources: number
  totalViews: number
  breakingCount: number
  categoryCounts: Record<string, number>
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

function AnalyticsSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-5 w-48" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-72 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-72 rounded-xl" />
    </div>
  )
}

// Custom tooltip component for consistency
function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="border border-border/50 bg-card rounded-lg px-3 py-2 shadow-xl text-xs">
      <p className="font-semibold text-foreground mb-1">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="size-2 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
          <span className="text-muted-foreground">{p.name}:</span>
          <span className="font-medium text-foreground">{p.value.toLocaleString()}</span>
        </div>
      ))}
    </div>
  )
}

function EmptyChartMessage({ isRTL }: { isRTL: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center py-8">
      <Newspaper className="size-10 text-muted-foreground/30 mb-3" />
      <p className="text-sm text-muted-foreground">
        {isRTL ? 'في انتظار البيانات — ستظهر الرسوم البيانية عند جلب الأخبار' : 'Waiting for data — charts will appear when news is fetched'}
      </p>
    </div>
  )
}

export function AnalyticsPage() {
  const language = useLanguage()
  const isRTL = useIsRTL()
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [stats, setStats] = useState<StatsData | null>(null)

  const fetchData = useCallback(async () => {
    try {
      const [analyticsRes, statsRes] = await Promise.allSettled([
        fetch('/api/analytics/trends'),
        fetch('/api/stats'),
      ])

      if (analyticsRes.status === 'fulfilled' && analyticsRes.value.ok) {
        const data = await analyticsRes.value.json()
        setAnalytics(data)
      }

      if (statsRes.status === 'fulfilled' && statsRes.value.ok) {
        const data = await statsRes.value.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleRefresh = useCallback(() => {
    setRefreshing(true)
    fetchData()
  }, [fetchData])

  // Prepare real data for charts
  const categoryDistribution = analytics?.categoryDistribution || []

  const pieChartData = categoryDistribution.map((cat, i) => ({
    name: categoryNames[cat.category]?.en || cat.category,
    nameAr: categoryNames[cat.category]?.ar || cat.category,
    value: cat.count,
    color: CHART_COLORS[i % CHART_COLORS.length],
  }))

  const articlesPerDayData = (analytics?.articlesPerDay || []).map(d => ({
    ...d,
    day: d.date.split('T')[0]?.slice(5) || d.date, // MM-DD format
  }))

  const topSourcesData = (analytics?.topSources || []).slice(0, 8)

  const trendingTopicsData = (analytics?.trendingTopics || []).slice(0, 16)

  if (loading) return <AnalyticsSkeleton />

  // Quick stats from real data
  const totalArticles = stats?.totalArticles || analytics?.totalArticles || 0
  const totalSources = stats?.totalSources || topSourcesData.length
  const hasData = totalArticles > 0

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="container mx-auto px-4 py-8 space-y-8"
    >
      {/* Page Header */}
      <motion.div variants={item} className="space-y-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center size-12 rounded-xl bg-gradient-to-br from-ai-blue to-ai-cyan text-white shadow-lg">
              <BarChart3 className="size-6" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">
                {isRTL ? 'التحليلات والاتجاهات' : 'Analytics & Trends'}
              </h1>
              <p className="text-sm text-muted-foreground">
                {isRTL
                  ? 'رؤى معمقة حول مشهد الذكاء الاصطناعي العالمي'
                  : 'Deep insights into the global AI landscape'}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="gap-2"
          >
            <RefreshCw className={`size-4 ${refreshing ? 'animate-spin' : ''}`} />
            {isRTL ? 'تحديث' : 'Refresh'}
          </Button>
        </div>
      </motion.div>

      {/* Quick Stats Row - REAL DATA */}
      <motion.div variants={item}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { labelAr: 'إجمالي المقالات', labelEn: 'Total Articles', value: String(totalArticles), icon: <TrendingUp className="size-4" />, color: 'text-ai-purple' },
            { labelAr: 'مصادر نشطة', labelEn: 'Active Sources', value: String(totalSources), icon: <Building2 className="size-4" />, color: 'text-ai-blue' },
            { labelAr: 'فئات مغطاة', labelEn: 'Categories Covered', value: String(categoryDistribution.length), icon: <PieChartIcon className="size-4" />, color: 'text-emerald-500' },
            { labelAr: 'مواضيع رائجة', labelEn: 'Trending Topics', value: String(trendingTopicsData.length), icon: <Cloud className="size-4" />, color: 'text-ai-cyan' },
          ].map((stat, i) => (
            <Card key={i} className="ai-card">
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`${stat.color}`}>
                  {refreshing ? <Loader2 className="size-4 animate-spin" /> : stat.icon}
                </div>
                <div>
                  <div className="text-xl font-bold">{stat.value}</div>
                  <div className="text-xs text-muted-foreground">
                    {isRTL ? stat.labelAr : stat.labelEn}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.div>

      {/* Row 1: Articles Per Day + Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Articles Per Day — Line Chart */}
        <motion.div variants={item}>
          <Card className="ai-card h-full">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="size-5 text-ai-purple" />
                {isRTL ? 'المقالات حسب اليوم' : 'Articles Per Day'}
              </CardTitle>
              <CardDescription>
                {isRTL ? 'عدد المقالات المتاحة لكل يوم' : 'Number of available articles per day'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                {articlesPerDayData.length === 0 || articlesPerDayData.every(d => d.count === 0) ? (
                  <EmptyChartMessage isRTL={isRTL} />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={articlesPerDayData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                      <XAxis
                        dataKey="day"
                        tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
                        axisLine={{ stroke: 'var(--border)' }}
                        tickLine={false}
                        interval={4}
                      />
                      <YAxis
                        tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                        width={35}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend
                        wrapperStyle={{ fontSize: 12 }}
                        iconType="circle"
                        iconSize={8}
                      />
                      <Line
                        type="monotone"
                        dataKey="count"
                        name={isRTL ? 'المقالات' : 'Articles'}
                        stroke="#8b5cf6"
                        strokeWidth={2.5}
                        dot={false}
                        activeDot={{ r: 5, strokeWidth: 0 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Category Distribution — Pie/Donut Chart */}
        <motion.div variants={item}>
          <Card className="ai-card h-full">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <PieChartIcon className="size-5 text-ai-blue" />
                {isRTL ? 'توزيع الفئات' : 'Category Distribution'}
              </CardTitle>
              <CardDescription>
                {isRTL ? 'توزيع الأخبار حسب الفئة' : 'News distribution by category'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-72 flex items-center">
                {pieChartData.length === 0 ? (
                  <EmptyChartMessage isRTL={isRTL} />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={90}
                        paddingAngle={3}
                        dataKey="value"
                        nameKey={isRTL ? 'nameAr' : 'name'}
                        stroke="none"
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'var(--card)',
                          border: '1px solid var(--border)',
                          borderRadius: '8px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        }}
                        formatter={(value: number, name: string) => [`${value}`, name]}
                      />
                      <Legend
                        layout="vertical"
                        align={isRTL ? 'right' : 'right'}
                        verticalAlign="middle"
                        iconType="circle"
                        iconSize={8}
                        wrapperStyle={{ fontSize: 11, paddingLeft: '8px' }}
                        formatter={(value: string) => (
                          <span className="text-muted-foreground text-xs">{value}</span>
                        )}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Row 2: Top Sources + Trending Topics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Sources — Horizontal Bar Chart */}
        <motion.div variants={item}>
          <Card className="ai-card h-full">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Building2 className="size-5 text-ai-teal" />
                {isRTL ? 'أفضل المصادر' : 'Top Sources'}
              </CardTitle>
              <CardDescription>
                {isRTL ? 'ترتيب حسب عدد المقالات والموثوقية' : 'Ranked by article count and reliability'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                {topSourcesData.length === 0 ? (
                  <EmptyChartMessage isRTL={isRTL} />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={topSourcesData}
                      layout="vertical"
                      margin={{ left: 10, right: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                      <XAxis
                        type="number"
                        tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        type="category"
                        dataKey="name"
                        tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                        width={100}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend
                        wrapperStyle={{ fontSize: 12 }}
                        iconType="circle"
                        iconSize={8}
                      />
                      <Bar
                        dataKey="articleCount"
                        name={isRTL ? 'المقالات' : 'Articles'}
                        fill="#8b5cf6"
                        radius={[0, 4, 4, 0]}
                        maxBarSize={16}
                      />
                      <Bar
                        dataKey="reliabilityScore"
                        name={isRTL ? 'الموثوقية' : 'Reliability'}
                        fill="#06b6d4"
                        radius={[0, 4, 4, 0]}
                        maxBarSize={16}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Trending Topics — Word Cloud */}
        <motion.div variants={item}>
          <Card className="ai-card h-full">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Cloud className="size-5 text-ai-pink" />
                {isRTL ? 'المواضيع الرائجة' : 'Trending Topics'}
              </CardTitle>
              <CardDescription>
                {isRTL ? 'أكثر المواضيع تداولاً في الأخبار الحالية' : 'Most discussed topics in current news'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                {trendingTopicsData.length === 0 ? (
                  <EmptyChartMessage isRTL={isRTL} />
                ) : (
                  <div className="h-full flex flex-wrap items-center justify-center gap-2 p-2">
                    {trendingTopicsData.map((topic, i) => {
                      const maxCount = trendingTopicsData[0]?.count || 1
                      const weight = (topic.count / maxCount) * 100
                      const minSize = 12
                      const maxSize = 32
                      const size = minSize + (weight / 100) * (maxSize - minSize)
                      const color = CHART_COLORS[i % CHART_COLORS.length]
                      return (
                        <motion.span
                          key={topic.tag}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.3, delay: i * 0.03 }}
                          whileHover={{ scale: 1.15 }}
                          className="cursor-default font-semibold transition-colors hover:underline"
                          style={{
                            fontSize: `${size}px`,
                            color,
                            lineHeight: 1.3,
                          }}
                        >
                          {topic.tag}
                        </motion.span>
                      )
                    })}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* No Data Message */}
      {!hasData && (
        <motion.div variants={item}>
          <Card className="ai-card">
            <CardContent className="p-8 text-center">
              <Newspaper className="size-12 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-lg font-bold mb-2">
                {isRTL ? 'لا توجد بيانات متاحة حالياً' : 'No data available yet'}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {isRTL
                  ? 'يتم جلب الأخبار تلقائياً كل 15 دقيقة. اضغط على زر التحديث لجلب البيانات الآن.'
                  : 'News is fetched automatically every 15 minutes. Click refresh to fetch data now.'}
              </p>
              <Button onClick={handleRefresh} disabled={refreshing} className="btn-ai-gradient gap-2">
                <RefreshCw className={`size-4 ${refreshing ? 'animate-spin' : ''}`} />
                {isRTL ? 'تحديث الآن' : 'Refresh Now'}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  )
}
