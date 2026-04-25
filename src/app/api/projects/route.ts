import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getProjects, createProject } from '@/services/project.service'

// ── Validation Schemas ───────────────────────────────────────────────────────

const localeEnum = z.enum(['en', 'ar', 'fr', 'es', 'de'])
const imagePathSchema = z
  .string()
  .trim()
  .refine(
    (value) => {
      if (!value) return false
      if (value.startsWith('/')) return true
      try {
        new URL(value)
        return true
      } catch {
        return false
      }
    },
    { message: 'Image must be an absolute URL or a local path starting with /' },
  )

const createProjectSchema = z.object({
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/),
  imageUrl: imagePathSchema.optional(),
  imageUrls: z.array(imagePathSchema).max(5).optional(),
  category: z.string().max(100).optional(),
  externalUrl: z.string().url().optional().or(z.literal('')),
  tags: z.string().optional(),
  featured: z.boolean().optional(),
  published: z.boolean().optional(),
  order: z.number().int().optional(),
  translations: z
    .array(
      z.object({
        locale: localeEnum,
        name: z.string().min(1),
        tagline: z.string().optional(),
        description: z.string().optional(),
      }),
    )
    .optional(),
})

// ── Route Handlers ───────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const locale = searchParams.get('locale') || 'en'
    const search = searchParams.get('search') || undefined
    const category = searchParams.get('category') || undefined
    const featuredParam = searchParams.get('featured')
    const publishedParam = searchParams.get('published')
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '12', 10)

    const result = await getProjects({
      locale,
      search: search || undefined,
      category: category || undefined,
      featured: featuredParam ? featuredParam === 'true' : undefined,
      published: publishedParam ? publishedParam === 'true' : undefined,
      page,
      limit,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('GET /api/projects error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = createProjectSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'Validation error',
          details: parsed.error.flatten(),
        },
        { status: 400 },
      )
    }

    const project = await createProject(parsed.data)
    return NextResponse.json(project, { status: 201 })
  } catch (error) {
    console.error('POST /api/projects error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
