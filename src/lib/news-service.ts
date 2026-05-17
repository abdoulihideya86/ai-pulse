// Real News Fetching Service for AI Pulse
// Search methods (in order of priority):
// 1. Z-AI Gateway (direct HTTP) - works locally, may work on Vercel if URL is reachable
// 2. Z-AI SDK fallback - works locally where .z-ai-config exists
// 3. RSS Feeds - ALWAYS works from anywhere (Vercel included), no API key needed
// 4. GNews API - works from Vercel if API key is provided

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

interface SearchResultItem {
  url?: string
  name?: string
  snippet?: string
  host_name?: string
  date?: string
  favicon?: string
  rank?: number
}

// ─── Z-AI Gateway Config (from env vars, with local fallbacks) ──────────────

const ZAI_BASE_URL = process.env.ZAI_BASE_URL || 'http://172.25.136.193:8080/v1'
const ZAI_API_KEY = process.env.ZAI_API_KEY || 'Z.ai'
const ZAI_TOKEN = process.env.ZAI_TOKEN || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiZjgxOGI2MjktY2IxMy00NWU4LWFlNzItOGQ0ZTZmNjMxZmFiIiwiY2hhdF9pZCI6ImNoYXQtMGE4NWYxMmUtMTBhMS00MThlLWFiOTMtN2Y4OWQxZDk2YWJiIiwicGxhdGZvcm0iOiJ6YWkifQ.yhPiuLkp4j_HDEredENsR2G8iRn6sQlV04hagGMbf9w'
const ZAI_USER_ID = process.env.ZAI_USER_ID || 'f818b629-cb13-45e8-ae72-8d4e6f631fab'
const ZAI_CHAT_ID = process.env.ZAI_CHAT_ID || 'chat-0a85f12e-10a1-418e-ab93-7f89d1d96abb'

// GNews API (free, works from Vercel)
const GNEWS_API_KEY = process.env.GNEWS_API_KEY || ''

// ─── Search Methods ─────────────────────────────────────────────────────────

// Method 1: Direct HTTP to Z-AI Gateway
async function webSearchGateway(query: string, num: number = 10): Promise<SearchResultItem[]> {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${ZAI_API_KEY}`,
      'X-Z-AI-From': 'Z',
      'X-Chat-Id': ZAI_CHAT_ID,
      'X-User-Id': ZAI_USER_ID,
    }
    if (ZAI_TOKEN) {
      headers['X-Token'] = ZAI_TOKEN
    }

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10000) // 10s timeout

    const response = await fetch(`${ZAI_BASE_URL}/functions/invoke`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        function_name: 'web_search',
        arguments: { query, num },
      }),
      signal: controller.signal,
    })

    clearTimeout(timeout)

    if (!response.ok) {
      console.error(`Gateway HTTP ${response.status}: ${response.statusText}`)
      return []
    }

    const data = await response.json()

    if (Array.isArray(data?.result)) return data.result
    if (Array.isArray(data)) return data
    if (Array.isArray(data?.data)) return data.data
    if (Array.isArray(data?.results)) return data.results

    return []
  } catch (error) {
    console.error('Gateway search failed:', (error as Error).message)
    return []
  }
}

// Method 2: SDK fallback (for local dev where config file exists)
async function webSearchSDK(query: string, num: number = 10): Promise<SearchResultItem[]> {
  try {
    const ZAI = (await import('z-ai-web-dev-sdk')).default
    const zai = await ZAI.create()
    const results = await zai.functions.invoke('web_search', { query, num })
    if (Array.isArray(results)) return results as SearchResultItem[]
    return []
  } catch {
    return []
  }
}

// Method 3: GNews API fallback (works from Vercel)
async function webSearchGNews(query: string, num: number = 10): Promise<SearchResultItem[]> {
  if (!GNEWS_API_KEY) return []
  try {
    const url = `https://gnews.io/api/v4/search?q=${encodeURIComponent(query)}&lang=en&max=${num}&apikey=${GNEWS_API_KEY}`
    const response = await fetch(url, { signal: AbortSignal.timeout(8000) })
    if (!response.ok) return []
    const data = await response.json()
    if (!Array.isArray(data?.articles)) return []

    return data.articles.map((a: { title?: string; description?: string; url?: string; source?: { name?: string }; image?: string; publishedAt?: string }) => ({
      name: a.title || '',
      snippet: a.description || '',
      url: a.url || '',
      host_name: a.source?.name || '',
      date: a.publishedAt || '',
      favicon: '',
    }))
  } catch (error) {
    console.error('GNews search failed:', (error as Error).message)
    return []
  }
}

// Method 4: RSS Feeds (ALWAYS works, no API key needed)
const RSS_FEEDS = [
  { url: 'https://techcrunch.com/category/artificial-intelligence/feed/', source: 'techcrunch.com', category: 'general-ai' },
  { url: 'https://www.theverge.com/rss/ai-artificial-intelligence/index.xml', source: 'theverge.com', category: 'general-ai' },
  { url: 'https://arstechnica.com/tagged/ai/feed/', source: 'arstechnica.com', category: 'general-ai' },
  { url: 'https://www.wired.com/feed/tag/ai/latest/rss', source: 'wired.com', category: 'general-ai' },
  { url: 'https://www.technologyreview.com/feed/', source: 'technologyreview.com', category: 'machine-learning' },
  { url: 'https://blogs.nvidia.com/blog/category/ai/feed/', source: 'blogs.nvidia.com', category: 'general-ai' },
  { url: 'https://openai.com/blog/rss.xml', source: 'openai.com', category: 'general-ai' },
  { url: 'https://www.deepmind.google/feed/', source: 'deepmind.google', category: 'machine-learning' },
]

// Simple XML parser for RSS feeds (no external dependency needed)
function parseRSSItems(xml: string): SearchResultItem[] {
  const items: SearchResultItem[] = []

  // Match <item>...</item> blocks (RSS 2.0)
  const itemRegex = /<item[\s\S]*?<\/item>/gi
  const matches = xml.match(itemRegex) || []

  for (const item of matches) {
    const title = item.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.trim() || ''
    const link = item.match(/<link[^>]*>([\s\S]*?)<\/link>/i)?.[1]?.trim() || ''
    const description = item.match(/<description[^>]*>([\s\S]*?)<\/description>/i)?.[1]?.trim() || ''
    const pubDate = item.match(/<pubDate[^>]*>([\s\S]*?)<\/pubDate>/i)?.[1]?.trim() || ''
    const contentEncoded = item.match(/<content:encoded[^>]*>([\s\S]*?)<\/content:encoded>/i)?.[1]?.trim() || ''

    // Clean HTML entities and tags from title and description
    const cleanTitle = decodeHTMLEntities(title.replace(/<[^>]+>/g, ''))
    const cleanDescription = decodeHTMLEntities(description.replace(/<[^>]+>/g, ''))
    const cleanContent = decodeHTMLEntities(contentEncoded.replace(/<[^>]+>/g, ''))

    if (cleanTitle && (cleanDescription || cleanContent)) {
      items.push({
        name: cleanTitle,
        snippet: cleanDescription || cleanContent.substring(0, 300),
        url: link,
        host_name: '',
        date: pubDate ? new Date(pubDate).toISOString() : '',
        favicon: '',
      })
    }
  }

  // Also try Atom <entry>...</entry> format
  const entryRegex = /<entry[\s\S]*?<\/entry>/gi
  const entryMatches = xml.match(entryRegex) || []

  for (const entry of entryMatches) {
    const title = entry.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.trim() || ''
    const link = entry.match(/<link[^>]*href="([^"]*)"[^>]*\/?>/i)?.[1]?.trim() ||
                 entry.match(/<link[^>]*>([\s\S]*?)<\/link>/i)?.[1]?.trim() || ''
    const summary = entry.match(/<summary[^>]*>([\s\S]*?)<\/summary>/i)?.[1]?.trim() ||
                    entry.match(/<content[^>]*>([\s\S]*?)<\/content>/i)?.[1]?.trim() || ''
    const updated = entry.match(/<updated[^>]*>([\s\S]*?)<\/updated>/i)?.[1]?.trim() ||
                    entry.match(/<published[^>]*>([\s\S]*?)<\/published>/i)?.[1]?.trim() || ''

    const cleanTitle = decodeHTMLEntities(title.replace(/<[^>]+>/g, ''))
    const cleanSummary = decodeHTMLEntities(summary.replace(/<[^>]+>/g, ''))

    if (cleanTitle && cleanSummary) {
      items.push({
        name: cleanTitle,
        snippet: cleanSummary.substring(0, 300),
        url: link,
        host_name: '',
        date: updated ? new Date(updated).toISOString() : '',
        favicon: '',
      })
    }
  }

  return items
}

function decodeHTMLEntities(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, num) => String.fromCharCode(parseInt(num)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .trim()
}

async function fetchRSSFeed(feedUrl: string, sourceName: string): Promise<SearchResultItem[]> {
  try {
    const response = await fetch(feedUrl, {
      signal: AbortSignal.timeout(8000),
      headers: {
        'User-Agent': 'AI-Pulse-News-Bot/1.0',
        'Accept': 'application/rss+xml, application/xml, text/xml, application/atom+xml',
      },
    })

    if (!response.ok) return []

    const xml = await response.text()
    const items = parseRSSItems(xml)

    // Set the host_name from the feed source
    items.forEach(item => {
      if (!item.host_name) item.host_name = sourceName
    })

    return items
  } catch (error) {
    console.error(`RSS feed failed for ${feedUrl}:`, (error as Error).message)
    return []
  }
}

// Combined search: Gateway → SDK → RSS → GNews
async function searchWeb(query: string, num: number = 10): Promise<SearchResultItem[]> {
  // Try Z-AI Gateway first (works locally and on Vercel if URL is reachable)
  const gatewayResults = await webSearchGateway(query, num)
  if (gatewayResults.length > 0) {
    console.log(`[searchWeb] Gateway returned ${gatewayResults.length} results for: ${query}`)
    return gatewayResults
  }

  // Try SDK fallback (works locally where .z-ai-config exists)
  const sdkResults = await webSearchSDK(query, num)
  if (sdkResults.length > 0) {
    console.log(`[searchWeb] SDK returned ${sdkResults.length} results for: ${query}`)
    return sdkResults
  }

  // Try RSS feeds (ALWAYS works from anywhere, no API key needed)
  const rssResults = await searchRSSFeeds(query, num)
  if (rssResults.length > 0) {
    console.log(`[searchWeb] RSS returned ${rssResults.length} results for: ${query}`)
    return rssResults
  }

  // Try GNews API (works from Vercel if API key is provided)
  const gnewsResults = await webSearchGNews(query, num)
  if (gnewsResults.length > 0) {
    console.log(`[searchWeb] GNews returned ${gnewsResults.length} results for: ${query}`)
    return gnewsResults
  }

  console.log(`[searchWeb] ALL methods failed for: ${query}`)
  return []
}

// Search RSS feeds and filter/sort by relevance to query
async function searchRSSFeeds(query: string, num: number = 10): Promise<SearchResultItem[]> {
  // Fetch all RSS feeds in parallel
  const feedPromises = RSS_FEEDS.map(feed =>
    fetchRSSFeed(feed.url, feed.source).catch(() => [] as SearchResultItem[])
  )
  const feedResults = await Promise.allSettled(feedPromises)

  const allItems: SearchResultItem[] = []
  for (const result of feedResults) {
    if (result.status === 'fulfilled') {
      allItems.push(...result.value)
    }
  }

  // Filter by query relevance
  const queryTerms = query.toLowerCase().split(/\s+/).filter(t => t.length > 2)
  const scored = allItems.map(item => {
    const text = `${item.name} ${item.snippet}`.toLowerCase()
    let score = 0
    for (const term of queryTerms) {
      if (text.includes(term)) score += 1
    }
    return { item, score }
  })

  // Sort by score (relevant first), then by date
  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score
    return new Date(b.item.date || 0).getTime() - new Date(a.item.date || 0).getTime()
  })

  // If no query-relevant results, return all items sorted by date
  const relevantResults = scored.filter(s => s.score > 0)
  if (relevantResults.length > 0) {
    return relevantResults.slice(0, num).map(s => s.item)
  }

  // Fallback: return latest items regardless of query
  return scored
    .sort((a, b) => new Date(b.item.date || 0).getTime() - new Date(a.item.date || 0).getTime())
    .slice(0, num)
    .map(s => s.item)
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

// Source reliability mapping based on known domains
const sourceReliability: Record<string, number> = {
  'techcrunch.com': 0.92, 'theverge.com': 0.88, 'arstechnica.com': 0.90,
  'nature.com': 0.97, 'wired.com': 0.86, 'venturebeat.com': 0.82,
  'reuters.com': 0.95, 'bbc.com': 0.94, 'bloomberg.com': 0.93,
  'wsj.com': 0.93, 'nytimes.com': 0.91, 'theguardian.com': 0.89,
  'mit.edu': 0.98, 'stanford.edu': 0.97, 'arxiv.org': 0.96,
  'openai.com': 0.90, 'deepmind.google': 0.91, 'ai.google': 0.89,
  'anthropic.com': 0.90, 'huggingface.co': 0.88, 'medium.com': 0.70,
  'dev.to': 0.72, 'zdnet.com': 0.80, 'engadget.com': 0.78,
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
    if (isNaN(d.getTime())) return true
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

function getReliabilityScore(hostName: string): number {
  if (sourceReliability[hostName]) return sourceReliability[hostName]
  for (const [domain, score] of Object.entries(sourceReliability)) {
    if (hostName.endsWith(domain) || domain.endsWith(hostName)) return score
  }
  return 0.70
}

function isBreakingNews(title: string, snippet: string, dateStr: string): boolean {
  const text = `${title} ${snippet}`.toLowerCase()
  const breakingKeywords = ['breaking', 'just announced', 'just released', 'urgent', 'عاجل', 'لحظة بلحظة']
  const hasBreakingKeyword = breakingKeywords.some(kw => text.includes(kw))
  if (!hasBreakingKeyword) return false
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return false
    const hoursDiff = (Date.now() - d.getTime()) / (1000 * 60 * 60)
    return hoursDiff <= 6
  } catch {
    return false
  }
}

function mapSearchResult(result: SearchResultItem, index: number): LiveArticle | null {
  const title = result.name || ''
  const snippet = result.snippet || ''
  if (!title || !snippet) return null

  const id = generateId(`${result.url || title}`)
  const hostName = result.host_name || ''
  const favicon = result.favicon || ''
  const category = detectCategory(title, snippet)
  const publishedAt = result.date || new Date().toISOString()

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
    views: 0,
    isBreaking: isBreakingNews(title, snippet, publishedAt),
    isTrending: false,
    publishedAt,
    createdAt: publishedAt,
    updatedAt: new Date().toISOString(),
    source: {
      id: `src-${hostName.replace(/\./g, '-')}`,
      name: hostName || 'News Source',
      url: result.url || '',
      type: 'web',
      reliabilityScore: getReliabilityScore(hostName),
      logo: favicon ? (favicon.startsWith('http') ? favicon : `https://${favicon}`) : '',
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
    const results = await searchWeb(query, limit)

    const seenIds = new Set<string>()
    return results
      .map((r, idx) => mapSearchResult(r, idx))
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

  // Mark trending based on recency (within 48h = trending)
  const now = Date.now()
  articles.forEach((a) => {
    const hoursDiff = (now - new Date(a.publishedAt).getTime()) / (1000 * 60 * 60)
    a.isTrending = hoursDiff <= 48
  })

  articles.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())

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

export async function fetchAITools(): Promise<Array<{
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
}>> {
  try {
    const [enResults, arResults] = await Promise.allSettled([
      searchWeb('best AI tools 2026 ChatGPT Claude Midjourney Stable Diffusion Cursor Copilot', 10),
      searchWeb('أفضل أدوات الذكاء الاصطناعي 2026', 5),
    ])

    const tools: Array<{
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
    }> = []

    const processResults = (results: SearchResultItem[]) => {
      for (const r of results) {
        const name = r.name || ''
        const snippet = r.snippet || ''
        const url = r.url || ''
        if (!name) continue

        const toolKeywords = ['ai', 'tool', 'app', 'platform', 'software', 'model', 'assistant', 'chatbot', 'generator', 'copilot', 'gpt', 'claude', 'gemini', 'llm', 'bot', 'midjourney', 'dall-e', 'stable diffusion', 'cursor', 'ai tool', 'أداة', 'تطبيق', 'منصة']
        const textToCheck = `${name} ${snippet}`.toLowerCase()
        const isTool = toolKeywords.some(kw => textToCheck.includes(kw))
        if (!isTool) continue

        let category = 'productivity'
        const lowerName = name.toLowerCase()
        const lowerSnippet = snippet.toLowerCase()
        if (lowerName.includes('code') || lowerName.includes('cursor') || lowerName.includes('copilot') || lowerSnippet.includes('coding') || lowerSnippet.includes('developer')) category = 'coding'
        else if (lowerName.includes('write') || lowerName.includes('grammar') || lowerSnippet.includes('writing') || lowerSnippet.includes('content')) category = 'writing'
        else if (lowerName.includes('image') || lowerName.includes('midjourney') || lowerName.includes('dall-e') || lowerName.includes('diffusion') || lowerSnippet.includes('image generation') || lowerSnippet.includes('visual')) category = 'image-generation'
        else if (lowerName.includes('audio') || lowerName.includes('speech') || lowerName.includes('voice') || lowerSnippet.includes('speech') || lowerSnippet.includes('audio')) category = 'speech'
        else if (lowerName.includes('video') || lowerSnippet.includes('video generation')) category = 'video'
        else if (lowerName.includes('search') || lowerName.includes('perplexity') || lowerSnippet.includes('search engine')) category = 'search'
        else if (lowerName.includes('chat') || lowerName.includes('gpt') || lowerName.includes('claude') || lowerName.includes('gemini') || lowerName.includes('bot') || lowerSnippet.includes('chatbot')) category = 'chatbots'
        else if (lowerName.includes('langchain') || lowerName.includes('hugging') || lowerName.includes('framework') || lowerSnippet.includes('framework') || lowerSnippet.includes('open source')) category = 'frameworks'

        let pricing = 'freemium'
        if (lowerSnippet.includes('free') || lowerSnippet.includes('open source') || lowerSnippet.includes('مجاني') || lowerSnippet.includes('مفتوح المصدر')) pricing = 'free'
        else if (lowerSnippet.includes('subscription') || lowerSnippet.includes('paid') || lowerSnippet.includes('$') || lowerSnippet.includes('اشتراك') || lowerSnippet.includes('مدفوع')) pricing = 'subscription'

        const id = `tool-${generateId(name)}`

        if (tools.some(t => t.id === id)) continue

        tools.push({
          id,
          name,
          description: snippet || null,
          category,
          rating: 4.0 + (generateId(name + 'rating').charCodeAt(0) % 10) / 10,
          pricing,
          url: url || null,
          imageUrl: null,
          features: extractToolFeatures(snippet),
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
      }
    }

    if (enResults.status === 'fulfilled') processResults(enResults.value)
    if (arResults.status === 'fulfilled') processResults(arResults.value)

    tools.sort((a, b) => b.rating - a.rating)

    return tools
  } catch (error) {
    console.error('Error fetching AI tools:', error)
    return []
  }
}

function extractToolFeatures(snippet: string): string[] {
  const features: string[] = []
  const featureKeywords: Record<string, string> = {
    'code generation': 'Code Generation',
    'code completion': 'Code Completion',
    'image generation': 'Image Generation',
    'text generation': 'Text Generation',
    'chat': 'Chat Interface',
    'api': 'API Access',
    'open source': 'Open Source',
    'free': 'Free Tier',
    'real-time': 'Real-time',
    'multilingual': 'Multilingual',
    'integration': 'Integrations',
    'collaboration': 'Collaboration',
    'automation': 'Automation',
    'analysis': 'Analysis',
    'writing': 'Writing Assistant',
    'search': 'Web Search',
    'voice': 'Voice Support',
    'video': 'Video Generation',
    'fine-tun': 'Fine-tuning',
    'custom model': 'Custom Models',
    'microsoft': 'Microsoft Integration',
    'google': 'Google Integration',
    'plugin': 'Plugins',
  }

  const lowerSnippet = snippet.toLowerCase()
  for (const [keyword, feature] of Object.entries(featureKeywords)) {
    if (lowerSnippet.includes(keyword) && features.length < 5) {
      if (!features.includes(feature)) features.push(feature)
    }
  }

  if (features.length === 0) {
    features.push('AI-Powered')
  }

  return features
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
