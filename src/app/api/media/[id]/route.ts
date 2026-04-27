import { NextRequest, NextResponse } from 'next/server'
import { unlink } from 'fs/promises'
import path from 'path'
import { deleteMedia } from '@/services/media.service'
import { db } from '@/lib/db'

// ── Route Handlers ───────────────────────────────────────────────────────────

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params

    // Find media record to get file URL before deleting
    const mediaModel = (db as Record<string, unknown>).media as {
      findUnique: (args: { where: { id: string } }) => Promise<{ url: string } | null>
    }

    const media = await mediaModel.findUnique({
      where: { id },
    })

    if (!media) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    // Delete the file from disk
    const filePath = path.join(process.cwd(), 'public', media.url)
    try {
      await unlink(filePath)
    } catch {
      // File may already be deleted; proceed with DB cleanup
    }

    // Delete the database record
    await deleteMedia(id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/media/[id] error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
