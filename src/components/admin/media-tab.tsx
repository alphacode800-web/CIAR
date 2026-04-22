"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Upload,
  Image as ImageIcon,
  Trash2,
  Copy,
  Search,
  Filter,
  X,
  Loader2,
  FolderOpen,
  Check,
  HardDrive,
  ImageIcon as ImageLucide,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import { BulkActionsBar } from "./bulk-actions-bar"

// ── Types ────────────────────────────────────────────────────────────────────

interface MediaItem {
  id: string
  filename: string
  originalName: string
  mimeType: string
  size: number
  url: string
  alt: string
  category: string
  createdAt: string
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function isImageType(mimeType: string): boolean {
  return mimeType.startsWith("image/")
}

const ACCEPTED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
]

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

const CATEGORIES = [
  { value: "all", label: "All Categories" },
  { value: "hero", label: "Hero" },
  { value: "project", label: "Project" },
  { value: "about", label: "About" },
  { value: "general", label: "General" },
]

// ── Component ────────────────────────────────────────────────────────────────

export function MediaTab() {
  const { t } = useI18n()

  // State
  const [media, setMedia] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState("all")
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [deleteTarget, setDeleteTarget] = useState<MediaItem | null>(null)
  const [deleteMultiple, setDeleteMultiple] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // Upload state
  const [uploading, setUploading] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [uploadCategory, setUploadCategory] = useState("general")
  const inputRef = useRef<HTMLInputElement>(null)

  // ── Fetch media ────────────────────────────────────────────────────────

  const fetchMedia = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ limit: "100" })
      if (category !== "all") params.set("category", category)

      const res = await fetch(`/api/media?${params}`)
      if (!res.ok) throw new Error("Failed to fetch")

      const data = await res.json()
      setMedia(data || [])
    } catch {
      toast.error(t("admin.fetch_media_failed") || "Failed to load media library")
    } finally {
      setLoading(false)
    }
  }, [category, t])

  useEffect(() => {
    fetchMedia()
  }, [fetchMedia])

  // ── Upload handler ─────────────────────────────────────────────────────

  const processFiles = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files)
      const validFiles = fileArray.filter((f) => {
        if (!ACCEPTED_TYPES.includes(f.type)) return false
        if (f.size > MAX_FILE_SIZE) return false
        return true
      })

      if (validFiles.length === 0) {
        toast.error(
          t("admin.upload_invalid_type") ||
            "Invalid files. Use JPEG, PNG, GIF, WebP, SVG. Max 5MB."
        )
        return
      }

      setUploading(true)
      let successCount = 0

      for (const file of validFiles) {
        try {
          const formData = new FormData()
          formData.append("file", file)
          formData.append("category", uploadCategory)

          const res = await fetch("/api/media", {
            method: "POST",
            body: formData,
          })

          if (!res.ok) throw new Error("Upload failed")
          successCount++
        } catch {
          // Continue with other files
        }
      }

      setUploading(false)

      if (successCount > 0) {
        toast.success(
          t("admin.upload_success") ||
            `${successCount} file(s) uploaded successfully`
        )
        fetchMedia()
      } else {
        toast.error(t("admin.upload_failed") || "Upload failed")
      }
    },
    [uploadCategory, fetchMedia, t]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragging(false)
      if (e.dataTransfer.files.length > 0) {
        processFiles(e.dataTransfer.files)
      }
    },
    [processFiles]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files)
      e.target.value = ""
    }
  }

  // ── Delete handlers ────────────────────────────────────────────────────

  const handleDeleteSingle = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/media/${deleteTarget.id}`, {
        method: "DELETE",
      })
      if (!res.ok) throw new Error("Delete failed")

      toast.success(t("admin.media_deleted") || "Media deleted")
      setDeleteTarget(null)
      setSelectedIds((prev) => {
        const next = new Set(prev)
        next.delete(deleteTarget.id)
        return next
      })
      fetchMedia()
    } catch {
      toast.error(t("admin.delete_failed") || "Failed to delete media")
    } finally {
      setDeleting(false)
    }
  }

  const handleDeleteSelected = async () => {
    if (selectedIds.size === 0) return
    setDeleting(true)
    try {
      await Promise.all(
        Array.from(selectedIds).map((id) =>
          fetch(`/api/media/${id}`, { method: "DELETE" })
        )
      )

      toast.success(
        t("admin.media_deleted_plural") ||
          `${selectedIds.size} file(s) deleted`
      )
      setSelectedIds(new Set())
      setDeleteMultiple(false)
      fetchMedia()
    } catch {
      toast.error(t("admin.delete_failed") || "Failed to delete media")
    } finally {
      setDeleting(false)
    }
  }

  // ── Copy URL handler ──────────────────────────────────────────────────

  const handleCopyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url)
      toast.success(t("admin.url_copied") || "URL copied to clipboard")
    } catch {
      toast.error(t("admin.copy_failed") || "Failed to copy URL")
    }
  }

  // ── Selection handlers ─────────────────────────────────────────────────

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold">
          {t("admin.media_library") || "Media Library"}
        </h2>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1.5 text-xs border-[oklch(0.78_0.14_82)]/30 text-[oklch(0.78_0.14_82)]">
            <HardDrive className="h-3 w-3" />
            {media.length} {t("admin.files") || "files"}
          </Badge>
        </div>
      </div>

      {/* Bulk actions bar */}
      <BulkActionsBar
        selectedCount={selectedIds.size}
        actions={[
          {
            id: "bulk-delete",
            label: t("common.delete") || "Delete",
            icon: Trash2,
            variant: "destructive",
            onClick: () => setDeleteMultiple(true),
          },
        ]}
        onClearSelection={() => setSelectedIds(new Set())}
      />

      {/* Upload area */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          "rounded-xl border-2 border-dashed transition-all duration-200 overflow-hidden",
          dragging
            ? "border-[oklch(0.78_0.14_82)] bg-[oklch(0.78_0.14_82)]/5 scale-[1.005]"
            : "border-border/50 hover:border-[oklch(0.78_0.14_82)]/40",
          uploading && "pointer-events-none opacity-60"
        )}
      >
        <div className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {/* Upload button area */}
            <div className="flex items-center gap-3 flex-1">
              <input
                ref={inputRef}
                type="file"
                accept={ACCEPTED_TYPES.join(",")}
                multiple
                onChange={handleFileChange}
                className="hidden"
              />
              <Button
                onClick={() => inputRef.current?.click()}
                disabled={uploading}
                className="gap-2 bg-[oklch(0.78_0.14_82)] text-[oklch(0.15_0.04_80)] hover:bg-[oklch(0.75_0.14_82)]"
              >
                {uploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                {uploading
                  ? (t("admin.uploading") || "Uploading...")
                  : (t("admin.upload_files") || "Upload Files")}
              </Button>
              <p className="text-sm text-muted-foreground">
                {t("admin.upload_hint_media") ||
                  "Drag & drop or click to browse. JPEG, PNG, GIF, WebP, SVG. Max 5MB each."}
              </p>
            </div>

            {/* Category selector */}
            <Select value={uploadCategory} onValueChange={setUploadCategory}>
              <SelectTrigger className="w-36 rounded-lg h-9">
                <SelectValue>
                  <span className="flex items-center gap-2 text-xs">
                    <FolderOpen className="h-3 w-3" />
                    {CATEGORIES.find((c) => c.value === uploadCategory)?.label}
                  </span>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.filter((c) => c.value !== "all").map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Drag overlay */}
        <AnimatePresence>
          {dragging && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[oklch(0.78_0.14_82)]/5 flex items-center justify-center pointer-events-none"
            >
              <div className="flex flex-col items-center gap-2">
                <Upload className="h-8 w-8 text-[oklch(0.78_0.14_82)] animate-bounce" />
                <span className="text-sm font-medium text-[oklch(0.78_0.14_82)]">
                  {t("admin.drop_files") || "Drop files here"}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Filter bar */}
      <div className="flex items-center gap-3">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-48 rounded-xl">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>
                {t(`admin.category_${cat.value}`) || cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Media grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-xl" />
          ))}
        </div>
      ) : media.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-16 text-center"
        >
          <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mb-6">
            <ImageLucide className="h-10 w-10 text-muted-foreground/60" />
          </div>
          <h3 className="text-lg font-semibold text-muted-foreground mb-2">
            {t("admin.no_media") || "No media files"}
          </h3>
          <p className="text-sm text-muted-foreground/70 max-w-sm">
            {t("admin.no_media_hint") ||
              "Upload images to build your media library. They'll appear here once uploaded."}
          </p>
          <Button
            variant="outline"
            className="mt-4 gap-2 border-[oklch(0.78_0.14_82)]/30 text-[oklch(0.78_0.14_82)] hover:bg-[oklch(0.78_0.14_82)]/10"
            onClick={() => inputRef.current?.click()}
          >
            <Upload className="h-4 w-4" />
            {t("admin.upload_first") || "Upload your first file"}
          </Button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <AnimatePresence>
            {media.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.03 }}
                className={cn(
                  "group relative rounded-xl border border-border/50 overflow-hidden bg-card transition-all duration-200 cursor-pointer",
                  selectedIds.has(item.id) &&
                    "ring-2 ring-[oklch(0.78_0.14_82)] border-[oklch(0.78_0.14_82)]/50"
                )}
                onClick={() => toggleSelect(item.id)}
              >
                {/* Selection checkbox */}
                <div
                  className={cn(
                    "absolute top-2 start-2 z-10 transition-opacity",
                    selectedIds.has(item.id) ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                  )}
                >
                  <div
                    className={cn(
                      "h-5 w-5 rounded border-2 flex items-center justify-center transition-colors",
                      selectedIds.has(item.id)
                        ? "bg-[oklch(0.78_0.14_82)] border-[oklch(0.78_0.14_82)]"
                        : "bg-background/80 border-border"
                    )}
                  >
                    {selectedIds.has(item.id) && (
                      <Check className="h-3 w-3 text-[oklch(0.15_0.04_80)]" />
                    )}
                  </div>
                </div>

                {/* Category badge */}
                <div className="absolute top-2 end-2 z-10">
                  <Badge
                    variant="secondary"
                    className="text-[10px] h-5 px-1.5 bg-black/50 text-white backdrop-blur-sm border-0"
                  >
                    {item.category}
                  </Badge>
                </div>

                {/* Image preview */}
                <div className="aspect-square bg-muted/20 relative overflow-hidden">
                  {isImageType(item.mimeType) ? (
                    <img
                      src={item.url}
                      alt={item.alt || item.originalName}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="h-8 w-8 text-muted-foreground/40" />
                    </div>
                  )}

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="h-8 w-8 p-0 rounded-full"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleCopyUrl(item.url)
                      }}
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="h-8 w-8 p-0 rounded-full"
                      onClick={(e) => {
                        e.stopPropagation()
                        setDeleteTarget(item)
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                {/* File info */}
                <div className="p-3 space-y-1">
                  <p className="text-xs font-medium truncate">
                    {item.originalName}
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                    <span>{formatFileSize(item.size)}</span>
                    <span>{formatDate(item.createdAt)}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Delete single confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("admin.delete_media") || "Delete Media"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("admin.delete_media_confirm") ||
                `Are you sure you want to delete "${deleteTarget?.originalName}"? This action cannot be undone.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel") || "Cancel"}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSingle}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? (
                <Loader2 className="h-4 w-4 animate-spin me-2" />
              ) : null}
              {t("common.delete") || "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete multiple confirmation */}
      <AlertDialog open={deleteMultiple} onOpenChange={setDeleteMultiple}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("admin.delete_media_plural") || "Delete Media Files"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("admin.delete_selected_media_confirm") ||
                `Are you sure you want to delete ${selectedIds.size} selected file(s)? This action cannot be undone.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel") || "Cancel"}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSelected}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? (
                <Loader2 className="h-4 w-4 animate-spin me-2" />
              ) : null}
              {t("common.delete") || "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
