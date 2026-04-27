import { NextRequest, NextResponse } from 'next/server'
import { getSettings, updateSettings } from '@/services/settings.service'

// ── Route Handlers ───────────────────────────────────────────────────────────

export async function GET() {
  try {
    const settings = await getSettings()
    return NextResponse.json(settings)
  } catch (error) {
    console.error('GET /api/settings error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json(
        { error: 'Validation error', details: { message: 'Expected a key-value object' } },
        { status: 400 },
      )
    }

    // Convert all values to strings
    const data: Record<string, string> = {}
    for (const [key, value] of Object.entries(body)) {
      if (typeof key !== 'string' || !key) continue
      data[key] = String(value ?? '')
    }

    await updateSettings(data)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('PUT /api/settings error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
