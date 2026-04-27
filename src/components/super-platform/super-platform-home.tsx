"use client"

import { useEffect, useMemo, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { BadgeCheck, Globe2, ShieldCheck, Sparkles } from "lucide-react"
import { useI18n } from "@/lib/i18n-context"
import { useRouter } from "@/lib/router-context"

type Banner = {
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
  module: {
    nameEn: string
    nameAr: string
    visibility: "VISIBLE" | "HIDDEN"
    isEnabled: boolean
  }
}

type ModuleWithBanner = {
  id: string
  slug: string
  nameEn: string
  nameAr: string
  descriptionEn: string
  descriptionAr: string
  visibility: "VISIBLE" | "HIDDEN"
  isEnabled: boolean
  order: number
  banner: Banner | null
}

type CachedProject = {
  slug: string
  category: string
  featured: boolean
  published: boolean
  imageUrl: string
  imageUrls?: string[]
  translations?: { locale: string; name: string; tagline: string; description: string }[]
}

const LOCAL_PROJECTS_CACHE_KEY = "ciar-admin-projects-local-cache"

function moduleSlugToProjectSlug(moduleSlug: string): string {
  return `ciar-${moduleSlug.toLowerCase().replace(/_/g, "-")}`
}

function pickTranslation(
  translations: CachedProject["translations"] = [],
  locale: "ar" | "en"
) {
  const direct = translations.find((tr) => tr.locale === locale)
  if (direct) return direct
  return translations.find((tr) => tr.locale === "en") || translations[0]
}

const whyChooseItems = [
  { icon: ShieldCheck, title: "Enterprise-Grade Security", text: "Role-based controls and secure architecture for large-scale operations." },
  { icon: Globe2, title: "Global Multi-Module Ecosystem", text: "15 connected modules running as one scalable super platform." },
  { icon: Sparkles, title: "Premium User Experience", text: "Fast, modern, image-first pages with smooth interactions." },
  { icon: BadgeCheck, title: "Full Admin Control", text: "Manage modules, banners, users, content, and settings in one place." },
]

export function SuperPlatformHome() {
  const { locale, dir } = useI18n()
  const { navigate } = useRouter()
  const [modules, setModules] = useState<ModuleWithBanner[]>([])
  const [headerIndex, setHeaderIndex] = useState(0)
  const activeLocale: "en" | "ar" = locale === "ar" ? "ar" : "en"

  useEffect(() => {
    document.documentElement.lang = activeLocale
    document.documentElement.dir = dir
  }, [activeLocale, dir])

  useEffect(() => {
    const timer = setTimeout(() => {
      fetch("/api/super-platform/modules")
        .then((r) => r.json())
        .then((d) => {
          let rows = Array.isArray(d.modules) ? d.modules : []

          // In fallback mode, merge admin local project edits so the public
          // platform reflects changes immediately even when DB is offline.
          if (d?.fallback && typeof window !== "undefined") {
            try {
              const cachedRaw = localStorage.getItem(LOCAL_PROJECTS_CACHE_KEY)
              const cachedProjects: CachedProject[] = cachedRaw ? JSON.parse(cachedRaw) : []
              if (Array.isArray(cachedProjects) && cachedProjects.length > 0) {
                rows = rows.map((moduleItem: ModuleWithBanner) => {
                  const matched = cachedProjects.find(
                    (project) => project.slug === moduleSlugToProjectSlug(moduleItem.slug)
                  )
                  if (!matched) return moduleItem

                  const ar = pickTranslation(matched.translations, "ar")
                  const en = pickTranslation(matched.translations, "en")
                  const images =
                    Array.isArray(matched.imageUrls) && matched.imageUrls.length > 0
                      ? matched.imageUrls
                      : matched.imageUrl
                        ? [matched.imageUrl]
                        : []

                  return {
                    ...moduleItem,
                    nameEn: en?.name || moduleItem.nameEn,
                    nameAr: ar?.name || moduleItem.nameAr,
                    descriptionEn: en?.description || moduleItem.descriptionEn,
                    descriptionAr: ar?.description || moduleItem.descriptionAr,
                    isEnabled: matched.published,
                    banner: moduleItem.banner
                      ? {
                          ...moduleItem.banner,
                          titleEn: en?.name || moduleItem.banner.titleEn,
                          titleAr: ar?.name || moduleItem.banner.titleAr,
                          descriptionEn: en?.description || moduleItem.banner.descriptionEn,
                          descriptionAr: ar?.description || moduleItem.banner.descriptionAr,
                          imageUrl1: images[0] || moduleItem.banner.imageUrl1,
                          imageUrl2: images[1] || moduleItem.banner.imageUrl2,
                          imageUrl3: images[2] || moduleItem.banner.imageUrl3,
                        }
                      : moduleItem.banner,
                  }
                })
              }
            } catch {
              // ignore cached merge issues and keep API rows
            }
          }

          const filtered = rows
            .filter((m: ModuleWithBanner) => m.visibility === "VISIBLE" && m.isEnabled && m.banner?.isActive)
            .sort((a: ModuleWithBanner, b: ModuleWithBanner) => a.order - b.order)
          setModules(filtered)
        })
        .catch(() => setModules([]))
    }, 0)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const totalImages = modules
      .flatMap((m) => (m.banner ? [m.banner.imageUrl1, m.banner.imageUrl2, m.banner.imageUrl3] : []))
      .filter(Boolean)
      .slice(0, 5).length
    const interval = setInterval(() => {
      setHeaderIndex((s) => (totalImages ? (s + 1) % totalImages : 0))
    }, 3500)
    return () => clearInterval(interval)
  }, [modules])

  useEffect(() => {
    const images = modules
      .flatMap((m) => (m.banner ? [m.banner.imageUrl1, m.banner.imageUrl2, m.banner.imageUrl3] : []))
      .filter(Boolean)
      .slice(0, 5)
    images.forEach((src) => {
      if (!src) return
      const img = new Image()
      img.src = src
    })
  }, [modules])

  const cards = useMemo(
    () =>
      modules.map((m) => {
        const banner = m.banner
        const images = banner ? [banner.imageUrl1, banner.imageUrl2, banner.imageUrl3].filter(Boolean) : []
        return { module: m, banner, images }
      }),
    [modules]
  )

  const headerImages = cards.flatMap((c) => c.images).filter(Boolean).slice(0, 5)

  return (
    <div className="min-h-screen bg-background">
      <section className="relative min-h-[62vh] overflow-hidden bg-[oklch(0.10_0.025_265)]">
        {headerImages.length > 0 && (
          <AnimatePresence mode="sync">
            <motion.img
              key={headerImages[headerIndex]}
              src={headerImages[headerIndex]}
              alt="CIAR Header"
              className="absolute inset-0 h-full w-full object-cover"
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
            />
          </AnimatePresence>
        )}
        <div className="absolute inset-0 bg-black/60" />

        <div className="relative z-10 mx-auto flex min-h-[62vh] max-w-7xl items-center px-4 py-20">
          <div className="max-w-4xl space-y-6 text-white">
            <h1 className={`text-4xl font-bold leading-tight sm:text-6xl ${activeLocale === "ar" ? "font-arabic-display" : ""}`}>
              {activeLocale === "ar" ? "منصتنا - منظومة CIAR المتكاملة" : "Our Platform - CIAR Integrated Ecosystem"}
            </h1>
            <p className="max-w-3xl text-lg text-white/85">
              {activeLocale === "ar"
                ? "جميع منصات CIAR في واجهة واحدة حديثة. كل منصة تُدار من لوحة الأدمن مع صور ومحتوى ديناميكي."
                : "All CIAR platforms in one modern experience. Every platform card is managed dynamically from the admin panel."}
            </p>
            <div className="flex flex-wrap gap-2">
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
        <div className="mb-8 flex items-center justify-between">
          <h2 className={`text-2xl font-bold sm:text-3xl ${activeLocale === "ar" ? "font-arabic-display" : ""}`}>
            {activeLocale === "ar" ? "جميع منصاتنا" : "All Platform Cards"}
          </h2>
          <span className="text-sm text-muted-foreground">
            {activeLocale === "ar" ? `${cards.length} منصة` : `${cards.length} modules`}
          </span>
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
    banner: Banner | null
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
