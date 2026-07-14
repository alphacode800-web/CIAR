"use client"

import { useState, useMemo, useCallback, useRef, useEffect } from "react"
import { motion, AnimatePresence, useInView } from "framer-motion"
import {
  Search,
  ExternalLink,
  Eye,
  Star,
  ArrowRight,
  FolderOpen,
  Layers,
  Filter,
  Grid3X3,
  Building2,
  Car,
  ShoppingCart,
  Plane,
  UtensilsCrossed,
  GraduationCap,
  HeartPulse,
  Truck,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useI18n } from "@/lib/i18n-context"
import { useRouter } from "@/lib/router-context"
import { cn } from "@/lib/utils"
import { PageHeroHeader } from "@/components/layout/page-hero-header"
import { SiteAdSlot } from "@/components/ads/site-ad-slot"
import { DEFAULT_PAGE_HEADERS, type PageHeaderConfig } from "@/lib/page-headers"

export interface Project {
  id: string
  slug: string
  imageUrl: string
  imageUrls?: string[]
  category: string
  featured: boolean
  published: boolean
  views: number
  tags: string
  externalUrl: string
  createdAt: string
  translations: { locale: string; name: string; tagline: string; description: string }[]
}

interface ProjectsPageProps {
  projects: Project[]
  categories: string[]
  onRefresh: () => void
}

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
}

const fadeCard = {
  hidden: { opacity: 0, y: 30, scale: 0.96 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  },
}

/* ── Category icon map ───────────────────────────────────────── */
const catIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  "Real Estate": Building2,
  "Car Rental": Car,
  "E-Commerce": ShoppingCart,
  "Tourism": Plane,
  "Food Delivery": UtensilsCrossed,
  "Education": GraduationCap,
  "Healthcare": HeartPulse,
  "Logistics": Truck,
}

/* ══════════════════════════════════════════════════════════════ */

export function ProjectsPage({ projects, categories, onRefresh }: ProjectsPageProps) {
  const { t, locale } = useI18n()
  const { navigate } = useRouter()
  const [search, setSearch] = useState("")
  const [activeCategory, setActiveCategory] = useState("")
  const [headerConfig, setHeaderConfig] = useState<PageHeaderConfig>(DEFAULT_PAGE_HEADERS.projects)
  const headerRef = useRef<HTMLDivElement>(null)
  const headerInView = useInView(headerRef, { once: true, margin: "-100px" })

  useEffect(() => {
    fetch("/api/page-headers?page=projects")
      .then((r) => r.json())
      .then((d) => {
        if (d?.header) setHeaderConfig(d.header as PageHeaderConfig)
      })
      .catch(() => setHeaderConfig(DEFAULT_PAGE_HEADERS.projects))
  }, [])

  const filtered = useMemo(() => {
    let result = projects
    if (activeCategory) result = result.filter((p) => p.category === activeCategory)
    if (search) {
      const q = search.toLowerCase()
      result = result.filter((p) => {
        const tr = p.translations[0]
        return (
          tr?.name?.toLowerCase().includes(q) ||
          tr?.tagline?.toLowerCase().includes(q) ||
          tr?.description?.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
        )
      })
    }
    return result
  }, [projects, search, activeCategory])

  const getTranslation = (p: Project) =>
    p.translations[0] || { name: p.slug, tagline: "", description: "" }

  const getTags = (p: Project) => {
    try { return JSON.parse(p.tags) as string[] } catch { return [] }
  }

  const formatViews = (v: number) => {
    if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`
    if (v >= 1_000) return `${(v / 1_000).toFixed(1)}K`
    return v.toLocaleString()
  }

  const handleCategoryToggle = useCallback((cat: string) => {
    setActiveCategory((prev) => (prev === cat ? "" : cat))
  }, [])

  /* ── Stats summary ─────────────────────────────────────────── */
  const totalViews = projects.reduce((s, p) => s + p.views, 0)
  const featuredCount = projects.filter((p) => p.featured).length

  const statCards = [
    { label: t("projects.total_projects") || "Platforms", value: projects.length, icon: Layers },
    { label: t("hero.stat_views") || "Total Views", value: formatViews(totalViews), icon: Eye },
    { label: t("projects.featured") || "Featured", value: featuredCount, icon: Star },
    { label: t("hero.stat_categories") || "Categories", value: categories.length, icon: Grid3X3 },
  ]

  return (
    <div className="relative">
      <PageHeroHeader config={headerConfig} locale={locale === "ar" ? "ar" : "en"}>
        <div ref={headerRef} className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={headerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.35 }}
          >
            <div className="glass-strong rounded-2xl p-5 sm:p-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-border/20">
                {statCards.map((s) => (
                  <div key={s.label} className="flex flex-col items-center gap-1 px-3 first:ps-0 last:pe-0">
                    <s.icon className="h-4 w-4 text-[oklch(0.78_0.14_82/50%)] mb-1" />
                    <span className="text-xl sm:text-2xl font-heading font-bold tracking-tight text-foreground">
                      {s.value}
                    </span>
                    <span className="text-[10px] sm:text-xs text-muted-foreground/50 uppercase tracking-[0.1em] font-medium">
                      {s.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </PageHeroHeader>

      <div className="glow-line-gold" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <SiteAdSlot placement="projects_top" position="slot_1" locale={locale === "ar" ? "ar" : "en"} />
      </div>

      {/* ══════════════════════════════════════════════════════════
          FILTERS & SEARCH
      ══════════════════════════════════════════════════════════ */}
      <section className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-2">
        {/* Search & Filter bar */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-8"
        >
          {/* Search input */}
          <div className="relative flex-1 max-w-xl">
            <Search className="absolute start-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground/50 pointer-events-none" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("projects.search_placeholder")}
              className={cn(
                "h-11 ps-11 pe-4 text-sm rounded-xl",
                "bg-card/40 backdrop-blur-sm border-border/25",
                "focus-visible:border-[oklch(0.78_0.14_82/35%)] focus-visible:ring-[oklch(0.78_0.14_82/15%)]",
                "placeholder:text-muted-foreground/40",
                "transition-all duration-300"
              )}
            />
          </div>

          {/* Filter indicator */}
          <div className="flex items-center gap-2 shrink-0">
            <Filter className="h-4 w-4 text-muted-foreground/40" />
            <span className="text-xs text-muted-foreground/50 font-medium">
              {filtered.length} {t("projects.all") || "platforms"}
            </span>
          </div>
        </motion.div>

        {/* Category pills */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="flex gap-2 overflow-x-auto pb-2 scrollbar-none mb-10"
        >
          {/* All pill */}
          <button
            onClick={() => setActiveCategory("")}
            className={cn(
              "shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all duration-300 border",
              activeCategory === ""
                ? "bg-[oklch(0.78_0.14_82)] text-[oklch(0.12_0.03_265)] border-[oklch(0.78_0.14_82)] shadow-sm shadow-[oklch(0.78_0.14_82/20%)]"
                : "bg-card/30 text-muted-foreground border-border/20 hover:text-foreground hover:border-border/40 hover:bg-card/50"
            )}
          >
            <Grid3X3 className="h-3 w-3" />
            {t("projects.all")}
          </button>

          {categories.filter((cat) => cat.trim().length > 0).map((cat, idx) => (
            <button
              key={`cat-${cat}-${idx}`}
              onClick={() => handleCategoryToggle(cat)}
              className={cn(
                "shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all duration-300 border",
                activeCategory === cat
                  ? "bg-[oklch(0.78_0.14_82)] text-[oklch(0.12_0.03_265)] border-[oklch(0.78_0.14_82)] shadow-sm shadow-[oklch(0.78_0.14_82/20%)]"
                  : "bg-card/30 text-muted-foreground border-border/20 hover:text-foreground hover:border-border/40 hover:bg-card/50"
              )}
            >
              {(() => {
                const Icon = catIcons[cat] || FolderOpen
                return <Icon className="h-3.5 w-3.5" />
              })()}
              {cat}
            </button>
          ))}
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          PROJECTS GRID
      ══════════════════════════════════════════════════════════ */}
      <section className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-24">
        <div className="absolute inset-0 dot-pattern opacity-[0.15] pointer-events-none" aria-hidden="true" />

        {filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="w-16 h-16 rounded-2xl glass-strong flex items-center justify-center mx-auto mb-5">
              <FolderOpen className="h-8 w-8 text-muted-foreground/40" />
            </div>
            <h3 className="text-lg font-heading font-semibold text-foreground/80 mb-2">
              {t("projects.no_results")}
            </h3>
            <p className="text-sm text-muted-foreground/60 mb-6">
              {t("projects.no_results_desc") || "Try adjusting your search or filters"}
            </p>
            <Button
              variant="outline"
              onClick={onRefresh}
              className="rounded-xl border-border/30 text-sm"
            >
              {t("projects.refresh")}
            </Button>
          </motion.div>
        ) : (
          <AnimatePresence mode="popLayout">
            <motion.div
              key={search + activeCategory}
              variants={stagger}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6 relative z-10"
            >
              {filtered.map((p) => {
                const tr = getTranslation(p)
                const tags = getTags(p)
                return (
                  <motion.div key={p.id} variants={fadeCard} layout>
                    <ProjectCard
                      project={p}
                      translation={tr}
                      tags={tags}
                      onClick={() => navigate({ page: "project", slug: p.slug })}
                      formatViews={formatViews}
                      t={t}
                    />
                  </motion.div>
                )
              })}
            </motion.div>
          </AnimatePresence>
        )}
      </section>
    </div>
  )
}

/* ── Project Card Component ──────────────────────────────────── */

function ProjectCard({
  project: p,
  translation: tr,
  tags,
  onClick,
  formatViews,
  t,
}: {
  project: Project
  translation: { name: string; tagline: string; description: string }
  tags: string[]
  onClick: () => void
  formatViews: (v: number) => string
  t: (key: string) => string
}) {
  const [hovered, setHovered] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const card = cardRef.current
    if (!card) return
    const rect = card.getBoundingClientRect()
    card.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`)
    card.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`)
  }, [])

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
      className={cn(
        "group relative rounded-2xl overflow-hidden cursor-pointer card-spotlight h-full",
        "bg-card/40 backdrop-blur-sm border border-border/30",
        "transition-all duration-500 ease-out",
        hovered
          ? "shadow-[0_12px_50px_-12px_oklch(0.78_0.14_82/12%),0_0_0_1px_oklch(0.78_0.14_82/18%)] scale-[1.015]"
          : "shadow-[0_2px_16px_-4px_oklch(0_0_0/5%)]"
      )}
    >
      {/* Image Area */}
      <div className="relative aspect-[16/10] overflow-hidden">
        {p.imageUrl ? (
          <img
            src={p.imageUrl}
            alt={tr.name}
            className={cn(
              "w-full h-full object-cover transition-transform duration-700",
              hovered ? "scale-110" : "scale-100"
            )}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[oklch(0.78_0.14_82/15%)] via-[oklch(0.72_0.12_75/8%)] to-[oklch(0.20_0.04_265/10%)] flex items-center justify-center">
            <span className="text-7xl font-heading font-bold text-foreground/10">
              {tr.name?.charAt(0) || "?"}
            </span>
          </div>
        )}

        {/* Bottom gradient overlay on image */}
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

        {/* Category badge */}
        <div className="absolute top-3 start-3 z-10">
          <Badge
            variant="secondary"
            className="glass text-[10px] font-semibold uppercase tracking-[0.08em] px-2.5 py-1"
          >
            {p.category}
          </Badge>
        </div>

        {/* Featured badge */}
        {p.featured && (
          <div className="absolute top-3 end-3 z-10">
            <Badge className="bg-[oklch(0.78_0.14_82)] text-[oklch(0.12_0.03_265)] border-0 text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 gap-1">
              <Star className="h-3 w-3" /> Featured
            </Badge>
          </div>
        )}

        {/* Hover overlay with external link */}
        <div className={cn(
          "absolute inset-0 bg-foreground/[0.03] transition-opacity duration-500 z-[5]",
          hovered ? "opacity-100" : "opacity-0"
        )} />
        <div className={cn(
          "absolute bottom-3 end-3 z-10 transition-all duration-300",
          hovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
        )}>
          <div className="w-9 h-9 rounded-full glass flex items-center justify-center shadow-lg">
            <ExternalLink className="h-4 w-4 text-white/90" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 p-5 sm:p-6">
        {/* Project name */}
        <h3 className="font-heading font-semibold text-[17px] text-foreground group-hover:text-[oklch(0.78_0.14_82)] transition-colors duration-300 tracking-tight">
          {tr.name}
        </h3>

        {/* Tagline */}
        <p className="text-sm text-muted-foreground/70 mt-2 leading-relaxed line-clamp-2">
          {tr.tagline}
        </p>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-4">
            {tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-[10px] font-medium uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-muted/50 text-muted-foreground/60 border border-border/15"
              >
                {tag}
              </span>
            ))}
            {tags.length > 3 && (
              <span className="text-[10px] font-medium text-muted-foreground/40 px-1 py-0.5">
                +{tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between mt-5 pt-4 border-t border-border/15">
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground/50">
            <Eye className="h-3.5 w-3.5" />
            {formatViews(p.views)}
          </span>
          <span className={cn(
            "flex items-center gap-1.5 text-xs font-medium transition-all duration-300",
            "text-[oklch(0.78_0.14_82/60)] group-hover:text-[oklch(0.78_0.14_82)]",
            hovered ? "opacity-100 translate-x-0 rtl:-translate-x-0" : "opacity-70 translate-x-0"
          )}>
            {t("projects.view_details")}
            <ArrowRight className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
          </span>
        </div>
      </div>
    </div>
  )
}
