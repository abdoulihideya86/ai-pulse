import { NextRequest, NextResponse } from 'next/server'
import { mockTools } from '@/lib/mock-data'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')

    // AI Tools are still from mock data (they change less frequently)
    let filtered = mockTools.filter((t) => t.isActive)
    if (category) {
      filtered = filtered.filter((t) => t.category === category)
    }
    filtered = filtered.sort((a, b) => b.rating - a.rating)

    return NextResponse.json({ tools: filtered })
  } catch (error) {
    console.error('Error fetching tools:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tools', tools: [] },
      { status: 500 }
    )
  }
}
