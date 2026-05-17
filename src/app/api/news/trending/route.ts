import { NextRequest, NextResponse } from 'next/server'
import { fetchTrendingNews } from '@/lib/news-service'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const lang = searchParams.get('lang') || 'ar'

    const result = await fetchTrendingNews(lang)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching trending articles:', error)
    return NextResponse.json(
      { error: 'Failed to fetch trending articles', articles: [] },
      { status: 500 }
    )
  }
}
