"use client"

import { useRef, useEffect, useMemo, useState } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import {
  ArrowRight,
  Layers,
  Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useI18n } from "@/lib/i18n-context"
import { useRouter } from "@/lib/router-context"
import { cn } from "@/lib/utils"
import type { HomeBannersConfig } from "@/lib/home-banners"

// New home section components
import { MarqueeBanner } from "@/components/home/MarqueeBanner"
import { AboutBrief } from "@/components/home/AboutBrief"
import { ServicesGrid } from "@/components/home/ServicesGrid"
import { HowItWorks } from "@/components/home/HowItWorks"
import { TechStack } from "@/components/home/TechStack"
import { Testimonials } from "@/components/home/Testimonials"
import { GlobalPresence } from "@/components/home/GlobalPresence"
import { TrustBadges } from "@/components/home/TrustBadges"
import { AwardsBanner } from "@/components/home/AwardsBanner"
import { TeamHighlight } from "@/components/home/TeamHighlight"
import { NewsUpdates } from "@/components/home/NewsUpdates"
import { FAQSection } from "@/components/home/FAQSection"
import { NewsletterCTA } from "@/components/home/NewsletterCTA"
import { PaymentMethods } from "@/components/home/PaymentMethods"

/** 20 distinct wide shots: travel, property, retail, mobility, logistics, teams, commerce, hospitality, etc. Replace via الإعدادات → الخلفيات. */
const u = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1920&q=75`

const DEFAULT_HERO_IMAGES = [
  u("1436491865332-7a61a109cc05"), // aviation / tourism
  u("1560518883-ce09059eeffa"), // real estate keys
  u("1441986300917-64674bd600d8"), // retail / e‑mall
  u("1492144534655-ae79c964c9d7"), // automotive
  u("1586528116311-ad8dd3c8310d"), // warehouse / shipping
  u("1522071820081-009f0129c71c"), // collaboration / jobs
  u("1460925895917-afdab827c52f"), // analytics / ads tech
  u("1556742049-0cfed4f6a45d"), // payments / commerce
  u("1517248135467-4c7edcad34c4"), // hospitality
  u("1445205170230-053b83016050"), // fashion retail
  u("1507679799987-c73779587ccf"), // professional services
  u("1504307651254-35680f356dfd"), // maintenance / field services
  u("1544191693-867a14dca8cf"), // luxury / VIP
  u("1486406146926-c627a92ad3b4"), // corporate / investment mood
  u("1556761175-5973dc0f32e7"), // product / campaign workspace
  u("1578574577315-3fbeb0ce23b9"), // global logistics
  u("1521737604893-d14cc237f11d"), // marketing / creative
  u("1454165804606-c3d568bc25a3"), // partnerships
  u("1497366216548-37526070297c"), // modern workspace
  u("1489515217757-5fd1b906566c"), // digital / platform lifestyle
]

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
  imageUrl1: DEFAULT_HERO_IMAGES[a % DEFAULT_HERO_IMAGES.length],
  imageUrl2: DEFAULT_HERO_IMAGES[b % DEFAULT_HERO_IMAGES.length],
  imageUrl3: DEFAULT_HERO_IMAGES[c % DEFAULT_HERO_IMAGES.length],
})

const FALLBACK_BANNERS: PlatformBanner[] = [
  { id: "fashion", titleEn: "CIAR Fashion", titleAr: "CiAr موضة", descriptionEn: "Women's and men's fashion, dresses, shoes, bags, and accessories.", descriptionAr: "موضة نسائية ورجالية: فساتين، احذية، جزادين، اكسسوارات.", ctaTextEn: "Explore", ctaTextAr: "استكشف", ctaHref: "#", ...hero(9, 10, 3) },
  { id: "global", titleEn: "CIAR Global Products", titleAr: "CiAr للمنتجات الصينية والدولية", descriptionEn: "Chinese and international products across industries.", descriptionAr: "للمنتجات الصينية والدولية بين الشركات العالمية من كافة الصناعات.", ctaTextEn: "Explore", ctaTextAr: "استكشف", ctaHref: "#", ...hero(2, 15, 7) },
  { id: "vip", titleEn: "CIAR VIP", titleAr: "CiAr VIP", descriptionEn: "Premium experience for VIP customers and luxury brands.", descriptionAr: "لكبار الشخصيات، البسة رجالية ونسائية وماركات عالمية.", ctaTextEn: "Explore", ctaTextAr: "استكشف", ctaHref: "#", ...hero(12, 13, 10) },
  { id: "mall", titleEn: "CIAR E-Mall", titleAr: "مول CiAr الالكتروني", descriptionEn: "Daily offers and exclusive features in one giant mall.", descriptionAr: "أكبر مول الكتروني عالميا مع عروض وميزات يومية.", ctaTextEn: "Explore", ctaTextAr: "استكشف", ctaHref: "#", ...hero(2, 7, 8) },
  { id: "tourism", titleEn: "CIAR Tourism", titleAr: "CiAr الدليل والوسيط السياحي", descriptionEn: "Global tourism services and offers.", descriptionAr: "الدليل والوسيط السياحي لكافة دول وشركات العالم.", ctaTextEn: "Explore", ctaTextAr: "استكشف", ctaHref: "#", ...hero(0, 19, 8) },
  { id: "realestate", titleEn: "CIAR Real Estate", titleAr: "دليل CiAr للتسويق العقاري", descriptionEn: "Buy, sell, and rent all property types.", descriptionAr: "بيع وشراء وأجار كافة انواع العقارات.", ctaTextEn: "Explore", ctaTextAr: "استكشف", ctaHref: "#", ...hero(1, 13, 18) },
  { id: "cars", titleEn: "CIAR Cars", titleAr: "دليل CiAr لتجارة السيارات", descriptionEn: "Buy, sell, and rent all car types.", descriptionAr: "بيع وشراء وأجار كافة انواع السيارات.", ctaTextEn: "Explore", ctaTextAr: "استكشف", ctaHref: "#", ...hero(3, 4, 11) },
  { id: "services", titleEn: "CIAR Services", titleAr: "دليل CiAr للصيانة والتنظيف", descriptionEn: "Home and office maintenance and cleaning.", descriptionAr: "صيانة المنازل والمكاتب وخدمات التنظيف.", ctaTextEn: "Explore", ctaTextAr: "استكشف", ctaHref: "#", ...hero(11, 5, 6) },
  { id: "shipping", titleEn: "CIAR Shipping", titleAr: "CiAr دليل الشحن العالمي", descriptionEn: "Shipping by land, sea, and air worldwide.", descriptionAr: "الشحن العالمي برا وبحرا وجوا إلى كافة دول العالم.", ctaTextEn: "Explore", ctaTextAr: "استكشف", ctaHref: "#", ...hero(4, 15, 0) },
  { id: "jobs", titleEn: "CIAR Jobs", titleAr: "CiAr دليل شواغر التوظيف", descriptionEn: "Jobs, career search, and employee housing.", descriptionAr: "شواغر التوظيف والبحث عن العمل وسكن موظفين.", ctaTextEn: "Explore", ctaTextAr: "استكشف", ctaHref: "#", ...hero(5, 18, 10) },
  { id: "marketing", titleEn: "CIAR Ads & Marketing", titleAr: "CiAr استضافة وتصميم الحملات الاعلانية", descriptionEn: "Design and hosting for full ad campaigns.", descriptionAr: "استضافة وتصميم كافة الحملات الاعلانية.", ctaTextEn: "Explore", ctaTextAr: "استكشف", ctaHref: "#", ...hero(6, 16, 19) },
  { id: "investment", titleEn: "CIAR Investment", titleAr: "CiAr أسهم المنصة والمكافآت", descriptionEn: "Member shares and rewards in CIAR platform.", descriptionAr: "أسهم منصتنا الخاصة بالأعضاء والمكافآت.", ctaTextEn: "Explore", ctaTextAr: "استكشف", ctaHref: "#", ...hero(13, 14, 17) },
]

export function HomePage({ featuredProjects = [], homeConfig }: HomePageProps) {
  const { t, locale } = useI18n()
  const { navigate } = useRouter()
  const heroRef = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  })

  const y = useTransform(scrollYProgress, [0, 1], [0, 150])
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.97])

  const [currentSlide, setCurrentSlide] = useState(0)
  const [heroImages, setHeroImages] = useState<string[]>(DEFAULT_HERO_IMAGES)
  const [platformBanners, setPlatformBanners] = useState<PlatformBanner[]>(FALLBACK_BANNERS)
  const activeHeroImages = useMemo(() => {
    const fromConfig = Array.isArray(homeConfig?.hero?.imageSlides) ? homeConfig.hero.imageSlides : []
    const cleaned = (fromConfig.length > 0 ? fromConfig : heroImages).map((url) => String(url || "").trim()).filter(Boolean)
    return cleaned.length > 0 ? cleaned : DEFAULT_HERO_IMAGES
  }, [heroImages, homeConfig?.hero?.imageSlides])

  const heroBackgroundType = homeConfig?.hero?.backgroundType === "video" ? "video" : "image"
  const heroVideoUrl = homeConfig?.hero?.backgroundVideoUrl || ""
  const heroVideoPoster = homeConfig?.hero?.backgroundVideoPoster || ""
  const heroTitle = locale === "ar" ? homeConfig?.hero?.title?.ar : homeConfig?.hero?.title?.en
  const heroSubtitle = locale === "ar" ? homeConfig?.hero?.subtitle?.ar : homeConfig?.hero?.subtitle?.en
  const heroPrimaryLabel = locale === "ar" ? homeConfig?.hero?.ctaPrimary?.ar : homeConfig?.hero?.ctaPrimary?.en
  const heroSecondaryLabel = locale === "ar" ? homeConfig?.hero?.ctaSecondary?.ar : homeConfig?.hero?.ctaSecondary?.en

  const resolveRouteFromSetting = (raw: string | undefined, fallback: "projects" | "about") => {
    const value = String(raw || "").trim().toLowerCase()
    if (value === "home" || value === "projects" || value === "about" || value === "contact") return value
    return fallback
  }
  const primaryRoute = resolveRouteFromSetting(homeConfig?.hero?.ctaPrimaryHref, "projects")
  const secondaryRoute = resolveRouteFromSetting(homeConfig?.hero?.ctaSecondaryHref, "about")

  useEffect(() => {
    if (activeHeroImages.length <= 1) return
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % activeHeroImages.length)
    }, 7000)
    return () => clearInterval(interval)
  }, [activeHeroImages.length])

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        const fromSettings = Array.from({ length: 20 }, (_, index) =>
          String(data?.[`home_hero_image_${index + 1}`] || "").trim()
        ).filter(Boolean)

        if (fromSettings.length > 0) {
          setHeroImages(fromSettings)
          setCurrentSlide((prev) => prev % fromSettings.length)
        }
      })
      .catch(() => {
        setHeroImages(DEFAULT_HERO_IMAGES)
      })
  }, [])

  useEffect(() => {
    fetch("/api/super-platform/banners")
      .then((r) => r.json())
      .then((d) => {
        const banners = Array.isArray(d?.banners) ? d.banners : []
        const normalized = banners
          .filter((b: any) => b?.module?.visibility === "VISIBLE" && b?.module?.isEnabled && b?.isActive)
          .slice(0, 12)
        if (normalized.length > 0) {
          setPlatformBanners(normalized)
        }
      })
      .catch(() => {
        setPlatformBanners(FALLBACK_BANNERS)
      })
  }, [])

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
    <div ref={heroRef} className="relative overflow-hidden pt-[var(--site-header-offset)]">
      {/* ═══ 1. HERO SECTION — stacked slides: instant cut, no load gap / gray flash ═══ */}
      <section className="relative h-[75vh] flex items-center justify-center">
        <div className="absolute inset-0 bg-black">
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
            activeHeroImages.map((url, i) => (
              <img
                key={`hero-bg-${i}-${url}`}
                src={url}
                alt=""
                aria-hidden
                loading="eager"
                decoding="async"
                fetchPriority={i === currentSlide ? "high" : "low"}
                className={cn(
                  "pointer-events-none absolute inset-0 h-full w-full object-cover select-none",
                  i === currentSlide ? "z-[1] opacity-100" : "z-0 opacity-0"
                )}
                style={{ transition: "none" }}
                onError={() => {
                  const removeIndex = i
                  setHeroImages((prev) => {
                    if (prev.length <= 1) return DEFAULT_HERO_IMAGES
                    return prev.filter((_, idx) => idx !== removeIndex)
                  })
                  setCurrentSlide(0)
                }}
              />
            ))
          )}
          <div className="absolute inset-0 z-[2] bg-black/35" />
        </div>

        <div className="absolute inset-0 dot-pattern opacity-20" />

        <motion.div style={{ y, opacity, scale }} className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-32 pb-20 sm:pt-36 sm:pb-28 flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="mt-8"
          >
            <img
              src="/logo.png"
              alt="CIAR"
              className="h-24 sm:h-32 lg:h-40 w-auto object-contain drop-shadow-[0_10px_30px_rgba(0,0,0,0.45)]"
            />
          </motion.div>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.35, ease: [0.22, 1, 0.36, 1] }} className="mt-8 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {heroTitle ? <span className="mb-2 block text-2xl font-semibold text-white">{heroTitle}</span> : null}
            {heroSubtitle || t("hero.subtitle")}
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.5, ease: [0.22, 1, 0.36, 1] }} className="mt-10 flex flex-col sm:flex-row items-center gap-4 rounded-2xl glass-premium px-4 py-4">
            <Button size="lg" onClick={() => navigate({ page: primaryRoute })} className={cn("gap-2 rounded-xl px-8 h-12 text-base font-semibold", "btn-gold", "transition-all duration-500")}>
              {heroPrimaryLabel || t("hero.cta")}
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate({ page: secondaryRoute })} className={cn("rounded-xl px-8 h-12 text-base font-medium", "border-[oklch(0.78_0.14_82/25%)] bg-[oklch(0.78_0.14_82/5%)]", "text-[oklch(0.78_0.14_82)]", "hover:bg-[oklch(0.78_0.14_82/10%)] hover:border-[oklch(0.78_0.14_82/40%)]", "transition-all duration-300")}>
              {heroSecondaryLabel || t("hero.cta2")}
            </Button>
          </motion.div>

        </motion.div>
      </section>

      <div className="glow-line-gold" />

      {/* ═══ 2. ALL PLATFORMS GRID (replaces single banner) ═══ */}
      <section className="relative py-24 sm:py-32">
        <div className="absolute inset-0 dot-pattern opacity-30 pointer-events-none" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp(0)} className="text-center mb-14">
            <span className="inline-flex items-center gap-2 rounded-full border border-[oklch(0.78_0.14_82/20%)] bg-[oklch(0.78_0.14_82/6%)] px-4 py-1.5 text-xs font-semibold text-[oklch(0.82_0.145_85)]">
              <Layers className="h-3.5 w-3.5" />
              {locale === "ar" ? "منصات CIAR" : "CIAR Platforms"}
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              {locale === "ar" ? "جميع المنصات" : "All Platforms"}
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
                  className="overflow-hidden rounded-2xl border border-[oklch(0.78_0.14_82/20%)] bg-card/40 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="relative h-56 overflow-hidden bg-[oklch(0.10_0.025_265)]">
                    <img
                      src={banner.imageUrl1 || activeHeroImages[idx % activeHeroImages.length] || DEFAULT_HERO_IMAGES[0]}
                      alt={title}
                      className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <div className="absolute bottom-3 left-3 flex gap-1.5">
                      <span className="h-1.5 w-6 rounded-full bg-white" />
                      <span className="h-1.5 w-2 rounded-full bg-white/50" />
                      <span className="h-1.5 w-2 rounded-full bg-white/50" />
                    </div>
                  </div>
                  <div className="space-y-2 p-5">
                    <h3 className="text-xl font-semibold">{title}</h3>
                    <p className="line-clamp-2 text-sm text-muted-foreground">{description}</p>
                    <button
                      type="button"
                      onClick={() => navigate({ page: "platform", slug: resolvePlatformSlug(banner) })}
                      className="inline-flex text-sm font-medium text-[oklch(0.78_0.14_82)] hover:underline"
                    >
                      {locale === "ar" ? banner.ctaTextAr || "استكشف القسم" : banner.ctaTextEn || "Explore section"}
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

      {/* ═══ 11. Tech Stack ═══ */}
      <TechStack />

      <div className="glow-line-gold" />

      {/* ═══ 12. Testimonials ═══ */}
      <Testimonials />

      <div className="section-divider-gold mx-auto max-w-7xl" />

      {/* ═══ 13. Global Presence ═══ */}
      <GlobalPresence />

      <div className="glow-line-gold" />

      {/* ═══ 14. Team Highlight ═══ */}
      <TeamHighlight />

      <div className="section-divider-gold mx-auto max-w-7xl" />

      {/* ═══ 15. Awards Banner ═══ */}
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
