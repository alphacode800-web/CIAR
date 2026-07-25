"use client"

import { useEffect, useMemo, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowRight,
  Layers,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useI18n } from "@/lib/i18n-context"
import { useRouter } from "@/lib/router-context"
import { cn } from "@/lib/utils"
import type { HomeBannersConfig } from "@/lib/home-banners"
import { DEFAULT_HERO_IMAGE_URLS, collectPlatformBannerImages, mergeHeroSlideUrls, resolveHeroSlidesFromSettings } from "@/lib/default-hero-images"
import { MarqueeBanner } from "@/components/home/MarqueeBanner"
import { AboutBrief } from "@/components/home/AboutBrief"
import { ServicesGrid } from "@/components/home/ServicesGrid"
import { HowItWorks } from "@/components/home/HowItWorks"
import { Testimonials } from "@/components/home/Testimonials"
import { TrustBadges } from "@/components/home/TrustBadges"
import { AwardsBanner } from "@/components/home/AwardsBanner"
import { NewsUpdates } from "@/components/home/NewsUpdates"
import { FAQSection } from "@/components/home/FAQSection"
import { NewsletterCTA } from "@/components/home/NewsletterCTA"
import { PaymentMethods } from "@/components/home/PaymentMethods"
import { ImageStripBar } from "@/components/home/ImageStripBar"
import { DEFAULT_IMAGE_STRIP_CONFIG, type ImageStripConfig } from "@/lib/image-strip"
import {
  DEFAULT_PAGE_HEADERS,
  homeHeroHeaderOnLightBackground,
  type PageHeaderConfig,
} from "@/lib/page-headers"
import { PageHeaderTextBlock } from "@/components/layout/page-hero-header"
import { comparePlatformOrderDesc, reversePlatformDisplayOrder } from "@/lib/platform-display-order"

interface FeaturedProject {
  id: string
  slug: string
  imageUrl: string
  category: string
  featured: boolean
  externalUrl: string
  tags: string
  views: number
  translations: { locale: string; name: string; tagline: string; description: string }[]
}

interface HomePageProps {
  featuredProjects?: FeaturedProject[]
  homeConfig?: HomeBannersConfig
  headerConfig?: PageHeaderConfig
}

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" as const },
  transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] as const },
})

type PlatformBanner = {
  id: string
  titleEn: string
  titleAr: string
  descriptionEn: string
  descriptionAr: string
  ctaTextEn: string
  ctaTextAr: string
  ctaHref: string
  imageUrl1: string
  imageUrl2: string
  imageUrl3: string
  module?: {
    slug?: string
  }
}

const hero = (a: number, b: number, c: number) => ({
  imageUrl1: DEFAULT_HERO_IMAGE_URLS[a % DEFAULT_HERO_IMAGE_URLS.length],
  imageUrl2: DEFAULT_HERO_IMAGE_URLS[b % DEFAULT_HERO_IMAGE_URLS.length],
  imageUrl3: DEFAULT_HERO_IMAGE_URLS[c % DEFAULT_HERO_IMAGE_URLS.length],
})

const FALLBACK_BANNERS_ORDERED: PlatformBanner[] = [
  { id: "fashion", titleEn: "CIAR Fashion", titleAr: "CiAr موضة", descriptionEn: "Women's and men's fashion, dresses, shoes, bags, and accessories.", descriptionAr: "موضة نسائية ورجالية: فساتين، احذية، جزادين، اكسسوارات.", ctaTextEn: "Explore", ctaTextAr: "استكشف", ctaHref: "#", ...hero(9, 10, 3) },
  { id: "global", titleEn: "CIAR Global Products", titleAr: "CiAr للمنتجات الصينية والدولية", descriptionEn: "Chinese and international products across industries.", descriptionAr: "للمنتجات الصينية والدولية بين الشركات العالمية من كافة الصناعات.", ctaTextEn: "Explore", ctaTextAr: "استكشف", ctaHref: "#", ...hero(2, 15, 7) },
  { id: "vip", titleEn: "CIAR VIP", titleAr: "CiAr VIP", descriptionEn: "Premium experience for VIP customers and luxury brands.", descriptionAr: "لكبار الشخصيات، البسة رجالية ونسائية وماركات عالمية.", ctaTextEn: "Explore", ctaTextAr: "استكشف", ctaHref: "#", ...hero(12, 13, 10) },
  { id: "mall", titleEn: "CIAR E-Mall", titleAr: "مول CiAr الالكتروني", descriptionEn: "Daily offers and exclusive features in one giant mall.", descriptionAr: "أكبر مول الكتروني عالميا مع عروض وميزات يومية.", ctaTextEn: "Explore", ctaTextAr: "استكشف", ctaHref: "#", ...hero(2, 7, 8) },
  { id: "tourism", titleEn: "CIAR Tourism", titleAr: "CiAr الوسيط السياحي", descriptionEn: "Global tourism services and offers.", descriptionAr: "الوسيط السياحي لكافة دول وشركات العالم.", ctaTextEn: "Explore", ctaTextAr: "استكشف", ctaHref: "#", ...hero(0, 19, 8) },
  { id: "realestate", titleEn: "CIAR Real Estate", titleAr: "CiAr للتسويق العقاري", descriptionEn: "Buy, sell, and rent all property types.", descriptionAr: "بيع وشراء وأجار كافة انواع العقارات.", ctaTextEn: "Explore", ctaTextAr: "استكشف", ctaHref: "#", ...hero(1, 13, 18) },
  { id: "cars", titleEn: "CIAR Cars", titleAr: "CiAr لتجارة السيارات", descriptionEn: "Buy, sell, and rent all car types.", descriptionAr: "بيع وشراء وأجار كافة انواع السيارات.", ctaTextEn: "Explore", ctaTextAr: "استكشف", ctaHref: "#", ...hero(3, 4, 11) },
  { id: "services", titleEn: "CIAR Services", titleAr: "CiAr للصيانة والتنظيف", descriptionEn: "Home and office maintenance and cleaning.", descriptionAr: "صيانة المنازل والمكاتب وخدمات التنظيف.", ctaTextEn: "Explore", ctaTextAr: "استكشف", ctaHref: "#", ...hero(11, 5, 6) },
  { id: "shipping", titleEn: "CIAR Shipping", titleAr: "CiAr للشحن العالمي", descriptionEn: "Shipping by land, sea, and air worldwide.", descriptionAr: "الشحن العالمي برا وبحرا وجوا إلى كافة دول العالم.", ctaTextEn: "Explore", ctaTextAr: "استكشف", ctaHref: "#", ...hero(4, 15, 0) },
  { id: "jobs", titleEn: "CIAR Jobs", titleAr: "CiAr لشواغر التوظيف", descriptionEn: "Jobs, career search, and employee housing.", descriptionAr: "شواغر التوظيف والبحث عن العمل وسكن موظفين.", ctaTextEn: "Explore", ctaTextAr: "استكشف", ctaHref: "#", ...hero(5, 18, 10) },
  { id: "marketing", titleEn: "CIAR Ads & Marketing", titleAr: "CiAr استضافة وتصميم الحملات الاعلانية", descriptionEn: "Design and hosting for full ad campaigns.", descriptionAr: "استضافة وتصميم كافة الحملات الاعلانية.", ctaTextEn: "Explore", ctaTextAr: "استكشف", ctaHref: "#", ...hero(6, 16, 19) },
  { id: "investment", titleEn: "CIAR Investment", titleAr: "CiAr أسهم المنصة والمكافآت", descriptionEn: "Member shares and rewards in CIAR platform.", descriptionAr: "أسهم منصتنا الخاصة بالأعضاء والمكافآت.", ctaTextEn: "Explore", ctaTextAr: "استكشف", ctaHref: "#", ...hero(13, 14, 17) },
]

const FALLBACK_BANNERS = reversePlatformDisplayOrder(FALLBACK_BANNERS_ORDERED)

export function HomePage({
  featuredProjects = [],
  homeConfig,
  headerConfig: initialHeaderConfig,
}: HomePageProps) {
  const { t, locale } = useI18n()
  const { navigate } = useRouter()
  const activeLocale = locale === "ar" ? "ar" : "en"

  const [currentSlide, setCurrentSlide] = useState(0)
  const [heroImages, setHeroImages] = useState<string[]>([...DEFAULT_HERO_IMAGE_URLS])
  const [platformBanners, setPlatformBanners] = useState<PlatformBanner[]>(FALLBACK_BANNERS)
  const [imageStripConfig, setImageStripConfig] = useState<ImageStripConfig>(DEFAULT_IMAGE_STRIP_CONFIG)
  const [imageStripImages, setImageStripImages] = useState<string[]>([...DEFAULT_HERO_IMAGE_URLS])
  const [brokenHeroUrls, setBrokenHeroUrls] = useState<Set<string>>(() => new Set())
  const [headerConfig, setHeaderConfig] = useState<PageHeaderConfig>(
    initialHeaderConfig ?? DEFAULT_PAGE_HEADERS.home
  )

  const heroBackgroundType = homeConfig?.hero?.backgroundType === "video" ? "video" : "image"
  const heroVideoUrl = homeConfig?.hero?.backgroundVideoUrl || ""
  const heroVideoPoster = homeConfig?.hero?.backgroundVideoPoster || ""

  const platformHeroImages = useMemo(
    () => collectPlatformBannerImages(platformBanners),
    [platformBanners]
  )

  const activeHeroImages = useMemo(() => {
    const fromConfig = Array.isArray(homeConfig?.hero?.imageSlides)
      ? homeConfig.hero.imageSlides.map((url, index) => {
          const trimmed = String(url || "").trim()
          return trimmed || DEFAULT_HERO_IMAGE_URLS[index % DEFAULT_HERO_IMAGE_URLS.length]
        })
      : []

    const fromSettings = heroImages.map((url, index) => {
      const trimmed = String(url || "").trim()
      return trimmed || DEFAULT_HERO_IMAGE_URLS[index % DEFAULT_HERO_IMAGE_URLS.length]
    })

    const sources =
      fromConfig.length > 0
        ? fromConfig
        : platformHeroImages.length > 0
          ? [...platformHeroImages, ...fromSettings]
          : fromSettings

    return mergeHeroSlideUrls(sources, brokenHeroUrls, 5, 20)
  }, [heroImages, homeConfig?.hero?.imageSlides, platformHeroImages, brokenHeroUrls])

  const HERO_SLIDE_INTERVAL_MS = 3500

  const headerSlides = useMemo(() => activeHeroImages.slice(0, 20), [activeHeroImages])
  const heroHeaderConfig = useMemo(
    () => homeHeroHeaderOnLightBackground(headerConfig),
    [headerConfig]
  )

  useEffect(() => {
    if (initialHeaderConfig) setHeaderConfig(initialHeaderConfig)
  }, [initialHeaderConfig])

  useEffect(() => {
    if (heroBackgroundType === "video" && heroVideoUrl) return
    if (headerSlides.length <= 1) return
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % headerSlides.length)
    }, HERO_SLIDE_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [headerSlides.length, heroBackgroundType, heroVideoUrl])

  useEffect(() => {
    setCurrentSlide(0)
  }, [headerSlides.length])

  useEffect(() => {
    headerSlides.forEach((src) => {
      const img = new Image()
      img.src = src
    })
  }, [headerSlides])

  useEffect(() => {
    fetch("/api/page-headers?page=home", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (d?.header) setHeaderConfig(d.header)
      })
      .catch(() => {
        setHeaderConfig(DEFAULT_PAGE_HEADERS.home)
      })
  }, [])

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        setHeroImages(resolveHeroSlidesFromSettings(data))
        setCurrentSlide(0)
      })
      .catch(() => {
        setHeroImages([...DEFAULT_HERO_IMAGE_URLS])
      })
  }, [])

  useEffect(() => {
      fetch("/api/super-platform/banners", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        const banners = Array.isArray(d?.banners) ? d.banners : []
        const normalized = banners
          .filter((b: any) => b?.module?.visibility === "VISIBLE" && b?.module?.isEnabled && b?.isActive)
          .sort((a: { module?: { order?: number } }, b: { module?: { order?: number } }) =>
            comparePlatformOrderDesc(
              { order: a.module?.order },
              { order: b.module?.order }
            )
          )
          .slice(0, 12)
        if (normalized.length > 0) {
          setPlatformBanners(normalized)
        }
      })
      .catch(() => {
        setPlatformBanners(FALLBACK_BANNERS)
      })
  }, [])

  useEffect(() => {
    fetch("/api/home/image-strip")
      .then((r) => r.json())
      .then((d) => {
        if (d?.config) {
          setImageStripConfig(d.config as ImageStripConfig)
        }
        if (Array.isArray(d?.images)) {
          setImageStripImages(d.images)
        }
      })
      .catch(() => {
        setImageStripConfig(DEFAULT_IMAGE_STRIP_CONFIG)
        setImageStripImages([...DEFAULT_HERO_IMAGE_URLS])
      })
  }, [])

  const markHeroImageBroken = (url: string) => {
    setBrokenHeroUrls((prev) => {
      if (prev.has(url)) return prev
      const next = new Set(prev)
      next.add(url)
      return next
    })
    setCurrentSlide(0)
  }

  const resolvePlatformSlug = (banner: PlatformBanner) => {
    if (banner.module?.slug) return banner.module.slug.toLowerCase()
    const ctaMatch = banner.ctaHref?.match(/module=([^&]+)/i)
    if (ctaMatch?.[1]) return ctaMatch[1].toLowerCase()

    const fallbackMap: Record<string, string> = {
      fashion: "fashion",
      global: "global_products",
      vip: "vip",
      mall: "mall",
      tourism: "tourism",
      realestate: "real_estate",
      cars: "cars",
      services: "services",
      shipping: "shipping",
      jobs: "jobs",
      marketing: "ads_marketing",
      investment: "investment",
    }
    return fallbackMap[banner.id] || banner.id.toLowerCase()
  }

  return (
    <div className="relative overflow-hidden">
      {/* ═══ 1. HERO — same style as منصاتنا (SuperPlatformHome) ═══ */}
      <section className="relative min-h-[62vh] overflow-hidden bg-[oklch(0.10_0.025_265)]">
        {heroBackgroundType === "video" && heroVideoUrl ? (
          <video
            key={heroVideoUrl}
            src={heroVideoUrl}
            poster={heroVideoPoster || undefined}
            autoPlay
            muted
            loop
            playsInline
            className="pointer-events-none absolute inset-0 z-[1] h-full w-full object-cover select-none"
          />
        ) : (
          headerSlides.length > 0 && (
            <div className="absolute inset-0 z-[1]">
              {headerSlides.map((src, idx) => (
                <img
                  key={`${src}-${idx}`}
                  src={src}
                  alt=""
                  aria-hidden={idx !== currentSlide}
                  className={cn(
                    "absolute inset-0 h-full w-full object-cover [filter:none] transition-opacity duration-700 ease-in-out",
                    idx === currentSlide ? "opacity-100" : "opacity-0"
                  )}
                  onError={() => markHeroImageBroken(src)}
                />
              ))}
            </div>
          )
        )}

        <div className="relative z-10 mx-auto flex min-h-[62vh] max-w-7xl items-center px-4 pb-20 sm:px-6 lg:px-8 pt-[calc(var(--site-header-offset)+2.5rem)]">
          <div className="max-w-4xl">
            <PageHeaderTextBlock
              config={heroHeaderConfig}
              locale={activeLocale}
              align="start"
              onLightBackground
            />

            {headerSlides.length > 1 && heroBackgroundType !== "video" && (
              <div className="flex flex-wrap gap-2 pt-2">
                {headerSlides.map((img, idx) => (
                  <button
                    key={`${img}-${idx}`}
                    type="button"
                    className={cn(
                      "h-2 rounded-full transition-all duration-300",
                      idx === currentSlide ? "w-10 bg-primary shadow-[0_0_12px_oklch(0.78_0.14_82/50%)]" : "w-4 bg-foreground/35 hover:bg-foreground/55"
                    )}
                    onClick={() => setCurrentSlide(idx)}
                    aria-label={`${activeLocale === "ar" ? "صورة" : "Image"} ${idx + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ═══ Image strip — animated category gallery ═══ */}
      <ImageStripBar config={imageStripConfig} images={imageStripImages} />

      <div className="glow-line-gold" />

      {/* ═══ 2. ALL PLATFORMS GRID (replaces single banner) ═══ */}
      <section className="relative py-24 sm:py-32">
        <div className="absolute inset-0 dot-pattern opacity-30 pointer-events-none" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp(0)} className="text-center mb-14">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/8 px-4 py-1.5 text-xs font-semibold text-primary">
              <Layers className="h-3.5 w-3.5" />
              {locale === "ar" ? "منصات CIAR" : "CIAR Platforms"}
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              {locale === "ar" ? "جميع منصاتنا في خدمتكم" : "All Our Platforms at Your Service"}
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {platformBanners.map((banner, idx) => {
              const title = locale === "ar" ? banner.titleAr : banner.titleEn
              const description = locale === "ar" ? banner.descriptionAr : banner.descriptionEn
              return (
                <motion.article
                  key={banner.id}
                  {...fadeUp(idx * 0.05)}
                  className="group overflow-hidden rounded-2xl border border-primary/15 bg-card shadow-sm transition-all duration-500 hover:-translate-y-1.5 hover:border-primary/35 hover:shadow-[0_20px_50px_-12px_oklch(0.78_0.14_82/25%)]"
                >
                  <div className="relative h-56 overflow-hidden bg-muted">
                    <img
                      src={banner.imageUrl1 || activeHeroImages[idx % activeHeroImages.length] || DEFAULT_HERO_IMAGE_URLS[0]}
                      alt={title}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                      loading="lazy"
                    />
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/55 to-transparent" />
                    <div className="absolute bottom-3 inset-x-3 flex items-end justify-between gap-2">
                      <Badge className="border-0 bg-primary/90 text-primary-foreground text-[10px] font-semibold shadow-lg">
                        {locale === "ar" ? "منصة" : "Platform"}
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-2.5 p-5">
                    <h3 className="text-xl font-bold tracking-tight text-black dark:text-white">{title}</h3>
                    <p className="line-clamp-2 text-sm leading-relaxed text-black/75 dark:text-white/80">{description}</p>
                    <button
                      type="button"
                      onClick={() => navigate({ page: "platform", slug: resolvePlatformSlug(banner) })}
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-black transition-colors hover:text-black/70 dark:text-white dark:hover:text-white/80"
                    >
                      {locale === "ar" ? banner.ctaTextAr || "استكشف القسم" : banner.ctaTextEn || "Explore section"}
                      <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
                    </button>
                  </div>
                </motion.article>
              )
            })}
          </div>
        </div>
      </section>

      <div className="glow-line-gold" />

      {/* ═══ 3. Payment Methods ═══ */}
      <PaymentMethods />

      <div className="section-divider-gold mx-auto max-w-7xl" />

      {/* ═══ 4. Marquee Banner ═══ */}
      <MarqueeBanner />

      {/* ═══ 5. About Brief ═══ */}
      <AboutBrief />

      <div className="section-divider-gold mx-auto max-w-7xl" />

      {/* ═══ 6. Trust Badges ═══ */}
      <TrustBadges />

      <div className="glow-line-gold" />

      {/* ═══ 7. Services Grid ═══ */}
      <ServicesGrid />

      <div className="section-divider-gold mx-auto max-w-7xl" />

      {/* ═══ 8. How It Works ═══ */}
      <HowItWorks />

      <div className="glow-line-gold" />

      {/* ═══ 9. Stats Section ═══ */}

      <div className="section-divider-gold mx-auto max-w-7xl" />

      {/* ═══ 10. Platform Showcase Carousel ═══ */}

      <div className="section-divider-gold mx-auto max-w-7xl" />

      {/* ═══ 11. Testimonials ═══ */}
      <Testimonials />

      <div className="section-divider-gold mx-auto max-w-7xl" />

      {/* ═══ 12. Awards Banner ═══ */}
      <AwardsBanner />

      <div className="glow-line-gold" />

      {/* ═══ 16. News Updates ═══ */}
      <NewsUpdates />

      <div className="section-divider-gold mx-auto max-w-7xl" />

      {/* ═══ FAQ Section ═══ */}
      <FAQSection />

      <div className="glow-line-gold" />

      {/* ═══ Newsletter CTA ═══ */}
      <NewsletterCTA />
    </div>
  )
}
