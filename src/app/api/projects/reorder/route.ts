import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { reorderProjects } from '@/services/project.service'

const reorderSchema = z.object({
  orders: z
    .array(
      z.object({
        id: z.string().min(1),
        order: z.number().int().min(0),
      }),
    )
    .min(1),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = reorderSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: parsed.error.flatten() },
        { status: 400 },
      )
    }

    await reorderProjects(parsed.data.orders)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('POST /api/projects/reorder error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
