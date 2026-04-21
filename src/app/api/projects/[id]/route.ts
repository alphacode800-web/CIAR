import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const project = await db.project.findUnique({
      where: { id },
      include: { translations: true },
    })
    if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(project)
  } catch (error) {
    console.error('GET /api/projects/[id] error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { slug, order, featured, published, imageUrl, category, externalUrl, tags } = body

    const project = await db.project.update({
      where: { id },
      data: {
        ...(slug !== undefined && { slug }),
        ...(order !== undefined && { order }),
        ...(featured !== undefined && { featured }),
        ...(published !== undefined && { published }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(category !== undefined && { category }),
        ...(externalUrl !== undefined && { externalUrl }),
        ...(tags !== undefined && { tags: typeof tags === 'string' ? tags : JSON.stringify(tags) }),
      },
      include: { translations: true },
    })
    return NextResponse.json(project)
  } catch (error) {
    console.error('PUT /api/projects/[id] error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await db.project.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/projects/[id] error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
