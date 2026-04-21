import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const locale = searchParams.get('locale') || 'en'
    const keys = searchParams.get('keys')

    const where: Record<string, unknown> = { locale }
    if (keys) {
      const keyArr = keys.split(',')
      where.key = { in: keyArr }
    }

    const translations = await db.translation.findMany({ where })
    const map: Record<string, string> = {}
    for (const t of translations) map[t.key] = t.value
    return NextResponse.json(map)
  } catch (error) {
    console.error('GET /api/translations error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { key, locale, value } = body

    const t = await db.translation.upsert({
      where: { key_locale: { key, locale } },
      update: { value },
      create: { key, locale, value },
    })
    return NextResponse.json(t)
  } catch (error) {
    console.error('PUT /api/translations error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
