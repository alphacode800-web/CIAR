"use client"

import { useRef, useCallback, useEffect, useState } from "react"
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

const DEFAULT_HERO_IMAGES = [
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2200&q=90", // tourism
  "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=2200&q=90", // real estate
  "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=2200&q=90", // fashion
  "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=2200&q=90", // cars
  "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=2200&q=90", // nature
  "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=2200&q=90", // beauty
  "https://images.unsplash.com/photo-1473625247510-8ceb1760943f?auto=format&fit=crop&w=2200&q=90", // city
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=2200&q=90", // restaurants
  "https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=2200&q=90", // technology
  "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=2200&q=90", // sports
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
  newsTickerItems?: string[]
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

const FALLBACK_BANNERS: PlatformBanner[] = [
  { id: "fashion", titleEn: "CIAR Fashion", titleAr: "CiAr موضة", descriptionEn: "Women's and men's fashion, dresses, shoes, bags, and accessories.", descriptionAr: "موضة نسائية ورجالية: فساتين، احذية، جزادين، اكسسوارات.", ctaTextEn: "Explore", ctaTextAr: "استكشف", ctaHref: "#", imageUrl1: "/images/headers/hero-1.png", imageUrl2: "/images/headers/hero-2.png", imageUrl3: "/images/headers/hero-3.png" },
  { id: "global", titleEn: "CIAR Global Products", titleAr: "CiAr للمنتجات الصينية والدولية", descriptionEn: "Chinese and international products across industries.", descriptionAr: "للمنتجات الصينية والدولية بين الشركات العالمية من كافة الصناعات.", ctaTextEn: "Explore", ctaTextAr: "استكشف", ctaHref: "#", imageUrl1: "/images/headers/hero-2.png", imageUrl2: "/images/headers/hero-3.png", imageUrl3: "/images/headers/hero-4.png" },
  { id: "vip", titleEn: "CIAR VIP", titleAr: "CiAr VIP", descriptionEn: "Premium experience for VIP customers and luxury brands.", descriptionAr: "لكبار الشخصيات، البسة رجالية ونسائية وماركات عالمية.", ctaTextEn: "Explore", ctaTextAr: "استكشف", ctaHref: "#", imageUrl1: "/images/headers/hero-3.png", imageUrl2: "/images/headers/hero-4.png", imageUrl3: "/images/headers/hero-1.png" },
  { id: "mall", titleEn: "CIAR E-Mall", titleAr: "مول CiAr الالكتروني", descriptionEn: "Daily offers and exclusive features in one giant mall.", descriptionAr: "أكبر مول الكتروني عالميا مع عروض وميزات يومية.", ctaTextEn: "Explore", ctaTextAr: "استكشف", ctaHref: "#", imageUrl1: "/images/headers/hero-4.png", imageUrl2: "/images/headers/hero-1.png", imageUrl3: "/images/headers/hero-2.png" },
  { id: "tourism", titleEn: "CIAR Tourism", titleAr: "CiAr الدليل والوسيط السياحي", descriptionEn: "Global tourism services and offers.", descriptionAr: "الدليل والوسيط السياحي لكافة دول وشركات العالم.", ctaTextEn: "Explore", ctaTextAr: "استكشف", ctaHref: "#", imageUrl1: "/images/headers/hero-1.png", imageUrl2: "/images/headers/hero-3.png", imageUrl3: "/images/headers/hero-2.png" },
  { id: "realestate", titleEn: "CIAR Real Estate", titleAr: "دليل CiAr للتسويق العقاري", descriptionEn: "Buy, sell, and rent all property types.", descriptionAr: "بيع وشراء وأجار كافة انواع العقارات.", ctaTextEn: "Explore", ctaTextAr: "استكشف", ctaHref: "#", imageUrl1: "/images/headers/hero-2.png", imageUrl2: "/images/headers/hero-4.png", imageUrl3: "/images/headers/hero-1.png" },
  { id: "cars", titleEn: "CIAR Cars", titleAr: "دليل CiAr لتجارة السيارات", descriptionEn: "Buy, sell, and rent all car types.", descriptionAr: "بيع وشراء وأجار كافة انواع السيارات.", ctaTextEn: "Explore", ctaTextAr: "استكشف", ctaHref: "#", imageUrl1: "/images/headers/hero-3.png", imageUrl2: "/images/headers/hero-1.png", imageUrl3: "/images/headers/hero-4.png" },
  { id: "services", titleEn: "CIAR Services", titleAr: "دليل CiAr للصيانة والتنظيف", descriptionEn: "Home and office maintenance and cleaning.", descriptionAr: "صيانة المنازل والمكاتب وخدمات التنظيف.", ctaTextEn: "Explore", ctaTextAr: "استكشف", ctaHref: "#", imageUrl1: "/images/headers/hero-4.png", imageUrl2: "/images/headers/hero-2.png", imageUrl3: "/images/headers/hero-3.png" },
  { id: "shipping", titleEn: "CIAR Shipping", titleAr: "CiAr دليل الشحن العالمي", descriptionEn: "Shipping by land, sea, and air worldwide.", descriptionAr: "الشحن العالمي برا وبحرا وجوا إلى كافة دول العالم.", ctaTextEn: "Explore", ctaTextAr: "استكشف", ctaHref: "#", imageUrl1: "/images/headers/hero-1.png", imageUrl2: "/images/headers/hero-4.png", imageUrl3: "/images/headers/hero-3.png" },
  { id: "jobs", titleEn: "CIAR Jobs", titleAr: "CiAr دليل شواغر التوظيف", descriptionEn: "Jobs, career search, and employee housing.", descriptionAr: "شواغر التوظيف والبحث عن العمل وسكن موظفين.", ctaTextEn: "Explore", ctaTextAr: "استكشف", ctaHref: "#", imageUrl1: "/images/headers/hero-2.png", imageUrl2: "/images/headers/hero-1.png", imageUrl3: "/images/headers/hero-4.png" },
  { id: "marketing", titleEn: "CIAR Ads & Marketing", titleAr: "CiAr استضافة وتصميم الحملات الاعلانية", descriptionEn: "Design and hosting for full ad campaigns.", descriptionAr: "استضافة وتصميم كافة الحملات الاعلانية.", ctaTextEn: "Explore", ctaTextAr: "استكشف", ctaHref: "#", imageUrl1: "/images/headers/hero-3.png", imageUrl2: "/images/headers/hero-2.png", imageUrl3: "/images/headers/hero-1.png" },
  { id: "investment", titleEn: "CIAR Investment", titleAr: "CiAr أسهم المنصة والمكافآت", descriptionEn: "Member shares and rewards in CIAR platform.", descriptionAr: "أسهم منصتنا الخاصة بالأعضاء والمكافآت.", ctaTextEn: "Explore", ctaTextAr: "استكشف", ctaHref: "#", imageUrl1: "/images/headers/hero-4.png", imageUrl2: "/images/headers/hero-3.png", imageUrl3: "/images/headers/hero-2.png" },
]

export function HomePage({ featuredProjects = [], newsTickerItems = [] }: HomePageProps) {
  const { t, locale, dir } = useI18n()
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

  useEffect(() => {
    if (heroImages.length <= 1) return
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length)
    }, 7000)
    return () => clearInterval(interval)
  }, [heroImages.length])

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        const fromSettings = Array.from({ length: 10 }, (_, index) =>
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

  const defaultNewsTickerItems = [
    "Launching new enterprise platforms this quarter",
    "24/7 technical support now available for all clients",
    "New AI-powered modules added to our ecosystem",
    "International expansion across multiple industries",
  ]
  const tickerItems = newsTickerItems.length > 0 ? newsTickerItems : defaultNewsTickerItems
  const tickerLoopItems = [...tickerItems, ...tickerItems]

  return (
    <div ref={heroRef} className="relative overflow-hidden">
      {/* ═══ 1. HERO SECTION with 10-image slideshow ═══ */}
      <section className="relative h-[75vh] flex items-center justify-center">
        <div className="absolute inset-0">
          <img
            key={heroImages[currentSlide] || `hero-slide-${currentSlide}`}
            src={heroImages[currentSlide] || DEFAULT_HERO_IMAGES[0]}
            alt=""
            loading="eager"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-black/35" />
        </div>

        <div className="absolute inset-0 dot-pattern opacity-20" />

        <div className="absolute top-20 inset-x-0 z-30 px-4 sm:px-6">
          <div className="mx-auto max-w-7xl overflow-hidden rounded-xl border border-[oklch(0.78_0.14_82/24%)] bg-black/55 shadow-lg backdrop-blur-md">
            <div className="flex items-center">
              <div className="shrink-0 px-3 sm:px-4 py-2.5 border-e border-white/20 bg-[oklch(0.78_0.14_82/22%)]">
                <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.16em] text-white">
                  {locale === "ar" ? "أخبار" : "News"}
                </span>
              </div>
              <div className="relative flex-1 overflow-hidden py-2.5">
                <motion.div
                  className="flex w-max whitespace-nowrap text-[12px] sm:text-[13px] text-white/95 font-medium tracking-wide"
                  animate={{ x: dir === "rtl" ? ["-50%", "0%"] : ["0%", "-50%"] }}
                  transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
                >
                  {tickerLoopItems.map((item, index) => (
                    <span
                      key={`${item}-${index}`}
                      className="inline-flex items-center gap-4 px-6 sm:px-8"
                    >
                      <span className="text-white/95">{item}</span>
                      <span className="text-[oklch(0.82_0.145_85)]">•</span>
                    </span>
                  ))}
                </motion.div>
              </div>
            </div>
          </div>
        </div>

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
            {t("hero.subtitle")}
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.5, ease: [0.22, 1, 0.36, 1] }} className="mt-10 flex flex-col sm:flex-row items-center gap-4 rounded-2xl glass-premium px-4 py-4">
            <Button size="lg" onClick={() => navigate({ page: "projects" })} className={cn("gap-2 rounded-xl px-8 h-12 text-base font-semibold", "btn-gold", "transition-all duration-500")}>
              {t("hero.cta")}
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate({ page: "about" })} className={cn("rounded-xl px-8 h-12 text-base font-medium", "border-[oklch(0.78_0.14_82/25%)] bg-[oklch(0.78_0.14_82/5%)]", "text-[oklch(0.78_0.14_82)]", "hover:bg-[oklch(0.78_0.14_82/10%)] hover:border-[oklch(0.78_0.14_82/40%)]", "transition-all duration-300")}>
              {t("hero.cta2")}
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
                      src={banner.imageUrl1 || heroImages[idx % heroImages.length] || DEFAULT_HERO_IMAGES[0]}
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
