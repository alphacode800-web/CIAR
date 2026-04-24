import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// ── Route Handler ────────────────────────────────────────────────────────────

/**
 * GET /api/admin/users
 *
 * List all registered users. Passwords are excluded from the response.
 */
export async function GET() {
  try {
    const users = await db.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return NextResponse.json({ users })
  } catch (error) {
    console.error('GET /api/admin/users error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
