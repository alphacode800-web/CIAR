import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getSetting, updateSettings } from '@/services/settings.service'
import { buildDefaultHomeSections, localizeHomeSection } from '@/lib/home-section-labels'

// ── Types ────────────────────────────────────────────────────────────────────

interface HomeSection {
  id: string
  name: string
  visible: boolean
  order: number
}

// ── Validation Schemas ───────────────────────────────────────────────────────

const homeSectionSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  visible: z.boolean(),
  order: z.number().int().min(0),
})

const updateHomeSectionsSchema = z.object({
  sections: z.array(homeSectionSchema),
})

// ── Helpers ──────────────────────────────────────────────────────────────────

const SETTING_KEY = 'home_sections'

const defaultSections = buildDefaultHomeSections()

function parseSections(value: string | null): HomeSection[] {
  if (!value) return defaultSections
  try {
    const parsed = JSON.parse(value)
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.map((section) => localizeHomeSection(section as HomeSection))
    }
  } catch {
    // Fall through to default
  }
  return defaultSections
}

// ── Route Handlers ───────────────────────────────────────────────────────────

/**
 * GET /api/admin/home-sections
 *
 * Return the current home page sections configuration.
 */
export async function GET() {
  try {
    const raw = await getSetting(SETTING_KEY)
    const sections = parseSections(raw)

    return NextResponse.json({ sections })
  } catch (error) {
    console.error('GET /api/admin/home-sections error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}

/**
 * PUT /api/admin/home-sections
 *
 * Save the home page sections configuration.
 *
 * Body: { sections: HomeSection[] }
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = updateHomeSectionsSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation error', details: parsed.error.flatten() },
        { status: 400 },
      )
    }

    await updateSettings({
      [SETTING_KEY]: JSON.stringify(parsed.data.sections),
    })

    return NextResponse.json({ success: true, sections: parsed.data.sections })
  } catch (error) {
    console.error('PUT /api/admin/home-sections error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
