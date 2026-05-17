import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const lang = searchParams.get('lang') || 'ar'
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = 12

    if (!userId) {
      return NextResponse.json(
        { error: 'userId query parameter is required' },
        { status: 400 }
      )
    }

    // Check if user exists
    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        interests: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const isAr = lang === 'ar'

    // If user has no interests, return general trending articles
    if (user.interests.length === 0) {
      const articles = await db.article.findMany({
        where: { isTrending: true },
        include: { source: true },
        orderBy: { publishedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      })

      const total = await db.article.count({ where: { isTrending: true } })

      const mappedArticles = articles.map((article) => ({
        ...article,
        title: isAr ? article.titleAr : article.titleEn,
        summary: isAr ? article.summaryAr : article.summaryEn,
        content: isAr ? article.contentAr : article.contentEn,
      }))

      return NextResponse.json({
        articles: mappedArticles,
        total,
        page,
        totalPages: Math.ceil(total / limit),
        personalized: false,
      })
    }

    // Get categories sorted by weight (highest first)
    const interestsByWeight = [...user.interests].sort(
      (a, b) => b.weight - a.weight
    )
    const categories = interestsByWeight.map((i) => i.category)

    // Build weight map for scoring
    const weightMap = new Map(
      user.interests.map((i) => [i.category, i.weight])
    )

    // Fetch articles from the user's interest categories
    const articles = await db.article.findMany({
      where: {
        category: { in: categories },
      },
      include: {
        source: true,
      },
      orderBy: {
        publishedAt: 'desc',
      },
    })

    // Score and sort articles by category weight and recency
    const now = new Date()
    const scoredArticles = articles.map((article) => {
      const weight = weightMap.get(article.category) || 1
      const daysSincePublish = Math.max(
        1,
        (now.getTime() - article.publishedAt.getTime()) / (1000 * 60 * 60 * 24)
      )
      // Score: higher weight and more recent = higher score
      const recencyScore = 1 / Math.log2(daysSincePublish + 1)
      const score = weight * 0.7 + recencyScore * 0.3

      return { article, score }
    })

    scoredArticles.sort((a, b) => b.score - a.score)

    // Apply pagination
    const total = scoredArticles.length
    const paginatedArticles = scoredArticles.slice(
      (page - 1) * limit,
      page * limit
    )

    const mappedArticles = paginatedArticles.map(({ article }) => ({
      ...article,
      title: isAr ? article.titleAr : article.titleEn,
      summary: isAr ? article.summaryAr : article.summaryEn,
      content: isAr ? article.contentAr : article.contentEn,
    }))

    return NextResponse.json({
      articles: mappedArticles,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      personalized: true,
      interests: interestsByWeight.map((i) => ({
        category: i.category,
        weight: i.weight,
      })),
    })
  } catch (error) {
    console.error('Error fetching user feed:', error)
    return NextResponse.json(
      { error: 'Failed to fetch personalized feed' },
      { status: 500 }
    )
  }
}
