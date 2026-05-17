import { NextResponse } from 'next/server'
import { fetchLiveNews, fetchTrendingNews } from '@/lib/news-service'

export async function GET() {
  try {
    // Fetch news to compute analytics from live data
    const [allNews, trendingNews] = await Promise.all([
      fetchLiveNews('all', 'en', 1, 50),
      fetchTrendingNews('en'),
    ])

    const articles = [...allNews.articles, ...trendingNews.articles]

    // Remove duplicates
    const seenIds = new Set<string>()
    const uniqueArticles = articles.filter((a) => {
      if (seenIds.has(a.id)) return false
      seenIds.add(a.id)
      return true
    })

    // Category distribution
    const categoryCount: Record<string, number> = {}
    for (const article of uniqueArticles) {
      categoryCount[article.category] = (categoryCount[article.category] || 0) + 1
    }

    const categoryDistribution = Object.entries(categoryCount)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)

    // Articles per day (last 30 days)
    const now = new Date()
    const articlesByDay: Record<string, number> = {}
    for (const article of uniqueArticles) {
      const dayKey = new Date(article.publishedAt).toISOString().split('T')[0]
      articlesByDay[dayKey] = (articlesByDay[dayKey] || 0) + 1
    }

    const articlesPerDay: { date: string; count: number }[] = []
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      const dayKey = date.toISOString().split('T')[0]
      articlesPerDay.push({ date: dayKey, count: articlesByDay[dayKey] || 0 })
    }

    // Top sources
    const sourceMap = new Map<string, { id: string; name: string; reliabilityScore: number; logo: string; articleCount: number }>()
    for (const article of uniqueArticles) {
      if (article.source) {
        const key = article.source.name
        const existing = sourceMap.get(key)
        if (existing) {
          existing.articleCount++
        } else {
          sourceMap.set(key, {
            id: article.source.id,
            name: article.source.name,
            reliabilityScore: article.source.reliabilityScore,
            logo: article.source.logo,
            articleCount: 1,
          })
        }
      }
    }
    const topSources = Array.from(sourceMap.values())
      .sort((a, b) => b.reliabilityScore - a.reliabilityScore)
      .slice(0, 10)

    // Trending topics from tags
    const tagCount: Record<string, number> = {}
    for (const article of uniqueArticles) {
      try {
        const tags: string[] = JSON.parse(article.tags || '[]')
        for (const tag of tags) {
          tagCount[tag] = (tagCount[tag] || 0) + 1
        }
      } catch {
        // skip
      }
    }

    const trendingTopics = Object.entries(tagCount)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20)

    return NextResponse.json({
      categoryDistribution,
      articlesPerDay,
      topSources,
      trendingTopics,
      totalArticles: uniqueArticles.length,
      period: '30d',
    })
  } catch (error) {
    console.error('Error fetching analytics trends:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics data', categoryDistribution: [], articlesPerDay: [], topSources: [], trendingTopics: [], totalArticles: 0, period: '30d' },
      { status: 500 }
    )
  }
}
