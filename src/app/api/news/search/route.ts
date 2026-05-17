import { NextRequest, NextResponse } from 'next/server'
import { searchLiveNews } from '@/lib/news-service'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q') || ''
    const lang = searchParams.get('lang') || 'ar'
    const page = parseInt(searchParams.get('page') || '1', 10)

    if (!q.trim()) {
      return NextResponse.json(
        { error: 'Search query parameter "q" is required' },
        { status: 400 }
      )
    }

    const result = await searchLiveNews(q, lang, page)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error searching articles:', error)
    return NextResponse.json(
      { error: 'Failed to search articles', articles: [], total: 0, page: 1, totalPages: 0, query: '' },
      { status: 500 }
    )
  }
}
