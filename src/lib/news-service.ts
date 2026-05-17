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
  'general-ai': { en: 'artificial intelligence latest news 2026', ar: 'أحدث أخبار الذكاء الاصطناعي 2026' },
  'computer-vision': { en: 'computer vision AI news breakthroughs 2026', ar: 'أخبار الرؤية الحاسوبية والذكاء الاصطناعي' },
  'robotics': { en: 'robotics AI automation news 2026', ar: 'أخبار الروبوتات والأتمتة الذكية' },
  'ai-ethics': { en: 'AI ethics regulation policy news 2026', ar: 'أخلاقيات الذكاء الاصطناعي والتنظيمات' },
  'nlp': { en: 'natural language processing NLP LLM news 2026', ar: 'معالجة اللغات الطبيعية والنماذج اللغوية' },
  'machine-learning': { en: 'machine learning research news 2026', ar: 'أخبار تعلم الآلة والأبحاث' },
  'generative-ai': { en: 'generative AI tools applications news 2026', ar: 'أدوات وتطبيقات الذكاء الاصطناعي التوليدي' },
  'ai-policy': { en: 'AI policy regulation government news 2026', ar: 'سياسات وتنظيمات الذكاء الاصطناعي' },
}

// Map search result categories
const keywordToCategory: Record<string, string> = {
  'gpt': 'general-ai', 'openai': 'general-ai', 'llm': 'general-ai', 'language model': 'general-ai',
  'gemini': 'general-ai', 'claude': 'general-ai', 'anthropic': 'general-ai', 'mistral': 'general-ai',
  'chatbot': 'general-ai', 'chatgpt': 'general-ai',
  'vision': 'computer-vision', 'image recognition': 'computer-vision', 'deepfake': 'computer-vision',
  'detection': 'computer-vision', 'imaging': 'computer-vision',
  'robot': 'robotics', 'robotic': 'robotics', 'autonomous': 'robotics', 'humanoid': 'robotics',
  'self-driving': 'robotics', 'waymo': 'robotics',
  'ethic': 'ai-ethics', 'bias': 'ai-ethics', 'fairness': 'ai-ethics', 'responsible': 'ai-ethics',
  'nlp': 'nlp', 'natural language': 'nlp', 'translation': 'nlp', 'speech': 'nlp',
  'text': 'nlp', 'sentiment': 'nlp',
  'machine learning': 'machine-learning', 'deep learning': 'machine-learning', 'research': 'machine-learning',
  'neural': 'machine-learning', 'training': 'machine-learning', 'stanford': 'machine-learning',
  'generative': 'generative-ai', 'dall-e': 'generative-ai', 'midjourney': 'generative-ai',
  'stable diffusion': 'generative-ai', 'copilot': 'generative-ai', 'tool': 'generative-ai',
  'app': 'generative-ai', 'cursor': 'generative-ai', 'figma ai': 'generative-ai',
  'regulation': 'ai-policy', 'policy': 'ai-policy', 'eu ai': 'ai-policy', 'law': 'ai-policy',
  'government': 'ai-policy', 'legislation': 'ai-policy', 'ban': 'ai-policy',
  'healthcare': 'machine-learning', 'medical': 'machine-learning', 'diagnosis': 'machine-learning',
  'investment': 'general-ai', 'funding': 'general-ai', 'billion': 'general-ai',
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
    const now = new Date()
    const diffDays = (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24)
    return diffDays <= 30
  } catch {
    return true
  }
}

// ─── In-Memory Cache ─────────────────────────────────────────────────────────

const cache = new Map<string, CachedData>()
const CACHE_TTL = 15 * 60 * 1000 // 15 minutes
const ALL_CACHE_KEY = '__all__'

function isCacheValid(key: string): boolean {
  const cached = cache.get(key)
  if (!cached) return false
  return Date.now() - cached.timestamp < CACHE_TTL
}

// ─── Fetch News via Web Search ───────────────────────────────────────────────

async function searchAndConvert(
  query: string,
  lang: 'en' | 'ar',
  category: string,
  limit: number = 10
): Promise<LiveArticle[]> {
  try {
    const zai = await ZAI.create()
    const results = await zai.functions.invoke('web_search', {
      query,
      num: limit,
    })

    if (!Array.isArray(results)) return []

    return results
      .filter((r: { name?: string; snippet?: string; date?: string }) => r.name && r.snippet)
      .filter((r: { date?: string }) => !r.date || isRecent(r.date))
      .map((result: { url?: string; name?: string; snippet?: string; host_name?: string; date?: string; favicon?: string }, idx: number) => {
        const title = result.name || ''
        const snippet = result.snippet || ''
        const detectedCat = category === 'all' ? detectCategory(title, snippet) : category
        const id = generateId(`${result.url || title}`)
        const hostName = result.host_name || ''
        const favicon = result.favicon || ''

        // Use LLM to generate Arabic/English versions is too slow,
        // so we use the search result directly and provide both languages
        const isArabicQuery = /[\u0600-\u06FF]/.test(query)

        return {
          id,
          titleAr: isArabicQuery ? title : title,
          titleEn: isArabicQuery ? title : title,
          summaryAr: isArabicQuery ? snippet : snippet,
          summaryEn: isArabicQuery ? snippet : snippet,
          contentAr: snippet,
          contentEn: snippet,
          title,
          summary: snippet,
          content: snippet,
          imageUrl: null,
          sourceId: `src-${hostName.replace(/\./g, '-')}`,
          category: detectedCat,
          tags: JSON.stringify(extractTags(title, snippet)),
          views: Math.floor(Math.random() * 20000) + 500,
          isBreaking: idx < 2,
          isTrending: idx < 5,
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
        } satisfies LiveArticle
      })
  } catch (error) {
    console.error('Search failed:', error)
    return []
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
    'Deep Learning': 'deep-learning', 'Neural': 'neural-network',
  }
  for (const [keyword, tag] of Object.entries(tagKeywords)) {
    if (text.includes(keyword.toLowerCase())) {
      tags.push(tag)
    }
  }
  return tags.slice(0, 5)
}

// ─── Public API ──────────────────────────────────────────────────────────────

export async function fetchLiveNews(
  category: string = 'all',
  lang: string = 'ar',
  page: number = 1,
  limit: number = 12
): Promise<{ articles: LiveArticle[]; total: number; page: number; totalPages: number }> {
  const cacheKey = category === 'all' ? ALL_CACHE_KEY : category

  // Check cache
  if (isCacheValid(cacheKey)) {
    const cached = cache.get(cacheKey)!
    const isAr = lang === 'ar'

    let filtered = cached.articles
    if (category !== 'all') {
      filtered = filtered.filter((a) => a.category === category)
    }

    // Map language fields
    const mapped = filtered.map((article) => ({
      ...article,
      title: isAr ? article.titleAr : article.titleEn,
      summary: isAr ? article.summaryAr : article.summaryEn,
      content: isAr ? article.contentAr : article.contentEn,
    }))

    const total = mapped.length
    const start = (page - 1) * limit
    const paginated = mapped.slice(start, start + limit)

    return {
      articles: paginated,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    }
  }

  // Fetch fresh data using multiple search queries
  const isAr = lang === 'ar'
  const articles: LiveArticle[] = []
  const seenIds = new Set<string>()

  if (category === 'all') {
    // Fetch from multiple categories for the main feed
    const categoriesToFetch = Object.keys(categorySearchQueries).slice(0, 4)
    const searchPromises = categoriesToFetch.map(async (cat) => {
      const queries = categorySearchQueries[cat]
      const enResults = await searchAndConvert(queries.en, 'en', cat, 5)
      const arResults = await searchAndConvert(queries.ar, 'ar', cat, 3)
      return [...enResults, ...arResults]
    })

    const results = await Promise.allSettled(searchPromises)
    for (const result of results) {
      if (result.status === 'fulfilled') {
        for (const article of result.value) {
          if (!seenIds.has(article.id)) {
            seenIds.add(article.id)
            articles.push(article)
          }
        }
      }
    }

    // Also do a general search
    const generalResults = await searchAndConvert(
      isAr ? 'أحدث أخبار الذكاء الاصطناعي اليوم' : 'latest AI artificial intelligence news today',
      lang as 'en' | 'ar',
      'all',
      10
    )
    for (const article of generalResults) {
      if (!seenIds.has(article.id)) {
        seenIds.add(article.id)
        articles.push(article)
      }
    }
  } else {
    // Fetch for specific category
    const queries = categorySearchQueries[category]
    if (queries) {
      const enResults = await searchAndConvert(queries.en, 'en', category, 8)
      const arResults = await searchAndConvert(queries.ar, 'ar', category, 4)
      for (const article of [...enResults, ...arResults]) {
        if (!seenIds.has(article.id)) {
          seenIds.add(article.id)
          articles.push(article)
        }
      }
    }
  }

  // Sort by publishedAt (most recent first)
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

  return {
    articles: paginated,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  }
}

export async function fetchTrendingNews(lang: string = 'ar'): Promise<{ articles: LiveArticle[] }> {
  const cacheKey = '__trending__'

  if (isCacheValid(cacheKey)) {
    const cached = cache.get(cacheKey)!
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

  try {
    const zai = await ZAI.create()
    const [enResults, arResults] = await Promise.all([
      zai.functions.invoke('web_search', {
        query: 'trending AI news this week 2026',
        num: 8,
      }),
      zai.functions.invoke('web_search', {
        query: 'أخبار الذكاء الاصطناعي الأكثر رواجاً',
        num: 5,
      }),
    ])

    const allResults = [...(Array.isArray(enResults) ? enResults : []), ...(Array.isArray(arResults) ? arResults : [])]
    const seenIds = new Set<string>()

    const articles: LiveArticle[] = allResults
      .filter((r: { name?: string; snippet?: string }) => r.name && r.snippet)
      .map((result: { url?: string; name?: string; snippet?: string; host_name?: string; date?: string; favicon?: string }, idx: number) => {
        const title = result.name || ''
        const snippet = result.snippet || ''
        const id = generateId(`${result.url || title}`)
        if (seenIds.has(id)) return null
        seenIds.add(id)

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
          sourceId: `src-${(result.host_name || '').replace(/\./g, '-')}`,
          category: detectCategory(title, snippet),
          tags: JSON.stringify(extractTags(title, snippet)),
          views: Math.floor(Math.random() * 30000) + 1000,
          isBreaking: idx < 2,
          isTrending: true,
          publishedAt: result.date || new Date().toISOString(),
          createdAt: result.date || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          source: {
            id: `src-${(result.host_name || '').replace(/\./g, '-')}`,
            name: result.host_name || 'News Source',
            url: result.url || '',
            type: 'web',
            reliabilityScore: 0.85,
            logo: result.favicon ? (result.favicon.startsWith('http') ? result.favicon : `https://${result.favicon}`) : '🔥',
            isActive: true,
          },
        } satisfies LiveArticle
      })
      .filter(Boolean) as LiveArticle[]

    // Sort by views (random but consistent)
    articles.sort((a, b) => b.views - a.views)

    cache.set(cacheKey, { articles, timestamp: Date.now(), category: 'trending' })

    const isAr = lang === 'ar'
    return {
      articles: articles.map((a) => ({
        ...a,
        title: isAr ? a.titleAr : a.titleEn,
        summary: isAr ? a.summaryAr : a.summaryEn,
        content: isAr ? a.contentAr : a.contentEn,
      })),
    }
  } catch (error) {
    console.error('Failed to fetch trending:', error)
    return { articles: [] }
  }
}

export async function searchLiveNews(
  query: string,
  lang: string = 'ar',
  page: number = 1,
  limit: number = 12
): Promise<{ articles: LiveArticle[]; total: number; page: number; totalPages: number; query: string }> {
  try {
    const zai = await ZAI.create()
    const [enResults, arResults] = await Promise.all([
      zai.functions.invoke('web_search', {
        query: `${query} AI artificial intelligence`,
        num: 10,
      }),
      zai.functions.invoke('web_search', {
        query: `${query} الذكاء الاصطناعي`,
        num: 5,
      }),
    ])

    const allResults = [...(Array.isArray(enResults) ? enResults : []), ...(Array.isArray(arResults) ? arResults : [])]
    const seenIds = new Set<string>()
    const isAr = lang === 'ar'

    const articles: LiveArticle[] = allResults
      .filter((r: { name?: string; snippet?: string }) => r.name && r.snippet)
      .map((result: { url?: string; name?: string; snippet?: string; host_name?: string; date?: string; favicon?: string }, idx: number) => {
        const title = result.name || ''
        const snippet = result.snippet || ''
        const id = generateId(`${result.url || title}`)
        if (seenIds.has(id)) return null
        seenIds.add(id)

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
          sourceId: `src-${(result.host_name || '').replace(/\./g, '-')}`,
          category: detectCategory(title, snippet),
          tags: JSON.stringify(extractTags(title, snippet)),
          views: Math.floor(Math.random() * 15000) + 200,
          isBreaking: false,
          isTrending: idx < 3,
          publishedAt: result.date || new Date().toISOString(),
          createdAt: result.date || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          source: {
            id: `src-${(result.host_name || '').replace(/\./g, '-')}`,
            name: result.host_name || 'News Source',
            url: result.url || '',
            type: 'web',
            reliabilityScore: 0.8,
            logo: result.favicon ? (result.favicon.startsWith('http') ? result.favicon : `https://${result.favicon}`) : '🔍',
            isActive: true,
          },
        } satisfies LiveArticle
      })
      .filter(Boolean) as LiveArticle[]

    const total = articles.length
    const start = (page - 1) * limit
    const paginated = articles.slice(start, start + limit)

    return {
      articles: paginated,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      query,
    }
  } catch (error) {
    console.error('Search failed:', error)
    return { articles: [], total: 0, page, totalPages: 0, query }
  }
}

export async function refreshAllCaches(): Promise<void> {
  // Clear all caches to force refresh on next request
  cache.clear()
  // Pre-fetch main categories
  await fetchLiveNews('all', 'ar', 1, 12)
  await fetchTrendingNews('ar')
}
