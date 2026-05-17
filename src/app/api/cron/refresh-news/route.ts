import { NextRequest, NextResponse } from 'next/server'
import { refreshAllCaches } from '@/lib/news-service'

// Vercel Cron Job endpoint - refreshes the news cache periodically
export async function GET(request: NextRequest) {
  try {
    // Optional: verify cron secret if set
    if (process.env.CRON_SECRET) {
      const authHeader = request.headers.get('authorization')
      if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    await refreshAllCaches()

    return NextResponse.json({
      success: true,
      message: 'News cache refreshed successfully',
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Cron refresh failed:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to refresh cache' },
      { status: 500 }
    )
  }
}
