import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import {
  getProjectById,
  updateProject,
  deleteProject,
} from '@/services/project.service'

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

// ── Validation Schemas ───────────────────────────────────────────────────────

const updateProjectSchema = z.object({
  imageUrl: imagePathSchema.optional(),
  imageUrls: z.array(imagePathSchema).max(5).optional(),
  category: z.string().optional(),
  externalUrl: z.string().url().optional().or(z.literal('')),
  tags: z.string().optional(),
  featured: z.boolean().optional(),
  published: z.boolean().optional(),
  order: z.number().int().optional(),
  views: z.number().int().optional(),
})

// ── Route Handlers ───────────────────────────────────────────────────────────

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const project = await getProjectById(id)

    if (!project) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    return NextResponse.json(project)
  } catch (error) {
    console.error('GET /api/projects/[id] error:', error)
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
    const parsed = updateProjectSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'Validation error',
          details: parsed.error.flatten(),
        },
        { status: 400 },
      )
    }

    // Verify project exists before updating
    const existing = await getProjectById(id)
    if (!existing) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const project = await updateProject(id, parsed.data)
    return NextResponse.json(project)
  } catch (error) {
    console.error('PUT /api/projects/[id] error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params

    // Verify project exists before deleting
    const existing = await getProjectById(id)
    if (!existing) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    await deleteProject(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/projects/[id] error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
