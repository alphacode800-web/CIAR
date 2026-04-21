import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category') || ''
    const featured = searchParams.get('featured') === 'true'

    const where: Record<string, unknown> = {}

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { tagline: { contains: search } },
        { description: { contains: search } },
        { category: { contains: search } },
      ]
    }

    if (category) {
      where.category = category
    }

    if (featured) {
      where.featured = true
    }

    const projects = await db.project.findMany({
      where,
      orderBy: { order: 'asc' },
    })

    const categories = await db.project.findMany({
      distinct: ['category'],
      select: { category: true },
    })

    const stats = await db.project.aggregate({
      _sum: { views: true },
      _count: true,
    })

    return NextResponse.json({
      projects,
      categories: categories.map((c) => c.category),
      stats: {
        totalViews: stats._sum.views || 0,
        totalProjects: stats._count,
      },
    })
  } catch (error) {
    console.error('Error fetching projects:', error)
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 })
  }
}
