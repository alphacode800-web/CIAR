import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const translations = await db.projectTranslation.findMany({
      where: { projectId: id },
    })
    return NextResponse.json(translations)
  } catch (error) {
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
    const { locale, name, tagline, description } = body

    const t = await db.projectTranslation.upsert({
      where: { projectId_locale: { projectId: id, locale } },
      update: { name: name || '', tagline: tagline || '', description: description || '' },
      create: { projectId: id, locale, name: name || '', tagline: tagline || '', description: description || '' },
    })
    return NextResponse.json(t)
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
