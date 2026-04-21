"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Eye,
  EyeOff,
  Star,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
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
import { useI18n } from "@/lib/i18n-context"
import { toast } from "sonner"
import { ProjectDialog } from "./project-dialog"

export interface Project {
  id: string
  slug: string
  imageUrl: string
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

export function ProjectsTab() {
  const { t } = useI18n()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filterCategory, setFilterCategory] = useState("all")
  const [categories, setCategories] = useState<string[]>([])
  const [editProject, setEditProject] = useState<Project | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogKey, setDialogKey] = useState(0)
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null)

  const fetchProjects = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/projects?locale=en")
      const data = await res.json()
      setProjects(data.projects || [])
      setCategories(data.categories || [])
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  const filteredProjects = projects.filter((p) => {
    if (filterCategory !== "all" && p.category !== filterCategory) return false
    if (search) {
      const q = search.toLowerCase()
      const name = p.translations[0]?.name?.toLowerCase() || ""
      const slug = p.slug.toLowerCase()
      if (!name.includes(q) && !slug.includes(q)) return false
    }
    return true
  })

  const handleSave = async (
    projectData: Record<string, unknown>,
    translations: Record<string, { name: string; tagline: string; description: string }>
  ) => {
    try {
      if (editProject) {
        // Update project
        await fetch(`/api/projects/${editProject.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(projectData),
        })
        // Update translations
        for (const [loc, tr] of Object.entries(translations)) {
          await fetch(`/api/projects/${editProject.id}/translations`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ locale: loc, ...tr }),
          })
        }
        toast.success(t("admin.project_updated") || "Project updated")
      } else {
        // Create project
        const translationsArr = Object.entries(translations).map(
          ([locale, tr]) => ({
            locale,
            ...tr,
          })
        )
        const res = await fetch("/api/projects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...projectData, translations: translationsArr }),
        })
        if (res.ok)
          toast.success(t("admin.project_created") || "Project created")
        else toast.error(t("admin.project_create_failed") || "Failed to create project")
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
      await fetch(`/api/projects/${deleteTarget.id}`, { method: "DELETE" })
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

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h2 className="text-2xl font-bold">{t("admin.projects")}</h2>
        <Button
          onClick={openCreate}
          className="gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white"
        >
          <Plus className="h-4 w-4" />
          {t("admin.add_project")}
        </Button>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4">
        <div className="relative flex-1 w-full sm:max-w-sm">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("common.search") || "Search projects..."}
            className="ps-9 rounded-xl"
          />
        </div>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-48 rounded-xl">
            <SelectValue placeholder={t("admin.all_categories") || "All Categories"} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              {t("admin.all_categories") || "All Categories"}
            </SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {loading ? (
        <Skeleton className="h-96 rounded-xl" />
      ) : (
        <div className="rounded-xl border border-border/50 overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>{t("admin.project_name") || "Name"}</TableHead>
                  <TableHead>{t("admin.project_category") || "Category"}</TableHead>
                  <TableHead className="text-center">
                    {t("admin.project_featured") || "Featured"}
                  </TableHead>
                  <TableHead className="text-center">
                    {t("admin.project_published") || "Published"}
                  </TableHead>
                  <TableHead className="text-end">
                    {t("admin.project_views") || "Views"}
                  </TableHead>
                  <TableHead className="text-end">
                    {t("admin.actions") || "Actions"}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProjects.map((p) => {
                  const tr = p.translations[0]
                  return (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">
                        {tr?.name || p.slug}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {p.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        {p.featured ? (
                          <Badge className="bg-amber-500/90 text-white border-0 text-xs">
                            <Star className="h-3 w-3 me-1" />
                            {t("admin.project_featured")}
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant={p.published ? "default" : "secondary"}
                          className={`text-xs ${
                            p.published
                              ? "bg-emerald-500/90 text-white border-0"
                              : ""
                          }`}
                        >
                          {p.published ? (
                            <>
                              <Eye className="h-3 w-3 me-1" />
                              {t("admin.project_published")}
                            </>
                          ) : (
                            <>
                              <EyeOff className="h-3 w-3 me-1" />
                              {t("admin.project_draft") || "Draft"}
                            </>
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-end text-muted-foreground">
                        {p.views.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-end">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => openEdit(p)}
                            className="h-8 w-8"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => setDeleteTarget(p)}
                            className="h-8 w-8 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
                {filteredProjects.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-12 text-muted-foreground"
                    >
                      {projects.length === 0
                        ? t("admin.no_projects") || "No projects yet"
                        : t("admin.no_matching_projects") || "No matching projects"}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Create/Edit Dialog */}
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

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={() => setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("admin.delete_project") || "Delete Project"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("admin.delete_project_confirm", {
                name:
                  deleteTarget?.translations[0]?.name || deleteTarget?.slug || "",
              }) ||
                `Are you sure you want to delete "${deleteTarget?.translations[0]?.name || deleteTarget?.slug}"? This action cannot be undone.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t("common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
