"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, ExternalLink, Eye, Calendar, Star, BookOpen, Cpu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useI18n } from "@/lib/i18n-context"
import { useRouter } from "@/lib/router-context"
import { cn } from "@/lib/utils"
import type { Project } from "./projects-page"

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const },
  }),
} as const

export function ProjectDetailsPage({ slug }: { slug: string }) {
  const { t, locale } = useI18n()
  const { navigate } = useRouter()
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProject() {
      try {
        const res = await fetch(`/api/projects?locale=${locale}`)
        const data = await res.json()
        const found = data.projects.find((p: Project) => p.slug === slug)
        setProject(found || null)
      } catch {
        setProject(null)
      } finally {
        setLoading(false)
      }
    }
    fetchProject()
  }, [slug, locale])

  // ── Loading skeleton ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-24">
        <Skeleton className="h-8 w-32 mb-8 rounded-lg" />
        <Skeleton className="h-64 w-full rounded-2xl mb-8" />
        <Skeleton className="h-10 w-64 mb-4 rounded-lg" />
        <Skeleton className="h-5 w-96 mb-2" />
        <Skeleton className="h-4 w-full mb-1" />
        <Skeleton className="h-4 w-full mb-1" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    )
  }

  // ── Not found state ───────────────────────────────────────────────────────
  if (!project) {
    return (
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-24 text-center">
        <p className="text-lg text-muted-foreground">{t("projects.no_results")}</p>
        <Button
          variant="outline"
          onClick={() => navigate({ page: "projects" })}
          className="mt-4 rounded-xl border-border/30"
        >
          {t("common.back")}
        </Button>
      </div>
    )
  }

  // ── Derived data ──────────────────────────────────────────────────────────
  const tr =
    project.translations[0] || {
      name: project.slug,
      tagline: "",
      description: "",
    }

  let tags: string[] = []
  try {
    tags = JSON.parse(project.tags)
  } catch {
    // ignore parse errors
  }

  const formatDate = (dateStr: string) => {
    try {
      const localeMap: Record<string, string> = {
        ar: "ar-SA",
        fr: "fr-FR",
        es: "es-ES",
        de: "de-DE",
      }
      return new Date(dateStr).toLocaleDateString(
        localeMap[locale] || "en-US",
        { year: "numeric", month: "long", day: "numeric" }
      )
    } catch {
      return dateStr
    }
  }

  // ── Page render ───────────────────────────────────────────────────────────
  return (
    <div className="relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 dot-pattern opacity-20 pointer-events-none" aria-hidden="true" />

      {/* ── Full-width Hero Banner ──────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative h-[50vh] sm:h-[60vh] overflow-hidden"
      >
        {project.imageUrl ? (
          <img
            src={project.imageUrl}
            alt={tr.name}
            className="w-full h-full object-cover transition-transform duration-[20s] ease-linear scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[oklch(0.78_0.14_82/20%)] via-[oklch(0.72_0.12_75/10%)] to-[oklch(0.78_0.14_82/5%)] flex items-center justify-center">
            <span className="text-9xl font-bold gradient-text/20">
              {tr.name[0]}
            </span>
          </div>
        )}

        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/30" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 to-transparent h-1/3" />

        {/* Navigation dots decoration */}
        <div className="absolute top-6 start-6 z-10">
          <Button
            variant="ghost"
            onClick={() => navigate({ page: "projects" })}
            className={cn(
              "gap-2 text-white/70 hover:text-white rounded-xl",
              "bg-black/20 backdrop-blur-sm border border-white/10",
              "transition-all duration-200"
            )}
          >
            <ArrowLeft className="h-4 w-4" />
            {t("project.back")}
          </Button>
        </div>

        {/* Floating badges over bottom */}
        <div className="absolute bottom-6 start-6 sm:bottom-10 sm:start-10 z-10">
          <div className="flex gap-2">
            <Badge variant="secondary" className="glass text-xs font-medium border border-white/10 bg-black/20 text-white backdrop-blur-sm">
              {project.category}
            </Badge>
            {project.featured && (
              <Badge className="bg-[oklch(0.78_0.14_82)] text-[oklch(0.12_0.03_265)] border-0 text-xs font-semibold">
                <Star className="h-3 w-3 me-1" />
                {t("project.featured")}
              </Badge>
            )}
          </div>
        </div>
      </motion.div>

      {/* ── Content Section ──────────────────────────────────────────────── */}
      <div className="relative -mt-20 z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 pb-24">
        <div
          className="absolute -top-20 -start-20 w-72 h-72 rounded-full bg-[oklch(0.78_0.14_82/10%)] blur-[100px] pointer-events-none"
          aria-hidden="true"
        />
        <div
          className="absolute top-1/3 -end-32 w-80 h-80 rounded-full bg-violet-500/8 blur-[120px] pointer-events-none"
          aria-hidden="true"
        />
        <div
          className="absolute bottom-0 start-1/4 w-64 h-64 rounded-full bg-[oklch(0.72_0.12_75/6%)] blur-[100px] pointer-events-none"
          aria-hidden="true"
        />

        <div className="relative z-10">
        {/* ── Title + Tagline ─────────────────────────────────────────── */}
        <motion.div
          initial="hidden"
          animate="visible"
          custom={0}
          variants={fadeUp}
          className="mb-4"
        >
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            {tr.name}
          </h1>
          {tr.tagline && (
            <p className="mt-3 text-lg sm:text-xl text-muted-foreground">
              {tr.tagline}
            </p>
          )}
        </motion.div>

        {/* ── Section Divider ─────────────────────────────────────────── */}
        <div className="section-divider my-8" />

        {/* ── About Section ───────────────────────────────────────────── */}
        <motion.section
          initial="hidden"
          animate="visible"
          custom={1}
          variants={fadeUp}
          className="mb-2"
        >
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-[oklch(0.78_0.14_82)]" />
            {t("project.about")}
          </h2>
          {tr.description ? (
            <p className="text-muted-foreground leading-relaxed max-w-3xl whitespace-pre-line text-base">
              {tr.description}
            </p>
          ) : (
            <p className="text-muted-foreground/60 italic">{t("project.no_description")}</p>
          )}
        </motion.section>

        {/* ── Section Divider ─────────────────────────────────────────── */}
        {tags.length > 0 && <div className="section-divider my-8" />}

        {/* ── Technologies Section ────────────────────────────────────── */}
        {tags.length > 0 && (
          <motion.section
            initial="hidden"
            animate="visible"
            custom={2}
            variants={fadeUp}
            className="mb-2"
          >
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
              <Cpu className="h-4 w-4 text-[oklch(0.78_0.14_82)]" />
              {t("project.technologies")}
            </h2>
            <div className="glass-subtle rounded-2xl border border-border/20 p-5">
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className={cn(
                      "px-3 py-1.5 border-border/30 text-sm font-normal",
                      "hover:border-[oklch(0.78_0.14_82/40%)] hover:text-[oklch(0.78_0.14_82)]",
                      "transition-all duration-300 cursor-default"
                    )}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </motion.section>
        )}

        {/* ── Section Divider ─────────────────────────────────────────── */}
        <div className="section-divider my-8" />

        {/* ── Stats: Views + Date ─────────────────────────────────────── */}
        <motion.div
          initial="hidden"
          animate="visible"
          custom={3}
          variants={fadeUp}
          className="flex flex-wrap items-center gap-6 mb-10 text-sm text-muted-foreground"
        >
          <span className="flex items-center gap-2 glass-subtle px-3 py-1.5 rounded-full border border-border/20">
            <Eye className="h-4 w-4" />
            {project.views.toLocaleString()} {t("projects.views")}
          </span>
          {project.createdAt && (
            <span className="flex items-center gap-2 glass-subtle px-3 py-1.5 rounded-full border border-border/20">
              <Calendar className="h-4 w-4" />
              {formatDate(project.createdAt)}
            </span>
          )}
        </motion.div>

        {/* ── Visit Website CTA ───────────────────────────────────────── */}
        {project.externalUrl && (
          <motion.div
            initial="hidden"
            animate="visible"
            custom={4}
            variants={fadeUp}
          >
            <Button
              size="lg"
              asChild
              className={cn(
                "gap-2 rounded-xl px-8 py-3 text-base font-medium",
                "bg-gradient-to-r from-[oklch(0.78_0.14_82)] via-[oklch(0.72_0.12_75)] to-[oklch(0.78_0.14_82)]",
                "hover:from-[oklch(0.72_0.13_75)] hover:via-[oklch(0.65_0.12_75)] hover:to-[oklch(0.72_0.13_75)]",
                "text-white shadow-lg shadow-[oklch(0.78_0.14_82/25%)]",
                "btn-glow",
                "transition-all duration-300"
              )}
            >
              <a href={project.externalUrl} target="_blank" rel="noopener noreferrer">
                {t("project.visit_website")}
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          </motion.div>
        )}
        </div>
        </div>
    </div>
  )
}
