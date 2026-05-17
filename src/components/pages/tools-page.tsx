'use client'

import { useState, useEffect, useMemo } from 'react'
import { useLanguage, useIsRTL } from '@/lib/store'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Star,
  ExternalLink,
  Info,
  Sparkles,
  Filter,
  ArrowUpDown,
  Code,
  Rocket,
  PenTool,
  Image as ImageIcon,
  Mic,
  Video,
  SearchIcon,
  Wrench,
  Crown,
  Zap,
  Tag,
  MessageSquare,
  Blocks,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'

// ---- Types ----
interface Tool {
  id: string
  name: string
  description: string | null
  category: string
  rating: number
  pricing: string
  url: string | null
  imageUrl: string | null
  features: string[]
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface ToolsResponse {
  tools: Tool[]
}

type CategoryKey = 'all' | 'coding' | 'productivity' | 'writing' | 'image' | 'audio' | 'video' | 'search' | 'chatbots' | 'image-generation' | 'speech' | 'frameworks'
type SortOption = 'rating' | 'name' | 'pricing'

// ---- StarRating component ----
function StarRating({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' | 'lg' }) {
  const sizeMap = { sm: 'size-3.5', md: 'size-4', lg: 'size-5' }
  const iconSize = sizeMap[size]

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => {
        const fill = rating >= star ? 1 : rating >= star - 0.5 ? 0.5 : 0
        return (
          <span key={star} className="relative">
            <Star className={`${iconSize} text-muted-foreground/30`} />
            {fill > 0 && (
              <span
                className="absolute inset-0 overflow-hidden"
                style={{ width: `${fill * 100}%` }}
              >
                <Star className={`${iconSize} fill-ai-purple text-ai-purple`} />
              </span>
            )}
          </span>
        )
      })}
      <span className="text-xs font-medium text-muted-foreground ms-1">
        {rating.toFixed(1)}
      </span>
    </div>
  )
}

// ---- Category config ----
// Maps DB categories to display info, plus the generic filter tabs
const categoryDisplayMap: Record<string, { labelAr: string; labelEn: string; icon: React.ReactNode }> = {
  coding: { labelAr: 'البرمجة', labelEn: 'Coding', icon: <Code className="size-4" /> },
  productivity: { labelAr: 'الإنتاجية', labelEn: 'Productivity', icon: <Rocket className="size-4" /> },
  writing: { labelAr: 'الكتابة', labelEn: 'Writing', icon: <PenTool className="size-4" /> },
  image: { labelAr: 'الصور', labelEn: 'Image', icon: <ImageIcon className="size-4" /> },
  'image-generation': { labelAr: 'الصور', labelEn: 'Image Generation', icon: <ImageIcon className="size-4" /> },
  audio: { labelAr: 'الصوت', labelEn: 'Audio', icon: <Mic className="size-4" /> },
  speech: { labelAr: 'الصوت', labelEn: 'Speech', icon: <Mic className="size-4" /> },
  video: { labelAr: 'الفيديو', labelEn: 'Video', icon: <Video className="size-4" /> },
  search: { labelAr: 'البحث', labelEn: 'Search', icon: <SearchIcon className="size-4" /> },
  chatbots: { labelAr: 'روبوتات المحادثة', labelEn: 'Chatbots', icon: <MessageSquare className="size-4" /> },
  frameworks: { labelAr: 'أطر العمل', labelEn: 'Frameworks', icon: <Blocks className="size-4" /> },
}

// Tab filter categories — these are the categories shown in the tabs
const filterCategories: { key: CategoryKey; labelAr: string; labelEn: string; icon: React.ReactNode; matchCategories: string[] }[] = [
  { key: 'all', labelAr: 'الكل', labelEn: 'All', icon: <Sparkles className="size-3.5" />, matchCategories: [] },
  { key: 'coding', labelAr: 'البرمجة', labelEn: 'Coding', icon: <Code className="size-3.5" />, matchCategories: ['coding'] },
  { key: 'productivity', labelAr: 'الإنتاجية', labelEn: 'Productivity', icon: <Rocket className="size-3.5" />, matchCategories: ['productivity'] },
  { key: 'writing', labelAr: 'الكتابة', labelEn: 'Writing', icon: <PenTool className="size-3.5" />, matchCategories: ['writing'] },
  { key: 'image', labelAr: 'الصور', labelEn: 'Image', icon: <ImageIcon className="size-3.5" />, matchCategories: ['image', 'image-generation'] },
  { key: 'audio', labelAr: 'الصوت', labelEn: 'Audio', icon: <Mic className="size-3.5" />, matchCategories: ['audio', 'speech'] },
  { key: 'video', labelAr: 'الفيديو', labelEn: 'Video', icon: <Video className="size-3.5" />, matchCategories: ['video'] },
  { key: 'search', labelAr: 'البحث', labelEn: 'Search', icon: <SearchIcon className="size-3.5" />, matchCategories: ['search'] },
  { key: 'chatbots', labelAr: 'المحادثة', labelEn: 'Chatbots', icon: <MessageSquare className="size-3.5" />, matchCategories: ['chatbots'] },
  { key: 'frameworks', labelAr: 'أطر العمل', labelEn: 'Frameworks', icon: <Blocks className="size-3.5" />, matchCategories: ['frameworks'] },
]

function getCategoryDisplay(category: string): { labelAr: string; labelEn: string; icon: React.ReactNode } {
  return categoryDisplayMap[category] || { labelAr: category, labelEn: category, icon: <Wrench className="size-4" /> }
}

// ---- Pricing badge config ----
function PricingBadge({ pricing, isRTL }: { pricing: string; isRTL: boolean }) {
  const config: Record<string, { labelAr: string; labelEn: string; className: string }> = {
    free: {
      labelAr: 'مجاني',
      labelEn: 'Free',
      className: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    },
    freemium: {
      labelAr: 'مجاني محدود',
      labelEn: 'Freemium',
      className: 'bg-ai-blue/15 text-blue-600 dark:text-blue-400 border-ai-blue/20',
    },
    paid: {
      labelAr: 'مدفوع',
      labelEn: 'Paid',
      className: 'bg-ai-purple/15 text-purple-600 dark:text-purple-400 border-ai-purple/20',
    },
    subscription: {
      labelAr: 'اشتراك',
      labelEn: 'Subscription',
      className: 'bg-ai-purple/15 text-purple-600 dark:text-purple-400 border-ai-purple/20',
    },
  }
  const c = config[pricing] || config.free
  return (
    <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${c.className}`}>
      {isRTL ? c.labelAr : c.labelEn}
    </Badge>
  )
}

// ---- Tool Card with gradient border glow ----
function ToolCard({
  tool,
  isRTL,
  onViewDetails,
}: {
  tool: Tool
  isRTL: boolean
  onViewDetails: (tool: Tool) => void
}) {
  const catDisplay = getCategoryDisplay(tool.category)

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -4 }}
      className="group"
    >
      <div className="relative rounded-xl overflow-hidden ai-card-glow">
        <Card className="ai-card border-0 h-full">
          <CardContent className="p-5 flex flex-col gap-3 h-full">
            {/* Header: Name + Category + Pricing */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="flex items-center justify-center size-9 rounded-lg bg-gradient-to-br from-ai-purple/20 to-ai-cyan/20 text-primary shrink-0">
                  {catDisplay.icon}
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-sm truncate">{tool.name}</h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                      {isRTL ? catDisplay.labelAr : catDisplay.labelEn}
                    </Badge>
                    <PricingBadge pricing={tool.pricing} isRTL={isRTL} />
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
              {tool.description || (isRTL ? 'لا يوجد وصف' : 'No description')}
            </p>

            {/* Star Rating */}
            <StarRating rating={tool.rating} size="sm" />

            {/* Features Tags */}
            <div className="flex flex-wrap gap-1.5 mt-auto">
              {(tool.features || []).slice(0, 3).map((feature, i) => (
                <Badge
                  key={i}
                  variant="outline"
                  className="text-[10px] px-1.5 py-0 border-primary/20 text-primary/80"
                >
                  <Tag className="size-2.5 me-0.5" />
                  {feature}
                </Badge>
              ))}
              {(tool.features || []).length > 3 && (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-muted-foreground">
                  +{tool.features.length - 3}
                </Badge>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-1">
              <Button
                size="sm"
                className="btn-ai-gradient h-8 text-xs flex-1 gap-1.5"
                onClick={() => tool.url && window.open(tool.url, '_blank', 'noopener')}
                disabled={!tool.url}
              >
                <ExternalLink className="size-3" />
                {isRTL ? 'زيارة' : 'Visit'}
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-8 text-xs gap-1.5"
                onClick={() => onViewDetails(tool)}
              >
                <Info className="size-3" />
                {isRTL ? 'تفاصيل' : 'Details'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  )
}

// ---- Featured Tool Hero Card ----
function FeaturedTool({ tool, isRTL }: { tool: Tool; isRTL: boolean }) {
  const catDisplay = getCategoryDisplay(tool.category)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="relative rounded-2xl overflow-hidden">
        {/* Gradient border glow wrapper */}
        <div className="absolute inset-0 rounded-2xl p-[1.5px] bg-gradient-to-r from-ai-purple via-ai-blue to-ai-cyan opacity-60 ai-glow-pulse" />
        <Card className="relative rounded-2xl border-0 overflow-hidden">
          <CardContent className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Left: Icon + Crown */}
              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center size-16 rounded-2xl bg-gradient-to-br from-ai-purple to-ai-cyan text-white shadow-lg shrink-0">
                  {catDisplay.icon}
                </div>
                <div className="md:hidden">
                  <Badge className="badge-ai-gradient gap-1 text-xs">
                    <Crown className="size-3" />
                    {isRTL ? 'الأعلى تقييماً' : 'Top Rated'}
                  </Badge>
                </div>
              </div>

              {/* Right: Content */}
              <div className="flex-1 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <h2 className="text-2xl font-bold">{tool.name}</h2>
                  <div className="hidden md:flex items-center">
                    <Badge className="badge-ai-gradient gap-1 text-xs">
                      <Crown className="size-3" />
                      {isRTL ? 'الأعلى تقييماً' : 'Top Rated'}
                    </Badge>
                  </div>
                  <PricingBadge pricing={tool.pricing} isRTL={isRTL} />
                </div>

                <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
                  {tool.description || (isRTL ? 'لا يوجد وصف' : 'No description')}
                </p>

                <StarRating rating={tool.rating} size="md" />

                {/* Features */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {(tool.features || []).map((feature, i) => (
                    <Badge
                      key={i}
                      variant="outline"
                      className="text-xs px-2.5 py-0.5 border-primary/25 text-primary/90"
                    >
                      <Zap className="size-3 me-1" />
                      {feature}
                    </Badge>
                  ))}
                </div>

                {tool.url && (
                  <div className="flex items-center gap-3 pt-2">
                    <Button
                      className="btn-ai-gradient gap-2"
                      onClick={() => window.open(tool.url, '_blank', 'noopener')}
                    >
                      <ExternalLink className="size-4" />
                      {isRTL ? 'زيارة الأداة' : 'Visit Tool'}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  )
}

// ---- Loading Skeleton ----
function ToolsLoadingSkeleton() {
  return (
    <div className="space-y-8">
      {/* Featured skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-48 w-full rounded-2xl skeleton-ai" />
      </div>
      {/* Grid skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="space-y-3 rounded-xl border border-border/50 p-5">
            <div className="flex items-center gap-2.5">
              <Skeleton className="size-9 rounded-lg" />
              <div className="space-y-1.5 flex-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-3/4" />
            <Skeleton className="h-3 w-20" />
            <div className="flex gap-1.5">
              <Skeleton className="h-5 w-14 rounded-full" />
              <Skeleton className="h-5 w-14 rounded-full" />
              <Skeleton className="h-5 w-14 rounded-full" />
            </div>
            <div className="flex gap-2 pt-1">
              <Skeleton className="h-8 flex-1 rounded-md" />
              <Skeleton className="h-8 w-20 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ======== Main ToolsPage Component ========
export function ToolsPage() {
  const language = useLanguage()
  const isRTL = useIsRTL()
  const [tools, setTools] = useState<Tool[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<CategoryKey>('all')
  const [sortBy, setSortBy] = useState<SortOption>('rating')
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null)

  useEffect(() => {
    async function fetchTools() {
      try {
        setLoading(true)
        const res = await fetch('/api/tools')
        const data: ToolsResponse = await res.json()
        setTools(data.tools || [])
      } catch {
        // silently handle
      } finally {
        setLoading(false)
      }
    }
    fetchTools()
  }, [])

  // Filtered + sorted tools
  const filteredTools = useMemo(() => {
    let result = tools

    // Category filter
    if (activeCategory !== 'all') {
      const filterCat = filterCategories.find(c => c.key === activeCategory)
      if (filterCat && filterCat.matchCategories.length > 0) {
        result = result.filter((t) => filterCat.matchCategories.includes(t.category))
      }
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          (t.description || '').toLowerCase().includes(q) ||
          (t.features || []).some(f => f.toLowerCase().includes(q))
      )
    }

    // Sort
    result = [...result].sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating
      if (sortBy === 'name') return a.name.localeCompare(b.name)
      // pricing: free first, then freemium, then paid/subscription
      const pricingOrder: Record<string, number> = { free: 0, freemium: 1, paid: 2, subscription: 2 }
      return (pricingOrder[a.pricing] ?? 3) - (pricingOrder[b.pricing] ?? 3)
    })

    return result
  }, [tools, activeCategory, searchQuery, sortBy])

  // Featured tool (top-rated overall)
  const featuredTool = useMemo(() => {
    if (tools.length === 0) return null
    return [...tools].sort((a, b) => b.rating - a.rating)[0]
  }, [tools])

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-2"
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center size-10 rounded-xl bg-gradient-to-br from-ai-purple to-ai-cyan text-white">
            <Wrench className="size-5" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              {isRTL ? 'سوق الأدوات' : 'Tools Marketplace'}
            </h1>
            <p className="text-sm text-muted-foreground">
              {isRTL
                ? 'اكتشف وقارن أفضل أدوات الذكاء الاصطناعي'
                : 'Discover and compare the best AI tools'}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Search & Filter Bar */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="flex flex-col sm:flex-row gap-3"
      >
        <div className="relative flex-1">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder={isRTL ? 'ابحث عن أداة...' : 'Search for a tool...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="ps-9 h-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={activeCategory}
            onValueChange={(v) => setActiveCategory(v as CategoryKey)}
          >
            <SelectTrigger className="w-[160px] h-10">
              <Filter className="size-3.5 me-1" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {filterCategories.map((cat) => (
                <SelectItem key={cat.key} value={cat.key}>
                  <span className="flex items-center gap-1.5">
                    {cat.icon}
                    {isRTL ? cat.labelAr : cat.labelEn}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
            <SelectTrigger className="w-[150px] h-10">
              <ArrowUpDown className="size-3.5 me-1" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rating">
                {isRTL ? 'التقييم' : 'Rating'}
              </SelectItem>
              <SelectItem value="name">
                {isRTL ? 'الاسم' : 'Name'}
              </SelectItem>
              <SelectItem value="pricing">
                {isRTL ? 'السعر' : 'Pricing'}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </motion.div>

      {/* Category Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
      >
        <Tabs
          value={activeCategory}
          onValueChange={(v) => setActiveCategory(v as CategoryKey)}
        >
          <TabsList className="flex-wrap h-auto gap-1 bg-muted/50 p-1.5">
            {filterCategories.map((cat) => (
              <TabsTrigger
                key={cat.key}
                value={cat.key}
                className="gap-1.5 text-xs data-[state=active]:bg-gradient-to-r data-[state=active]:from-ai-purple/20 data-[state=active]:to-ai-cyan/20 data-[state=active]:text-primary"
              >
                {cat.icon}
                <span className="hidden sm:inline">{isRTL ? cat.labelAr : cat.labelEn}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </motion.div>

      {/* Loading State */}
      {loading ? (
        <ToolsLoadingSkeleton />
      ) : (
        <>
          {/* Featured Tool (only show when no category filter or all) */}
          {featuredTool && activeCategory === 'all' && !searchQuery && (
            <div className="space-y-3">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Crown className="size-5 text-ai-purple" />
                {isRTL ? 'الأداة المميزة' : 'Featured Tool'}
              </h2>
              <FeaturedTool tool={featuredTool} isRTL={isRTL} />
            </div>
          )}

          {/* Results count */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {isRTL
                ? `${filteredTools.length} أداة`
                : `${filteredTools.length} tools`}
            </p>
          </div>

          {/* Tools Grid */}
          {filteredTools.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-16 text-center space-y-4"
            >
              <div className="flex items-center justify-center size-16 rounded-2xl bg-muted text-muted-foreground">
                <Search className="size-7" />
              </div>
              <p className="text-lg font-medium">
                {isRTL ? 'لا توجد أدوات' : 'No tools found'}
              </p>
              <p className="text-sm text-muted-foreground max-w-sm">
                {isRTL
                  ? 'جرّب تغيير معايير البحث أو اختيار فئة مختلفة'
                  : 'Try changing your search criteria or selecting a different category'}
              </p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              <AnimatePresence mode="popLayout">
                {filteredTools.map((tool) => (
                  <ToolCard
                    key={tool.id}
                    tool={tool}
                    isRTL={isRTL}
                    onViewDetails={setSelectedTool}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </>
      )}

      {/* Tool Details Dialog */}
      <Dialog open={!!selectedTool} onOpenChange={(open) => !open && setSelectedTool(null)}>
        <DialogContent className="max-w-lg">
          {selectedTool && (() => {
            const catDisplay = getCategoryDisplay(selectedTool.category)
            return (
              <>
                <DialogHeader>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center size-11 rounded-xl bg-gradient-to-br from-ai-purple to-ai-cyan text-white shrink-0">
                      {catDisplay.icon}
                    </div>
                    <div>
                      <DialogTitle className="text-xl">
                        {selectedTool.name}
                      </DialogTitle>
                      <DialogDescription className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {isRTL ? catDisplay.labelAr : catDisplay.labelEn}
                        </Badge>
                        <PricingBadge pricing={selectedTool.pricing} isRTL={isRTL} />
                      </DialogDescription>
                    </div>
                  </div>
                </DialogHeader>

                <div className="space-y-4 mt-2">
                  <div>
                    <StarRating rating={selectedTool.rating} size="lg" />
                  </div>

                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {selectedTool.description || (isRTL ? 'لا يوجد وصف' : 'No description')}
                  </p>

                  {(selectedTool.features || []).length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold mb-2">
                        {isRTL ? 'الميزات الرئيسية' : 'Key Features'}
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedTool.features.map((feature, i) => (
                          <Badge
                            key={i}
                            variant="outline"
                            className="text-xs px-2.5 py-0.5 border-primary/25 text-primary/90"
                          >
                            <Zap className="size-3 me-1" />
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3 pt-2">
                    {selectedTool.url && (
                      <Button
                        className="btn-ai-gradient flex-1 gap-2"
                        onClick={() => window.open(selectedTool.url, '_blank', 'noopener')}
                      >
                        <ExternalLink className="size-4" />
                        {isRTL ? 'زيارة الأداة' : 'Visit Tool'}
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      onClick={() => setSelectedTool(null)}
                    >
                      {isRTL ? 'إغلاق' : 'Close'}
                    </Button>
                  </div>
                </div>
              </>
            )
          })()}
        </DialogContent>
      </Dialog>
    </div>
  )
}
