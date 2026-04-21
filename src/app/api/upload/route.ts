import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { createMedia } from '@/services/media.service'

// ── Constants ────────────────────────────────────────────────────────────────

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
])

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

// ── Helpers ──────────────────────────────────────────────────────────────────

function sanitizeFilename(filename: string): string {
  // Remove path traversal attempts
  const cleaned = filename.replace(/[/\\]/g, '')

  // Extract extension
  const lastDot = cleaned.lastIndexOf('.')
  const ext = lastDot > 0 ? cleaned.slice(lastDot) : ''
  const name = lastDot > 0 ? cleaned.slice(0, lastDot) : cleaned

  // Sanitize name: keep only alphanumeric, hyphens, underscores
  const sanitized = name.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 100)

  return sanitized + ext
}

// ── Route Handlers ───────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file')

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: 'Validation error', details: { message: 'File is required' } },
        { status: 400 },
      )
    }

    // Validate MIME type
    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json(
        {
          error: 'Validation error',
          details: {
            message: `Invalid file type. Allowed: ${[...ALLOWED_MIME_TYPES].join(', ')}`,
          },
        },
        { status: 400 },
      )
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          error: 'Validation error',
          details: { message: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB` },
        },
        { status: 400 },
      )
    }

    // Read file buffer
    const buffer = Buffer.from(await file.arrayBuffer())

    // Sanitize filename
    const sanitizedFilename = sanitizeFilename(file.name)

    // Create date-based directory
    const dateDir = new Date().toISOString().split('T')[0]
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', dateDir)
    await mkdir(uploadDir, { recursive: true })

    // Write file
    const filePath = path.join(uploadDir, sanitizedFilename)
    await writeFile(filePath, buffer)

    const url = `/uploads/${dateDir}/${sanitizedFilename}`

    // Create media record
    const media = await createMedia({
      filename: sanitizedFilename,
      originalName: file.name,
      mimeType: file.type,
      size: file.size,
      url,
    })

    return NextResponse.json(
      {
        id: media.id,
        url: media.url,
        alt: '',
      },
      { status: 201 },
    )
  } catch (error) {
    console.error('POST /api/upload error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
