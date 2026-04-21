import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { name, email, subject, message, locale } = await request.json()
    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: 'All fields required' }, { status: 400 })
    }
    const submission = await db.contactSubmission.create({
      data: { name, email, subject, message, locale: locale || 'en' },
    })
    return NextResponse.json({ success: true, id: submission.id })
  } catch (error) {
    console.error('Contact error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
