import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { z } from 'zod'
import { getMedia, createMedia } from '@/services/media.service'

// ── Constants ────────────────────────────────────────────────────────────────

const ACCEPTED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
]

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

const VALID_CATEGORIES = ['hero', 'project', 'about', 'general']

// ── GET: list media ──────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category') || undefined
    const limit = parseInt(searchParams.get('limit') || '50', 10)

    const media = await getMedia(category, limit)
    return NextResponse.json(media)
  } catch (error) {
    console.error('GET /api/media error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}

// ── POST: upload new media ───────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const category = formData.get('category') as string | null

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 },
      )
    }

    // Validate MIME type
    if (!ACCEPTED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Accepted: JPEG, PNG, GIF, WebP, SVG' },
        { status: 400 },
      )
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File too large. Maximum 5MB' },
        { status: 400 },
      )
    }

    // Validate category
    const validatedCategory = VALID_CATEGORIES.includes(category || '')
      ? category!
      : 'general'

    // Generate unique filename
    const ext = file.name.split('.').pop() || 'png'
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'media')

    // Ensure directory exists
    await mkdir(uploadDir, { recursive: true })

    // Write file to disk
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const filePath = path.join(uploadDir, filename)
    await writeFile(filePath, buffer)

    // Save to database
    const result = await createMedia({
      filename,
      originalName: file.name,
      mimeType: file.type,
      size: file.size,
      url: `/uploads/media/${filename}`,
      category: validatedCategory,
    })

    return NextResponse.json({
      id: result.id,
      url: result.url,
      filename: file.name,
      size: file.size,
      mimeType: file.type,
      category: validatedCategory,
    })
  } catch (error) {
    console.error('POST /api/media error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
