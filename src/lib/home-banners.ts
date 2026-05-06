export type HomeMediaType = "image" | "video"

export type LocalizedHomeBannerText = {
  ar: string
  en: string
}

export type HomeBannersConfig = {
  nav: {
    logoType: HomeMediaType
    logoUrl: string
    logoVideoUrl: string
    logoAlt: LocalizedHomeBannerText
  }
  hero: {
    title: LocalizedHomeBannerText
    subtitle: LocalizedHomeBannerText
    ctaPrimary: LocalizedHomeBannerText
    ctaPrimaryHref: string
    ctaSecondary: LocalizedHomeBannerText
    ctaSecondaryHref: string
    backgroundType: HomeMediaType
    backgroundVideoUrl: string
    backgroundVideoPoster: string
    imageSlides: string[]
  }
  newsTickerItems: string[]
}

const DEFAULT_NEWS_ITEMS = [
  "Launching new enterprise platforms this quarter",
  "24/7 technical support now available for all clients",
  "New AI-powered modules added to our ecosystem",
  "International expansion across multiple industries",
]

const DEFAULT_HERO_IMAGES = Array.from({ length: 20 }, (_, index) => `home_hero_image_${index + 1}`)

const clean = (value: unknown) => String(value ?? "").trim()

const asMediaType = (value: unknown, fallback: HomeMediaType = "image"): HomeMediaType => {
  const normalized = clean(value).toLowerCase()
  return normalized === "video" ? "video" : fallback
}

export function parseHomeNewsTicker(raw: string | null): string[] {
  if (!raw) return DEFAULT_NEWS_ITEMS
  try {
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) {
      const items = parsed.map((item) => clean(item)).filter(Boolean).slice(0, 20)
      if (items.length > 0) return items
    }
  } catch {
    // ignore malformed json
  }
  return DEFAULT_NEWS_ITEMS
}

export function resolveHeroSlides(settings: Record<string, string>): string[] {
  return DEFAULT_HERO_IMAGES
    .map((key) => clean(settings[key]))
    .filter(Boolean)
}

export function buildHomeBannersConfig(settings: Record<string, string>): HomeBannersConfig {
  return {
    nav: {
      logoType: asMediaType(settings.home_nav_logo_type, "image"),
      logoUrl: clean(settings.home_nav_logo_url) || "/logo.png",
      logoVideoUrl: clean(settings.home_nav_logo_video_url),
      logoAlt: {
        ar: clean(settings.home_nav_logo_alt_ar) || "CIAR",
        en: clean(settings.home_nav_logo_alt_en) || "CIAR",
      },
    },
    hero: {
      title: {
        ar: clean(settings.home_hero_title_ar),
        en: clean(settings.home_hero_title_en),
      },
      subtitle: {
        ar: clean(settings.home_hero_subtitle_ar),
        en: clean(settings.home_hero_subtitle_en),
      },
      ctaPrimary: {
        ar: clean(settings.home_hero_cta_primary_ar),
        en: clean(settings.home_hero_cta_primary_en),
      },
      ctaPrimaryHref: clean(settings.home_hero_cta_primary_href) || "projects",
      ctaSecondary: {
        ar: clean(settings.home_hero_cta_secondary_ar),
        en: clean(settings.home_hero_cta_secondary_en),
      },
      ctaSecondaryHref: clean(settings.home_hero_cta_secondary_href) || "about",
      backgroundType: asMediaType(settings.home_hero_background_type, "image"),
      backgroundVideoUrl: clean(settings.home_hero_video_url),
      backgroundVideoPoster: clean(settings.home_hero_video_poster),
      imageSlides: resolveHeroSlides(settings),
    },
    newsTickerItems: parseHomeNewsTicker(settings.home_news_ticker_items ?? null),
  }
}

export const HOME_BANNERS_SETTING_KEYS = [
  "home_nav_logo_type",
  "home_nav_logo_url",
  "home_nav_logo_video_url",
  "home_nav_logo_alt_ar",
  "home_nav_logo_alt_en",
  "home_hero_title_ar",
  "home_hero_title_en",
  "home_hero_subtitle_ar",
  "home_hero_subtitle_en",
  "home_hero_cta_primary_ar",
  "home_hero_cta_primary_en",
  "home_hero_cta_primary_href",
  "home_hero_cta_secondary_ar",
  "home_hero_cta_secondary_en",
  "home_hero_cta_secondary_href",
  "home_hero_background_type",
  "home_hero_video_url",
  "home_hero_video_poster",
  "home_news_ticker_items",
  ...DEFAULT_HERO_IMAGES,
] as const
