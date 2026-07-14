import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { CIAR_MODULES } from "@/features/super-platform/config"
import { getSettings } from "@/services/settings.service"
import { parseAiSettings } from "@/features/ai/settings"

export async function GET(request: Request) {
  try {
    const settings = parseAiSettings(await getSettings())
    if (!settings.recommendationsEnabled) {
      return NextResponse.json({ recommendations: [], enabled: false })
    }

    const { searchParams } = new URL(request.url)
    const seedId = searchParams.get("seedId") || ""
    const locale = searchParams.get("locale") === "en" ? "en" : "ar"
    const limit = Math.min(12, Math.max(1, Number(searchParams.get("limit") || 6)))

    const products = await db.product.findMany({
      take: 80,
      select: {
        id: true,
        title: true,
        categoryId: true,
        stock: true,
        category: { select: { name: true } },
        orderItems: { select: { quantity: true } },
      },
    })

    if (products.length > 0) {
      const scored = products.map((item) => {
        const sales = item.orderItems.reduce((sum, row) => sum + row.quantity, 0)
        const seedBoost = item.id === seedId || item.categoryId === seedId ? 20 : 0
        const stockPenalty = item.stock <= 0 ? -10 : 0
        return { item, score: sales * 2 + seedBoost + stockPenalty }
      })
      scored.sort((a, b) => b.score - a.score)

      const recommendations = scored.slice(0, limit).map(({ item }) => ({
        id: item.id,
        title: item.title,
        category: item.category?.name || "",
        type: "product" as const,
      }))
      return NextResponse.json({ recommendations, enabled: true })
    }

    const projects = await db.project.findMany({
      where: { published: true },
      orderBy: { views: "desc" },
      take: 30,
      select: {
        slug: true,
        views: true,
        category: true,
        translations: { select: { locale: true, name: true, tagline: true } },
      },
    })

    if (projects.length > 0) {
      const seedSlug = seedId.toLowerCase()
      const recommendations = projects
        .map((project) => {
          const name =
            project.translations.find((t) => t.locale === locale)?.name ||
            project.translations.find((t) => t.locale === "en")?.name ||
            project.slug
          const sameSeed = project.slug.includes(seedSlug) || project.category.toLowerCase().includes(seedSlug)
          return {
            id: project.slug,
            title: name,
            category: project.category,
            type: "platform" as const,
            score: (project.views || 0) + (sameSeed ? 100 : 0),
          }
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map(({ id, title, category, type }) => ({ id, title, category, type }))

      return NextResponse.json({ recommendations, enabled: true })
    }

    const modules = CIAR_MODULES.filter((module) => module.visibility === "VISIBLE")
    const seedIndex = modules.findIndex((module) => module.slug === seedId)
    const ordered =
      seedIndex >= 0
        ? [...modules.slice(seedIndex + 1), ...modules.slice(0, seedIndex)]
        : modules

    return NextResponse.json({
      enabled: true,
      recommendations: ordered.slice(0, limit).map((module) => ({
        id: module.slug,
        title: locale === "ar" ? module.nameAr : module.nameEn,
        category: module.nameEn.replace(/^CIAR\s+/i, ""),
        type: "platform" as const,
      })),
    })
  } catch (error) {
    console.error("GET /api/ai/recommendations error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
