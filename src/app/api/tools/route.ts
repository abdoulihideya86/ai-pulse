import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')

    const where: Record<string, unknown> = {
      isActive: true,
    }
    if (category) {
      where.category = category
    }

    const tools = await db.tool.findMany({
      where,
      orderBy: {
        rating: 'desc',
      },
    })

    // Parse features JSON for each tool
    const mappedTools = tools.map((tool) => {
      let features: string[] = []
      try {
        features = JSON.parse(tool.features || '[]')
      } catch {
        features = []
      }

      return {
        ...tool,
        features,
      }
    })

    return NextResponse.json({ tools: mappedTools })
  } catch (error) {
    console.error('Error fetching tools:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tools' },
      { status: 500 }
    )
  }
}
