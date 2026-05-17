import { NextRequest, NextResponse } from 'next/server'
import { getCachedArticles } from '@/lib/news-service'
import ZAI from 'z-ai-web-dev-sdk'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Find article in the live news cache
    const cachedArticles = getCachedArticles()
    const article = cachedArticles.find((a) => a.id === id)

    let contentToSummarize = ''
    let articleSummaryAr = ''
    let articleSummaryEn = ''

    if (article) {
      contentToSummarize =
        article.contentEn || article.contentAr || article.summaryEn || article.summaryAr || ''
      articleSummaryAr = article.summaryAr || ''
      articleSummaryEn = article.summaryEn || ''
    } else {
      return NextResponse.json(
        { error: 'Article not found in cache' },
        { status: 404 }
      )
    }

    if (!contentToSummarize) {
      return NextResponse.json(
        { error: 'No content available to summarize' },
        { status: 400 }
      )
    }

    // Try to use ZAI SDK for AI summarization
    let summaryAr = articleSummaryAr
    let summaryEn = articleSummaryEn

    try {
      const zai = await ZAI.create()

      // Generate Arabic summary
      const arResponse = await zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content:
              'أنت مساعد ذكي متخصص في تلخيص الأخبار. قم بتلخيص المقال التالي في 3 نقاط رئيسية موجزة وواضحة. استخدم التنسيق التالي:\n• النقطة الأولى\n• النقطة الثانية\n• النقطة الثالثة',
          },
          {
            role: 'user',
            content: `لخص هذا المقال في 3 نقاط:\n\n${contentToSummarize}`,
          },
        ],
      })

      // Generate English summary
      const enResponse = await zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content:
              'You are an intelligent assistant specialized in summarizing news. Summarize the following article in 3 concise and clear bullet points. Use this format:\n• First point\n• Second point\n• Third point',
          },
          {
            role: 'user',
            content: `Summarize this article in 3 bullet points:\n\n${contentToSummarize}`,
          },
        ],
      })

      summaryAr =
        arResponse.choices?.[0]?.message?.content || articleSummaryAr
      summaryEn =
        enResponse.choices?.[0]?.message?.content || articleSummaryEn
    } catch (aiError) {
      console.warn('AI summarization unavailable, using existing summaries:', aiError)
      // Keep the existing article summaries as fallback
    }

    return NextResponse.json({
      summary: {
        ar: summaryAr,
        en: summaryEn,
      },
      articleId: id,
    })
  } catch (error) {
    console.error('Error generating summary:', error)
    return NextResponse.json(
      { error: 'Failed to generate summary' },
      { status: 500 }
    )
  }
}
