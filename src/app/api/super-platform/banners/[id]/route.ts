import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { canAccessSuperAdmin } from "@/features/super-platform/authz"

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const allowed = await canAccessSuperAdmin(request)
  if (!allowed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const body = await request.json()

  const banner = await prisma.platformBanner.update({
    where: { id },
    data: {
      titleEn: String(body.titleEn || ""),
      titleAr: String(body.titleAr || ""),
      descriptionEn: String(body.descriptionEn || ""),
      descriptionAr: String(body.descriptionAr || ""),
      ctaTextEn: String(body.ctaTextEn || "Explore"),
      ctaTextAr: String(body.ctaTextAr || "استكشف"),
      ctaHref: String(body.ctaHref || "#"),
      imageUrl1: String(body.imageUrl1 || ""),
      imageUrl2: String(body.imageUrl2 || ""),
      imageUrl3: String(body.imageUrl3 || ""),
      isActive: body.isActive !== false,
    },
  })
  return NextResponse.json({ banner })
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const allowed = await canAccessSuperAdmin(request)
  if (!allowed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  await prisma.platformBanner.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
