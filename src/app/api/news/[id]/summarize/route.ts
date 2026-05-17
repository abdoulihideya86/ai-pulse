import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const article = await db.article.findUnique({
      where: { id },
      include: {
        source: true,
      },
    })

    if (!article) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      )
    }

    // Use the best available content for summarization
    const contentToSummarize =
      article.contentEn || article.contentAr || article.summaryEn || article.summaryAr || ''

    if (!contentToSummarize) {
      return NextResponse.json(
        { error: 'No content available to summarize' },
        { status: 400 }
      )
    }

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

    const summaryAr =
      arResponse.choices?.[0]?.message?.content || article.summaryAr || ''
    const summaryEn =
      enResponse.choices?.[0]?.message?.content || article.summaryEn || ''

    // Update the article with the generated summaries
    await db.article.update({
      where: { id },
      data: {
        summaryAr,
        summaryEn,
      },
    })

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
