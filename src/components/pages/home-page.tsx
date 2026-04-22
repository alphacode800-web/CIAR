"use client"

import { useRef, useCallback, useEffect, useState } from "react"
import { motion, useScroll, useTransform, useInView } from "framer-motion"
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

const HERO_IMAGES = [
  "/images/headers/hero-1.png",
  "/images/headers/hero-2.png",
  "/images/headers/hero-3.png",
  "/images/headers/hero-4.png",
  "/images/headers/hero-5.png",
  "/images/headers/hero-6.png",
  "/images/headers/hero-7.png",
  "/images/headers/hero-8.png",
  "/images/headers/hero-9.png",
  "/images/headers/hero-10.png",
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
  transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] },
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
  const [nextSlide, setNextSlide] = useState(1)
  const [isTransitioning, setIsTransitioning] = useState(false)
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
      setIsTransitioning(true)
      setTimeout(() => {
        setCurrentSlide((prev) => (prev + 1) % HERO_IMAGES.length)
        setNextSlide((prev) => (prev + 1) % HERO_IMAGES.length)
        setIsTransitioning(false)
      }, 800)
    }, 5000)
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

  return (
    <div ref={heroRef} className="relative overflow-hidden">
      {/* ═══ 1. HERO SECTION with 10-image slideshow ═══ */}
      <section className="relative min-h-screen flex items-center justify-center">
        <div className="absolute inset-0">
          <img
            src={HERO_IMAGES[currentSlide]}
            alt=""
            className={cn(
              "absolute inset-0 w-full h-full object-cover transition-opacity duration-[1200ms] ease-in-out",
              isTransitioning ? "opacity-0 scale-105" : "opacity-100 scale-100"
            )}
          />
          <img
            src={HERO_IMAGES[nextSlide]}
            alt=""
            className={cn(
              "absolute inset-0 w-full h-full object-cover transition-all duration-[1200ms] ease-in-out",
              isTransitioning ? "opacity-100 scale-100" : "opacity-0 scale-105"
            )}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[oklch(0.10_0.025_265/75%)] via-[oklch(0.10_0.025_265/85%)] to-[oklch(0.10_0.025_265/95%)]" />
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {HERO_IMAGES.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setIsTransitioning(true)
                setTimeout(() => {
                  setCurrentSlide(i)
                  setNextSlide((i + 1) % HERO_IMAGES.length)
                  setIsTransitioning(false)
                }, 400)
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

        <div className="absolute inset-0 dot-pattern opacity-40" />

        <div className={cn("absolute -top-20 -start-40 h-[500px] w-[500px] rounded-full blur-[120px] pointer-events-none", "bg-[oklch(0.78_0.14_82/15%)]", "animate-float")} />
        <div className={cn("absolute top-10 -end-32 h-[400px] w-[400px] rounded-full blur-[100px] pointer-events-none", "bg-[oklch(0.22_0.04_265/20%)]", "animate-float-delayed")} />
        <div className={cn("absolute bottom-20 start-1/3 h-[350px] w-[350px] rounded-full blur-[100px] pointer-events-none", "bg-[oklch(0.72_0.12_75/10%)]", "animate-float")} style={{ animationDelay: "1.5s" }} />

        <motion.div style={{ y, opacity, scale }} className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-36 pb-24 sm:pt-40 sm:pb-32 flex flex-col items-center text-center">
          <motion.div initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}>
            <Badge className="glass-strong border border-[oklch(0.78_0.14_82/20%)] rounded-full px-5 py-2 text-sm font-medium gap-2 shadow-lg">
              <Sparkles className="h-3.5 w-3.5 text-[oklch(0.78_0.14_82)]" />
              {t("hero.badge")}
            </Badge>
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }} className="mt-8 text-5xl sm:text-6xl lg:text-8xl font-bold tracking-tight leading-[1.05] max-w-5xl">
            {t("hero.title_1")}{" "}
            <span className="gradient-text">{t("hero.title_2")}</span>
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.35, ease: [0.22, 1, 0.36, 1] }} className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {t("hero.subtitle")}
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.5, ease: [0.22, 1, 0.36, 1] }} className="mt-10 flex flex-col sm:flex-row items-center gap-4">
            <Button size="lg" onClick={() => navigate({ page: "projects" })} className={cn("gap-2 rounded-xl px-8 h-12 text-base font-semibold", "btn-gold", "transition-all duration-500")}>
              {t("hero.cta")}
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate({ page: "about" })} className={cn("rounded-xl px-8 h-12 text-base font-medium", "border-[oklch(0.78_0.14_82/25%)] bg-[oklch(0.78_0.14_82/5%)]", "text-[oklch(0.78_0.14_82)]", "hover:bg-[oklch(0.78_0.14_82/10%)] hover:border-[oklch(0.78_0.14_82/40%)]", "transition-all duration-300")}>
              {t("hero.cta2")}
            </Button>
          </motion.div>

          <motion.div ref={statsRef} initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.65, ease: [0.22, 1, 0.36, 1] }} className="mt-16 sm:mt-20 w-full max-w-2xl">
            <div className="glass-strong rounded-2xl border border-[oklch(0.78_0.14_82/20%)] p-6 sm:p-8 shadow-lg shadow-black/10">
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
        </motion.div>
      </section>

      <div className="glow-line-gold" />

      {/* ═══ 2. Marquee Banner ═══ */}
      <MarqueeBanner />

      {/* ═══ 3. About Brief ═══ */}
      <AboutBrief />

      <div className="section-divider-gold mx-auto max-w-7xl" />

      {/* ═══ 4. Trust Badges ═══ */}
      <TrustBadges />

      <div className="glow-line-gold" />

      {/* ═══ 5. Services Grid ═══ */}
      <ServicesGrid />

      <div className="section-divider-gold mx-auto max-w-7xl" />

      {/* ═══ 6. How It Works ═══ */}
      <HowItWorks />

      <div className="glow-line-gold" />

      {/* ═══ 7. Stats Section ═══ */}
      <StatsSection />

      <div className="section-divider-gold mx-auto max-w-7xl" />

      {/* ═══ 8. All Platforms Grid ═══ */}
      {featuredProjects.length > 0 && (
        <section className="relative py-24 sm:py-32">
          <div className="absolute inset-0 dot-pattern opacity-30 pointer-events-none" />
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.div {...fadeUp(0)} className="text-center mb-14">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                {t("home.featured_projects") || "Our Platforms"}
              </h2>
              <div className="mt-4 mx-auto w-24 h-1 rounded-full bg-gradient-to-r from-[oklch(0.82_0.145_85)] via-[oklch(0.78_0.14_82)] to-[oklch(0.70_0.13_72)]" />
              <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
                {t("home.featured_subtitle") || "Discover all our digital platforms"}
              </p>
            </motion.div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
              {featuredProjects.map((project, i) => (
                <button key={project.id} onClick={() => navigate({ page: "project", slug: project.slug })} className="text-start w-full">
                  <ProjectCard project={project} locale={locale} navigate={navigate} index={i} />
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      <div className="glow-line-gold" />

      {/* ═══ 9. Platform Showcase Carousel ═══ */}
      <PlatformShowcase />

      <div className="section-divider-gold mx-auto max-w-7xl" />

      {/* ═══ 10. Tech Stack ═══ */}
      <TechStack />

      <div className="glow-line-gold" />

      {/* ═══ 11. Testimonials ═══ */}
      <Testimonials />

      <div className="section-divider-gold mx-auto max-w-7xl" />

      {/* ═══ 12. Global Presence ═══ */}
      <GlobalPresence />

      <div className="glow-line-gold" />

      {/* ═══ 13. Team Highlight ═══ */}
      <TeamHighlight />

      <div className="section-divider-gold mx-auto max-w-7xl" />

      {/* ═══ 14. Awards Banner ═══ */}
      <AwardsBanner />

      <div className="glow-line-gold" />

      {/* ═══ 15. News Updates ═══ */}
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
