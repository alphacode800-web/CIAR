import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const locale = searchParams.get('locale') || 'en'
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category') || ''
    const featured = searchParams.get('featured') === 'true'

    const where: Record<string, unknown> = { published: true }

    if (search) {
      where.OR = [
        { translations: { some: { locale, name: { contains: search } } } },
        { translations: { some: { locale, tagline: { contains: search } } } },
        { category: { contains: search } },
      ]
    }
    if (category) where.category = category
    if (featured) where.featured = true

    const projects = await db.project.findMany({
      where,
      orderBy: { order: 'asc' },
      include: {
        translations: { where: { locale } },
      },
    })

    const categories = await db.project.findMany({
      where: { published: true },
      distinct: ['category'],
      select: { category: true },
      orderBy: { category: 'asc' },
    })

    const stats = await db.project.aggregate({
      _sum: { views: true },
      _count: true,
    })

    return NextResponse.json({
      projects,
      categories: categories.map((c) => c.category),
      stats: { totalViews: stats._sum.views || 0, totalProjects: stats._count },
    })
  } catch (error) {
    console.error('GET /api/projects error:', error)
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { slug, order, featured, published, imageUrl, category, externalUrl, tags, translations } = body

    if (!slug) return NextResponse.json({ error: 'Slug required' }, { status: 400 })

    const project = await db.project.create({
      data: {
        slug, order: order || 0, featured: featured || false, published: published !== false,
        imageUrl: imageUrl || '', category: category || '', externalUrl: externalUrl || '',
        tags: typeof tags === 'string' ? tags : JSON.stringify(tags || []),
        translations: translations ? {
          create: translations.map((t: { locale: string; name: string; tagline: string; description: string }) => ({
            locale: t.locale,
            name: t.name || '',
            tagline: t.tagline || '',
            description: t.description || '',
          })),
        } : undefined,
      },
      include: { translations: true },
    })

    return NextResponse.json(project, { status: 201 })
  } catch (error) {
    console.error('POST /api/projects error:', error)
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 })
  }
}
