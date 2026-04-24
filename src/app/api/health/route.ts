import { NextResponse } from 'next/server'

// ── Route Handlers ───────────────────────────────────────────────────────────

export async function GET() {
  return NextResponse.json({ status: 'ok', timestamp: new Date().toISOString() })
}
