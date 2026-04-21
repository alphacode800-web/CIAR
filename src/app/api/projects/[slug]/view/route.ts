import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    await db.project.update({
      where: { slug },
      data: { views: { increment: 1 } },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error tracking view:', error)
    return NextResponse.json({ error: 'Failed to track view' }, { status: 500 })
  }
}
