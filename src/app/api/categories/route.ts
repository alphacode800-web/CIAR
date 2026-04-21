import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const cats = await db.project.findMany({
      where: { published: true },
      distinct: ['category'],
      select: { category: true },
      orderBy: { category: 'asc' },
    })
    return NextResponse.json(cats.map((c) => c.category))
  } catch {
    return NextResponse.json([])
  }
}
