import { NextRequest, NextResponse } from 'next/server'
import { fetchLiveNews, getBaseViews } from '@/lib/news-service'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category') || 'all'
    const lang = searchParams.get('lang') || 'ar'
    const page = parseInt(searchParams.get('page') || '1', 10)

    const result = await fetchLiveNews(category, lang, page)

    // Overlay view counts from the in-memory counter
    const articles = result.articles.map((article) => ({
      ...article,
      views: getBaseViews(article.id),
    }))

    return NextResponse.json({ ...result, articles })
  } catch (error) {
    console.error('Error fetching news:', error)
    return NextResponse.json(
      { error: 'Failed to fetch articles', articles: [], total: 0, page: 1, totalPages: 0 },
      { status: 500 }
    )
  }
}
