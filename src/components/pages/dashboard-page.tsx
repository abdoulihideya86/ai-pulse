'use client'

import { useAppStore, useLanguage, useIsRTL } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
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
  ArrowLeft,
  ArrowRight,
  Sparkles,
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
import { useState, useEffect } from 'react'

const CHART_COLORS = ['#8b5cf6', '#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#6366f1']

// Mock data
const READING_ACTIVITY = [
  { day: 'السبت', dayEn: 'Sat', articles: 5 },
  { day: 'الأحد', dayEn: 'Sun', articles: 8 },
  { day: 'الاثنين', dayEn: 'Mon', articles: 12 },
  { day: 'الثلاثاء', dayEn: 'Tue', articles: 7 },
  { day: 'الأربعاء', dayEn: 'Wed', articles: 10 },
  { day: 'الخميس', dayEn: 'Thu', articles: 3 },
  { day: 'الجمعة', dayEn: 'Fri', articles: 6 },
]

const USER_INTERESTS = [
  { id: '1', nameAr: 'النماذج اللغوية', nameEn: 'LLMs', weight: 92, color: '#8b5cf6' },
  { id: '2', nameAr: 'الرؤية الحاسوبية', nameEn: 'Computer Vision', weight: 78, color: '#3b82f6' },
  { id: '3', nameAr: 'الذكاء الاصطناعي في الطب', nameEn: 'AI in Healthcare', weight: 65, color: '#06b6d4' },
  { id: '4', nameAr: 'الروبوتات', nameEn: 'Robotics', weight: 45, color: '#10b981' },
  { id: '5', nameAr: 'أخبار الشركات', nameEn: 'Company News', weight: 38, color: '#f59e0b' },
]

const BOOKMARKED_ARTICLES = [
  {
    id: '1',
    titleAr: 'GPT-5 يحقق أداءً مذهلاً في اختبارات التفكير المنطقي',
    titleEn: 'GPT-5 Achieves Stunning Performance on Reasoning Benchmarks',
    categoryAr: 'نماذج لغوية',
    categoryEn: 'LLMs',
    date: '2025-03-04',
  },
  {
    id: '2',
    titleAr: 'أبل تستثمر 500 مليار دولار في البنية التحتية للذكاء الاصطناعي',
    titleEn: 'Apple Invests $500B in AI Infrastructure',
    categoryAr: 'أخبار الشركات',
    categoryEn: 'Company News',
    date: '2025-03-03',
  },
  {
    id: '3',
    titleAr: 'نموذج جديد يكشف السرطان بدقة 99% من صور الأشعة',
    titleEn: 'New Model Detects Cancer with 99% Accuracy from X-ray Images',
    categoryAr: 'الذكاء الاصطناعي في الطب',
    categoryEn: 'AI in Healthcare',
    date: '2025-03-02',
  },
  {
    id: '4',
    titleAr: 'روبوتات المستقبل: كيف يغير الذكاء الاصطناعي التصنيع',
    titleEn: 'Robots of the Future: How AI is Changing Manufacturing',
    categoryAr: 'الروبوتات',
    categoryEn: 'Robotics',
    date: '2025-03-01',
  },
]

const RECOMMENDED_ARTICLES = [
  {
    id: '1',
    titleAr: 'Claude 4 يتفوق على البشر في اختبارات البرمجة',
    titleEn: 'Claude 4 Surpasses Humans in Coding Tests',
    categoryAr: 'نماذج لغوية',
    categoryEn: 'LLMs',
    sourceAr: 'تيك كرانش',
    sourceEn: 'TechCrunch',
    timeAr: 'منذ ساعة',
    timeEn: '1 hour ago',
  },
  {
    id: '2',
    titleAr: 'رؤية حاسوبية جديدة تحلل الفيديو في الوقت الفعلي',
    titleEn: 'New Computer Vision Analyzes Video in Real-Time',
    categoryAr: 'الرؤية الحاسوبية',
    categoryEn: 'Computer Vision',
    sourceAr: 'ذا فيرج',
    sourceEn: 'The Verge',
    timeAr: 'منذ 3 ساعات',
    timeEn: '3 hours ago',
  },
  {
    id: '3',
    titleAr: 'ذكاء اصطناعي يكتشف أمراض القلب من تخطيط الصوت',
    titleEn: 'AI Detects Heart Disease from Phonocardiogram',
    categoryAr: 'الذكاء الاصطناعي في الطب',
    categoryEn: 'AI in Healthcare',
    sourceAr: 'نيتشر',
    sourceEn: 'Nature',
    timeAr: 'منذ 5 ساعات',
    timeEn: '5 hours ago',
  },
  {
    id: '4',
    titleAr: 'جيل جديد من الروبوتات الإنسانية يعمل في المستشفيات',
    titleEn: 'New Generation of Humanoid Robots Works in Hospitals',
    categoryAr: 'الروبوتات',
    categoryEn: 'Robotics',
    sourceAr: 'وايرد',
    sourceEn: 'Wired',
    timeAr: 'منذ 8 ساعات',
    timeEn: '8 hours ago',
  },
  {
    id: '5',
    titleAr: 'مايكروسوفت تطلق مشروعاً ضخماً للنماذج اللغوية المفتوحة',
    titleEn: 'Microsoft Launches Major Open LLM Initiative',
    categoryAr: 'نماذج لغوية',
    categoryEn: 'LLMs',
    sourceAr: 'ريكود',
    sourceEn: 'Recode',
    timeAr: 'منذ 10 ساعات',
    timeEn: '10 hours ago',
  },
]

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

function DashboardSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-5 w-40" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
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
  const { selectArticle } = useAppStore()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800)
    return () => clearTimeout(timer)
  }, [])

  if (loading) return <DashboardSkeleton />

  const today = new Date()
  const dateStr = isRTL
    ? today.toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    : today.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight

  const stats = [
    {
      icon: <BookOpen className="size-5" />,
      value: '47',
      labelAr: 'مقالات مقروءة',
      labelEn: 'Articles Read',
      trend: 12,
      trendUp: true,
      gradient: 'from-ai-purple to-ai-blue',
    },
    {
      icon: <Bookmark className="size-5" />,
      value: '12',
      labelAr: 'إشارات مرجعية',
      labelEn: 'Bookmarks',
      trend: 3,
      trendUp: true,
      gradient: 'from-ai-blue to-ai-cyan',
    },
    {
      icon: <Hash className="size-5" />,
      value: '5',
      labelAr: 'مواضيع متابعة',
      labelEn: 'Topics Followed',
      trend: 1,
      trendUp: true,
      gradient: 'from-ai-cyan to-ai-teal',
    },
    {
      icon: <Clock className="size-5" />,
      value: isRTL ? '3.5' : '3.5',
      unitAr: 'ساعات',
      unitEn: 'hours',
      labelAr: 'وقت القراءة',
      labelEn: 'Reading Time',
      trend: -0.5,
      trendUp: false,
      gradient: 'from-ai-pink to-ai-purple',
    },
  ]

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="container mx-auto px-4 py-8 space-y-8"
    >
      {/* Welcome Header */}
      <motion.div variants={item} className="space-y-1">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center size-12 rounded-xl bg-gradient-to-br from-ai-purple to-ai-cyan text-white shadow-lg">
            <Sparkles className="size-6" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              {isRTL ? 'مرحباً أحمد' : 'Welcome Ahmed'} 👋
            </h1>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="size-4" />
              <span className="text-sm">{dateStr}</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div key={i} variants={item}>
            <Card className="ai-card group h-full">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div
                    className={`inline-flex items-center justify-center size-10 rounded-xl bg-gradient-to-br ${stat.gradient} text-white shadow-md`}
                  >
                    {stat.icon}
                  </div>
                  <div
                    className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                      stat.trendUp
                        ? 'text-emerald-600 bg-emerald-500/10 dark:text-emerald-400 dark:bg-emerald-500/15'
                        : 'text-red-600 bg-red-500/10 dark:text-red-400 dark:bg-red-500/15'
                    }`}
                  >
                    {stat.trendUp ? (
                      <TrendingUp className="size-3" />
                    ) : (
                      <TrendingDown className="size-3" />
                    )}
                    {Math.abs(stat.trend)}%
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {stat.value}
                    {stat.unitAr && (
                      <span className="text-sm font-normal text-muted-foreground ms-1">
                        {isRTL ? stat.unitAr : stat.unitEn}
                      </span>
                    )}
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

      {/* Your Interests */}
      <motion.div variants={item}>
        <Card className="ai-card">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Star className="size-5 text-ai-purple" />
              {isRTL ? 'اهتماماتك' : 'Your Interests'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {USER_INTERESTS.map((interest) => (
                <Badge
                  key={interest.id}
                  variant="secondary"
                  className="px-3 py-1.5 text-sm gap-2 border border-border/50 hover:border-primary/30 transition-colors cursor-default"
                  style={{ borderColor: `${interest.color}30` }}
                >
                  <span
                    className="size-2 rounded-full shrink-0"
                    style={{ backgroundColor: interest.color }}
                  />
                  {isRTL ? interest.nameAr : interest.nameEn}
                </Badge>
              ))}
            </div>
            <div className="space-y-3">
              {USER_INTERESTS.map((interest) => (
                <div key={interest.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">
                      {isRTL ? interest.nameAr : interest.nameEn}
                    </span>
                    <span className="text-muted-foreground">{interest.weight}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${interest.weight}%` }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                      className="h-full rounded-full"
                      style={{
                        background: `linear-gradient(90deg, ${interest.color}, ${interest.color}88)`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Reading Activity Chart */}
      <motion.div variants={item}>
        <Card className="ai-card">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <BookOpen className="size-5 text-ai-blue" />
              {isRTL ? 'نشاط القراءة' : 'Reading Activity'}
              <span className="text-sm font-normal text-muted-foreground">
                {isRTL ? '(آخر 7 أيام)' : '(Last 7 days)'}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={READING_ACTIVITY} barCategoryGap="20%">
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
                    {READING_ACTIVITY.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Bottom Grid: Bookmarks + Recommended */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bookmarked Articles */}
        <motion.div variants={item}>
          <Card className="ai-card h-full">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Bookmark className="size-5 text-ai-cyan" />
                {isRTL ? 'المقالات المحفوظة' : 'Bookmarked Articles'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {BOOKMARKED_ARTICLES.map((article) => (
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
                          {isRTL ? article.categoryAr : article.categoryEn}
                        </Badge>
                        <span>{article.date}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recommended For You */}
        <motion.div variants={item}>
          <Card className="ai-card h-full">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Sparkles className="size-5 text-ai-purple" />
                {isRTL ? 'موصى لك' : 'Recommended For You'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {RECOMMENDED_ARTICLES.map((article, i) => (
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
                          {isRTL ? article.categoryAr : article.categoryEn}
                        </Badge>
                        <span>{isRTL ? article.sourceAr : article.sourceEn}</span>
                        <span>·</span>
                        <span>{isRTL ? article.timeAr : article.timeEn}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  )
}
