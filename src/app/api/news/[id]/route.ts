import { NextRequest, NextResponse } from 'next/server'
import { fetchLiveNews } from '@/lib/news-service'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const lang = searchParams.get('lang') || 'ar'
    const isAr = lang === 'ar'

    // Search for article by ID in cached/live data
    // Since we don't have a database, we fetch from cache and find by ID
    const result = await fetchLiveNews('all', lang, 1, 50)
    const article = result.articles.find((a) => a.id === id)

    if (!article) {
      // Try trending
      const { fetchTrendingNews } = await import('@/lib/news-service')
      const trending = await fetchTrendingNews(lang)
      const trendingArticle = trending.articles.find((a) => a.id === id)

      if (!trendingArticle) {
        return NextResponse.json(
          { error: 'Article not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        article: {
          ...trendingArticle,
          views: trendingArticle.views + 1,
          title: isAr ? trendingArticle.titleAr : trendingArticle.titleEn,
          summary: isAr ? trendingArticle.summaryAr : trendingArticle.summaryEn,
          content: isAr ? trendingArticle.contentAr : trendingArticle.contentEn,
        },
      })
    }

    return NextResponse.json({
      article: {
        ...article,
        views: article.views + 1,
        title: isAr ? article.titleAr : article.titleEn,
        summary: isAr ? article.summaryAr : article.summaryEn,
        content: isAr ? article.contentAr : article.contentEn,
      },
    })
  } catch (error) {
    console.error('Error fetching article:', error)
    return NextResponse.json(
      { error: 'Failed to fetch article' },
      { status: 500 }
    )
  }
}
