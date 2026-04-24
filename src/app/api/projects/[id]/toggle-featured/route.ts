import { NextRequest, NextResponse } from 'next/server'
import { getProjectById, toggleFeatured } from '@/services/project.service'

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params

    // Verify project exists before toggling
    const existing = await getProjectById(id)
    if (!existing) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const featured = await toggleFeatured(id)
    return NextResponse.json({ featured })
  } catch (error) {
    console.error('POST /api/projects/[id]/toggle-featured error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
