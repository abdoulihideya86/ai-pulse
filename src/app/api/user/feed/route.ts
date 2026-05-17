import { NextRequest, NextResponse } from 'next/server'
import { fetchTrendingNews } from '@/lib/news-service'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const lang = searchParams.get('lang') || 'ar'
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = 12

    // For now, return trending as personalized feed (no user DB required)
    const result = await fetchTrendingNews(lang)

    const total = result.articles.length
    const start = (page - 1) * limit
    const paginated = result.articles.slice(start, start + limit)

    return NextResponse.json({
      articles: paginated,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      personalized: false,
    })
  } catch (error) {
    console.error('Error fetching user feed:', error)
    return NextResponse.json(
      { error: 'Failed to fetch feed', articles: [], total: 0, page: 1, totalPages: 0, personalized: false },
      { status: 500 }
    )
  }
}
