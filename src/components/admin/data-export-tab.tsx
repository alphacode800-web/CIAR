"use client"

import { useState, useCallback } from "react"
import { motion } from "framer-motion"
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
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
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

/* ─── Main Component ────────────────────────────────────────────────────── */

export function DataExportTab() {
  const { t } = useI18n()
  const [exporting, setExporting] = useState<string | null>(null)
  const [importFile, setImportFile] = useState<File | null>(null)
  const [importPreview, setImportPreview] = useState<string>("")
  const [importing, setImporting] = useState(false)
  const [confirmDialog, setConfirmDialog] = useState<string | null>(null)
  const [confirmLoading, setConfirmLoading] = useState(false)

  /* ── Export functions ── */

  const exportProjects = async () => {
    setExporting("projects")
    try {
      const res = await fetch("/api/projects?locale=en")
      const data = await res.json()
      downloadFile(
        JSON.stringify(data, null, 2),
        "ciar-projects-export.json",
        "application/json"
      )
      toast.success("Projects exported successfully")
    } catch {
      toast.error("Failed to export projects")
    } finally {
      setExporting(null)
    }
  }

  const exportTranslations = async (locale: string = "en") => {
    setExporting(`translations-${locale}`)
    try {
      const res = await fetch(`/api/translations?locale=${locale}`)
      const data = await res.json()
      downloadFile(
        JSON.stringify(data, null, 2),
        `ciar-translations-${locale}-export.json`,
        "application/json"
      )
      toast.success(`Translations (${locale}) exported successfully`)
    } catch {
      toast.error("Failed to export translations")
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
        toast.info("No contact submissions to export")
        setExporting(null)
        return
      }

      // Convert to CSV
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
      toast.success(`${submissions.length} contacts exported as CSV`)
    } catch {
      toast.error("Failed to export contacts")
    } finally {
      setExporting(null)
    }
  }

  const exportSettings = async () => {
    setExporting("settings")
    try {
      const res = await fetch("/api/settings")
      const data = await res.json()
      downloadFile(
        JSON.stringify(data, null, 2),
        "ciar-settings-export.json",
        "application/json"
      )
      toast.success("Settings exported successfully")
    } catch {
      toast.error("Failed to export settings")
    } finally {
      setExporting(null)
    }
  }

  /* ── Import functions ── */

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return

      if (!file.name.endsWith(".json")) {
        toast.error("Please select a valid JSON file")
        return
      }

      setImportFile(file)
      const reader = new FileReader()
      reader.onload = (ev) => {
        try {
          const text = ev.target?.result as string
          const parsed = JSON.parse(text)
          if (typeof parsed !== "object" || Array.isArray(parsed)) {
            toast.error("Invalid format: expected a JSON object with key-value pairs")
            setImportPreview("")
            return
          }
          const keys = Object.keys(parsed)
          setImportPreview(
            `Found ${keys.length} translation keys\n\n` +
              `Sample keys:\n${keys.slice(0, 10).map((k) => `  • ${k}`).join("\n")}${keys.length > 10 ? `\n  ... and ${keys.length - 10} more` : ""}`
          )
        } catch {
          toast.error("Failed to parse JSON file")
          setImportPreview("")
        }
      }
      reader.readAsText(file)
    },
    []
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
        `Import complete: ${imported} translations imported, ${failed} failed`
      )
      setImportFile(null)
      setImportPreview("")
      // Reset file input
      const fileInput = document.getElementById(
        "import-translations-input"
      ) as HTMLInputElement
      if (fileInput) fileInput.value = ""
    } catch {
      toast.error("Failed to import translations")
    } finally {
      setImporting(false)
    }
  }

  /* ── Danger zone functions ── */

  const resetTranslations = async () => {
    setConfirmLoading(true)
    try {
      // Fetch default translations and overwrite current ones
      const res = await fetch("/api/translations?locale=en")
      const data = await res.json()
      const keys = Object.keys(data)
      toast.success(
        `Translations reset. ${keys.length} keys remain in the database.`
      )
    } catch {
      toast.error("Failed to reset translations")
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

      toast.success(`${deleted} contact submissions cleared`)
    } catch {
      toast.error("Failed to clear contacts")
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
      gradient: "from-[oklch(0.78_0.14_82/20%)] to-[oklch(0.72_0.13_75/10%)]",
      iconColor: "text-[oklch(0.78_0.14_82)]",
    },
    {
      id: "translations-en",
      label: t("admin.export_translations") || "Export Translations (EN)",
      desc: t("admin.export_translations_desc") || "Download English translations as JSON",
      icon: Languages,
      action: () => exportTranslations("en"),
      gradient: "from-violet-500/15% to-fuchsia-500/8%",
      iconColor: "text-violet-400",
    },
    {
      id: "translations-ar",
      label: t("admin.export_translations_ar") || "Export Translations (AR)",
      desc: t("admin.export_translations_ar_desc") || "Download Arabic translations as JSON",
      icon: Languages,
      action: () => exportTranslations("ar"),
      gradient: "from-teal-500/15% to-cyan-500/8%",
      iconColor: "text-teal-400",
    },
    {
      id: "contacts",
      label: t("admin.export_contacts") || "Export Contacts",
      desc: t("admin.export_contacts_desc") || "Download contact submissions as CSV",
      icon: FileSpreadsheet,
      action: exportContacts,
      gradient: "from-emerald-500/15% to-green-500/8%",
      iconColor: "text-emerald-400",
    },
    {
      id: "settings",
      label: t("admin.export_settings") || "Export Settings",
      desc: t("admin.export_settings_desc") || "Download all site settings as JSON",
      icon: Settings,
      action: exportSettings,
      gradient: "from-amber-500/15% to-orange-500/8%",
      iconColor: "text-amber-400",
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
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[oklch(0.78_0.14_82/20%)] to-[oklch(0.72_0.13_75/10%)] flex items-center justify-center">
            <Download className="h-4.5 w-4.5 text-[oklch(0.78_0.14_82)]" />
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {exportButtons.map((btn, index) => (
            <motion.button
              key={btn.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.06 }}
              whileHover={{ scale: 1.01, y: -1 }}
              whileTap={{ scale: 0.99 }}
              onClick={btn.action}
              disabled={exporting === btn.id}
              className="group flex items-start gap-3 p-4 rounded-xl border border-[oklch(0.78_0.14_82/8%)] bg-[oklch(0.14_0.028_265/30%)] hover:border-[oklch(0.78_0.14_82/18%)] hover:bg-[oklch(0.78_0.14_82/4%)] transition-all text-start disabled:opacity-50 disabled:pointer-events-none"
            >
              <div
                className={cn(
                  "w-9 h-9 rounded-lg bg-gradient-to-br flex items-center justify-center shrink-0 transition-transform group-hover:scale-110",
                  btn.gradient
                )}
              >
                {exporting === btn.id ? (
                  <Loader2 className={cn("h-4 w-4 animate-spin", btn.iconColor)} />
                ) : (
                  <btn.icon className={cn("h-4 w-4", btn.iconColor)} />
                )}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">
                  {btn.label}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                  {btn.desc}
                </p>
              </div>
              <Download className="h-4 w-4 text-muted-foreground/40 shrink-0 mt-0.5 group-hover:text-[oklch(0.78_0.14_82)/60] transition-colors" />
            </motion.button>
          ))}
        </div>
      </GlassCard>

      {/* ── Import Section ── */}
      <GlassCard>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500/15% to-fuchsia-500/8% flex items-center justify-center">
            <Upload className="h-4.5 w-4.5 text-violet-400" />
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
          {/* File upload area */}
          <label
            htmlFor="import-translations-input"
            className={cn(
              "flex flex-col items-center justify-center gap-3 p-8 rounded-xl border-2 border-dashed cursor-pointer transition-all",
              "border-[oklch(0.78_0.14_82/15%)] bg-[oklch(0.14_0.028_265/20%)]",
              "hover:border-[oklch(0.78_0.14_82/30%)] hover:bg-[oklch(0.78_0.14_82/4%)]",
              importFile && "border-[oklch(0.78_0.14_82/30%)] bg-[oklch(0.78_0.14_82/5%)]"
            )}
          >
            <div className="w-12 h-12 rounded-xl bg-[oklch(0.78_0.14_82/10%)] flex items-center justify-center">
              {importFile ? (
                <CheckCircle2 className="h-6 w-6 text-[oklch(0.78_0.14_82)]" />
              ) : (
                <Upload className="h-6 w-6 text-muted-foreground/50" />
              )}
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">
                {importFile
                  ? importFile.name
                  : "Click to select a JSON file"}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {importFile
                  ? `${(importFile.size / 1024).toFixed(1)} KB`
                  : "Supports .json files with key-value translation pairs"}
              </p>
            </div>
            <input
              id="import-translations-input"
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleFileSelect}
            />
          </label>

          {/* Preview */}
          {importPreview && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Eye className="h-3.5 w-3.5 text-[oklch(0.78_0.14_82)]" />
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Preview
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

          {/* Import button */}
          {importFile && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-3"
            >
              <Button
                onClick={handleImport}
                disabled={importing}
                className="gap-2 btn-gold rounded-xl px-6"
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
                  const fileInput = document.getElementById(
                    "import-translations-input"
                  ) as HTMLInputElement
                  if (fileInput) fileInput.value = ""
                }}
                className="gap-2 text-muted-foreground"
              >
                <XCircle className="h-4 w-4" />
                Clear
              </Button>
            </motion.div>
          )}
        </motion.div>
      </GlassCard>

      {/* ── Danger Zone ── */}
      <GlassCard className="!border-red-500/25 !bg-red-500/[0.03%] dark:!bg-red-500/[0.04%]">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-xl bg-red-500/15% flex items-center justify-center">
            <AlertTriangle className="h-4.5 w-4.5 text-red-400" />
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

        <div className="space-y-4">
          {/* Reset translations */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-red-500/15% bg-red-500/[0.04%]"
          >
            <div>
              <p className="text-sm font-medium text-foreground">
                {t("admin.reset_translations") || "Reset All Translations"}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {t("admin.reset_translations_desc") || "Restore all translations to their default seeded values"}
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => setConfirmDialog("reset-translations")}
              className="gap-2 border-red-500/25% text-red-400 hover:bg-red-500/10% hover:text-red-300 rounded-xl shrink-0 w-fit"
            >
              <RefreshCw className="h-4 w-4" />
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
            <div>
              <p className="text-sm font-medium text-foreground">
                {t("admin.clear_contacts") || "Clear Contact Submissions"}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {t("admin.clear_contacts_desc") || "Permanently delete all contact form submissions"}
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => setConfirmDialog("clear-contacts")}
              className="gap-2 border-red-500/25% text-red-400 hover:bg-red-500/10% hover:text-red-300 rounded-xl shrink-0 w-fit"
            >
              <Trash2 className="h-4 w-4" />
              {t("admin.clear_button") || "Clear All Contacts"}
            </Button>
          </motion.div>
        </div>
      </GlassCard>

      {/* ── Confirmation Dialogs ── */}
      <AlertDialog
        open={confirmDialog !== null}
        onOpenChange={() => setConfirmDialog(null)}
      >
        <AlertDialogContent className="rounded-2xl border-[oklch(0.78_0.14_82/15%)] bg-[oklch(0.14_0.028_265/95%)] dark:bg-[oklch(0.12_0.03_265/98%)] backdrop-blur-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-400">
              <AlertTriangle className="h-5 w-5" />
              {confirmDialog === "reset-translations"
                ? "Reset All Translations?"
                : "Clear All Contacts?"}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              {confirmDialog === "reset-translations"
                ? "This will restore all translations to their default values. Any custom translations you have added will be lost. This action cannot be undone."
                : "This will permanently delete all contact form submissions from the database. This action cannot be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="rounded-xl">
              Cancel
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
                "Reset All Translations"
              ) : (
                "Clear All Contacts"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
