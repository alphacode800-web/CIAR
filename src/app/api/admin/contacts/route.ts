import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'

// ── Validation Schemas ───────────────────────────────────────────────────────

const listContactsSchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  search: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
})

const deleteContactSchema = z.object({
  id: z.string().min(1),
})

// ── Route Handlers ───────────────────────────────────────────────────────────

/**
 * GET /api/admin/contacts
 *
 * List contact submissions with pagination, search, and date filtering.
 *
 * Query params:
 *   - page (number, default 1)
 *   - limit (number, default 20)
 *   - search (string): search name, email, phone, or subject
 *   - dateFrom (string ISO date): filter from date
 *   - dateTo (string ISO date): filter to date
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const parsed = listContactsSchema.safeParse({
      page: searchParams.get('page') || undefined,
      limit: searchParams.get('limit') || undefined,
      search: searchParams.get('search') || undefined,
      dateFrom: searchParams.get('dateFrom') || undefined,
      dateTo: searchParams.get('dateTo') || undefined,
    })

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation error', details: parsed.error.flatten() },
        { status: 400 },
      )
    }

    const { page, limit, search, dateFrom, dateTo } = parsed.data

    // Build where clause
    const where: Record<string, unknown> = {}

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } },
        { subject: { contains: search } },
      ]
    }

    if (dateFrom || dateTo) {
      where.createdAt = {}
      if (dateFrom) {
        ;(where.createdAt as Record<string, unknown>).gte = new Date(dateFrom)
      }
      if (dateTo) {
        ;(where.createdAt as Record<string, unknown>).lte = new Date(dateTo)
      }
    }

    const [submissions, total] = await Promise.all([
      db.contactSubmission.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.contactSubmission.count({ where }),
    ])

    return NextResponse.json({
      submissions,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error('GET /api/admin/contacts error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}

/**
 * DELETE /api/admin/contacts?id=xxx
 *
 * Delete a contact submission by its ID.
 *
 * Query params:
 *   - id (string, required): submission ID to delete
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const parsed = deleteContactSchema.safeParse({
      id: searchParams.get('id') || undefined,
    })

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation error', details: parsed.error.flatten() },
        { status: 400 },
      )
    }

    // Verify the submission exists
    const existing = await db.contactSubmission.findUnique({
      where: { id: parsed.data.id },
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Contact submission not found' },
        { status: 404 },
      )
    }

    await db.contactSubmission.delete({
      where: { id: parsed.data.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/admin/contacts error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
