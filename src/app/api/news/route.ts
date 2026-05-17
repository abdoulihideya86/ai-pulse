import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const lang = searchParams.get('lang') || 'ar'
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = 12

    const where: Record<string, unknown> = {}
    if (category) {
      where.category = category
    }

    const [articles, total] = await Promise.all([
      db.article.findMany({
        where,
        include: {
          source: true,
        },
        orderBy: {
          publishedAt: 'desc',
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.article.count({ where }),
    ])

    // Map articles to prioritize language-specific fields
    const mappedArticles = articles.map((article) => {
      const isAr = lang === 'ar'
      return {
        ...article,
        title: isAr ? article.titleAr : article.titleEn,
        summary: isAr ? article.summaryAr : article.summaryEn,
        content: isAr ? article.contentAr : article.contentEn,
      }
    })

    return NextResponse.json({
      articles: mappedArticles,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error('Error fetching news:', error)
    return NextResponse.json(
      { error: 'Failed to fetch articles' },
      { status: 500 }
    )
  }
}
