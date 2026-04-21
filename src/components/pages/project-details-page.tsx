"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, ExternalLink, Eye, Calendar, Star, Tag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useI18n } from "@/lib/i18n-context"
import { useRouter } from "@/lib/router-context"
import type { Project } from "./projects-page"

export function ProjectDetailsPage({ slug }: { slug: string }) {
  const { t, locale } = useI18n()
  const { navigate, back } = useRouter()
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProject() {
      try {
        const res = await fetch(`/api/projects?locale=${locale}`)
        const data = await res.json()
        const found = data.projects.find(
          (p: Project) => p.slug === slug
        )
        setProject(found || null)
      } catch {
        setProject(null)
      } finally {
        setLoading(false)
      }
    }
    fetchProject()
  }, [slug, locale])

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-24">
        <Skeleton className="h-8 w-32 mb-8" />
        <Skeleton className="h-64 w-full rounded-2xl mb-8" />
        <Skeleton className="h-10 w-64 mb-4" />
        <Skeleton className="h-5 w-96 mb-2" />
        <Skeleton className="h-4 w-full mb-1" />
        <Skeleton className="h-4 w-full mb-1" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    )
  }

  if (!project) {
    return (
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-24 text-center">
        <p className="text-lg text-muted-foreground">{t("projects.no_results")}</p>
        <Button
          variant="outline"
          onClick={() => navigate({ page: "projects" })}
          className="mt-4"
        >
          {t("common.back")}
        </Button>
      </div>
    )
  }

  const tr = project.translations[0] || { name: project.slug, tagline: "", description: "" }

  let tags: string[] = []
  try {
    tags = JSON.parse(project.tags)
  } catch {
    // ignore
  }

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString(locale === "ar" ? "ar-SA" : locale === "fr" ? "fr-FR" : locale === "es" ? "es-ES" : locale === "de" ? "de-DE" : "en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    } catch {
      return dateStr
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-24">
      {/* Back button */}
      <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
        <Button
          variant="ghost"
          onClick={() => navigate({ page: "projects" })}
          className="gap-2 text-muted-foreground hover:text-foreground mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("project.back")}
        </Button>
      </motion.div>

      {/* Hero image */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative rounded-2xl overflow-hidden mb-8 border border-border/50"
      >
        <div className="aspect-video bg-gradient-to-br from-emerald-500/20 to-teal-500/10 flex items-center justify-center">
          {project.imageUrl ? (
            <img
              src={project.imageUrl}
              alt={tr.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-8xl font-bold gradient-text opacity-40">
              {tr.name[0]}
            </span>
          )}
        </div>
      </motion.div>

      {/* Title and badges */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-6"
      >
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <Badge variant="secondary" className="border border-border/50">
            {project.category}
          </Badge>
          {project.featured && (
            <Badge className="bg-amber-500/90 text-white border-0">
              <Star className="h-3 w-3 me-1" />
              {t("project.featured")}
            </Badge>
          )}
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">{tr.name}</h1>
        {tr.tagline && (
          <p className="mt-2 text-lg text-muted-foreground">{tr.tagline}</p>
        )}
      </motion.div>

      {/* Description */}
      {tr.description && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
            {tr.description}
          </p>
        </motion.div>
      )}

      {/* Technologies */}
      {tags.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="mb-8"
        >
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
            <Tag className="h-4 w-4" />
            {t("project.technologies")}
          </h2>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="px-3 py-1 border-border/50 hover:border-emerald-500/50 hover:text-emerald-400 transition-colors"
              >
                {tag}
              </Badge>
            ))}
          </div>
        </motion.div>
      )}

      {/* Meta info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex flex-wrap items-center gap-6 mb-8 text-sm text-muted-foreground"
      >
        <span className="flex items-center gap-1.5">
          <Eye className="h-4 w-4" />
          {project.views.toLocaleString()} {t("projects.views")}
        </span>
        {project.createdAt && (
          <span className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            {formatDate(project.createdAt)}
          </span>
        )}
      </motion.div>

      {/* Visit button */}
      {project.externalUrl && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
        >
          <Button
            size="lg"
            asChild
            className="gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl px-8"
          >
            <a href={project.externalUrl} target="_blank" rel="noopener noreferrer">
              {t("project.visit_website")}
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        </motion.div>
      )}
    </div>
  )
}
