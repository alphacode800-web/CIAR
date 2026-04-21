import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getProjectById } from '@/services/project.service'
import { db } from '@/lib/db'

// ── Validation Schemas ───────────────────────────────────────────────────────

const localeEnum = z.enum(['en', 'ar', 'fr', 'es', 'de'])

const upsertTranslationSchema = z.object({
  locale: localeEnum,
  name: z.string(),
  tagline: z.string().optional(),
  description: z.string().optional(),
})

// ── Route Handlers ───────────────────────────────────────────────────────────

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params

    // Verify project exists
    const project = await getProjectById(id)
    if (!project) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const translations = await db.projectTranslation.findMany({
      where: { projectId: id },
      select: {
        locale: true,
        name: true,
        tagline: true,
        description: true,
      },
      orderBy: { locale: 'asc' },
    })

    return NextResponse.json(translations)
  } catch (error) {
    console.error('GET /api/projects/[id]/translations error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
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

    // Verify project exists
    const project = await getProjectById(id)
    if (!project) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const { locale, name, tagline, description } = parsed.data

    const translation = await db.projectTranslation.upsert({
      where: { projectId_locale: { projectId: id, locale } },
      update: {
        name,
        tagline: tagline ?? '',
        description: description ?? '',
      },
      create: {
        projectId: id,
        locale,
        name,
        tagline: tagline ?? '',
        description: description ?? '',
      },
      select: {
        locale: true,
        name: true,
        tagline: true,
        description: true,
      },
    })

    return NextResponse.json(translation)
  } catch (error) {
    console.error('PUT /api/projects/[id]/translations error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
