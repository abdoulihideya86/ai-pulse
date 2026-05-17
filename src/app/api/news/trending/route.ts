import { NextRequest, NextResponse } from 'next/server'
import { fetchTrendingNews, getViews } from '@/lib/news-service'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const lang = searchParams.get('lang') || 'ar'

    const result = await fetchTrendingNews(lang)

    // Overlay real view counts from the in-memory counter
    const articles = result.articles.map((article) => ({
      ...article,
      views: getViews(article.id),
    }))

    return NextResponse.json({ ...result, articles })
  } catch (error) {
    console.error('Error fetching trending articles:', error)
    return NextResponse.json(
      { error: 'Failed to fetch trending articles', articles: [] },
      { status: 500 }
    )
  }
}
