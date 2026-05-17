import { NextResponse } from 'next/server'
import { fetchLiveNews, fetchTrendingNews } from '@/lib/news-service'

export async function GET() {
  try {
    // Fetch real data to compute stats
    const [allNews, trendingNews] = await Promise.all([
      fetchLiveNews('all', 'en', 1, 50).catch(() => ({ articles: [], total: 0 })),
      fetchTrendingNews('en').catch(() => ({ articles: [] })),
    ])

    const allArticles = [...(allNews.articles || []), ...(trendingNews.articles || [])]

    // Remove duplicates
    const seenIds = new Set<string>()
    const uniqueArticles = allArticles.filter((a) => {
      if (seenIds.has(a.id)) return false
      seenIds.add(a.id)
      return true
    })

    // Count by category
    const categoryCounts: Record<string, number> = {}
    for (const article of uniqueArticles) {
      categoryCounts[article.category] = (categoryCounts[article.category] || 0) + 1
    }

    // Count unique sources
    const sourcesSet = new Set(uniqueArticles.map((a) => a.source?.name).filter(Boolean))

    // Count breaking news
    const breakingCount = uniqueArticles.filter((a) => a.isBreaking).length

    // Total views
    const totalViews = uniqueArticles.reduce((sum, a) => sum + (a.views || 0), 0)

    return NextResponse.json({
      totalArticles: uniqueArticles.length,
      totalSources: sourcesSet.size,
      totalViews,
      breakingCount,
      categoryCounts,
      lastUpdated: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json({
      totalArticles: 0,
      totalSources: 0,
      totalViews: 0,
      breakingCount: 0,
      categoryCounts: {},
      lastUpdated: new Date().toISOString(),
    })
  }
}
