import { NextRequest, NextResponse } from 'next/server'
import { fetchAITools } from '@/lib/news-service'

// Cache tools for 1 hour (they change less frequently than news)
let toolsCache: Array<{
  id: string
  name: string
  description: string | null
  category: string
  rating: number
  pricing: string
  url: string | null
  imageUrl: string | null
  features: string[]
  isActive: boolean
  createdAt: string
  updatedAt: string
}> = []
let toolsCacheTimestamp = 0
const TOOLS_CACHE_TTL = 60 * 60 * 1000 // 1 hour

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')

    // Check if cache is still valid
    if (toolsCache.length === 0 || Date.now() - toolsCacheTimestamp > TOOLS_CACHE_TTL) {
      // Fetch real AI tools from web search
      toolsCache = await fetchAITools()
      toolsCacheTimestamp = Date.now()
    }

    let filtered = toolsCache.filter((t) => t.isActive)
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
