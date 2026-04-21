import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    const { filename, data, projectId } = await request.json()
    if (!data || !filename) {
      return NextResponse.json({ error: 'Missing data or filename' }, { status: 400 })
    }

    const buffer = Buffer.from(data, 'base64')
    const dir = path.join(process.cwd(), 'public', 'uploads')
    await mkdir(dir, { recursive: true })
    const filepath = path.join(dir, filename)
    await writeFile(filepath, buffer)

    const url = `/uploads/${filename}`

    if (projectId) {
      await db.project.update({ where: { id: projectId }, data: { imageUrl: url } })
    }

    return NextResponse.json({ url, success: true })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
