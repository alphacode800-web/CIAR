import { NextRequest, NextResponse } from 'next/server'
import { getMedia } from '@/services/media.service'

// ── Route Handlers ───────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category') || undefined
    const limit = parseInt(searchParams.get('limit') || '50', 10)

    const media = await getMedia(category, limit)
    return NextResponse.json(media)
  } catch (error) {
    console.error('GET /api/media error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
