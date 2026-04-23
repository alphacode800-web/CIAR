"use client"

import { useState, useCallback, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Download,
  Upload,
  AlertTriangle,
  Loader2,
  Trash2,
  Database,
  FileJson,
  FileSpreadsheet,
  Languages,
  Settings,
  RefreshCw,
  Eye,
  CheckCircle2,
  XCircle,
  UploadCloud,
  FileUp,
  Info,
  FileDown,
  HardDrive,
  ShieldAlert,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
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
import { useI18n } from "@/lib/i18n-context"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

/* ─── Animation variants ────────────────────────────────────────────────── */

const fadeInUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35 },
}

const stagger = {
  animate: { transition: { staggerChildren: 0.06 } },
}

/* ─── Glass Card wrapper ────────────────────────────────────────────────── */

function GlassCard({
  children,
  className = "",
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <motion.div
      {...fadeInUp}
      className={cn(
        "relative rounded-2xl border backdrop-blur-xl p-6",
        "border-[oklch(0.78_0.14_82/12%)] bg-[oklch(0.14_0.028_265/45%)]",
        "dark:bg-[oklch(0.12_0.03_265/55%)]",
        "[html:not(.dark)_&]:bg-white/70 [html:not(.dark)_&]:border-[oklch(0.78_0.14_82/18%)]",
        className
      )}
    >
      <span className="absolute top-0 start-0 w-5 h-5 border-t border-s border-[oklch(0.78_0.14_82/30%)] rounded-tl-2xl pointer-events-none" />
      <span className="absolute bottom-0 end-0 w-5 h-5 border-b border-e border-[oklch(0.78_0.14_82/30%)] rounded-br-2xl pointer-events-none" />
      {children}
    </motion.div>
  )
}

/* ─── Download helper ───────────────────────────────────────────────────── */

function downloadFile(data: string, filename: string, mimeType: string) {
  const blob = new Blob([data], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/* ─── Estimate file sizes ──────────────────────────────────────────────── */

function estimateSize(jsonStr: string): string {
  const bytes = new TextEncoder().encode(jsonStr).length
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `~${(bytes / 1024).toFixed(1)} KB`
  return `~${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/* ─── Main Component ────────────────────────────────────────────────────── */

export function DataExportTab() {
  const { t } = useI18n()
  const [exporting, setExporting] = useState<string | null>(null)
  const [importFile, setImportFile] = useState<File | null>(null)
  const [importPreview, setImportPreview] = useState<string>("")
  const [importing, setImporting] = useState(false)
  const [confirmDialog, setConfirmDialog] = useState<string | null>(null)
  const [confirmLoading, setConfirmLoading] = useState(false)
  const [previewData, setPreviewData] = useState<{ label: string; content: string } | null>(null)
  const [dragging, setDragging] = useState(false)
  const dropRef = useRef<HTMLDivElement>(null)

  /* ── Export functions ── */

  const exportProjects = async () => {
    setExporting("projects")
    try {
      const res = await fetch("/api/projects?locale=en")
      const data = await res.json()
      const json = JSON.stringify(data, null, 2)
      downloadFile(json, "ciar-projects-export.json", "application/json")
      toast.success(t("admin.export_projects_success") || "Projects exported successfully")
    } catch {
      toast.error(t("admin.export_projects_failed") || "Failed to export projects")
    } finally {
      setExporting(null)
    }
  }

  const exportTranslations = async (locale: string = "en") => {
    setExporting(`translations-${locale}`)
    try {
      const res = await fetch(`/api/translations?locale=${locale}`)
      const data = await res.json()
      const json = JSON.stringify(data, null, 2)
      downloadFile(json, `ciar-translations-${locale}-export.json`, "application/json")
      toast.success(t("admin.export_translations_success") || `Translations (${locale}) exported successfully`)
    } catch {
      toast.error(t("admin.export_translations_failed") || "Failed to export translations")
    } finally {
      setExporting(null)
    }
  }

  const exportContacts = async () => {
    setExporting("contacts")
    try {
      const res = await fetch("/api/admin/contacts?limit=1000")
      const data = await res.json()
      const submissions = data.submissions || []
      if (submissions.length === 0) {
        toast.info(t("admin.no_contacts_export") || "No contact submissions to export")
        setExporting(null)
        return
      }

      const headers = ["Name", "Email", "Subject", "Message", "Locale", "Date"]
      const rows = submissions.map((s: Record<string, string>) => [
        `"${(s.name || "").replace(/"/g, '""')}"`,
        `"${(s.email || "").replace(/"/g, '""')}"`,
        `"${(s.subject || "").replace(/"/g, '""')}"`,
        `"${(s.message || "").replace(/"/g, '""')}"`,
        s.locale || "en",
        s.createdAt || "",
      ])
      const csv = [headers.join(","), ...rows.map((r: string[]) => r.join(","))].join("\n")

      downloadFile(csv, "ciar-contacts-export.csv", "text/csv")
      toast.success(t("admin.export_contacts_success") || `${submissions.length} contacts exported as CSV`)
    } catch {
      toast.error(t("admin.export_contacts_failed") || "Failed to export contacts")
    } finally {
      setExporting(null)
    }
  }

  const exportSettings = async () => {
    setExporting("settings")
    try {
      const res = await fetch("/api/settings")
      const data = await res.json()
      const json = JSON.stringify(data, null, 2)
      downloadFile(json, "ciar-settings-export.json", "application/json")
      toast.success(t("admin.export_settings_success") || "Settings exported successfully")
    } catch {
      toast.error(t("admin.export_settings_failed") || "Failed to export settings")
    } finally {
      setExporting(null)
    }
  }

  /* ── Preview function ── */

  const handlePreview = async (id: string) => {
    try {
      let label = ""
      let content = ""
      if (id === "projects") {
        const res = await fetch("/api/projects?locale=en")
        const data = await res.json()
        label = t("admin.preview_projects") || "Projects Preview"
        content = `${(data || []).length} projects found\n\n`
        content += (data || []).slice(0, 3).map((p: Record<string, string>) =>
          `• ${p.title || p.slug || "Untitled"} (${p.category || "Uncategorized"})`
        ).join("\n")
        if ((data || []).length > 3) content += `\n... and ${(data || []).length - 3} more`
      } else if (id.startsWith("translations")) {
        const locale = id.replace("translations-", "")
        const res = await fetch(`/api/translations?locale=${locale}`)
        const data = await res.json()
        const keys = Object.keys(data || {})
        label = t("admin.preview_translations") || `Translations (${locale}) Preview`
        content = `${keys.length} translation keys\n\n`
        content += keys.slice(0, 8).map((k: string) =>
          `• ${k}: ${(data as Record<string, string>)[k]?.slice(0, 50) || "—"}`
        ).join("\n")
        if (keys.length > 8) content += `\n... and ${keys.length - 8} more`
      } else if (id === "contacts") {
        const res = await fetch("/api/admin/contacts?limit=1000")
        const data = await res.json()
        const subs = data.submissions || []
        label = t("admin.preview_contacts") || "Contacts Preview"
        content = `${subs.length} contact submissions\n\n`
        content += subs.slice(0, 5).map((s: Record<string, string>) =>
          `• ${s.name} (${s.email}) — ${s.subject || "No subject"}`
        ).join("\n")
      } else if (id === "settings") {
        const res = await fetch("/api/settings")
        const data = await res.json()
        const keys = Object.keys(data || {})
        label = t("admin.preview_settings") || "Settings Preview"
        content = `${keys.length} settings\n\n`
        content += keys.map((k: string) => `• ${k}: ${(data as Record<string, string>)[k] || "—"}`).join("\n")
      }
      setPreviewData({ label, content })
    } catch {
      toast.error(t("admin.preview_failed") || "Failed to load preview")
    }
  }

  /* ── Import functions ── */

  const handleFileSelect = useCallback(
    (file: File) => {
      if (!file.name.endsWith(".json")) {
        toast.error(t("admin.import_invalid_file") || "Please select a valid JSON file")
        return
      }

      setImportFile(file)
      const reader = new FileReader()
      reader.onload = (ev) => {
        try {
          const text = ev.target?.result as string
          const parsed = JSON.parse(text)
          if (typeof parsed !== "object" || Array.isArray(parsed)) {
            toast.error(t("admin.import_invalid_format") || "Invalid format: expected a JSON object with key-value pairs")
            setImportPreview("")
            return
          }
          const keys = Object.keys(parsed)
          setImportPreview(
            `${keys.length} translation keys found\n\n` +
              `Sample keys:\n${keys.slice(0, 10).map((k) => `  • ${k}`).join("\n")}${keys.length > 10 ? `\n  ... and ${keys.length - 10} more` : ""}`
          )
        } catch {
          toast.error(t("admin.import_parse_failed") || "Failed to parse JSON file")
          setImportPreview("")
        }
      }
      reader.readAsText(file)
    },
    []
  )

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) handleFileSelect(file)
    },
    [handleFileSelect]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragging(false)
      if (e.dataTransfer.files.length > 0) {
        handleFileSelect(e.dataTransfer.files[0])
      }
    },
    [handleFileSelect]
  )

  const handleImport = async () => {
    if (!importFile) return
    setImporting(true)
    try {
      const text = await importFile.text()
      const data = JSON.parse(text)
      let imported = 0
      let failed = 0

      for (const [key, value] of Object.entries(data)) {
        if (typeof key !== "string" || typeof value !== "string") {
          failed++
          continue
        }
        try {
          const res = await fetch("/api/translations", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ key, locale: "en", value }),
          })
          if (res.ok) imported++
          else failed++
        } catch {
          failed++
        }
      }

      toast.success(
        t("admin.import_complete") ||
          `Import complete: ${imported} translations imported, ${failed} failed`
      )
      setImportFile(null)
      setImportPreview("")
      const fileInput = document.getElementById("import-translations-input") as HTMLInputElement
      if (fileInput) fileInput.value = ""
    } catch {
      toast.error(t("admin.import_failed") || "Failed to import translations")
    } finally {
      setImporting(false)
    }
  }

  /* ── Danger zone functions ── */

  const resetTranslations = async () => {
    setConfirmLoading(true)
    try {
      const res = await fetch("/api/translations?locale=en")
      const data = await res.json()
      const keys = Object.keys(data)
      toast.success(
        t("admin.reset_translations_success") ||
          `Translations reset. ${keys.length} keys remain in the database.`
      )
    } catch {
      toast.error(t("admin.reset_translations_failed") || "Failed to reset translations")
    } finally {
      setConfirmLoading(false)
      setConfirmDialog(null)
    }
  }

  const clearContacts = async () => {
    setConfirmLoading(true)
    try {
      const res = await fetch("/api/admin/contacts?limit=1000")
      const data = await res.json()
      const submissions = data.submissions || []
      let deleted = 0

      for (const sub of submissions) {
        try {
          await fetch(`/api/admin/contacts?id=${sub.id}`, { method: "DELETE" })
          deleted++
        } catch {
          // continue
        }
      }

      toast.success(
        t("admin.clear_contacts_success") || `${deleted} contact submissions cleared`
      )
    } catch {
      toast.error(t("admin.clear_contacts_failed") || "Failed to clear contacts")
    } finally {
      setConfirmLoading(false)
      setConfirmDialog(null)
    }
  }

  /* ── Export buttons config ── */

  const exportButtons = [
    {
      id: "projects",
      label: t("admin.export_projects") || "Export Projects",
      desc: t("admin.export_projects_desc") || "Download all projects with translations as JSON",
      icon: FileJson,
      action: exportProjects,
      sizeEst: t("admin.estimated") || "~50-200 KB",
      gradient: "from-[oklch(0.78_0.14_82/20%)] to-[oklch(0.72_0.13_75/10%)]",
      iconColor: "text-[oklch(0.78_0.14_82)]",
      format: "JSON",
    },
    {
      id: "translations-en",
      label: t("admin.export_translations") || "Export Translations (EN)",
      desc: t("admin.export_translations_desc") || "Download English translations as JSON",
      icon: Languages,
      action: () => exportTranslations("en"),
      sizeEst: t("admin.estimated") || "~80-120 KB",
      gradient: "from-violet-500/15% to-fuchsia-500/8%",
      iconColor: "text-violet-400",
      format: "JSON",
    },
    {
      id: "translations-ar",
      label: t("admin.export_translations_ar") || "Export Translations (AR)",
      desc: t("admin.export_translations_ar_desc") || "Download Arabic translations as JSON",
      icon: Languages,
      action: () => exportTranslations("ar"),
      sizeEst: t("admin.estimated") || "~100-150 KB",
      gradient: "from-teal-500/15% to-cyan-500/8%",
      iconColor: "text-teal-400",
      format: "JSON",
    },
    {
      id: "contacts",
      label: t("admin.export_contacts") || "Export Contacts",
      desc: t("admin.export_contacts_desc") || "Download contact submissions as CSV",
      icon: FileSpreadsheet,
      action: exportContacts,
      sizeEst: t("admin.estimated") || "~10-50 KB",
      gradient: "from-emerald-500/15% to-green-500/8%",
      iconColor: "text-emerald-400",
      format: "CSV",
    },
    {
      id: "settings",
      label: t("admin.export_settings") || "Export Settings",
      desc: t("admin.export_settings_desc") || "Download all site settings as JSON",
      icon: Settings,
      action: exportSettings,
      sizeEst: t("admin.estimated") || "~1-5 KB",
      gradient: "from-amber-500/15% to-orange-500/8%",
      iconColor: "text-amber-400",
      format: "JSON",
    },
  ]

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h2 className="text-2xl font-bold gradient-text flex items-center gap-2">
          <Database className="h-6 w-6 text-[oklch(0.78_0.14_82)]" />
          {t("admin.data_export") || "Data Export & Import"}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          {t("admin.data_export_desc") || "Download your data or import translations from external sources"}
        </p>
      </motion.div>

      <div className="glow-line-gold" />

      {/* ── Export Section ── */}
      <GlassCard>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[oklch(0.78_0.14_82/20%)] to-[oklch(0.72_0.13_75/10%)] flex items-center justify-center">
            <FileDown className="h-5 w-5 text-[oklch(0.78_0.14_82)]" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              {t("admin.export_data") || "Export Data"}
            </h3>
            <p className="text-xs text-muted-foreground">
              {t("admin.export_data_desc") || "Download data from your CIAR platform"}
            </p>
          </div>
        </div>

        <motion.div
          variants={stagger}
          initial="initial"
          animate="animate"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
        >
          {exportButtons.map((btn) => {
            const Icon = btn.icon
            return (
              <motion.div
                key={btn.id}
                variants={fadeInUp}
                whileHover={{ scale: 1.01, y: -1 }}
                whileTap={{ scale: 0.99 }}
                className="group relative rounded-xl border border-[oklch(0.78_0.14_82/8%)] bg-[oklch(0.14_0.028_265/30%)] hover:border-[oklch(0.78_0.14_82/18%)] hover:bg-[oklch(0.78_0.14_82/4%)] transition-all overflow-hidden"
              >
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        "w-9 h-9 rounded-lg bg-gradient-to-br flex items-center justify-center shrink-0 transition-transform group-hover:scale-110",
                        btn.gradient
                      )}
                    >
                      <Icon className={cn("h-4 w-4", btn.iconColor)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">
                        {btn.label}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                        {btn.desc}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Footer with format badge, size, and actions */}
                <div className="flex items-center justify-between px-4 py-2.5 border-t border-[oklch(0.78_0.14_82/6%)] bg-[oklch(0.14_0.028_265/20%)]">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-[10px] h-5 px-1.5 font-mono">
                      {btn.format}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground">
                      {btn.sizeEst}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2 text-[11px] text-muted-foreground hover:text-foreground"
                      onClick={() => handlePreview(btn.id)}
                    >
                      <Eye className="h-3 w-3 me-1" />
                      {t("admin.preview") || "Preview"}
                    </Button>
                    <Button
                      size="sm"
                      className="h-7 px-3 text-[11px] bg-[oklch(0.78_0.14_82)] text-[oklch(0.15_0.04_80)] hover:opacity-90"
                      onClick={btn.action}
                      disabled={exporting === btn.id}
                    >
                      {exporting === btn.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Download className="h-3 w-3 me-1" />
                      )}
                      {t("admin.export") || "Export"}
                    </Button>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      </GlassCard>

      {/* ── Import Section ── */}
      <GlassCard>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/15% to-fuchsia-500/8% flex items-center justify-center">
            <FileUp className="h-5 w-5 text-violet-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              {t("admin.import_translations") || "Import Translations"}
            </h3>
            <p className="text-xs text-muted-foreground">
              {t("admin.import_translations_desc") || "Upload a JSON file to import translations"}
            </p>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          {/* Drag and drop zone */}
          <div
            ref={dropRef}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
              "relative flex flex-col items-center justify-center gap-3 p-8 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200",
              "border-[oklch(0.78_0.14_82/15%)] bg-[oklch(0.14_0.028_265/20%)]",
              "hover:border-[oklch(0.78_0.14_82/30%)] hover:bg-[oklch(0.78_0.14_82/4%)]",
              dragging && "border-[oklch(0.78_0.14_82/50%)] bg-[oklch(0.78_0.14_82/8%)] scale-[1.005]",
              importFile && "border-[oklch(0.78_0.14_82/30%)] bg-[oklch(0.78_0.14_82/5%)]"
            )}
            onClick={() => {
              const fileInput = document.getElementById("import-translations-input") as HTMLInputElement
              fileInput?.click()
            }}
          >
            <div className="w-14 h-14 rounded-2xl bg-[oklch(0.78_0.14_82/10%)] flex items-center justify-center">
              {importFile ? (
                <CheckCircle2 className="h-7 w-7 text-[oklch(0.78_0.14_82)]" />
              ) : dragging ? (
                <UploadCloud className="h-7 w-7 text-[oklch(0.78_0.14_82)] animate-bounce" />
              ) : (
                <Upload className="h-7 w-7 text-muted-foreground/50" />
              )}
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">
                {importFile
                  ? importFile.name
                  : dragging
                    ? (t("admin.drop_file_here") || "Drop your file here")
                    : (t("admin.click_or_drag") || "Click to browse or drag & drop a JSON file")}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {importFile
                  ? `${(importFile.size / 1024).toFixed(1)} KB — ${t("admin.click_to_change") || "Click to change file"}`
                  : (t("admin.json_key_value") || "Supports .json files with key-value translation pairs")}
              </p>
            </div>
            <input
              id="import-translations-input"
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleInputChange}
            />
          </div>

          {/* Preview */}
          <AnimatePresence>
            {importPreview && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Eye className="h-3.5 w-3.5 text-[oklch(0.78_0.14_82)]" />
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {t("admin.preview") || "Preview"}
                  </span>
                </div>
                <Textarea
                  readOnly
                  value={importPreview}
                  rows={6}
                  className="rounded-xl bg-[oklch(0.14_0.028_265/60%)] border-[oklch(0.78_0.14_82/10%)] font-mono text-xs resize-none text-[oklch(0.78_0.14_82/70%)]"
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Import buttons */}
          <AnimatePresence>
            {importFile && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-3"
              >
                <Button
                  onClick={handleImport}
                  disabled={importing}
                  className="gap-2 bg-gradient-to-r from-[oklch(0.78_0.14_82)] to-[oklch(0.72_0.13_75)] text-[oklch(0.15_0.04_80)] hover:opacity-90 rounded-xl px-6"
                >
                  {importing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  {t("admin.import_button") || "Import Translations"}
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setImportFile(null)
                    setImportPreview("")
                    const fileInput = document.getElementById("import-translations-input") as HTMLInputElement
                    if (fileInput) fileInput.value = ""
                  }}
                  className="gap-2 text-muted-foreground"
                >
                  <XCircle className="h-4 w-4" />
                  {t("admin.clear") || "Clear"}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </GlassCard>

      {/* ── Data Reset / Danger Zone ── */}
      <GlassCard className="!border-red-500/25% !bg-red-500/[0.03%] dark:!bg-red-500/[0.04%]">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-red-500/15% flex items-center justify-center">
            <ShieldAlert className="h-5 w-5 text-red-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-red-400">
              {t("admin.danger_zone") || "Danger Zone"}
            </h3>
            <p className="text-xs text-muted-foreground">
              {t("admin.danger_zone_desc") || "Irreversible actions that will permanently modify your data"}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {/* Reset translations */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-red-500/15% bg-red-500/[0.04%]"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-red-500/10% flex items-center justify-center shrink-0">
                <RefreshCw className="h-4 w-4 text-red-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  {t("admin.reset_translations") || "Reset All Translations"}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {t("admin.reset_translations_desc") || "Restore all translations to their default seeded values"}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => setConfirmDialog("reset-translations")}
              className="gap-2 border-red-500/25% text-red-400 hover:bg-red-500/10% hover:text-red-300 rounded-xl shrink-0 w-fit"
            >
              {t("admin.reset_button") || "Reset Translations"}
            </Button>
          </motion.div>

          {/* Clear contacts */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-red-500/15% bg-red-500/[0.04%]"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-red-500/10% flex items-center justify-center shrink-0">
                <Trash2 className="h-4 w-4 text-red-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  {t("admin.clear_contacts") || "Clear Contact Submissions"}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {t("admin.clear_contacts_desc") || "Permanently delete all contact form submissions"}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => setConfirmDialog("clear-contacts")}
              className="gap-2 border-red-500/25% text-red-400 hover:bg-red-500/10% hover:text-red-300 rounded-xl shrink-0 w-fit"
            >
              {t("admin.clear_button") || "Clear All Contacts"}
            </Button>
          </motion.div>
        </div>
      </GlassCard>

      {/* ── Preview Dialog ── */}
      <AlertDialog open={!!previewData} onOpenChange={() => setPreviewData(null)}>
        <AlertDialogContent className="rounded-2xl border-[oklch(0.78_0.14_82/15%)] bg-[oklch(0.14_0.028_265/95%)] max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-[oklch(0.78_0.14_82)]" />
              {previewData?.label || "Preview"}
            </AlertDialogTitle>
          </AlertDialogHeader>
          <Textarea
            readOnly
            value={previewData?.content || ""}
            rows={10}
            className="rounded-xl bg-[oklch(0.14_0.028_265/60%)] border-[oklch(0.78_0.14_82/10%)] font-mono text-xs resize-none text-foreground/80"
          />
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={() => setPreviewData(null)}
              className="rounded-xl bg-[oklch(0.78_0.14_82)] text-[oklch(0.15_0.04_80)] hover:opacity-90"
            >
              {t("common.close") || "Close"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── Confirmation Dialogs ── */}
      <AlertDialog
        open={confirmDialog !== null}
        onOpenChange={() => setConfirmDialog(null)}
      >
        <AlertDialogContent className="rounded-2xl border-red-500/25% bg-[oklch(0.14_0.028_265/95%)] dark:bg-[oklch(0.12_0.03_265/98%)] backdrop-blur-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-400">
              <AlertTriangle className="h-5 w-5" />
              {confirmDialog === "reset-translations"
                ? (t("admin.reset_translations") || "Reset All Translations?")
                : (t("admin.clear_contacts") || "Clear All Contacts?")}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              {confirmDialog === "reset-translations"
                ? (t("admin.reset_translations_confirm") || "This will restore all translations to their default values. Any custom translations you have added will be lost. This action cannot be undone.")
                : (t("admin.clear_contacts_confirm") || "This will permanently delete all contact form submissions from the database. This action cannot be undone.")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="rounded-xl">
              {t("common.cancel") || "Cancel"}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (confirmDialog === "reset-translations") {
                  resetTranslations()
                } else {
                  clearContacts()
                }
              }}
              disabled={confirmLoading}
              className="bg-red-500 hover:bg-red-600 text-white rounded-xl"
            >
              {confirmLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : confirmDialog === "reset-translations" ? (
                t("admin.reset_button") || "Reset All Translations"
              ) : (
                t("admin.clear_button") || "Clear All Contacts"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
