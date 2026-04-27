"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Eye,
  EyeOff,
  Star,
  LayoutList,
  LayoutGrid,
  FolderOpen,
  Globe,
  Shield,
  Sparkles,
  ImageIcon,
  FileStack,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useI18n } from "@/lib/i18n-context"
import { toast } from "sonner"
import { ProjectDialog } from "./project-dialog"

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Project {
  id: string
  slug: string
  imageUrl: string
  imageUrls?: string[]
  category: string
  featured: boolean
  published: boolean
  externalUrl: string
  tags: string
  views: number
  order: number
  translations: {
    id?: string
    locale: string
    name: string
    tagline: string
    description: string
  }[]
}

type ViewMode = "table" | "card"
const LOCAL_PROJECTS_CACHE_KEY = "ciar-admin-projects-local-cache"

// ─── Animation variants ──────────────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.04, duration: 0.35, ease: "easeOut" },
  }),
  exit: { opacity: 0, y: 8, transition: { duration: 0.2 } },
}

const cardHover = {
  rest: { scale: 1, y: 0 },
  hover: {
    scale: 1.02,
    y: -4,
    transition: { type: "spring", stiffness: 300, damping: 20 },
  },
}

// ─── Component ───────────────────────────────────────────────────────────────

export function ProjectsTab() {
  const { t } = useI18n()

  // State
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filterCategory, setFilterCategory] = useState("all")
  const [categories, setCategories] = useState<string[]>([])
  const [editProject, setEditProject] = useState<Project | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogKey, setDialogKey] = useState(0)
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>("table")
  const [togglingId, setTogglingId] = useState<string | null>(null)

  const cacheProjects = useCallback((nextProjects: Project[]) => {
    if (typeof window === "undefined") return
    try {
      localStorage.setItem(LOCAL_PROJECTS_CACHE_KEY, JSON.stringify(nextProjects))
    } catch {
      // ignore localStorage issues
    }
  }, [])

  // ── Fetch projects ──
  const fetchProjects = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/projects?locale=en")
      const data = await res.json()
      let nextProjects = data.projects || []

      // When API is in CIAR fallback mode, restore local admin edits from cache.
      if (
        typeof window !== "undefined" &&
        Array.isArray(nextProjects) &&
        nextProjects.length > 0 &&
        nextProjects.every((project: Project) => project.id.startsWith("ciar-"))
      ) {
        try {
          const cachedRaw = localStorage.getItem(LOCAL_PROJECTS_CACHE_KEY)
          const cachedProjects = cachedRaw ? JSON.parse(cachedRaw) : null
          if (Array.isArray(cachedProjects) && cachedProjects.length > 0) {
            nextProjects = cachedProjects
          }
        } catch {
          // ignore parse errors and keep API data
        }
      }

      setProjects(nextProjects)
      setCategories([...new Set(nextProjects.map((project: Project) => project.category).filter(Boolean))])
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  // ── Filtering ──
  const filteredProjects = useMemo(
    () =>
      projects.filter((p) => {
        if (filterCategory !== "all" && p.category !== filterCategory) return false
        if (search) {
          const q = search.toLowerCase()
          const name = p.translations[0]?.name?.toLowerCase() || ""
          const slug = p.slug.toLowerCase()
          if (!name.includes(q) && !slug.includes(q)) return false
        }
        return true
      }),
    [projects, filterCategory, search]
  )

  // ── Stats ──
  const stats = useMemo(
    () => ({
      total: projects.length,
      published: projects.filter((p) => p.published).length,
      drafts: projects.filter((p) => !p.published).length,
      featured: projects.filter((p) => p.featured).length,
    }),
    [projects]
  )

  // ── Toggle published ──
  const togglePublished = async (id: string) => {
    setTogglingId(id)
    try {
      const res = await fetch(`/api/projects/${id}/toggle-published`, { method: "POST" })
      if (!res.ok) throw new Error()
      const { published } = await res.json()
      setProjects((prev) => {
        const next = prev.map((p) => (p.id === id ? { ...p, published } : p))
        cacheProjects(next)
        return next
      })
      toast.success(
        published
          ? (t("admin.project_published") || "Project published")
          : (t("admin.project_unpublished") || "Project unpublished")
      )
    } catch {
      setProjects((prev) => {
        const target = prev.find((project) => project.id === id)
        if (!target || !target.id.startsWith("ciar-")) return prev
        const next = prev.map((project) =>
          project.id === id ? { ...project, published: !project.published } : project
        )
        cacheProjects(next)
        return next
      })
      toast.success(t("admin.project_updated") || "Project updated")
    } finally {
      setTogglingId(null)
    }
  }

  // ── Toggle featured ──
  const toggleFeatured = async (id: string) => {
    setTogglingId(id)
    try {
      const res = await fetch(`/api/projects/${id}/toggle-featured`, { method: "POST" })
      if (!res.ok) throw new Error()
      const { featured } = await res.json()
      setProjects((prev) => {
        const next = prev.map((p) => (p.id === id ? { ...p, featured } : p))
        cacheProjects(next)
        return next
      })
      toast.success(
        featured
          ? (t("admin.project_featured") || "Project featured")
          : (t("admin.project_unfeatured") || "Project unfeatured")
      )
    } catch {
      setProjects((prev) => {
        const target = prev.find((project) => project.id === id)
        if (!target || !target.id.startsWith("ciar-")) return prev
        const next = prev.map((project) =>
          project.id === id ? { ...project, featured: !project.featured } : project
        )
        cacheProjects(next)
        return next
      })
      toast.success(t("admin.project_updated") || "Project updated")
    } finally {
      setTogglingId(null)
    }
  }

  // ── CRUD handlers ──
  const handleSave = async (
    projectData: Record<string, unknown>,
    translations: Record<string, { name: string; tagline: string; description: string }>
  ) => {
    const fallbackTranslations = Object.entries(translations).map(([locale, tr]) => ({
      locale,
      name: tr.name,
      tagline: tr.tagline,
      description: tr.description,
    }))

    try {
      if (editProject) {
        const updateRes = await fetch(`/api/projects/${editProject.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(projectData),
        })
        if (!updateRes.ok) {
          // DB may be unavailable; keep admin UX usable for CIAR fallback rows.
          if (editProject.id.startsWith("ciar-")) {
            setProjects((prev) =>
              {
                const next = prev.map((project) =>
                project.id === editProject.id
                  ? {
                      ...project,
                      ...projectData,
                      translations: fallbackTranslations.length > 0 ? fallbackTranslations : project.translations,
                    }
                  : project
              )
                cacheProjects(next)
                return next
              }
            )
            setDialogOpen(false)
            setEditProject(null)
            toast.success(t("admin.project_updated") || "Project updated")
            return
          }

          let message = t("admin.project_save_failed") || "Failed to save project"
          try {
            const payload = await updateRes.json()
            if (typeof payload?.error === "string") {
              message = payload.error
            }
          } catch {
            // ignore parse errors and use fallback message
          }
          toast.error(message)
          return
        }

        for (const [loc, tr] of Object.entries(translations)) {
          const translationRes = await fetch(`/api/projects/${editProject.id}/translations`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ locale: loc, ...tr }),
          })
          if (!translationRes.ok) {
            if (editProject.id.startsWith("ciar-")) {
              setProjects((prev) =>
                {
                  const next = prev.map((project) =>
                  project.id === editProject.id
                    ? {
                        ...project,
                        translations: fallbackTranslations.length > 0 ? fallbackTranslations : project.translations,
                      }
                    : project
                )
                  cacheProjects(next)
                  return next
                }
              )
              setDialogOpen(false)
              setEditProject(null)
              toast.success(t("admin.project_updated") || "Project updated")
              return
            }

            let message = t("admin.project_save_failed") || "Failed to save project"
            try {
              const payload = await translationRes.json()
              if (typeof payload?.error === "string") {
                message = payload.error
              }
            } catch {
              // ignore parse errors and use fallback message
            }
            toast.error(message)
            return
          }
        }
        toast.success(t("admin.project_updated") || "Project updated")
      } else {
        // Send only meaningful translations; empty names fail API validation.
        const translationsArr = Object.entries(translations)
          .map(([locale, tr]) => ({
            locale,
            name: tr.name.trim(),
            tagline: tr.tagline.trim(),
            description: tr.description.trim(),
          }))
          .filter((tr) => tr.name.length > 0)
        const res = await fetch("/api/projects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...projectData, translations: translationsArr }),
        })
        if (res.ok) {
          toast.success(t("admin.project_created") || "Project created")
        } else {
          const fallbackSlug = String(projectData.slug || "").trim()
          if (fallbackSlug.startsWith("ciar-")) {
            const fallbackProject: Project = {
              id: fallbackSlug,
              slug: fallbackSlug,
              imageUrl: String(projectData.imageUrl || ""),
              imageUrls: Array.isArray(projectData.imageUrls)
                ? (projectData.imageUrls as string[])
                : (projectData.imageUrl ? [String(projectData.imageUrl)] : []),
              category: String(projectData.category || ""),
              featured: Boolean(projectData.featured),
              published: projectData.published !== false,
              externalUrl: String(projectData.externalUrl || ""),
              tags: String(projectData.tags || "[]"),
              views: 0,
              order: projects.length + 1,
              translations: fallbackTranslations,
            }
            setProjects((prev) => {
              const next = [fallbackProject, ...prev.filter((item) => item.id !== fallbackProject.id)]
              cacheProjects(next)
              return next
            })
            toast.success(t("admin.project_created") || "Project created")
            setDialogOpen(false)
            setEditProject(null)
            return
          }

          let message = t("admin.project_create_failed") || "Failed to create project"
          try {
            const payload = await res.json()
            if (typeof payload?.error === "string") {
              message = payload.error
            }
          } catch {
            // ignore parse errors and use fallback message
          }
          toast.error(message)
          return
        }
      }
      setDialogOpen(false)
      setEditProject(null)
      fetchProjects()
    } catch {
      toast.error(t("admin.project_save_failed") || "Failed to save project")
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      const res = await fetch(`/api/projects/${deleteTarget.id}`, { method: "DELETE" })
      if (!res.ok) {
        if (deleteTarget.id.startsWith("ciar-")) {
          setProjects((prev) => {
            const next = prev.filter((project) => project.id !== deleteTarget.id)
            cacheProjects(next)
            return next
          })
          setDeleteTarget(null)
          toast.success(t("admin.project_deleted") || "Project deleted")
          return
        }

        let message = t("admin.project_delete_failed") || "Failed to delete project"
        try {
          const payload = await res.json()
          if (typeof payload?.error === "string") {
            message = payload.error
          }
        } catch {
          // ignore parse errors and use fallback message
        }
        toast.error(message)
        return
      }
      toast.success(t("admin.project_deleted") || "Project deleted")
      setDeleteTarget(null)
      fetchProjects()
    } catch {
      toast.error(t("admin.project_delete_failed") || "Failed to delete project")
    }
  }

  const openCreate = () => {
    setEditProject(null)
    setDialogKey((k) => k + 1)
    setDialogOpen(true)
  }

  const openEdit = (project: Project) => {
    setEditProject(project)
    setDialogKey((k) => k + 1)
    setDialogOpen(true)
  }

  // ─── Sub-components ──────────────────────────────────────────────────────

  /** Inline thumbnail with gradient fallback */
  const Thumbnail = ({ src, name }: { src: string; name: string }) => (
    <div className="relative h-9 w-9 rounded-lg overflow-hidden flex-shrink-0 shadow-sm ring-1 ring-white/10">
      {src ? (
        <img
          src={src}
          alt={name}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      ) : (
        <div className="h-full w-full bg-gradient-to-br from-[oklch(0.55_0.12_82)] to-[oklch(0.40_0.10_260)] flex items-center justify-center">
          <ImageIcon className="h-3.5 w-3.5 text-white/70" />
        </div>
      )}
    </div>
  )

  /** Stats pill / badge */
  const StatPill = ({
    icon: Icon,
    label,
    value,
    color,
  }: {
    icon: React.ElementType
    label: string
    value: number
    color: string
  }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm px-3 py-1.5 text-xs"
    >
      <Icon className={`h-3.5 w-3.5 ${color}`} />
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold text-foreground">{value}</span>
    </motion.div>
  )

  // ─── Render: Card View ─────────────────────────────────────────────────

  const renderCards = () => (
    <motion.div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
      initial="hidden"
      animate="visible"
    >
      <AnimatePresence mode="popLayout">
        {filteredProjects.map((p, i) => {
          const tr = p.translations[0]
          return (
            <motion.div
              key={p.id}
              custom={i}
              variants={{
                hidden: fadeUp.hidden,
                visible: (idx: number) => fadeUp.visible(idx),
                exit: fadeUp.exit,
                rest: cardHover.rest,
                hover: cardHover.hover,
              }}
              initial="hidden"
              animate="visible"
              exit="exit"
              layout
              whileHover="hover"
              className="group relative rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl overflow-hidden cursor-default"
            >
              {/* Image area */}
              <div className="relative aspect-[4/3] overflow-hidden">
                {p.imageUrl ? (
                  <img
                    src={p.imageUrl}
                    alt={tr?.name || p.slug}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-[oklch(0.45_0.10_82)] to-[oklch(0.25_0.08_260)] flex items-center justify-center">
                    <ImageIcon className="h-10 w-10 text-white/30" />
                  </div>
                )}
                {/* Gradient overlay at bottom */}
                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/60 to-transparent" />

                {/* Top-right badges */}
                <div className="absolute top-2.5 end-2.5 flex items-center gap-1.5">
                  {p.featured && (
                    <Badge className="bg-[oklch(0.78_0.14_82)] text-black border-0 text-[10px] gap-1 px-2 py-0.5 font-semibold">
                      <Star className="h-3 w-3" />
                      Featured
                    </Badge>
                  )}
                  <Badge
                    className={`text-[10px] gap-1 px-2 py-0.5 border-0 font-medium ${
                      p.published
                        ? "bg-emerald-500/90 text-white"
                        : "bg-white/20 text-white backdrop-blur-sm"
                    }`}
                  >
                    {p.published ? (
                      <Eye className="h-3 w-3" />
                    ) : (
                      <EyeOff className="h-3 w-3" />
                    )}
                    {p.published
                      ? (t("admin.project_published") || "Published")
                      : (t("admin.project_draft") || "Draft")}
                  </Badge>
                </div>

                {/* Hover actions overlay */}
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
                  <Button
                    size="icon"
                    variant="secondary"
                    onClick={(e) => { e.stopPropagation(); openEdit(p) }}
                    className="h-9 w-9 rounded-full bg-white/20 text-white hover:bg-white/30 border-0 backdrop-blur-sm"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="secondary"
                    onClick={(e) => { e.stopPropagation(); setDeleteTarget(p) }}
                    className="h-9 w-9 rounded-full bg-red-500/30 text-red-200 hover:bg-red-500/50 border-0 backdrop-blur-sm"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                {/* View count */}
                <div className="absolute bottom-2.5 start-2.5 flex items-center gap-1 text-[11px] text-white/80">
                  <Eye className="h-3 w-3" />
                  {p.views.toLocaleString()}
                </div>
              </div>

              {/* Card body */}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-sm leading-tight line-clamp-1 text-foreground">
                    {tr?.name || p.slug}
                  </h3>
                </div>
                <Badge
                  variant="outline"
                  className="text-[10px] border-[oklch(0.78_0.14_82)]/30 text-[oklch(0.78_0.14_82)] bg-[oklch(0.78_0.14_82)]/5"
                >
                  {p.category}
                </Badge>
              </div>
            </motion.div>
          )
        })}
      </AnimatePresence>

      {filteredProjects.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="col-span-full flex flex-col items-center justify-center py-16 text-muted-foreground"
        >
          <FolderOpen className="h-16 w-16 mb-4 opacity-20" />
          <p className="text-sm font-medium">
            {projects.length === 0
              ? (t("admin.no_projects") || "No projects yet")
              : (t("admin.no_matching_projects") || "No matching projects")}
          </p>
        </motion.div>
      )}
    </motion.div>
  )

  // ─── Render: Table View ────────────────────────────────────────────────

  const renderTable = () => (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-b border-white/10">
              <TableHead className="text-xs text-muted-foreground">
                {t("admin.project_name") || "Name"}
              </TableHead>
              <TableHead className="text-xs text-muted-foreground">
                {t("admin.project_category") || "Category"}
              </TableHead>
              <TableHead className="text-center text-xs text-muted-foreground">
                {t("admin.project_featured") || "Featured"}
              </TableHead>
              <TableHead className="text-center text-xs text-muted-foreground">
                {t("admin.project_published") || "Published"}
              </TableHead>
              <TableHead className="text-end text-xs text-muted-foreground">
                {t("admin.project_views") || "Views"}
              </TableHead>
              <TableHead className="text-end text-xs text-muted-foreground">
                {t("admin.actions") || "Actions"}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProjects.map((p, i) => {
              const tr = p.translations[0]
              const isToggling = togglingId === p.id
              return (
                <motion.tr
                  key={p.id}
                  custom={i}
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  layout
                  className="group border-b border-white/5 transition-colors hover:bg-white/[0.04] [&>td]:py-3"
                >
                  {/* Thumbnail + Name */}
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Thumbnail src={p.imageUrl} name={tr?.name || p.slug} />
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate max-w-[180px]">
                          {tr?.name || p.slug}
                        </p>
                        <p className="text-[11px] text-muted-foreground font-mono truncate max-w-[180px]">
                          {p.slug}
                        </p>
                      </div>
                    </div>
                  </TableCell>

                  {/* Category */}
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="text-[10px] border-[oklch(0.78_0.14_82)]/30 text-[oklch(0.78_0.14_82)] bg-[oklch(0.78_0.14_82)]/5"
                    >
                      {p.category}
                    </Badge>
                  </TableCell>

                  {/* Featured toggle */}
                  <TableCell className="text-center">
                    <TooltipProvider delayDuration={300}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            disabled={isToggling}
                            onClick={() => toggleFeatured(p.id)}
                            className="inline-flex items-center justify-center transition-transform hover:scale-125 disabled:opacity-50"
                          >
                            <Star
                              className={`h-4.5 w-4.5 transition-colors ${
                                p.featured
                                  ? "fill-[oklch(0.78_0.14_82)] text-[oklch(0.78_0.14_82)]"
                                  : "text-muted-foreground/40 hover:text-muted-foreground"
                              }`}
                            />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="text-xs">
                          {p.featured ? "Unfeature" : "Set as featured"}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>

                  {/* Published toggle */}
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center">
                      <Switch
                        checked={p.published}
                        disabled={isToggling}
                        onCheckedChange={() => togglePublished(p.id)}
                        className="data-[state=checked]:bg-emerald-500"
                      />
                    </div>
                  </TableCell>

                  {/* Views */}
                  <TableCell className="text-end">
                    <div className="flex items-center justify-end gap-1.5 text-muted-foreground text-sm">
                      <Eye className="h-3.5 w-3.5 opacity-50" />
                      {p.views.toLocaleString()}
                    </div>
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="text-end">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => openEdit(p)}
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setDeleteTarget(p)}
                        className="h-8 w-8 text-destructive/70 hover:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </motion.tr>
              )
            })}

            {filteredProjects.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-48"
                >
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <FolderOpen className="h-16 w-16 mb-4 opacity-20" />
                    <p className="text-sm font-medium">
                      {projects.length === 0
                        ? (t("admin.no_projects") || "No projects yet")
                        : (t("admin.no_matching_projects") || "No matching projects")}
                    </p>
                    {projects.length === 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={openCreate}
                        className="mt-4 rounded-full gap-2 border-[oklch(0.78_0.14_82)]/30 text-[oklch(0.78_0.14_82)] hover:bg-[oklch(0.78_0.14_82)]/10"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        {t("admin.add_project") || "Add Project"}
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )

  // ─── Render: Main ──────────────────────────────────────────────────────

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-[oklch(0.88_0.14_82)] via-[oklch(0.78_0.14_82)] to-[oklch(0.65_0.16_82)] bg-clip-text text-transparent">
                  {t("admin.projects") || "Projects"}
                </h2>
                <Badge
                  variant="secondary"
                  className="bg-[oklch(0.78_0.14_82)]/10 text-[oklch(0.78_0.14_82)] border-[oklch(0.78_0.14_82)]/20 text-xs font-semibold tabular-nums"
                >
                  {stats.total}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {t("admin.projects_description") || "Manage your platforms and services"}
              </p>
            </div>
            <Button
              onClick={openCreate}
              className="gap-2 rounded-full bg-gradient-to-r from-[oklch(0.75_0.14_82)] to-[oklch(0.65_0.16_82)] text-black font-semibold hover:shadow-lg hover:shadow-[oklch(0.78_0.14_82)]/20 transition-shadow"
            >
              <Plus className="h-4 w-4" />
              {t("admin.add_project") || "Add Project"}
            </Button>
          </div>

          {/* Gold glow divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-[oklch(0.78_0.14_82)]/40 to-transparent" />
        </motion.div>

        {/* ── Stats Summary Row ── */}
        {!loading && projects.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-wrap items-center gap-2"
          >
            <StatPill
              icon={FileStack}
              label={t("admin.total") || "Total"}
              value={stats.total}
              color="text-foreground"
            />
            <StatPill
              icon={Globe}
              label={t("admin.project_published") || "Published"}
              value={stats.published}
              color="text-emerald-400"
            />
            <StatPill
              icon={EyeOff}
              label={t("admin.project_draft") || "Drafts"}
              value={stats.drafts}
              color="text-amber-400"
            />
            <StatPill
              icon={Star}
              label={t("admin.project_featured") || "Featured"}
              value={stats.featured}
              color="text-[oklch(0.78_0.14_82)]"
            />
          </motion.div>
        )}

        {/* ── Search, Filter & View Toggle ── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="relative flex-1 w-full sm:max-w-sm">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("common.search") || "Search projects..."}
              className="ps-9 rounded-xl bg-white/[0.04] border-white/10 backdrop-blur-sm focus-visible:border-[oklch(0.78_0.14_82)]/50 focus-visible:ring-[oklch(0.78_0.14_82)]/20"
            />
          </div>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-48 rounded-xl bg-white/[0.04] border-white/10 backdrop-blur-sm">
              <SelectValue placeholder={t("admin.all_categories") || "All Categories"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                {t("admin.all_categories") || "All Categories"}
              </SelectItem>
              {categories
                .filter((cat) => cat.trim().length > 0)
                .map((cat, idx) => (
                  <SelectItem key={`cat-${cat}-${idx}`} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>

          {/* View Toggle */}
          <div className="flex items-center rounded-xl border border-white/10 bg-white/[0.04] backdrop-blur-sm p-0.5">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setViewMode("table")}
                  className={`h-8 w-8 rounded-lg transition-colors ${
                    viewMode === "table"
                      ? "bg-[oklch(0.78_0.14_82)]/15 text-[oklch(0.78_0.14_82)]"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <LayoutList className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">
                {t("admin.table_view") || "Table View"}
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setViewMode("card")}
                  className={`h-8 w-8 rounded-lg transition-colors ${
                    viewMode === "card"
                      ? "bg-[oklch(0.78_0.14_82)]/15 text-[oklch(0.78_0.14_82)]"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">
                {t("admin.card_view") || "Card View"}
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* ── Content: Loading / Table / Cards ── */}
        {loading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={viewMode === "card" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" : ""}
          >
            {viewMode === "card"
              ? Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="rounded-2xl border border-white/10 bg-white/[0.04] overflow-hidden">
                    <Skeleton className="aspect-[4/3] rounded-none" />
                    <div className="p-4 space-y-2">
                      <Skeleton className="h-4 w-3/4 rounded" />
                      <Skeleton className="h-5 w-20 rounded-full" />
                    </div>
                  </div>
                ))
              : Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 rounded-none last:rounded-b-2xl" />
                ))}
          </motion.div>
        ) : viewMode === "card" ? (
          renderCards()
        ) : (
          renderTable()
        )}

        {/* ── Create/Edit Dialog ── */}
        <ProjectDialog
          key={dialogKey}
          project={editProject}
          open={dialogOpen}
          onClose={() => {
            setDialogOpen(false)
            setEditProject(null)
          }}
          onSave={handleSave}
        />

        {/* ── Delete Confirmation ── */}
        <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
          <AlertDialogContent className="rounded-2xl border-white/10 bg-white/[0.04] backdrop-blur-xl">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <Trash2 className="h-5 w-5 text-destructive" />
                {t("admin.delete_project") || "Delete Project"}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {t("admin.delete_project_confirm", {
                  name: deleteTarget?.translations[0]?.name || deleteTarget?.slug || "",
                }) ||
                  `Are you sure you want to delete "${deleteTarget?.translations[0]?.name || deleteTarget?.slug}"? This action cannot be undone.`}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t("common.cancel") || "Cancel"}</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl"
              >
                {t("common.delete") || "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  )
}
