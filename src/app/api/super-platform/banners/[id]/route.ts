import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { canAccessSuperAdmin } from "@/features/super-platform/authz"
import { platformImageSlotsToPayload } from "@/lib/platform-card-images"

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
  const imagePayload = Array.isArray(body.imageUrls)
    ? platformImageSlotsToPayload(body.imageUrls)
    : platformImageSlotsToPayload([body.imageUrl1, body.imageUrl2, body.imageUrl3])

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
      imageUrls: imagePayload.imageUrls,
      imageUrl1: imagePayload.imageUrl1,
      imageUrl2: imagePayload.imageUrl2,
      imageUrl3: imagePayload.imageUrl3,
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
