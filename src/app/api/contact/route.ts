import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, subject, message } = body

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    const submission = await db.contactSubmission.create({
      data: { name, email, subject, message },
    })

    return NextResponse.json({ success: true, id: submission.id })
  } catch (error) {
    console.error('Error submitting contact form:', error)
    return NextResponse.json({ error: 'Failed to submit' }, { status: 500 })
  }
}
