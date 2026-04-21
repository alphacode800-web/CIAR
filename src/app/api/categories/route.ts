import { NextResponse } from 'next/server'
import { getProjects } from '@/services/project.service'

// ── Route Handlers ───────────────────────────────────────────────────────────

export async function GET() {
  try {
    // Use the service to get categories from published projects
    const result = await getProjects({ locale: 'en', published: true })
    return NextResponse.json(result.categories)
  } catch (error) {
    console.error('GET /api/categories error:', error)
    return NextResponse.json([])
  }
}
