import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { ensureSuperPlatformSeed, getFallbackBanners } from "@/features/super-platform/server"
import { canAccessSuperAdmin } from "@/features/super-platform/authz"
import { platformImageSlotsToPayload } from "@/lib/platform-card-images"

function buildBannerImagePayload(body: Record<string, unknown>) {
  return Array.isArray(body.imageUrls)
    ? platformImageSlotsToPayload(body.imageUrls as string[])
    : platformImageSlotsToPayload([
        String(body.imageUrl1 || ""),
        String(body.imageUrl2 || ""),
        String(body.imageUrl3 || ""),
      ])
}

export async function GET() {
  try {
    await ensureSuperPlatformSeed()
    const banners = await prisma.platformBanner.findMany({
      orderBy: { createdAt: "desc" },
      include: { module: true },
    })
    return NextResponse.json({ banners })
  } catch {
    return NextResponse.json({ banners: getFallbackBanners(), fallback: true })
  }
}

export async function POST(request: NextRequest) {
  const allowed = await canAccessSuperAdmin(request)
  if (!allowed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const moduleId = String(body.moduleId || "")
  const imagePayload = buildBannerImagePayload(body)

  if (!moduleId) {
    return NextResponse.json({ error: "moduleId is required" }, { status: 400 })
  }

  const banner = await prisma.platformBanner.upsert({
    where: { moduleId },
    update: {
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
    create: {
      moduleId,
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
