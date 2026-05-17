import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // 1. Category distribution (count per category)
    const articles = await db.article.findMany({
      select: { category: true, tags: true, publishedAt: true, sourceId: true },
    })

    const categoryCount: Record<string, number> = {}
    const tagCount: Record<string, number> = {}
    const articlesByDay: Record<string, number> = {}

    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    for (const article of articles) {
      // Category distribution
      categoryCount[article.category] = (categoryCount[article.category] || 0) + 1

      // Trending topics from tags
      try {
        const tags: string[] = JSON.parse(article.tags || '[]')
        for (const tag of tags) {
          tagCount[tag] = (tagCount[tag] || 0) + 1
        }
      } catch {
        // Skip invalid JSON tags
      }

      // Articles per day (last 30 days)
      if (article.publishedAt >= thirtyDaysAgo) {
        const dayKey = article.publishedAt.toISOString().split('T')[0]
        articlesByDay[dayKey] = (articlesByDay[dayKey] || 0) + 1
      }
    }

    const categoryDistribution = Object.entries(categoryCount)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)

    // 2. Articles per day (fill in missing days)
    const articlesPerDay: { date: string; count: number }[] = []
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      const dayKey = date.toISOString().split('T')[0]
      articlesPerDay.push({
        date: dayKey,
        count: articlesByDay[dayKey] || 0,
      })
    }

    // 3. Top sources by reliability
    const sources = await db.source.findMany({
      where: { isActive: true },
      orderBy: { reliabilityScore: 'desc' },
      take: 10,
      include: {
        _count: {
          select: { articles: true },
        },
      },
    })

    const topSources = sources.map((source) => ({
      id: source.id,
      name: source.name,
      reliabilityScore: source.reliabilityScore,
      articleCount: source._count.articles,
      logo: source.logo,
    }))

    // 4. Trending topics from tags
    const trendingTopics = Object.entries(tagCount)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20)

    return NextResponse.json({
      categoryDistribution,
      articlesPerDay,
      topSources,
      trendingTopics,
      totalArticles: articles.length,
      period: '30d',
    })
  } catch (error) {
    console.error('Error fetching analytics trends:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    )
  }
}
