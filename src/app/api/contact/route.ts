import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { submitContact } from '@/services/contact.service'

// ── Validation Schemas ───────────────────────────────────────────────────────

const contactSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email().optional().or(z.literal("")).transform((value) => value || undefined),
  phone: z.string().trim().regex(/^\+?[0-9]{8,15}$/).optional().or(z.literal("")).transform((value) => value || undefined),
  subject: z.string().min(2).max(200),
  message: z.string().min(10).max(5000),
  locale: z.string().optional().default('en'),
}).refine((data) => Boolean(data.email || data.phone), {
  message: "Either email or phone is required",
  path: ["email"],
})

// ── Route Handlers ───────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = contactSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'Validation error',
          details: parsed.error.flatten(),
        },
        { status: 400 },
      )
    }

    const result = await submitContact(parsed.data)
    return NextResponse.json({ success: true, id: result.id })
  } catch (error) {
    console.error('POST /api/contact error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
