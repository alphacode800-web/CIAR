import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getProjects, createProject } from '@/services/project.service'
import { CIAR_MODULES, MODULE_BANNER_IMAGES } from '@/features/super-platform/config'

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
  imageUrl: imagePathSchema.or(z.literal('')).optional(),
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
    const fallbackProjects = CIAR_MODULES
      .filter((platformModule) => platformModule.visibility === "VISIBLE")
      .map((platformModule) => {
        const slug = `ciar-${platformModule.slug.toLowerCase().replace(/_/g, "-")}`
        const imageUrl = MODULE_BANNER_IMAGES[platformModule.slug]?.[0] || "/images/ecommerce.png"
        return {
          id: slug,
          slug,
          imageUrl,
          imageUrls: MODULE_BANNER_IMAGES[platformModule.slug] || [imageUrl],
          category: platformModule.nameEn.replace(/^CIAR\s+/i, ""),
          featured: platformModule.order <= 4,
          published: true,
          externalUrl: `https://${slug}.ciar.com`,
          tags: JSON.stringify(["CIAR", platformModule.slug, "Platform"]),
          views: 12000 + platformModule.order * 1750,
          order: platformModule.order,
          translations: [
            {
              locale: "en",
              name: platformModule.nameEn,
              tagline: "Enterprise-ready CIAR module.",
              description: platformModule.descriptionEn,
            },
            {
              locale: "ar",
              name: platformModule.nameAr,
              tagline: "منصة احترافية ضمن منظومة CIAR.",
              description: platformModule.descriptionAr,
            },
          ],
        }
      })

    return NextResponse.json({
      projects: fallbackProjects,
      categories: [...new Set(fallbackProjects.map((project) => project.category))],
      stats: {
        totalProjects: fallbackProjects.length,
        totalViews: fallbackProjects.reduce((sum, project) => sum + project.views, 0),
      },
      pagination: {
        page: 1,
        limit: fallbackProjects.length,
        total: fallbackProjects.length,
        totalPages: 1,
      },
    })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = createProjectSchema.safeParse(body)

    if (!parsed.success) {
      const flattened = parsed.error.flatten()
      const fieldErrors = flattened.fieldErrors
      const firstFieldError = Object.values(fieldErrors)
        .flat()
        .find((msg): msg is string => typeof msg === 'string' && msg.length > 0)
      const firstFormError = flattened.formErrors.find((msg) => msg.length > 0)
      return NextResponse.json(
        {
          error: firstFieldError || firstFormError || 'Validation error',
          details: flattened,
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
