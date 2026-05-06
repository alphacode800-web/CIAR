import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { getSettings, updateSettings } from "@/services/settings.service"
import {
  buildHomeBannersConfig,
  HOME_BANNERS_SETTING_KEYS,
} from "@/lib/home-banners"

const mediaTypeSchema = z.enum(["image", "video"])

const payloadSchema = z.object({
  nav: z.object({
    logoType: mediaTypeSchema,
    logoUrl: z.string().trim(),
    logoVideoUrl: z.string().trim(),
    logoAltAr: z.string().trim(),
    logoAltEn: z.string().trim(),
  }),
  hero: z.object({
    titleAr: z.string().trim(),
    titleEn: z.string().trim(),
    subtitleAr: z.string().trim(),
    subtitleEn: z.string().trim(),
    ctaPrimaryAr: z.string().trim(),
    ctaPrimaryEn: z.string().trim(),
    ctaPrimaryHref: z.string().trim(),
    ctaSecondaryAr: z.string().trim(),
    ctaSecondaryEn: z.string().trim(),
    ctaSecondaryHref: z.string().trim(),
    backgroundType: mediaTypeSchema,
    videoUrl: z.string().trim(),
    videoPoster: z.string().trim(),
    imageSlides: z.array(z.string().trim()).max(20),
  }),
  newsTickerItems: z.array(z.string().trim().min(1).max(220)).min(1).max(20),
})

function projectSettings(settings: Record<string, string>) {
  const out: Record<string, string> = {}
  for (const key of HOME_BANNERS_SETTING_KEYS) {
    out[key] = String(settings[key] ?? "")
  }
  return out
}

export async function GET() {
  try {
    const settings = await getSettings()
    const config = buildHomeBannersConfig(settings)
    return NextResponse.json({ config, settings: projectSettings(settings) })
  } catch (error) {
    console.error("GET /api/admin/home-banners error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = payloadSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation error", details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const data = parsed.data
    const slideSettings: Record<string, string> = {}
    for (let index = 0; index < 20; index += 1) {
      slideSettings[`home_hero_image_${index + 1}`] = String(data.hero.imageSlides[index] ?? "")
    }

    await updateSettings({
      home_nav_logo_type: data.nav.logoType,
      home_nav_logo_url: data.nav.logoUrl,
      home_nav_logo_video_url: data.nav.logoVideoUrl,
      home_nav_logo_alt_ar: data.nav.logoAltAr,
      home_nav_logo_alt_en: data.nav.logoAltEn,
      home_hero_title_ar: data.hero.titleAr,
      home_hero_title_en: data.hero.titleEn,
      home_hero_subtitle_ar: data.hero.subtitleAr,
      home_hero_subtitle_en: data.hero.subtitleEn,
      home_hero_cta_primary_ar: data.hero.ctaPrimaryAr,
      home_hero_cta_primary_en: data.hero.ctaPrimaryEn,
      home_hero_cta_primary_href: data.hero.ctaPrimaryHref,
      home_hero_cta_secondary_ar: data.hero.ctaSecondaryAr,
      home_hero_cta_secondary_en: data.hero.ctaSecondaryEn,
      home_hero_cta_secondary_href: data.hero.ctaSecondaryHref,
      home_hero_background_type: data.hero.backgroundType,
      home_hero_video_url: data.hero.videoUrl,
      home_hero_video_poster: data.hero.videoPoster,
      home_news_ticker_items: JSON.stringify(data.newsTickerItems),
      ...slideSettings,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("PUT /api/admin/home-banners error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
