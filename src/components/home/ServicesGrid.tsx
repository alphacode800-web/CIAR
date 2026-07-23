"use client"

import { useRef, useCallback, useEffect, useState } from "react"
import { motion, useInView } from "framer-motion"
import { useI18n } from "@/lib/i18n-context"
import { useRouter } from "@/lib/router-context"
import { cn } from "@/lib/utils"
import { CIAR_MODULES } from "@/features/super-platform/config"
import {
  Building2,
  Car,
  ShoppingCart,
  Plane,
  Truck,
  Briefcase,
  Sparkles,
  Globe,
  Crown,
  Wrench,
  Megaphone,
  TrendingUp,
  ArrowLeft,
  Layers,
  type LucideIcon,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { comparePlatformOrderDesc, reversePlatformDisplayOrder } from "@/lib/platform-display-order"

type PlatformItem = {
  slug: string
  nameEn: string
  nameAr: string
  descriptionEn: string
  descriptionAr: string
}

const SLUG_ICONS: Record<string, LucideIcon> = {
  FASHION: Sparkles,
  GLOBAL_PRODUCTS: Globe,
  VIP: Crown,
  MALL: ShoppingCart,
  TOURISM: Plane,
  REAL_ESTATE: Building2,
  CARS: Car,
  SERVICES: Wrench,
  SHIPPING: Truck,
  JOBS: Briefcase,
  ADS_MARKETING: Megaphone,
  INVESTMENT: TrendingUp,
}

function buildFallbackPlatforms(): PlatformItem[] {
  return reversePlatformDisplayOrder(
    CIAR_MODULES.filter((module) => module.visibility === "VISIBLE").map((module) => ({
      slug: module.slug,
      nameEn: module.nameEn,
      nameAr: module.nameAr,
      descriptionEn: module.descriptionEn,
      descriptionAr: module.descriptionAr,
    }))
  )
}

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" as const },
  transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] },
})

export function ServicesGrid() {
  const { t, locale } = useI18n()
  const ref = useRef<HTMLDivElement>(null)
  const [platforms, setPlatforms] = useState<PlatformItem[]>(buildFallbackPlatforms)

  useEffect(() => {
    fetch("/api/super-platform/modules")
      .then((res) => res.json())
      .then((data) => {
        const rows = Array.isArray(data?.modules) ? data.modules : []
        const visible = rows
          .filter(
            (module: { visibility?: string; isEnabled?: boolean }) =>
              module.visibility === "VISIBLE" && module.isEnabled
          )
          .sort(comparePlatformOrderDesc)

        if (visible.length === 0) return

        setPlatforms(
          visible.map(
            (module: {
              slug: string
              nameEn: string
              nameAr: string
              descriptionEn: string
              descriptionAr: string
            }) => ({
              slug: module.slug,
              nameEn: module.nameEn,
              nameAr: module.nameAr,
              descriptionEn: module.descriptionEn,
              descriptionAr: module.descriptionAr,
            })
          )
        )
      })
      .catch(() => {
        // keep bundled fallback
      })
  }, [])

  const title =
    locale === "ar"
      ? t("home.services_title") || `${platforms.length} منصة متكاملة`
      : t("home.services_title") || `${platforms.length} Integrated Platforms`

  return (
    <section ref={ref} className="relative py-20 sm:py-28">
      <div className="absolute inset-0 dot-pattern opacity-20 pointer-events-none" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div {...fadeUp(0)} className="text-center mb-14">
          <Badge
            className={cn(
              "glass-strong border-[oklch(0.78_0.14_82/20%)] rounded-full px-4 py-1.5 text-xs font-medium gap-1.5 mb-4",
              "text-[oklch(0.78_0.14_82)]"
            )}
          >
            <Layers className="h-3.5 w-3.5" />
            {t("home.services_badge") || (locale === "ar" ? "منصاتنا" : "Our Platforms")}
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">{title}</h2>
          <div className="mt-4 mx-auto w-24 h-1 rounded-full bg-gradient-to-r from-[oklch(0.82_0.145_85)] via-[oklch(0.78_0.14_82)] to-[oklch(0.70_0.13_72)]" />
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
            {t("home.services_subtitle") ||
              (locale === "ar"
                ? "حلول رقمية متكاملة لتبسيط الحياة اليومية وتمكين الأعمال."
                : "Comprehensive digital solutions designed to simplify daily life and empower businesses.")}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 lg:gap-6">
          {platforms.map((platform, index) => (
            <PlatformCard key={platform.slug} platform={platform} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}

function PlatformCard({ platform, index }: { platform: PlatformItem; index: number }) {
  const { navigate } = useRouter()
  const { locale } = useI18n()
  const cardRef = useRef<HTMLButtonElement>(null)
  const isInView = useInView(cardRef, { once: true, margin: "-60px" })
  const Icon = SLUG_ICONS[platform.slug] ?? Layers

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const card = cardRef.current
    if (!card) return
    const rect = card.getBoundingClientRect()
    card.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`)
    card.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`)
  }, [])

  const title = locale === "ar" ? platform.nameAr : platform.nameEn
  const description = locale === "ar" ? platform.descriptionAr : platform.descriptionEn

  return (
    <motion.button
      type="button"
      ref={cardRef}
      onClick={() => navigate({ page: "platform", slug: platform.slug })}
      onMouseMove={handleMouseMove}
      initial={{ opacity: 0, y: 24 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
      aria-label={locale === "ar" ? `استكشف ${title}` : `Explore ${title}`}
      className={cn(
        "card-spotlight group rounded-2xl border border-primary/15 bg-card p-6 text-start w-full",
        "transition-all duration-300 cursor-pointer",
        "hover:border-primary/35 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2"
      )}
    >
      <div className="relative z-10">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="h-12 w-12 rounded-xl flex items-center justify-center bg-primary/10 transition-transform duration-300 group-hover:scale-110">
            <Icon className="h-6 w-6 text-primary" />
          </div>
          <ArrowLeft className="h-4 w-4 text-primary/40 transition-all duration-300 group-hover:text-primary group-hover:-translate-x-0.5 rtl:rotate-180 rtl:group-hover:translate-x-0.5 shrink-0 mt-1" />
        </div>

        <h3 className="text-lg font-bold mb-2 text-foreground group-hover:text-primary transition-colors duration-300">
          {title}
        </h3>

        <p className="text-sm text-foreground/70 leading-relaxed line-clamp-3">{description}</p>
      </div>
    </motion.button>
  )
}
