import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'

// ── Validation Schemas ───────────────────────────────────────────────────────

const bulkActionSchema = z.object({
  action: z.enum(['publish', 'unpublish', 'feature', 'unfeature', 'delete']),
  projectIds: z.array(z.string().min(1)).min(1).max(100),
})

// ── Route Handler ────────────────────────────────────────────────────────────

/**
 * POST /api/admin/bulk-actions
 *
 * Perform a bulk operation on multiple projects at once.
 *
 * Body:
 *   - action: "publish" | "unpublish" | "feature" | "unfeature" | "delete"
 *   - projectIds: string[]
 *
 * Returns: { success: true, affected: number }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = bulkActionSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation error', details: parsed.error.flatten() },
        { status: 400 },
      )
    }

    const { action, projectIds } = parsed.data

    // Verify that all referenced projects exist
    const existingCount = await db.project.count({
      where: { id: { in: projectIds } },
    })

    if (existingCount === 0) {
      return NextResponse.json(
        { error: 'No matching projects found' },
        { status: 404 },
      )
    }

    let affected: number

    switch (action) {
      case 'publish':
        affected = await db.project.count({
          where: { id: { in: projectIds } },
        })
        await db.project.updateMany({
          where: { id: { in: projectIds } },
          data: { published: true },
        })
        break

      case 'unpublish':
        affected = await db.project.count({
          where: { id: { in: projectIds } },
        })
        await db.project.updateMany({
          where: { id: { in: projectIds } },
          data: { published: false },
        })
        break

      case 'feature':
        affected = await db.project.count({
          where: { id: { in: projectIds } },
        })
        await db.project.updateMany({
          where: { id: { in: projectIds } },
          data: { featured: true },
        })
        break

      case 'unfeature':
        affected = await db.project.count({
          where: { id: { in: projectIds } },
        })
        await db.project.updateMany({
          where: { id: { in: projectIds } },
          data: { featured: false },
        })
        break

      case 'delete':
        // Count before deleting (translations cascade automatically)
        affected = await db.project.count({
          where: { id: { in: projectIds } },
        })
        await db.project.deleteMany({
          where: { id: { in: projectIds } },
        })
        break

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 },
        )
    }

    return NextResponse.json({ success: true, affected })
  } catch (error) {
    console.error('POST /api/admin/bulk-actions error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
