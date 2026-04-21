"use client"

import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import { Search, ExternalLink, Eye, Star, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useI18n } from "@/lib/i18n-context"
import { useRouter } from "@/lib/router-context"

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

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.4 },
  }),
}

export function ProjectsPage({ projects, categories, onRefresh }: ProjectsPageProps) {
  const { t } = useI18n()
  const { navigate } = useRouter()
  const [search, setSearch] = useState("")
  const [activeCategory, setActiveCategory] = useState("")

  const featured = useMemo(
    () => projects.filter((p) => p.featured),
    [projects]
  )

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

  const getTranslation = (p: Project) => p.translations[0] || { name: p.slug, tagline: "", description: "" }

  const getTags = (p: Project) => {
    try { return JSON.parse(p.tags) as string[] } catch { return [] }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24">
      {/* Section header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <Badge variant="secondary" className="px-4 py-1.5 text-sm mb-4 border border-border/50">
          <Sparkles className="h-3.5 w-3.5 me-1.5" />
          {t("projects.featured")}
        </Badge>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
          {t("projects.title")}
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          {t("projects.subtitle")}
        </p>
      </motion.div>

      {/* Featured projects row */}
      {featured.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-16"
        >
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Star className="h-5 w-5 text-amber-400" />
            {t("projects.featured_title")}
          </h2>
          <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-none">
            {featured.map((p) => {
              const tr = getTranslation(p)
              return (
                <motion.button
                  key={p.id}
                  onClick={() => navigate({ page: "project", slug: p.slug })}
                  className="snap-start shrink-0 w-72 sm:w-80 rounded-2xl border border-border/50 bg-card hover:border-border hover:shadow-lg transition-all group overflow-hidden text-start"
                  whileHover={{ y: -2 }}
                >
                  <div className="h-40 bg-gradient-to-br from-emerald-500/20 to-teal-500/10 flex items-center justify-center">
                    {p.imageUrl ? (
                      <img
                        src={p.imageUrl}
                        alt={tr.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-4xl font-bold gradient-text">{tr.name[0]}</span>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold group-hover:text-emerald-400 transition-colors">
                      {tr.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {tr.tagline}
                    </p>
                  </div>
                </motion.button>
              )
            })}
          </div>
        </motion.div>
      )}

      {/* Search & filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8"
      >
        <div className="relative flex-1 w-full sm:max-w-sm">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("projects.search_placeholder")}
            className="ps-9 rounded-xl border-border/50"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant={activeCategory === "" ? "secondary" : "ghost"}
            onClick={() => setActiveCategory("")}
            className="rounded-full text-xs"
          >
            {t("projects.all")}
          </Button>
          {categories.map((cat) => (
            <Button
              key={cat}
              size="sm"
              variant={activeCategory === cat ? "secondary" : "ghost"}
              onClick={() => setActiveCategory(activeCategory === cat ? "" : cat)}
              className="rounded-full text-xs"
            >
              {cat}
            </Button>
          ))}
        </div>
      </motion.div>

      {/* Project count */}
      <p className="text-sm text-muted-foreground mb-6">
        {filtered.length} {filtered.length === 1 ? "project" : "projects"}
      </p>

      {/* Projects grid */}
      {filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20"
        >
          <p className="text-lg text-muted-foreground">{t("projects.no_results")}</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((p, i) => {
            const tr = getTranslation(p)
            const tags = getTags(p)
            return (
              <motion.div
                key={p.id}
                custom={i}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
              >
                <button
                  onClick={() => navigate({ page: "project", slug: p.slug })}
                  className="w-full rounded-2xl border border-border/50 bg-card hover:border-border hover:shadow-lg transition-all group overflow-hidden text-start"
                >
                  {/* Image */}
                  <div className="h-44 bg-gradient-to-br from-emerald-500/10 to-teal-500/5 flex items-center justify-center relative overflow-hidden">
                    {p.imageUrl ? (
                      <img
                        src={p.imageUrl}
                        alt={tr.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <span className="text-5xl font-bold gradient-text opacity-60">
                        {tr.name[0]}
                      </span>
                    )}
                    {/* Badges overlay */}
                    <div className="absolute top-3 start-3 flex gap-1.5">
                      <Badge variant="secondary" className="text-xs bg-background/80 backdrop-blur-sm">
                        {p.category}
                      </Badge>
                      {p.featured && (
                        <Badge className="text-xs bg-amber-500/90 text-white border-0">
                          <Star className="h-3 w-3 me-1" />
                          {t("projects.featured")}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <h3 className="font-semibold text-lg group-hover:text-emerald-400 transition-colors">
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
                            className="text-xs font-normal border-border/50"
                          >
                            {tag}
                          </Badge>
                        ))}
                        {tags.length > 3 && (
                          <Badge
                            variant="outline"
                            className="text-xs font-normal border-border/50"
                          >
                            +{tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/50">
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Eye className="h-3.5 w-3.5" />
                        {p.views.toLocaleString()} {t("projects.views")}
                      </span>
                      {p.externalUrl && (
                        <span
                          onClick={(e) => e.stopPropagation()}
                          className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                        >
                          {t("projects.visit")}
                          <ExternalLink className="h-3 w-3" />
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
