import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q') || ''
    const lang = searchParams.get('lang') || 'ar'
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = 12

    if (!q.trim()) {
      return NextResponse.json(
        { error: 'Search query parameter "q" is required' },
        { status: 400 }
      )
    }

    const where = {
      OR: [
        { titleAr: { contains: q } },
        { titleEn: { contains: q } },
        { summaryAr: { contains: q } },
        { summaryEn: { contains: q } },
      ],
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

    const isAr = lang === 'ar'
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
      query: q,
    })
  } catch (error) {
    console.error('Error searching articles:', error)
    return NextResponse.json(
      { error: 'Failed to search articles' },
      { status: 500 }
    )
  }
}
