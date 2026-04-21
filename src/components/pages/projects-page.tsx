"use client"

import { useState, useMemo, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, ExternalLink, Eye, Star, Sparkles, ArrowRight, FolderOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useI18n } from "@/lib/i18n-context"
import { useRouter } from "@/lib/router-context"
import { cn } from "@/lib/utils"

export interface Project {
  id: string
  slug: string
  imageUrl: string
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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
  exit: {
    opacity: 0,
    transition: { staggerChildren: 0.03, staggerDirection: -1 },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
  exit: {
    opacity: 0,
    y: -12,
    scale: 0.97,
    transition: { duration: 0.3 },
  },
} as const

export function ProjectsPage({ projects, categories, onRefresh }: ProjectsPageProps) {
  const { t } = useI18n()
  const { navigate } = useRouter()
  const [search, setSearch] = useState("")
  const [activeCategory, setActiveCategory] = useState("")

  // Filtered projects based on category + search
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
          p.category.toLowerCase().includes(q)
        )
      })
    }
    return result
  }, [projects, search, activeCategory])

  const getTranslation = (p: Project) =>
    p.translations[0] || { name: p.slug, tagline: "", description: "" }

  const getTags = (p: Project) => {
    try {
      return JSON.parse(p.tags) as string[]
    } catch {
      return []
    }
  }

  const handleCategoryToggle = useCallback((cat: string) => {
    setActiveCategory((prev) => (prev === cat ? "" : cat))
  }, [])

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 relative">
      {/* Background decorative elements */}
      <div className="absolute inset-0 dot-pattern opacity-40 pointer-events-none" aria-hidden="true" />
      <div
        className="absolute -top-40 -start-40 w-80 h-80 rounded-full bg-[oklch(0.78_0.14_82/10%)] blur-[100px] pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute top-1/2 -end-40 w-96 h-96 rounded-full bg-violet-500/8 blur-[120px] pointer-events-none"
        aria-hidden="true"
      />

      {/* Hero-style background */}
      <div className="absolute inset-0 pointer-events-none">
        <img src="/images/hero-bg.png" alt="" className="w-full h-64 object-cover opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-b from-[oklch(0.10_0.025_265/80%)] to-transparent" />
      </div>

      <div className="relative z-10">
        {/* ── Section Header ────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <Badge
            variant="secondary"
            className="glass px-4 py-1.5 text-sm mb-4 border border-border/30"
          >
            <Sparkles className="h-3.5 w-3.5 me-1.5 text-[oklch(0.78_0.14_82)]" />
            {t("projects.featured")}
          </Badge>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            <span className="gradient-text">{t("projects.title")}</span>
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            {t("projects.subtitle")}
          </p>
          <div className="glow-line mt-8 mx-auto max-w-md" />
        </motion.div>

        {/* ── Search Bar ────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="mb-6"
        >
          <div className="relative max-w-lg mx-auto">
            <Search className="absolute start-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/60 pointer-events-none" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("projects.search_placeholder")}
              className={cn(
                "h-12 ps-12 pe-4 text-base rounded-2xl",
                "glass-subtle border-border/30",
                "bg-transparent",
                "focus-visible:border-[oklch(0.78_0.14_82/40%)] focus-visible:ring-[oklch(0.78_0.14_82/20%)]",
                "transition-all duration-300"
              )}
            />
          </div>
        </motion.div>

        {/* ── Category Filter Pills ─────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            {/* All pill */}
            <button
              onClick={() => setActiveCategory("")}
              className={cn(
                "shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 border",
                activeCategory === ""
                  ? "bg-[oklch(0.78_0.14_82)]/15 text-[oklch(0.78_0.14_82)] border-[oklch(0.78_0.14_82/25%)]"
                  : "glass-subtle text-muted-foreground border-border/20 hover:text-foreground hover:border-border/40"
              )}
            >
              {t("projects.all")}
            </button>

            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryToggle(cat)}
                className={cn(
                  "shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 border",
                  activeCategory === cat
                    ? "bg-[oklch(0.78_0.14_82)]/15 text-[oklch(0.78_0.14_82)] border-[oklch(0.78_0.14_82/25%)]"
                    : "glass-subtle text-muted-foreground border-border/20 hover:text-foreground hover:border-border/40"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </motion.div>

        {/* ── Project Count ─────────────────────────────────────────────── */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-sm text-muted-foreground mb-8"
        >
          {filtered.length === 1
            ? t("projects.project_count_single").replace("{count}", "1")
            : t("projects.project_count").replace(
                "{count}",
                String(filtered.length)
              )}
        </motion.p>

        {/* ── Projects Grid or Empty State ──────────────────────────────── */}
        {filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="w-16 h-16 rounded-2xl glass flex items-center justify-center mx-auto mb-4">
              <FolderOpen className="h-8 w-8 text-muted-foreground/50" />
            </div>
            <p className="text-lg text-muted-foreground">
              {t("projects.no_results")}
            </p>
            <Button
              variant="outline"
              onClick={onRefresh}
              className="mt-4 rounded-xl border-border/30"
            >
              {t("projects.refresh")}
            </Button>
          </motion.div>
        ) : (
          <AnimatePresence mode="popLayout">
            <motion.div
              key={search + activeCategory}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filtered.map((p) => {
                const tr = getTranslation(p)
                const tags = getTags(p)
                return (
                  <motion.div key={p.id} variants={cardVariants} layout>
                    <button
                      onClick={() =>
                        navigate({ page: "project", slug: p.slug })
                      }
                      className={cn(
                        "group relative w-full rounded-2xl overflow-hidden",
                        "border border-border/30 bg-card/50",
                        "hover:border-[oklch(0.78_0.14_82/25%)] hover:shadow-xl hover:shadow-[oklch(0.78_0.14_82/5%)]",
                        "transition-all duration-500 text-start card-spotlight"
                      )}
                    >
                      {/* ── Image Area ──────────────────────────────────── */}
                      <div className="relative aspect-[4/3] overflow-hidden">
                        {p.imageUrl ? (
                          <img
                            src={p.imageUrl}
                            alt={tr.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-[oklch(0.78_0.14_82/20%)] via-[oklch(0.72_0.12_75/10%)] to-[oklch(0.78_0.14_82/5%)] flex items-center justify-center">
                            <span className="text-6xl font-bold gradient-text/20">
                              {tr.name[0]}
                            </span>
                          </div>
                        )}

                        {/* Dark overlay gradient at bottom of image */}
                        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

                        {/* Category badge — overlaid on image top-left */}
                        <div className="absolute top-3 start-3">
                          <Badge
                            variant="secondary"
                            className="glass text-xs font-medium"
                          >
                            {p.category}
                          </Badge>
                        </div>

                        {/* Featured star badge — overlaid on image top-right */}
                        {p.featured && (
                          <Badge className="absolute top-3 end-3 bg-amber-400/90 text-black border-0 text-xs font-medium">
                            <Star className="h-3 w-3 me-1" /> Featured
                          </Badge>
                        )}

                        {/* External link icon — appears on hover, bottom-right of image */}
                        <div className="absolute bottom-3 end-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="w-8 h-8 rounded-full glass flex items-center justify-center">
                            <ExternalLink className="h-4 w-4 text-white" />
                          </div>
                        </div>
                      </div>

                      {/* ── Content Area ─────────────────────────────────── */}
                      <div className="p-5 relative z-10">
                        <h3 className="font-semibold text-lg group-hover:text-[oklch(0.78_0.14_82)] transition-colors duration-300">
                          {tr.name}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1.5 line-clamp-2">
                          {tr.tagline}
                        </p>

                        {/* Tags */}
                        {tags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-3">
                            {tags.slice(0, 3).map((tag) => (
                              <Badge
                                key={tag}
                                variant="outline"
                                className="text-xs font-normal border-border/30"
                              >
                                {tag}
                              </Badge>
                            ))}
                            {tags.length > 3 && (
                              <Badge
                                variant="outline"
                                className="text-xs font-normal border-border/30"
                              >
                                +{tags.length - 3}
                              </Badge>
                            )}
                          </div>
                        )}

                        {/* Footer */}
                        <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/20">
                          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Eye className="h-3.5 w-3.5" />
                            {p.views.toLocaleString()}
                          </span>
                          <span className="text-xs text-[oklch(0.78_0.14_82)]/70 group-hover:text-[oklch(0.78_0.14_82)] transition-colors flex items-center gap-1">
                            {t("projects.view_details")}
                            <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                          </span>
                        </div>
                      </div>
                    </button>
                  </motion.div>
                )
              })}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}
