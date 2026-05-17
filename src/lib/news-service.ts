// Real News Fetching Service for AI Pulse
// Uses z-ai-web-dev-sdk web_search to fetch live AI news

import ZAI from 'z-ai-web-dev-sdk'

// ─── Types ───────────────────────────────────────────────────────────────────

export interface LiveArticle {
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
  source: {
    id: string
    name: string
    url: string
    type: string
    reliabilityScore: number
    logo: string
    isActive: boolean
  }
}

interface CachedData {
  articles: LiveArticle[]
  timestamp: number
  category: string
}

// ─── Category Search Queries ─────────────────────────────────────────────────

const categorySearchQueries: Record<string, { en: string; ar: string }> = {
  'general-ai': { en: 'artificial intelligence LLM GPT Claude Gemini latest news', ar: 'أحدث أخبار الذكاء الاصطناعي والنماذج اللغوية' },
  'computer-vision': { en: 'computer vision AI image recognition deepfake detection news', ar: 'أخبار الرؤية الحاسوبية والتعرف على الصور' },
  'robotics': { en: 'robotics AI automation humanoid robot news', ar: 'أخبار الروبوتات والأتمتة الذكية' },
  'ai-ethics': { en: 'AI ethics bias fairness responsible AI news', ar: 'أخلاقيات الذكاء الاصطناعي والتحيز' },
  'nlp': { en: 'NLP natural language processing speech recognition news', ar: 'معالجة اللغات الطبيعية والتعرف على الكلام' },
  'machine-learning': { en: 'machine learning deep learning research paper news', ar: 'أخبار تعلم الآلة والتعلم العميق والأبحاث' },
  'generative-ai': { en: 'generative AI DALL-E Midjourney Stable Diffusion AI tools apps', ar: 'أدوات وتطبيقات الذكاء الاصطناعي التوليدي' },
  'ai-policy': { en: 'AI regulation policy EU AI Act government legislation news', ar: 'سياسات وتنظيمات الذكاء الاصطناعي القوانين' },
}

// Map search result keywords to categories
const keywordToCategory: Record<string, string> = {
  'gpt': 'general-ai', 'openai': 'general-ai', 'llm': 'general-ai', 'language model': 'general-ai',
  'gemini': 'general-ai', 'claude': 'general-ai', 'anthropic': 'general-ai', 'mistral': 'general-ai',
  'chatbot': 'general-ai', 'chatgpt': 'general-ai', 'copilot': 'general-ai',
  'vision': 'computer-vision', 'image recognition': 'computer-vision', 'deepfake': 'computer-vision',
  'detection': 'computer-vision', 'imaging': 'computer-vision', 'face': 'computer-vision',
  'robot': 'robotics', 'robotic': 'robotics', 'autonomous': 'robotics', 'humanoid': 'robotics',
  'self-driving': 'robotics', 'waymo': 'robotics', 'tesla': 'robotics',
  'ethic': 'ai-ethics', 'bias': 'ai-ethics', 'fairness': 'ai-ethics', 'responsible': 'ai-ethics',
  'nlp': 'nlp', 'natural language': 'nlp', 'translation': 'nlp', 'speech': 'nlp',
  'text-to-speech': 'nlp', 'sentiment': 'nlp',
  'machine learning': 'machine-learning', 'deep learning': 'machine-learning', 'research': 'machine-learning',
  'neural': 'machine-learning', 'training': 'machine-learning', 'stanford': 'machine-learning',
  'generative': 'generative-ai', 'dall-e': 'generative-ai', 'midjourney': 'generative-ai',
  'stable diffusion': 'generative-ai', 'sora': 'generative-ai', 'runway': 'generative-ai',
  'figma ai': 'generative-ai', 'cursor': 'generative-ai', 'ai tool': 'generative-ai',
  'regulation': 'ai-policy', 'policy': 'ai-policy', 'eu ai': 'ai-policy', 'law': 'ai-policy',
  'government': 'ai-policy', 'legislation': 'ai-policy', 'ban': 'ai-policy', 'act': 'ai-policy',
  'healthcare': 'machine-learning', 'medical': 'machine-learning', 'diagnosis': 'machine-learning',
  'investment': 'general-ai', 'funding': 'general-ai', 'billion': 'general-ai',
  'apple': 'general-ai', 'google': 'general-ai', 'microsoft': 'general-ai', 'meta': 'general-ai',
  'nvidia': 'general-ai',
}

function detectCategory(title: string, snippet: string): string {
  const text = `${title} ${snippet}`.toLowerCase()
  for (const [keyword, cat] of Object.entries(keywordToCategory)) {
    if (text.includes(keyword)) return cat
  }
  return 'general-ai'
}

function generateId(text: string): string {
  let hash = 0
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash |= 0
  }
  return `live-${Math.abs(hash).toString(36)}`
}

function isRecent(dateStr: string): boolean {
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return true // If date is invalid, include it
    const now = new Date()
    const diffDays = (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24)
    return diffDays <= 60
  } catch {
    return true
  }
}

function extractTags(title: string, snippet: string): string[] {
  const text = `${title} ${snippet}`.toLowerCase()
  const tags: string[] = []
  const tagKeywords: Record<string, string> = {
    'GPT': 'gpt', 'OpenAI': 'openai', 'Google': 'google', 'Gemini': 'gemini',
    'Anthropic': 'anthropic', 'Claude': 'claude', 'Meta': 'meta', 'Llama': 'llama',
    'Microsoft': 'microsoft', 'Apple': 'apple', 'NVIDIA': 'nvidia', 'Tesla': 'tesla',
    'Robot': 'robotics', 'AI': 'ai', 'LLM': 'llm', 'ML': 'machine-learning',
  }
  for (const [keyword, tag] of Object.entries(tagKeywords)) {
    if (text.includes(keyword.toLowerCase()) && tags.length < 5) {
      tags.push(tag)
    }
  }
  return tags
}

function mapSearchResult(result: {
  url?: string; name?: string; snippet?: string;
  host_name?: string; date?: string; favicon?: string;
}, index: number): LiveArticle | null {
  const title = result.name || ''
  const snippet = result.snippet || ''
  if (!title || !snippet) return null

  const id = generateId(`${result.url || title}`)
  const hostName = result.host_name || ''
  const favicon = result.favicon || ''
  const category = detectCategory(title, snippet)

  return {
    id,
    titleAr: title,
    titleEn: title,
    summaryAr: snippet,
    summaryEn: snippet,
    contentAr: snippet,
    contentEn: snippet,
    title,
    summary: snippet,
    content: snippet,
    imageUrl: null,
    sourceId: `src-${hostName.replace(/\./g, '-')}`,
    category,
    tags: JSON.stringify(extractTags(title, snippet)),
    views: Math.floor(Math.random() * 20000) + 500,
    isBreaking: index < 2,
    isTrending: index < 5,
    publishedAt: result.date || new Date().toISOString(),
    createdAt: result.date || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    source: {
      id: `src-${hostName.replace(/\./g, '-')}`,
      name: hostName || 'News Source',
      url: result.url || '',
      type: 'web',
      reliabilityScore: 0.8,
      logo: favicon ? (favicon.startsWith('http') ? favicon : `https://${favicon}`) : '📰',
      isActive: true,
    },
  }
}

// ─── In-Memory Cache ─────────────────────────────────────────────────────────

const cache = new Map<string, CachedData>()
const CACHE_TTL = 15 * 60 * 1000 // 15 minutes
const ALL_CACHE_KEY = '__all__'
const TRENDING_CACHE_KEY = '__trending__'

function isCacheValid(key: string): boolean {
  const cached = cache.get(key)
  if (!cached) return false
  return Date.now() - cached.timestamp < CACHE_TTL
}

// ─── Core Search Function ────────────────────────────────────────────────────

async function searchNews(query: string, limit: number = 10): Promise<LiveArticle[]> {
  try {
    const zai = await ZAI.create()
    const results = await zai.functions.invoke('web_search', {
      query,
      num: limit,
    })

    if (!Array.isArray(results)) return []

    const seenIds = new Set<string>()
    return results
      .map((r: Record<string, unknown>, idx: number) => mapSearchResult(r as Parameters<typeof mapSearchResult>[0], idx))
      .filter((article): article is LiveArticle => {
        if (!article) return false
        if (seenIds.has(article.id)) return false
        if (article.publishedAt && !isRecent(article.publishedAt)) return false
        seenIds.add(article.id)
        return true
      })
  } catch (error) {
    console.error('Search failed for query:', query, error)
    return []
  }
}

// ─── Public API ──────────────────────────────────────────────────────────────

export async function fetchLiveNews(
  category: string = 'all',
  lang: string = 'ar',
  page: number = 1,
  limit: number = 12
): Promise<{ articles: LiveArticle[]; total: number; page: number; totalPages: number }> {
  const cacheKey = category === 'all' ? ALL_CACHE_KEY : category
  const isAr = lang === 'ar'

  // Check cache first
  if (isCacheValid(cacheKey)) {
    const cached = cache.get(cacheKey)!
    let filtered = cached.articles
    if (category !== 'all') {
      filtered = filtered.filter((a) => a.category === category)
    }

    const mapped = filtered.map((article) => ({
      ...article,
      title: isAr ? article.titleAr : article.titleEn,
      summary: isAr ? article.summaryAr : article.summaryEn,
      content: isAr ? article.contentAr : article.contentEn,
    }))

    const total = mapped.length
    const start = (page - 1) * limit
    const paginated = mapped.slice(start, start + limit)

    return { articles: paginated, total, page, totalPages: Math.ceil(total / limit) || 1 }
  }

  // Fetch fresh data
  const articles: LiveArticle[] = []
  const seenIds = new Set<string>()

  const addArticle = (article: LiveArticle) => {
    if (!seenIds.has(article.id)) {
      seenIds.add(article.id)
      articles.push(article)
    }
  }

  if (category === 'all') {
    // Fetch from multiple sources in parallel
    const queries = [
      searchNews(isAr ? 'أحدث أخبار الذكاء الاصطناعي اليوم' : 'latest AI artificial intelligence news today', 10),
      searchNews(isAr ? 'أخبار نماذج اللغة GPT Claude' : 'LLM GPT Claude Gemini large language model news', 8),
      searchNews(isAr ? 'أخبار الروبوتات والتعلم الآلي' : 'robotics machine learning automation news', 6),
      searchNews(isAr ? 'أدوات وتطبيقات ذكاء اصطناعي جديدة' : 'new AI tools apps generative AI news', 6),
    ]

    const results = await Promise.allSettled(queries)
    for (const result of results) {
      if (result.status === 'fulfilled') {
        result.value.forEach(addArticle)
      }
    }
  } else {
    const queries = categorySearchQueries[category]
    if (queries) {
      const results = await Promise.allSettled([
        searchNews(queries.en, 8),
        searchNews(queries.ar, 5),
      ])
      for (const result of results) {
        if (result.status === 'fulfilled') {
          result.value.forEach(addArticle)
        }
      }
    }
  }

  // Sort by date (most recent first)
  articles.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())

  // Store in cache
  cache.set(cacheKey, { articles, timestamp: Date.now(), category })

  // Map language and paginate
  const mapped = articles.map((article) => ({
    ...article,
    title: isAr ? article.titleAr : article.titleEn,
    summary: isAr ? article.summaryAr : article.summaryEn,
    content: isAr ? article.contentAr : article.contentEn,
  }))

  const total = mapped.length
  const start = (page - 1) * limit
  const paginated = mapped.slice(start, start + limit)

  return { articles: paginated, total, page, totalPages: Math.ceil(total / limit) || 1 }
}

export async function fetchTrendingNews(lang: string = 'ar'): Promise<{ articles: LiveArticle[] }> {
  if (isCacheValid(TRENDING_CACHE_KEY)) {
    const cached = cache.get(TRENDING_CACHE_KEY)!
    const isAr = lang === 'ar'
    return {
      articles: cached.articles.map((a) => ({
        ...a,
        title: isAr ? a.titleAr : a.titleEn,
        summary: isAr ? a.summaryAr : a.summaryEn,
        content: isAr ? a.contentAr : a.contentEn,
      })),
    }
  }

  const seenIds = new Set<string>()
  const articles: LiveArticle[] = []
  const addArticle = (article: LiveArticle) => {
    if (!seenIds.has(article.id)) {
      seenIds.add(article.id)
      articles.push(article)
    }
  }

  const results = await Promise.allSettled([
    searchNews('trending AI news this week 2026', 8),
    searchNews('أخبار الذكاء الاصطناعي الأكثر رواجاً هذا الأسبوع', 5),
    searchNews('AI breakthroughs latest developments', 5),
  ])

  for (const result of results) {
    if (result.status === 'fulfilled') {
      result.value.forEach(addArticle)
    }
  }

  // Mark all trending articles as trending
  articles.forEach((a) => { a.isTrending = true })

  articles.sort((a, b) => b.views - a.views)

  cache.set(TRENDING_CACHE_KEY, { articles, timestamp: Date.now(), category: 'trending' })

  const isAr = lang === 'ar'
  return {
    articles: articles.map((a) => ({
      ...a,
      title: isAr ? a.titleAr : a.titleEn,
      summary: isAr ? a.summaryAr : a.summaryEn,
      content: isAr ? a.contentAr : a.contentEn,
    })),
  }
}

export async function searchLiveNews(
  query: string,
  lang: string = 'ar',
  page: number = 1,
  limit: number = 12
): Promise<{ articles: LiveArticle[]; total: number; page: number; totalPages: number; query: string }> {
  const seenIds = new Set<string>()
  const articles: LiveArticle[] = []
  const addArticle = (article: LiveArticle) => {
    if (!seenIds.has(article.id)) {
      seenIds.add(article.id)
      articles.push(article)
    }
  }

  const results = await Promise.allSettled([
    searchNews(`${query} AI artificial intelligence`, 10),
    searchNews(`${query} الذكاء الاصطناعي`, 5),
  ])

  for (const result of results) {
    if (result.status === 'fulfilled') {
      result.value.forEach(addArticle)
    }
  }

  const total = articles.length
  const start = (page - 1) * limit
  const paginated = articles.slice(start, start + limit)

  return { articles: paginated, total, page, totalPages: Math.ceil(total / limit) || 1, query }
}

export async function refreshAllCaches(): Promise<void> {
  cache.clear()
  await Promise.allSettled([
    fetchLiveNews('all', 'ar', 1, 12),
    fetchTrendingNews('ar'),
  ])
}

// Get all cached articles (for stats)
export function getCachedArticles(): LiveArticle[] {
  const allArticles: LiveArticle[] = []
  const seenIds = new Set<string>()

  for (const [, data] of cache) {
    for (const article of data.articles) {
      if (!seenIds.has(article.id)) {
        seenIds.add(article.id)
        allArticles.push(article)
      }
    }
  }

  return allArticles
}
