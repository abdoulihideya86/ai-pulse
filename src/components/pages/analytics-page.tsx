'use client'

import { useAppStore, useLanguage, useIsRTL } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { motion } from 'framer-motion'
import {
  TrendingUp,
  PieChart as PieChartIcon,
  Building2,
  Cloud,
  DollarSign,
  Cpu,
  BarChart3,
} from 'lucide-react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { useState, useEffect } from 'react'

const CHART_COLORS = ['#8b5cf6', '#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#6366f1']

// ---- Mock Data ----

// 1. AI Trends Overview — Line chart, 30 days
const AI_TRENDS_DATA = Array.from({ length: 30 }, (_, i) => ({
  day: i + 1,
  dayLabel: `Day ${i + 1}`,
  volume: Math.floor(80 + Math.random() * 60 + (i > 20 ? i * 1.5 : 0)),
  aiNews: Math.floor(50 + Math.random() * 40 + (i > 15 ? i * 1.2 : 0)),
}))

// 2. Category Distribution — Pie/donut chart
const CATEGORY_DISTRIBUTION = [
  { name: 'LLMs', nameAr: 'نماذج لغوية', value: 28, color: '#8b5cf6' },
  { name: 'Computer Vision', nameAr: 'الرؤية الحاسوبية', value: 18, color: '#3b82f6' },
  { name: 'Robotics', nameAr: 'الروبوتات', value: 14, color: '#06b6d4' },
  { name: 'Healthcare AI', nameAr: 'AI طبي', value: 12, color: '#10b981' },
  { name: 'Investment', nameAr: 'استثمار', value: 10, color: '#f59e0b' },
  { name: 'Ethics & Policy', nameAr: 'أخلاقيات وسياسات', value: 8, color: '#ef4444' },
  { name: 'Autonomous', nameAr: 'قيادة ذاتية', value: 6, color: '#ec4899' },
  { name: 'Other', nameAr: 'أخرى', value: 4, color: '#6366f1' },
]

// 3. Top Sources — Horizontal bar chart
const TOP_SOURCES = [
  { name: 'TechCrunch', nameAr: 'تيك كرانش', articles: 156, reliability: 94 },
  { name: 'The Verge', nameAr: 'ذا فيرج', articles: 132, reliability: 91 },
  { name: 'ArXiv', nameAr: 'آركايف', articles: 120, reliability: 98 },
  { name: 'Nature AI', nameAr: 'نيتشر AI', articles: 98, reliability: 97 },
  { name: 'MIT Tech Review', nameAr: 'مراجعة MIT', articles: 87, reliability: 95 },
  { name: 'Wired', nameAr: 'وايرد', articles: 76, reliability: 88 },
  { name: 'VentureBeat', nameAr: 'فنتشر بيت', articles: 65, reliability: 82 },
  { name: 'AI News', nameAr: 'أخبار AI', articles: 54, reliability: 79 },
]

// 4. Trending Topics — Word cloud data
const TRENDING_TOPICS = [
  { text: 'GPT-5', textAr: 'GPT-5', weight: 100 },
  { text: 'AGI', textAr: 'AGI', weight: 88 },
  { text: 'Multimodal', textAr: 'متعدد الوسائط', weight: 82 },
  { text: 'Open Source AI', textAr: 'AI مفتوح المصدر', weight: 76 },
  { text: 'AI Safety', textAr: 'أمان AI', weight: 72 },
  { text: 'Embeddings', textAr: 'التضمينات', weight: 65 },
  { text: 'Fine-tuning', textAr: 'الضبط الدقيق', weight: 60 },
  { text: 'RAG', textAr: 'RAG', weight: 58 },
  { text: 'Agents', textAr: 'الوكلاء', weight: 55 },
  { text: 'Diffusion', textAr: 'الانتشار', weight: 50 },
  { text: 'MLOps', textAr: 'MLOps', weight: 45 },
  { text: 'Vision-Language', textAr: 'رؤية-لغة', weight: 42 },
  { text: 'Reinforcement Learning', textAr: 'التعلم المعزز', weight: 38 },
  { text: 'Quantum AI', textAr: 'AI كمي', weight: 35 },
  { text: 'Edge AI', textAr: 'AI حافّي', weight: 32 },
  { text: 'Synthetic Data', textAr: 'بيانات اصطناعية', weight: 30 },
]

// 5. AI Investment Trends — Area chart
const INVESTMENT_DATA = [
  { quarter: 'Q1 23', qAr: 'م1 23', northAmerica: 45, europe: 18, asia: 28, other: 5 },
  { quarter: 'Q2 23', qAr: 'م2 23', northAmerica: 52, europe: 22, asia: 32, other: 7 },
  { quarter: 'Q3 23', qAr: 'م3 23', northAmerica: 58, europe: 25, asia: 35, other: 9 },
  { quarter: 'Q4 23', qAr: 'م4 23', northAmerica: 65, europe: 28, asia: 38, other: 11 },
  { quarter: 'Q1 24', qAr: 'م1 24', northAmerica: 72, europe: 32, asia: 42, other: 14 },
  { quarter: 'Q2 24', qAr: 'م2 24', northAmerica: 85, europe: 38, asia: 48, other: 18 },
  { quarter: 'Q3 24', qAr: 'م3 24', northAmerica: 92, europe: 42, asia: 55, other: 22 },
  { quarter: 'Q4 24', qAr: 'م4 24', northAmerica: 110, europe: 48, asia: 62, other: 28 },
]

// 6. Model Performance Comparison — Bar chart
const MODEL_COMPARISON = [
  { model: 'GPT-5', reasoning: 96, coding: 94, math: 92, writing: 95 },
  { model: 'Claude 4', reasoning: 94, coding: 96, math: 90, writing: 93 },
  { model: 'Gemini 2', reasoning: 91, coding: 88, math: 95, writing: 87 },
  { model: 'Llama 4', reasoning: 85, coding: 82, math: 84, writing: 80 },
  { model: 'Mistral 3', reasoning: 80, coding: 78, math: 76, writing: 82 },
]

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

export function AnalyticsPage() {
  const language = useLanguage()
  const isRTL = useIsRTL()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800)
    return () => clearTimeout(timer)
  }, [])

  if (loading) return <AnalyticsSkeleton />

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="container mx-auto px-4 py-8 space-y-8"
    >
      {/* Page Header */}
      <motion.div variants={item} className="space-y-1">
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
      </motion.div>

      {/* Quick Stats Row */}
      <motion.div variants={item}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { labelAr: 'إجمالي المقالات', labelEn: 'Total Articles', value: '12,847', icon: <TrendingUp className="size-4" />, color: 'text-ai-purple' },
            { labelAr: 'مصادر نشطة', labelEn: 'Active Sources', value: '523', icon: <Building2 className="size-4" />, color: 'text-ai-blue' },
            { labelAr: 'اتجاه صاعد', labelEn: 'Trending Up', value: '+34%', icon: <TrendingUp className="size-4" />, color: 'text-emerald-500' },
            { labelAr: 'استثمار AI عالمي', labelEn: 'Global AI Investment', value: '$248B', icon: <DollarSign className="size-4" />, color: 'text-ai-cyan' },
          ].map((stat, i) => (
            <Card key={i} className="ai-card">
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`${stat.color}`}>{stat.icon}</div>
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

      {/* Row 1: AI Trends Overview + Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Trends Overview — Line Chart */}
        <motion.div variants={item}>
          <Card className="ai-card h-full">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="size-5 text-ai-purple" />
                {isRTL ? 'نظرة عامة على اتجاهات AI' : 'AI Trends Overview'}
              </CardTitle>
              <CardDescription>
                {isRTL ? 'حجم أخبار AI خلال آخر 30 يوماً' : 'AI news volume over the last 30 days'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={AI_TRENDS_DATA}>
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
                      dataKey="volume"
                      name={isRTL ? 'إجمالي الأخبار' : 'Total News'}
                      stroke="#8b5cf6"
                      strokeWidth={2.5}
                      dot={false}
                      activeDot={{ r: 5, strokeWidth: 0 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="aiNews"
                      name={isRTL ? 'أخبار AI' : 'AI News'}
                      stroke="#06b6d4"
                      strokeWidth={2.5}
                      dot={false}
                      activeDot={{ r: 5, strokeWidth: 0 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
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
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={CATEGORY_DISTRIBUTION}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={90}
                      paddingAngle={3}
                      dataKey="value"
                      nameKey={isRTL ? 'nameAr' : 'name'}
                      stroke="none"
                    >
                      {CATEGORY_DISTRIBUTION.map((entry, index) => (
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
                      formatter={(value: number, name: string) => [`${value}%`, name]}
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
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={TOP_SOURCES}
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
                      dataKey={isRTL ? 'nameAr' : 'name'}
                      tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      width={80}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                      wrapperStyle={{ fontSize: 12 }}
                      iconType="circle"
                      iconSize={8}
                    />
                    <Bar
                      dataKey="articles"
                      name={isRTL ? 'المقالات' : 'Articles'}
                      fill="#8b5cf6"
                      radius={[0, 4, 4, 0]}
                      maxBarSize={16}
                    />
                    <Bar
                      dataKey="reliability"
                      name={isRTL ? 'الموثوقية' : 'Reliability'}
                      fill="#06b6d4"
                      radius={[0, 4, 4, 0]}
                      maxBarSize={16}
                    />
                  </BarChart>
                </ResponsiveContainer>
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
                {isRTL ? 'أكثر المواضيع تداولاً هذا الأسبوع' : 'Most discussed topics this week'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-72 flex flex-wrap items-center justify-center gap-2 p-2">
                {TRENDING_TOPICS.map((topic, i) => {
                  const minSize = 12
                  const maxSize = 32
                  const size = minSize + (topic.weight / 100) * (maxSize - minSize)
                  const color = CHART_COLORS[i % CHART_COLORS.length]
                  return (
                    <motion.span
                      key={topic.text}
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
                      {isRTL ? topic.textAr : topic.text}
                    </motion.span>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Row 3: AI Investment Trends — Full Width Area Chart */}
      <motion.div variants={item}>
        <Card className="ai-card">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <DollarSign className="size-5 text-ai-blue" />
              {isRTL ? 'اتجاهات الاستثمار في AI' : 'AI Investment Trends'}
            </CardTitle>
            <CardDescription>
              {isRTL
                ? 'الاستثمار في الذكاء الاصطناعي حسب المنطقة (بالمليارات دولار)'
                : 'AI investment by region (in billions USD)'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={INVESTMENT_DATA}>
                  <defs>
                    <linearGradient id="colorNA" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorEU" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorAS" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorOT" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis
                    dataKey={isRTL ? 'qAr' : 'quarter'}
                    tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                    axisLine={{ stroke: 'var(--border)' }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
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
                  <Area
                    type="monotone"
                    dataKey="northAmerica"
                    name={isRTL ? 'أمريكا الشمالية' : 'North America'}
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    fill="url(#colorNA)"
                  />
                  <Area
                    type="monotone"
                    dataKey="europe"
                    name={isRTL ? 'أوروبا' : 'Europe'}
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fill="url(#colorEU)"
                  />
                  <Area
                    type="monotone"
                    dataKey="asia"
                    name={isRTL ? 'آسيا' : 'Asia'}
                    stroke="#06b6d4"
                    strokeWidth={2}
                    fill="url(#colorAS)"
                  />
                  <Area
                    type="monotone"
                    dataKey="other"
                    name={isRTL ? 'أخرى' : 'Other'}
                    stroke="#10b981"
                    strokeWidth={2}
                    fill="url(#colorOT)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Row 4: Model Performance Comparison — Grouped Bar Chart */}
      <motion.div variants={item}>
        <Card className="ai-card">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Cpu className="size-5 text-ai-cyan" />
              {isRTL ? 'مقارنة أداء النماذج' : 'Model Performance Comparison'}
            </CardTitle>
            <CardDescription>
              {isRTL
                ? 'مقارنة نتائج نماذج LLM الرئيسية في معايير مختلفة'
                : 'Comparing leading LLM benchmarks across different criteria'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={MODEL_COMPARISON} barCategoryGap="15%" barGap={3}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis
                    dataKey="model"
                    tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                    axisLine={{ stroke: 'var(--border)' }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    width={30}
                    domain={[60, 100]}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    wrapperStyle={{ fontSize: 12 }}
                    iconType="circle"
                    iconSize={8}
                  />
                  <Bar
                    dataKey="reasoning"
                    name={isRTL ? 'الاستدلال' : 'Reasoning'}
                    fill="#8b5cf6"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={20}
                  />
                  <Bar
                    dataKey="coding"
                    name={isRTL ? 'البرمجة' : 'Coding'}
                    fill="#3b82f6"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={20}
                  />
                  <Bar
                    dataKey="math"
                    name={isRTL ? 'الرياضيات' : 'Math'}
                    fill="#06b6d4"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={20}
                  />
                  <Bar
                    dataKey="writing"
                    name={isRTL ? 'الكتابة' : 'Writing'}
                    fill="#10b981"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={20}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
