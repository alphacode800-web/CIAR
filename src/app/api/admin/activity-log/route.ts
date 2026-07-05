import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'

interface ActivityEntry {
  id: string
  type: 'project' | 'contact' | 'translation' | 'user' | 'media' | 'setting'
  action: string
  description: string
  meta?: Record<string, string | number>
  timestamp: Date
}

const VALID_FILTERS = ['all', 'project', 'translation', 'contact', 'setting', 'user', 'media']

const querySchema = z.object({
  filter: z.string().optional().default('all'),
  limit: z.coerce.number().int().min(1).max(100).optional().default(50),
  page: z.coerce.number().int().min(1).optional().default(1),
})

function pickProjectName(
  translations: Array<{ locale: string; name: string }>,
  slug: string
): string {
  const ar = translations.find((tr) => tr.locale === 'ar')?.name?.trim()
  if (ar) return ar
  const en = translations.find((tr) => tr.locale === 'en')?.name?.trim()
  if (en) return en
  return slug
}

function localizeCategory(category: string): string {
  const trimmed = category.trim()
  if (!trimmed || trimmed === 'Uncategorized') return 'غير مصنّف'
  return trimmed
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const parsed = querySchema.safeParse({
      filter: searchParams.get('filter') || undefined,
      limit: searchParams.get('limit') || undefined,
      page: searchParams.get('page') || undefined,
    })
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation error', details: parsed.error.flatten() },
        { status: 400 },
      )
    }

    const filter = VALID_FILTERS.includes(parsed.data.filter) ? parsed.data.filter : 'all'
    const limit = parsed.data.limit
    const page = parsed.data.page

    const [
      recentProjects,
      recentContacts,
      recentTranslations,
      recentUsers,
      recentMedia,
    ] = await Promise.all([
      db.project.findMany({
        orderBy: { updatedAt: 'desc' },
        take: 15,
        select: {
          id: true,
          slug: true,
          published: true,
          featured: true,
          category: true,
          createdAt: true,
          updatedAt: true,
          translations: {
            select: { name: true, locale: true },
          },
        },
      }),
      ...(filter === 'all' || filter === 'contact'
        ? [
            db.contactSubmission.findMany({
              orderBy: { createdAt: 'desc' },
              take: 15,
              select: { id: true, name: true, email: true, subject: true, createdAt: true },
            }),
          ]
        : [
            Promise.resolve([] as Array<{ id: string; name: string; email: string; subject: string; createdAt: Date }>),
          ]),
      ...(filter === 'all' || filter === 'translation'
        ? [
            db.translation.findMany({
              orderBy: { id: 'desc' },
              take: 10,
              select: { id: true, key: true, locale: true },
            }),
          ]
        : [
            Promise.resolve([] as Array<{ id: string; key: string; locale: string }>),
          ]),
      ...(filter === 'all' || filter === 'user'
        ? [
            db.user.findMany({
              orderBy: { createdAt: 'desc' },
              take: 10,
              select: { id: true, name: true, email: true, createdAt: true },
            }),
          ]
        : [
            Promise.resolve([] as Array<{ id: string; name: string; email: string; createdAt: Date }>),
          ]),
      ...(filter === 'all' || filter === 'media'
        ? [
            db.media.findMany({
              orderBy: { createdAt: 'desc' },
              take: 10,
              select: { id: true, filename: true, createdAt: true },
            }),
          ]
        : [
            Promise.resolve([] as Array<{ id: string; filename: string; createdAt: Date }>),
          ]),
    ])

    const activities: ActivityEntry[] = []

    if (filter === 'all' || filter === 'project' || filter === 'setting') {
      for (const p of recentProjects) {
        const name = pickProjectName(p.translations, p.slug)
        const category = localizeCategory(p.category || '')

        activities.push({
          id: `proj-create-${p.id}`,
          type: 'project',
          action: 'project_created',
          description: `تم إنشاء المنصة «${name}»`,
          meta: { slug: p.slug, category },
          timestamp: p.createdAt,
        })

        if (p.updatedAt.getTime() - p.createdAt.getTime() > 5000) {
          activities.push({
            id: `proj-update-${p.id}`,
            type: 'project',
            action: p.featured ? 'project_featured' : 'project_updated',
            description: p.featured
              ? `تم تمييز المنصة «${name}»`
              : `تم تحديث المنصة «${name}»`,
            meta: { slug: p.slug },
            timestamp: p.updatedAt,
          })
        }

        if (p.published) {
          activities.push({
            id: `proj-pub-${p.id}`,
            type: 'project',
            action: 'project_published',
            description: `تم نشر المنصة «${name}»`,
            meta: { slug: p.slug },
            timestamp: p.createdAt,
          })
        }
      }
    }

    for (const c of recentContacts) {
      activities.push({
        id: `contact-${c.id}`,
        type: 'contact',
        action: 'contact_received',
        description: `رسالة تواصل جديدة من ${c.name}`,
        meta: { email: c.email, subject: c.subject },
        timestamp: c.createdAt,
      })
    }

    for (const tr of recentTranslations) {
      activities.push({
        id: `trans-${tr.id}`,
        type: 'translation',
        action: 'translation_updated',
        description: `تم تحديث الترجمة «${tr.key}» (${tr.locale})`,
        meta: { key: tr.key, locale: tr.locale },
        timestamp: new Date(),
      })
    }

    for (const u of recentUsers) {
      activities.push({
        id: `user-${u.id}`,
        type: 'user',
        action: 'user_registered',
        description: `تسجيل مستخدم جديد «${u.name}»`,
        meta: { email: u.email },
        timestamp: u.createdAt,
      })
    }

    for (const m of recentMedia) {
      activities.push({
        id: `media-${m.id}`,
        type: 'media',
        action: 'media_uploaded',
        description: `تم رفع ملف «${m.filename}»`,
        meta: { filename: m.filename },
        timestamp: m.createdAt,
      })
    }

    activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())

    const start = (page - 1) * limit
    const paginated = activities.slice(start, start + limit)
    const total = activities.length

    return NextResponse.json({
      activities: paginated.map((a) => ({
        ...a,
        timestamp: a.timestamp.toISOString(),
      })),
      pagination: {
        page,
        limit,
        total,
        hasMore: start + limit < total,
      },
    })
  } catch (error) {
    console.error('GET /api/admin/activity-log error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
