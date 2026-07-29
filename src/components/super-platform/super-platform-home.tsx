"use client"

import { useEffect, useMemo, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { BadgeCheck, Globe2, ShieldCheck, Sparkles } from "lucide-react"
import { useI18n } from "@/lib/i18n-context"
import { useRouter } from "@/lib/router-context"
import { collectPlatformBannerImages, DEFAULT_HERO_IMAGE_URLS, mergeHeroSlideUrls } from "@/lib/default-hero-images"
import { resolvePlatformCardImages } from "@/lib/platform-card-images"
import { DEFAULT_PAGE_HEADERS, type PageHeaderConfig } from "@/lib/page-headers"
import { PageHeaderOverlay, PageHeaderTextBlock } from "@/components/layout/page-hero-header"
import { SiteAdSlot } from "@/components/ads/site-ad-slot"
import { AiRecommendationsSection } from "@/components/home/ai-recommendations-section"
import {
  filterPublicPlatformModules,
  mergeLocalProjectsIntoModules,
  type PublicPlatformBanner,
  type PublicPlatformModule,
} from "@/lib/public-platform-modules"
import { cn } from "@/lib/utils"

type ModuleWithBanner = PublicPlatformModule

const whyChooseItems = [
  { icon: ShieldCheck, title: "Enterprise-Grade Security", text: "Role-based controls and secure architecture for large-scale operations." },
  { icon: Globe2, title: "Global Multi-Module Ecosystem", text: "15 connected modules running as one scalable super platform." },
  { icon: Sparkles, title: "Premium User Experience", text: "Fast, modern, image-first pages with smooth interactions." },
  { icon: BadgeCheck, title: "Full Admin Control", text: "Manage modules, banners, users, content, and settings in one place." },
]

export function SuperPlatformHome({
  headerConfig: initialHeaderConfig,
}: {
  headerConfig?: PageHeaderConfig
} = {}) {
  const { locale, dir } = useI18n()
  const { navigate } = useRouter()
  const [modules, setModules] = useState<ModuleWithBanner[]>([])
  const [headerIndex, setHeaderIndex] = useState(0)
  const [brokenHeaderUrls, setBrokenHeaderUrls] = useState<Set<string>>(() => new Set())
  const [headerConfig, setHeaderConfig] = useState<PageHeaderConfig>(
    initialHeaderConfig ?? DEFAULT_PAGE_HEADERS.projects
  )
  const activeLocale: "en" | "ar" = locale === "ar" ? "ar" : "en"

  useEffect(() => {
    if (initialHeaderConfig) setHeaderConfig(initialHeaderConfig)
  }, [initialHeaderConfig])

  useEffect(() => {
    fetch("/api/page-headers?page=projects", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (d?.header) setHeaderConfig(d.header as PageHeaderConfig)
      })
      .catch(() => {
        setHeaderConfig(DEFAULT_PAGE_HEADERS.projects)
      })
  }, [])

  useEffect(() => {
    document.documentElement.lang = activeLocale
    document.documentElement.dir = dir
  }, [activeLocale, dir])

  useEffect(() => {
    const timer = setTimeout(() => {
      fetch("/api/super-platform/modules", { cache: "no-store" })
        .then((r) => r.json())
        .then((d) => {
          let rows: ModuleWithBanner[] = Array.isArray(d.modules) ? d.modules : []

          if (d?.fallback) {
            rows = mergeLocalProjectsIntoModules(rows)
          }

          setModules(filterPublicPlatformModules(rows))
        })
        .catch(() => setModules([]))
    }, 0)
    return () => clearTimeout(timer)
  }, [])

  const cards = useMemo(
    () =>
      modules.map((m) => {
        const banner = m.banner
        const images = banner ? resolvePlatformCardImages(banner) : []
        return { module: m, banner, images }
      }),
    [modules]
  )

  const headerImages = useMemo(() => {
    const bannerImages = collectPlatformBannerImages(
      cards.map((card) => card.banner).filter(Boolean) as Array<{
        imageUrl1?: string
        imageUrl2?: string
        imageUrl3?: string
      }>
    )
    return mergeHeroSlideUrls(
      bannerImages.length > 0 ? bannerImages : [...DEFAULT_HERO_IMAGE_URLS],
      brokenHeaderUrls,
      5,
      20
    )
  }, [cards, brokenHeaderUrls])

  useEffect(() => {
    if (headerImages.length <= 1) return
    const interval = setInterval(() => {
      setHeaderIndex((s) => (s + 1) % headerImages.length)
    }, 3500)
    return () => clearInterval(interval)
  }, [headerImages.length])

  useEffect(() => {
    setHeaderIndex(0)
  }, [headerImages.length])

  useEffect(() => {
    headerImages.forEach((src) => {
      if (!src) return
      const img = new Image()
      img.src = src
    })
  }, [headerImages])

  return (
    <div className="min-h-screen bg-background">
      <section className="relative min-h-[62vh] overflow-hidden bg-[oklch(0.10_0.025_265)]">
        {headerImages.length > 0 && (
          <div className="absolute inset-0 z-[1]">
            {headerImages.map((src, idx) => (
              <img
                key={`${src}-${idx}`}
                src={src}
                alt=""
                aria-hidden={idx !== headerIndex}
                className={cn(
                  "absolute inset-0 h-full w-full object-cover [filter:none] transition-opacity duration-700 ease-in-out",
                  idx === headerIndex ? "opacity-100" : "opacity-0"
                )}
                onError={() => {
                  if (!src) return
                  setBrokenHeaderUrls((prev) => {
                    if (prev.has(src)) return prev
                    const next = new Set(prev)
                    next.add(src)
                    return next
                  })
                }}
              />
            ))}
          </div>
        )}
        <PageHeaderOverlay config={headerConfig} />

        <div className="relative z-10 mx-auto flex min-h-[62vh] max-w-7xl items-center px-4 py-20">
          <div className="max-w-4xl">
            <PageHeaderTextBlock
              config={headerConfig}
              locale={activeLocale}
              align={headerConfig.layout === "platforms" ? "center" : "start"}
            />

            <div className="flex flex-wrap gap-2 pt-2">
              {headerImages.map((img, idx) => (
                <button
                  key={`${img}-${idx}`}
                  className={`h-2 rounded-full transition-all ${idx === headerIndex ? "w-10 bg-primary" : "w-4 bg-white/40"}`}
                  onClick={() => setHeaderIndex(idx)}
                  aria-label={`Header image ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="mb-10 text-center">
          <h2 className={`text-2xl font-bold sm:text-3xl ${activeLocale === "ar" ? "font-arabic-display" : ""}`}>
            {activeLocale === "ar"
              ? "منصاتنا تخدم الملايين حول العالم"
              : "Our Platforms Serve Millions Worldwide"}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {activeLocale === "ar" ? `${cards.length} منصة` : `${cards.length} modules`}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {cards.map((card) => (
            <PlatformCard
              key={card.module.id}
              card={card}
              locale={activeLocale}
              onExplore={() => navigate({ page: "platform", slug: card.module.slug })}
            />
          ))}
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4">
        <SiteAdSlot placement="home_after_platforms" position="slot_1" locale={activeLocale} className="pb-8" />
      </div>

      <AiRecommendationsSection />

      <div className="mx-auto max-w-7xl px-4 pb-4">
        <SiteAdSlot placement="home_before_why" position="slot_2" locale={activeLocale} />
      </div>

      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="mb-10 text-center">
          <h2 className={`text-3xl font-bold ${activeLocale === "ar" ? "font-arabic-display" : ""}`}>{activeLocale === "ar" ? "لماذا تختارنا" : "Why Choose Us"}</h2>
          <p className="mt-3 text-muted-foreground">
            {activeLocale === "ar"
              ? "مصمم للنمو والثقة والكفاءة التشغيلية على نطاق عالمي."
              : "Built for scale, designed for trust, and optimized for global operations."}
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {whyChooseItems.map((item) => (
            <Card key={item.title} className="glass">
              <CardContent className="space-y-3 p-6">
                <item.icon className="h-8 w-8 text-primary" />
                <h3 className="text-lg font-semibold">
                  {activeLocale === "ar"
                    ? item.title === "Enterprise-Grade Security"
                      ? "أمان بمعايير المؤسسات"
                      : item.title === "Global Multi-Module Ecosystem"
                        ? "منظومة عالمية متعددة المنصات"
                        : item.title === "Premium User Experience"
                          ? "تجربة مستخدم فاخرة"
                          : "تحكم إداري كامل"
                    : item.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {activeLocale === "ar"
                    ? item.title === "Enterprise-Grade Security"
                      ? "صلاحيات دقيقة وبنية آمنة لعمليات كبيرة."
                      : item.title === "Global Multi-Module Ecosystem"
                        ? "15 منصة مترابطة تعمل كمنظومة واحدة قابلة للتوسع."
                        : item.title === "Premium User Experience"
                          ? "واجهة حديثة سريعة مع حركة سلسة وصور قوية."
                          : "إدارة المنصات والبنرات والمحتوى والإعدادات من مكان واحد."
                    : item.text}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  )
}

function PlatformCard({
  card,
  locale,
  onExplore,
}: {
  card: {
    module: ModuleWithBanner
    banner: PublicPlatformBanner | null
    images: string[]
  }
  locale: "en" | "ar"
  onExplore: () => void
}) {
  const [imgIdx, setImgIdx] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setImgIdx((s) => (card.images.length ? (s + 1) % card.images.length : 0))
    }, 2600)
    return () => clearInterval(interval)
  }, [card.images.length])

  useEffect(() => {
    card.images.forEach((src) => {
      if (!src) return
      const img = new Image()
      img.src = src
    })
  }, [card.images])

  const title = locale === "ar" ? card.banner?.titleAr || card.module.nameAr : card.banner?.titleEn || card.module.nameEn
  const description =
    locale === "ar"
      ? card.banner?.descriptionAr || card.module.descriptionAr
      : card.banner?.descriptionEn || card.module.descriptionEn
  const ctaText = locale === "ar" ? card.banner?.ctaTextAr || "استكشف" : card.banner?.ctaTextEn || "Explore"
  const activeImage = card.images[imgIdx] || ""

  return (
    <Card className="overflow-hidden border-border/40 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="relative h-56 w-full overflow-hidden bg-[oklch(0.10_0.025_265)]">
        {activeImage && (
          <AnimatePresence mode="sync">
            <motion.img
              key={`${card.module.id}-${imgIdx}-${activeImage}`}
              src={activeImage}
              alt={title}
              className="absolute inset-0 h-full w-full object-cover"
              initial={{ opacity: 0, scale: 1.02 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.45 }}
            />
          </AnimatePresence>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent" />
        <div className="absolute bottom-3 left-3 flex gap-1.5">
          {[0, 1, 2].map((dot) => (
            <span
              key={dot}
              className={`h-1.5 rounded-full ${dot === imgIdx ? "w-6 bg-white" : "w-2 bg-white/50"}`}
            />
          ))}
        </div>
      </div>
      <CardContent className="space-y-3 p-5">
        <h3 className={`text-xl font-semibold ${locale === "ar" ? "font-arabic-display" : ""}`}>{title}</h3>
        <p className="line-clamp-2 text-sm text-muted-foreground">{description}</p>
        <Button className="w-full btn-gold" onClick={onExplore}>
          {ctaText}
        </Button>
      </CardContent>
    </Card>
  )
}
