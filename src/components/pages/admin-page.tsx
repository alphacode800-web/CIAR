"use client"

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import {
  LayoutDashboard,
  FolderOpen,
  Languages,
  Settings,
  Plus,
  Pencil,
  Trash2,
  Search,
  Eye,
  EyeOff,
  Star,
  Menu,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
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
import { useI18n, ALL_LOCALES, LOCALE_NAMES } from "@/lib/i18n-context"
import { useRouter, type PageRoute } from "@/lib/router-context"
import { toast } from "sonner"

// Types
interface Project {
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
  translations: { id?: string; locale: string; name: string; tagline: string; description: string }[]
}

interface TranslationRow {
  id: string
  key: string
  locale: string
  value: string
}

// ────────────────────────────────────────────
// MAIN ADMIN PAGE
// ────────────────────────────────────────────
export function AdminPage() {
  const { t, locale: currentLocale, dir } = useI18n()
  const { route, navigate } = useRouter()
  const activeTab = route.tab || "dashboard"
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  const setTab = (tab: string) => {
    navigate({ page: "admin", tab })
    setMobileSidebarOpen(false)
  }

  return (
    <div className="flex min-h-screen pt-16">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 shrink-0 border-e border-border/50 bg-card/50 flex-col fixed top-16 bottom-0">
        <div className="p-4 border-b border-border/50">
          <h1 className="text-lg font-bold">{t("admin.title")}</h1>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {SIDEBAR_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setTab(tab.id)}
              className={`flex items-center gap-3 w-full rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {t(tab.labelKey)}
            </button>
          ))}
        </nav>
      </aside>

      {/* Mobile sidebar overlay + drawer */}
      {mobileSidebarOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          />
          {/* Drawer */}
          <aside
            dir={dir}
            className="fixed top-16 start-0 bottom-0 z-50 w-64 bg-card border-e border-border/50 flex flex-col lg:hidden"
          >
            <div className="p-4 border-b border-border/50 flex items-center justify-between">
              <h1 className="text-lg font-bold">{t("admin.title")}</h1>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setMobileSidebarOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
              {SIDEBAR_TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setTab(tab.id)}
                  className={`flex items-center gap-3 w-full rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? "bg-secondary text-foreground"
                      : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  {t(tab.labelKey)}
                </button>
              ))}
            </nav>
          </aside>
        </>
      )}

      {/* Main content */}
      <main className="flex-1 min-w-0 lg:ms-64">
        {/* Mobile header bar with hamburger */}
        <div className="lg:hidden flex items-center gap-3 px-4 py-3 border-b border-border/50 bg-card/80 sticky top-16 z-30">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={() => setMobileSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-bold">{t("admin.title")}</h1>
        </div>

        <div className="p-4 sm:p-6 lg:p-8 max-w-6xl">
          <Tabs value={activeTab} onValueChange={setTab}>
            <TabsContent value="dashboard">
              <DashboardTab />
            </TabsContent>
            <TabsContent value="projects">
              <ProjectsTab />
            </TabsContent>
            <TabsContent value="translations">
              <TranslationsTab />
            </TabsContent>
            <TabsContent value="settings">
              <SettingsTab />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}

// ────────────────────────────────────────────
// CONSTANTS
// ────────────────────────────────────────────
const SIDEBAR_TABS = [
  { id: "dashboard", icon: LayoutDashboard, labelKey: "admin.dashboard" },
  { id: "projects", icon: FolderOpen, labelKey: "admin.projects" },
  { id: "translations", icon: Languages, labelKey: "admin.translations" },
  { id: "settings", icon: Settings, labelKey: "admin.settings" },
]

// ────────────────────────────────────────────
// DASHBOARD TAB
// ────────────────────────────────────────────
function DashboardTab() {
  const { t } = useI18n()
  const [stats, setStats] = useState({ projects: 0, views: 0, translations: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [projRes, transRes] = await Promise.all([
          fetch("/api/projects?locale=en"),
          fetch("/api/translations?locale=en"),
        ])
        const projData = await projRes.json()
        const transData = await transRes.json()
        setStats({
          projects: projData.projects?.length || 0,
          views: projData.stats?.totalViews || 0,
          translations: Object.keys(transData).length || 0,
        })
      } catch {
        // ignore
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const cards = [
    {
      label: t("admin.total_projects"),
      value: stats.projects,
      icon: FolderOpen,
      color: "from-emerald-500/20 to-teal-500/10",
      iconColor: "text-emerald-400",
    },
    {
      label: t("admin.total_views"),
      value: stats.views.toLocaleString(),
      icon: Eye,
      color: "from-violet-500/20 to-fuchsia-500/10",
      iconColor: "text-violet-400",
    },
    {
      label: t("admin.total_translations"),
      value: stats.translations,
      icon: Languages,
      color: "from-amber-500/20 to-orange-500/10",
      iconColor: "text-amber-400",
    },
  ]

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">{t("admin.dashboard")}</h2>
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {cards.map((card) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-border/50 bg-card p-6"
            >
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${card.color} flex items-center justify-center mb-4`}>
                <card.icon className={`h-5 w-5 ${card.iconColor}`} />
              </div>
              <div className="text-3xl font-bold">{card.value}</div>
              <div className="text-sm text-muted-foreground mt-1">
                {card.label}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

// ────────────────────────────────────────────
// PROJECTS TAB
// ────────────────────────────────────────────
function ProjectsTab() {
  const { t } = useI18n()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [editProject, setEditProject] = useState<Project | null>(null)
  const [editOpen, setEditOpen] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null)

  const fetchProjects = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/projects?locale=en")
      const data = await res.json()
      // Load ALL translations for admin
      const resAll = await fetch("/api/projects?locale=en&all=true")
      // We'll just use the main endpoint which has full project data
      // Actually we need all translations. Let's fetch individually won't work.
      // Instead use the [id] endpoint for each. But for performance, let's just use the data we have
      // and fetch full translations on demand in the edit dialog.
      setProjects(data.projects || [])
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  const handleSave = async (projectData: Record<string, unknown>, translations: Record<string, { name: string; tagline: string; description: string }>) => {
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
        toast.success("Project updated")
      } else {
        // Create project
        const translationsArr = Object.entries(translations).map(([locale, tr]) => ({
          locale,
          ...tr,
        }))
        const res = await fetch("/api/projects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...projectData, translations: translationsArr }),
        })
        if (res.ok) toast.success("Project created")
        else toast.error("Failed to create project")
      }
      setEditOpen(false)
      setCreateOpen(false)
      setEditProject(null)
      fetchProjects()
    } catch {
      toast.error("Failed to save project")
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await fetch(`/api/projects/${deleteTarget.id}`, { method: "DELETE" })
      toast.success("Project deleted")
      setDeleteTarget(null)
      fetchProjects()
    } catch {
      toast.error("Failed to delete project")
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">{t("admin.projects")}</h2>
        <Button
          onClick={() => {
            setEditProject(null)
            setCreateOpen(true)
          }}
          className="gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white"
        >
          <Plus className="h-4 w-4" />
          {t("admin.add_project")}
        </Button>
      </div>

      {loading ? (
        <Skeleton className="h-96 rounded-xl" />
      ) : (
        <div className="rounded-xl border border-border/50 overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-center">Featured</TableHead>
                  <TableHead className="text-center">Published</TableHead>
                  <TableHead className="text-end">Views</TableHead>
                  <TableHead className="text-end">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.map((p) => {
                  const tr = p.translations[0]
                  return (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{tr?.name || p.slug}</TableCell>
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
                          className={`text-xs ${p.published ? "bg-emerald-500/90 text-white border-0" : ""}`}
                        >
                          {p.published ? (
                            <><Eye className="h-3 w-3 me-1" />{t("admin.project_published")}</>
                          ) : (
                            <><EyeOff className="h-3 w-3 me-1" />Draft</>
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
                            onClick={() => {
                              setEditProject(p)
                              setEditOpen(true)
                            }}
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
                {projects.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                      No projects yet
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Edit/Create Dialog */}
      <ProjectDialog
        project={editProject}
        open={editOpen || createOpen}
        onClose={() => {
          setEditOpen(false)
          setCreateOpen(false)
          setEditProject(null)
        }}
        onSave={handleSave}
      />

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{deleteTarget?.translations[0]?.name || deleteTarget?.slug}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {t("common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

// ────────────────────────────────────────────
// PROJECT EDIT/CREATE DIALOG
// ────────────────────────────────────────────
function ProjectDialog({
  project,
  open,
  onClose,
  onSave,
}: {
  project: Project | null
  open: boolean
  onClose: () => void
  onSave: (data: Record<string, unknown>, translations: Record<string, { name: string; tagline: string; description: string }>) => void
}) {
  const { t } = useI18n()
  const isEdit = !!project

  // Fetch full translations for this project when editing
  const [fullTranslations, setFullTranslations] = useState<
    { locale: string; name: string; tagline: string; description: string }[]
  >([])

  useEffect(() => {
    if (project && open) {
      fetch(`/api/projects/${project.id}/translations`)
        .then((r) => r.json())
        .then(setFullTranslations)
        .catch(() => {})
    }
  }, [project, open])

  // Derive form from project prop
  const form = project
    ? {
        slug: project.slug,
        imageUrl: project.imageUrl,
        category: project.category,
        externalUrl: project.externalUrl,
        tags: project.tags,
        featured: project.featured,
        published: project.published,
      }
    : {
        slug: "",
        imageUrl: "",
        category: "",
        externalUrl: "",
        tags: "[]",
        featured: false,
        published: true,
      }

  const [formOverrides, setFormOverrides] = useState<Partial<typeof form>>({})
  const effectiveForm = { ...form, ...formOverrides }

  // Derive initial translation fields from project
  const initialTransFields = project
    ? Object.fromEntries(project.translations.map((tr) => [tr.locale, { name: tr.name, tagline: tr.tagline, description: tr.description }]))
    : Object.fromEntries(ALL_LOCALES.map((loc) => [loc, { name: "", tagline: "", description: "" }]))

  const [transFields, setTransFields] = useState<Record<string, { name: string; tagline: string; description: string }>>({})

  // Merge full translations into transFields when loaded
  useEffect(() => {
    if (isEdit && fullTranslations.length > 0) {
      const updater = () => {
        setTransFields((prev) => {
          const base = Object.keys(prev).length > 0 ? prev : initialTransFields
          const merged = { ...base }
          for (const tr of fullTranslations) {
            merged[tr.locale] = { name: tr.name, tagline: tr.tagline, description: tr.description }
          }
          return merged
        })
      }
      updater()
    }
  }, [isEdit, fullTranslations, initialTransFields])

  // Initialize transFields when no edits yet
  const effectiveTransFields = Object.keys(transFields).length > 0
    ? transFields
    : initialTransFields

  const updateTransField = (locale: string, field: string, value: string) => {
    setTransFields((prev) => ({
      ...prev,
      [locale]: { ...prev[locale], [field]: value },
    }))
  }

  const handleSubmit = () => {
    onSave(
      {
        slug: effectiveForm.slug,
        imageUrl: effectiveForm.imageUrl,
        category: effectiveForm.category,
        externalUrl: effectiveForm.externalUrl,
        tags: effectiveForm.tags,
        featured: effectiveForm.featured,
        published: effectiveForm.published,
      },
      effectiveTransFields
    )
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? t("admin.edit_project") : t("admin.add_project")}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Slug</Label>
              <Input
                value={effectiveForm.slug}
                onChange={(e) => setFormOverrides((p) => ({ ...p, slug: e.target.value }))}
                placeholder="my-project"
                disabled={isEdit}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label>Image URL</Label>
              <Input
                value={effectiveForm.imageUrl}
                onChange={(e) => setFormOverrides((p) => ({ ...p, imageUrl: e.target.value }))}
                placeholder="/projects/my-project.svg"
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Input
                value={effectiveForm.category}
                onChange={(e) => setFormOverrides((p) => ({ ...p, category: e.target.value }))}
                placeholder="Infrastructure"
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label>External URL</Label>
              <Input
                value={effectiveForm.externalUrl}
                onChange={(e) => setFormOverrides((p) => ({ ...p, externalUrl: e.target.value }))}
                placeholder="https://example.com"
                className="rounded-xl"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Tags (JSON)</Label>
            <Input
              value={effectiveForm.tags}
              onChange={(e) => setFormOverrides((p) => ({ ...p, tags: e.target.value }))}
              placeholder='["React", "TypeScript"]'
              className="rounded-xl"
            />
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Switch
                checked={effectiveForm.featured}
                onCheckedChange={(v) => setFormOverrides((p) => ({ ...p, featured: v }))}
              />
              <Label>Featured</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={effectiveForm.published}
                onCheckedChange={(v) => setFormOverrides((p) => ({ ...p, published: v }))}
              />
              <Label>Published</Label>
            </div>
          </div>

          <Separator />

          {/* Translations */}
          <div>
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <Languages className="h-4 w-4" />
              Translations
            </h3>
            <div className="space-y-6">
              {ALL_LOCALES.map((loc) => {
                const fields = effectiveTransFields[loc] || { name: "", tagline: "", description: "" }
                return (
                  <div key={loc} className="rounded-xl border border-border/50 p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="secondary" className="text-xs uppercase">
                        {loc}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {LOCALE_NAMES[loc]}
                      </span>
                    </div>
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <Label className="text-xs">Name</Label>
                        <Input
                          value={fields.name}
                          onChange={(e) => updateTransField(loc, "name", e.target.value)}
                          placeholder="Project name"
                          className="rounded-lg"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Tagline</Label>
                        <Input
                          value={fields.tagline}
                          onChange={(e) => updateTransField(loc, "tagline", e.target.value)}
                          placeholder="Short tagline"
                          className="rounded-lg"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Description</Label>
                        <Textarea
                          value={fields.description}
                          onChange={(e) => updateTransField(loc, "description", e.target.value)}
                          placeholder="Full description"
                          rows={3}
                          className="rounded-lg resize-none"
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t("common.cancel")}
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white"
          >
            {t("common.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ────────────────────────────────────────────
// TRANSLATIONS TAB
// ────────────────────────────────────────────
function TranslationsTab() {
  const { t } = useI18n()
  const [rows, setRows] = useState<TranslationRow[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filterLocale, setFilterLocale] = useState("all")
  const [editRow, setEditRow] = useState<TranslationRow | null>(null)
  const [editValue, setEditValue] = useState("")
  const [editOpen, setEditOpen] = useState(false)

  const fetchTranslations = useCallback(async () => {
    setLoading(true)
    try {
      const promises = ALL_LOCALES.map(async (loc) => {
        const res = await fetch(`/api/translations?locale=${loc}`)
        const data = await res.json()
        return Object.entries(data).map(([key, value]) => ({
          id: `${loc}:${key}`,
          key,
          locale: loc,
          value: value as string,
        }))
      })
      const results = await Promise.all(promises)
      setRows(results.flat())
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTranslations()
  }, [fetchTranslations])

  const filtered = rows.filter((r) => {
    if (filterLocale !== "all" && r.locale !== filterLocale) return false
    if (search && !r.key.toLowerCase().includes(search.toLowerCase()) && !r.value.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const handleEdit = (row: TranslationRow) => {
    setEditRow(row)
    setEditValue(row.value)
    setEditOpen(true)
  }

  const handleSaveTranslation = async () => {
    if (!editRow) return
    try {
      await fetch("/api/translations", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: editRow.key,
          locale: editRow.locale,
          value: editValue,
        }),
      })
      toast.success("Translation updated")
      setRows((prev) =>
        prev.map((r) =>
          r.id === editRow.id ? { ...r, value: editValue } : r
        )
      )
      setEditOpen(false)
    } catch {
      toast.error("Failed to update translation")
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">{t("admin.translations")}</h2>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
        <div className="relative flex-1 w-full sm:max-w-sm">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("common.search")}
            className="ps-9 rounded-xl"
          />
        </div>
        <Select value={filterLocale} onValueChange={setFilterLocale}>
          <SelectTrigger className="w-40 rounded-xl">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Locales</SelectItem>
            {ALL_LOCALES.map((loc) => (
              <SelectItem key={loc} value={loc}>
                {LOCALE_NAMES[loc]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <Skeleton className="h-96 rounded-xl" />
      ) : (
        <div className="rounded-xl border border-border/50 overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-48">Key</TableHead>
                  <TableHead className="w-24">Locale</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead className="w-20 text-end">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.slice(0, 100).map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-mono text-xs">{row.key}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs uppercase">
                        {row.locale}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                      {row.value}
                    </TableCell>
                    <TableCell className="text-end">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleEdit(row)}
                        className="h-8 w-8"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">
                      No translations found
                    </TableCell>
                  </TableRow>
                )}
                {filtered.length > 100 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-4 text-xs text-muted-foreground">
                      Showing 100 of {filtered.length} results
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Edit dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Translation</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs text-muted-foreground">Key</Label>
              <p className="font-mono text-sm">{editRow?.key}</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Locale</Label>
              <Badge variant="outline" className="text-xs uppercase mt-1">
                {editRow?.locale}
              </Badge>
            </div>
            <div className="space-y-2">
              <Label>Value</Label>
              <Textarea
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                rows={4}
                className="rounded-xl"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button
              onClick={handleSaveTranslation}
              className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white"
            >
              {t("common.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ────────────────────────────────────────────
// SETTINGS TAB
// ────────────────────────────────────────────
function SettingsTab() {
  const { t } = useI18n()
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/settings")
        const data = await res.json()
        setSettings(data)
      } catch {
        // ignore
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const updateSetting = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      })
      toast.success("Settings saved")
    } catch {
      toast.error("Failed to save settings")
    } finally {
      setSaving(false)
    }
  }

  const settingFields = [
    { key: "site_name", label: "Site Name", type: "text" as const },
    { key: "default_locale", label: "Default Locale", type: "select" as const, options: ALL_LOCALES },
    { key: "available_locales", label: "Available Locales (JSON)", type: "text" as const },
  ]

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">{t("admin.settings")}</h2>

      {loading ? (
        <Skeleton className="h-64 rounded-2xl" />
      ) : (
        <div className="rounded-2xl border border-border/50 bg-card p-6 space-y-6">
          {settingFields.map((field) => (
            <div key={field.key} className="space-y-2">
              <Label>{field.label}</Label>
              {field.type === "select" ? (
                <Select
                  value={settings[field.key] || ""}
                  onValueChange={(v) => updateSetting(field.key, v)}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {field.options?.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {LOCALE_NAMES[opt]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  value={settings[field.key] || ""}
                  onChange={(e) => updateSetting(field.key, e.target.value)}
                  className="rounded-xl"
                />
              )}
            </div>
          ))}

          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white"
          >
            {t("common.save")}
          </Button>
        </div>
      )}
    </div>
  )
}
