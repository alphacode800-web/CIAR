"use client"

import { useRef, useCallback, useEffect, useState } from "react"
import { motion, AnimatePresence, useScroll, useTransform, useInView } from "framer-motion"
import {
  ArrowRight,
  Eye,
  Layers,
  Zap,
  Sparkles,
  ExternalLink,
  Globe,
  Building,
  ShoppingCart,
  Plane,
  ShieldCheck,
  Rocket,
  Gauge,
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
import { StatsSection } from "@/components/home/StatsSection"
import { PlatformShowcase } from "@/components/home/PlatformShowcase"
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

const HERO_IMAGES = [
  "/images/headers/hero-1.png",
  "/images/headers/hero-2.png",
  "/images/headers/hero-3.png",
  "/images/headers/hero-4.png",
]

interface HomeStats {
  totalProjects: number
  totalViews: number
  totalCategories: number
}

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
  stats: HomeStats
  featuredProjects?: FeaturedProject[]
}

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" as const },
  transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] as const },
})

const categoryIcons: Record<string, React.ElementType> = {
  "Real Estate": Building,
  "Car Rental": Globe,
  "E-Commerce": ShoppingCart,
  "Tourism": Plane,
  "Food Delivery": Sparkles,
}

function ProjectCard({
  project,
  locale,
  navigate,
  index,
}: {
  project: FeaturedProject
  locale: string
  navigate: (route: { page: "project"; slug: string }) => void
  index: number
}) {
  const cardRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const card = cardRef.current
    if (!card) return
    const rect = card.getBoundingClientRect()
    card.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`)
    card.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`)
  }, [])

  const translation = project.translations.find((tr) => tr.locale === locale)
  const name = translation?.name ?? project.translations[0]?.name ?? ""
  const tagline = translation?.tagline ?? project.translations[0]?.tagline ?? ""
  const IconComponent = categoryIcons[project.category] || Layers

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      {...fadeUp(index * 0.08)}
      className="card-spotlight group rounded-2xl border border-[oklch(0.78_0.14_82/12%)] bg-card/50 backdrop-blur-sm overflow-hidden transition-all duration-500 hover:border-[oklch(0.78_0.14_82/25%)] hover:shadow-xl hover:shadow-[oklch(0.78_0.14_82/5%)]"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-[oklch(0.14_0.028_265)] to-[oklch(0.10_0.02_265)]">
        {project.imageUrl ? (
          <img
            src={project.imageUrl}
            alt={name}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-[oklch(0.78_0.14_82/20%)] to-[oklch(0.72_0.13_75/10%)] flex items-center justify-center">
              <IconComponent className="h-7 w-7 text-[oklch(0.78_0.14_82/50%)]" />
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[oklch(0.10_0.025_265)] via-transparent to-transparent opacity-60" />
        <div className="absolute top-3 start-3">
          <Badge className="glass text-xs font-medium border-[oklch(0.78_0.14_82/20%)]">
            {project.category}
          </Badge>
        </div>
        {project.externalUrl && (
          <a
            href={project.externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className={cn(
              "absolute top-3 end-3 h-8 w-8 rounded-full glass border border-[oklch(0.78_0.14_82/20%)]",
              "flex items-center justify-center text-muted-foreground",
              "opacity-0 translate-y-1 transition-all duration-300",
              "group-hover:opacity-100 group-hover:translate-y-0",
              "hover:text-[oklch(0.78_0.14_82)]"
            )}
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        )}
      </div>
      <div className="p-5">
        <h3 className="text-lg font-semibold text-foreground group-hover:text-[oklch(0.78_0.14_82)] transition-colors duration-300 line-clamp-1">
          {name}
        </h3>
        <p className="mt-1.5 text-sm text-muted-foreground line-clamp-2 leading-relaxed">
          {tagline}
        </p>
      </div>
    </motion.div>
  )
}

export function HomePage({ stats, featuredProjects = [] }: HomePageProps) {
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

  const [animatedStats, setAnimatedStats] = useState({ projects: 0, views: 0, categories: 0 })
  const [currentSlide, setCurrentSlide] = useState(0)
  const statsRef = useRef<HTMLDivElement>(null)
  const statsInView = useInView(statsRef, { once: true, margin: "-50px" })

  useEffect(() => {
    if (!statsInView) return
    const duration = 1500
    const steps = 60
    const interval = duration / steps
    let step = 0
    const timer = setInterval(() => {
      step++
      const progress = step / steps
      const eased = 1 - Math.pow(1 - progress, 3)
      setAnimatedStats({
        projects: Math.round(stats.totalProjects * eased),
        views: Math.round(stats.totalViews * eased),
        categories: Math.round(stats.totalCategories * eased),
      })
      if (step >= steps) clearInterval(timer)
    }, interval)
    return () => clearInterval(timer)
  }, [statsInView, stats.totalProjects, stats.totalViews, stats.totalCategories])

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_IMAGES.length)
    }, 7000)
    return () => clearInterval(interval)
  }, [])

  const formatNumber = (num: number) => {
    try {
      return num.toLocaleString(
        locale === "ar" ? "ar-SA" : locale === "fr" ? "fr-FR" : locale === "es" ? "es-ES" : locale === "de" ? "de-DE" : "en-US"
      )
    } catch {
      return num.toLocaleString()
    }
  }

  const statItems = [
    { icon: Layers, value: formatNumber(animatedStats.projects), label: t("hero.stat_products") },
    { icon: Eye, value: formatNumber(animatedStats.views), label: t("hero.stat_views") },
    { icon: Zap, value: formatNumber(animatedStats.categories) + "+", label: t("hero.stat_categories") },
  ]

  const heroHighlights = [
    { icon: ShieldCheck, label: "Enterprise Security" },
    { icon: Rocket, label: "Fast Scalable Delivery" },
    { icon: Gauge, label: "99.9% Platform Uptime" },
  ]

  const luxuryPills = ["Glass UI", "AI Optimized", "Global Standards"]
  const newsTickerItems = [
    "Launching new enterprise platforms this quarter",
    "24/7 technical support now available for all clients",
    "New AI-powered modules added to our ecosystem",
    "International expansion across multiple industries",
  ]
  const newsTicker = newsTickerItems.join("   \u2022   ")

  return (
    <div ref={heroRef} className="relative overflow-hidden">
      {/* ═══ 1. HERO SECTION with 10-image slideshow ═══ */}
      <section className="relative min-h-screen flex items-center justify-center">
        <div className="absolute inset-0">
          <AnimatePresence mode="wait">
            <motion.img
              key={HERO_IMAGES[currentSlide]}
              src={HERO_IMAGES[currentSlide]}
              alt=""
              loading="eager"
              decoding="async"
              initial={{ opacity: 0, scale: 1.03 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0 w-full h-full object-cover"
            />
          </AnimatePresence>
          <div className="absolute inset-0 bg-gradient-to-b from-[oklch(0.10_0.025_265/64%)] via-[oklch(0.10_0.025_265/82%)] to-[oklch(0.10_0.025_265/96%)]" />
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {HERO_IMAGES.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setCurrentSlide(i)
              }}
              className={cn(
                "h-1.5 rounded-full transition-all duration-500",
                i === currentSlide
                  ? "w-8 bg-[oklch(0.78_0.14_82)] shadow-[0_0_8px_oklch(0.78_0.14_82/50%)]"
                  : "w-1.5 bg-white/20 hover:bg-white/40"
              )}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>

        <div className="absolute inset-0 dot-pattern opacity-35" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,oklch(0.10_0.025_265/45%)_70%,oklch(0.10_0.025_265/75%)_100%)]" />

        <div className="absolute top-18 inset-x-0 z-30 border-y border-[oklch(0.78_0.14_82/18%)] bg-[oklch(0.10_0.025_265/72%)] backdrop-blur-sm overflow-hidden">
          <div className="mx-auto max-w-7xl flex items-center">
            <div className="shrink-0 px-3 sm:px-4 py-2 border-e border-[oklch(0.78_0.14_82/16%)]">
              <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[oklch(0.82_0.145_85)]">
                News
              </span>
            </div>
            <div className="relative flex-1 overflow-hidden py-2">
              <motion.div
                className="flex w-max whitespace-nowrap text-[12px] sm:text-[13px] text-foreground/85 font-medium"
                animate={{ x: dir === "rtl" ? ["-50%", "0%"] : ["0%", "-50%"] }}
                transition={{ duration: 26, repeat: Infinity, ease: "linear" }}
              >
                <span className="px-6">{newsTicker}</span>
                <span className="px-6">{newsTicker}</span>
              </motion.div>
            </div>
          </div>
        </div>

        <div className={cn("absolute -top-20 -start-40 h-[500px] w-[500px] rounded-full blur-[120px] pointer-events-none", "bg-[oklch(0.78_0.14_82/15%)]", "animate-float")} />
        <div className={cn("absolute top-10 -end-32 h-[400px] w-[400px] rounded-full blur-[100px] pointer-events-none", "bg-[oklch(0.22_0.04_265/20%)]", "animate-float-delayed")} />
        <div className={cn("absolute bottom-20 start-1/3 h-[350px] w-[350px] rounded-full blur-[100px] pointer-events-none", "bg-[oklch(0.72_0.12_75/10%)]", "animate-float")} style={{ animationDelay: "1.5s" }} />

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

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.58 }}
            className="mt-5 flex flex-wrap justify-center gap-2.5"
          >
            {luxuryPills.map((pill) => (
              <span key={pill} className="glass rounded-full px-3.5 py-1.5 text-[11px] font-medium tracking-wide text-foreground/85">
                {pill}
              </span>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.62, ease: [0.22, 1, 0.36, 1] }}
            className="mt-6 flex flex-wrap items-center justify-center gap-2.5"
          >
            {heroHighlights.map((item) => (
              <span
                key={item.label}
                className="inline-flex items-center gap-2 rounded-full border border-[oklch(0.78_0.14_82/16%)] bg-[oklch(0.12_0.03_265/55%)] px-3.5 py-1.5 text-xs text-muted-foreground"
              >
                <item.icon className="h-3.5 w-3.5 text-[oklch(0.82_0.145_85)]" />
                {item.label}
              </span>
            ))}
          </motion.div>

          <motion.div ref={statsRef} initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.65, ease: [0.22, 1, 0.36, 1] }} className="mt-16 sm:mt-20 w-full max-w-2xl">
            <div className="glass-premium rounded-2xl p-6 sm:p-8 shadow-lg shadow-black/10">
              <div className="grid grid-cols-3 divide-x divide-[oklch(0.78_0.14_82/15%)]">
                {statItems.map((stat) => (
                  <div key={stat.label} className="flex flex-col items-center gap-1.5 px-3 sm:px-6 first:ps-0 last:pe-0">
                    <stat.icon className="h-5 w-5 text-[oklch(0.78_0.14_82)] mb-1" />
                    <span className="text-2xl sm:text-3xl font-bold tabular-nums tracking-tight gradient-text">{stat.value}</span>
                    <span className="text-xs sm:text-sm text-muted-foreground">{stat.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.85 }}
            className="mt-10 hidden sm:flex flex-col items-center gap-2"
          >
            <span className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground/70">Scroll</span>
            <span className="h-8 w-[1px] bg-gradient-to-b from-[oklch(0.78_0.14_82)] to-transparent" />
          </motion.div>
        </motion.div>
      </section>

      <div className="glow-line-gold" />

      {/* ═══ 2. All Platforms Grid (directly after hero) ═══ */}
      {featuredProjects.length > 0 && (
        <section className="relative py-24 sm:py-32">
          <div className="absolute inset-0 dot-pattern opacity-30 pointer-events-none" />
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.div {...fadeUp(0)} className="text-center mb-14">
              <span className="inline-flex items-center gap-2 rounded-full border border-[oklch(0.78_0.14_82/20%)] bg-[oklch(0.78_0.14_82/6%)] px-4 py-1.5 text-xs font-semibold text-[oklch(0.82_0.145_85)]">
                <Layers className="h-3.5 w-3.5" />
                Platform Ecosystem
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                {t("home.featured_projects") || "Our Platforms"}
              </h2>
              <div className="mt-4 mx-auto w-24 h-1 rounded-full bg-gradient-to-r from-[oklch(0.82_0.145_85)] via-[oklch(0.78_0.14_82)] to-[oklch(0.70_0.13_72)]" />
              <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
                {t("home.featured_subtitle") || "Discover all our digital platforms"}
              </p>
            </motion.div>
            <div className="rounded-3xl glass-premium p-5 sm:p-7">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
              {featuredProjects.map((project, i) => (
                <button key={project.id} onClick={() => navigate({ page: "project", slug: project.slug })} className="text-start w-full">
                  <ProjectCard project={project} locale={locale} navigate={navigate} index={i} />
                </button>
              ))}
              </div>
            </div>
          </div>
        </section>
      )}

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
      <StatsSection />

      <div className="section-divider-gold mx-auto max-w-7xl" />

      {/* ═══ 10. Platform Showcase Carousel ═══ */}
      <PlatformShowcase />

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
