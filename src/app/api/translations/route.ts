import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getTranslations, upsertTranslation } from '@/services/translation.service'

// ── Validation Schemas ───────────────────────────────────────────────────────

const localeEnum = z.enum(['en', 'ar', 'fr', 'es', 'de'])

const upsertTranslationSchema = z.object({
  key: z.string().min(1),
  locale: localeEnum,
  value: z.string(),
})

// ── Route Handlers ───────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const locale = searchParams.get('locale') || 'en'
    const keysParam = searchParams.get('keys')
    const keys = keysParam
      ? keysParam.split(',').map((k) => k.trim()).filter(Boolean)
      : undefined

    const translations = await getTranslations(locale, keys)
    return NextResponse.json(translations)
  } catch (error) {
    console.error('GET /api/translations error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = upsertTranslationSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'Validation error',
          details: parsed.error.flatten(),
        },
        { status: 400 },
      )
    }

    await upsertTranslation(parsed.data.key, parsed.data.locale, parsed.data.value)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('PUT /api/translations error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
