"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Upload,
  Image as ImageIcon,
  Trash2,
  Copy,
  X,
  Loader2,
  FolderOpen,
  Check,
  HardDrive,
  UploadCloud,
  ZoomIn,
  FileText,
  Video,
  Download,
  Info,
  Filter,
  Grid3X3,
  List,
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
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"
import { useI18n } from "@/lib/i18n-context"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { BulkActionsBar } from "./bulk-actions-bar"

/* ─── Types ─────────────────────────────────────────────────────────────── */

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

/* ─── Helpers ───────────────────────────────────────────────────────────── */

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

function isDocumentType(mimeType: string): boolean {
  return mimeType.includes("pdf") || mimeType.includes("document") || mimeType.includes("text")
}

function isVideoType(mimeType: string): boolean {
  return mimeType.startsWith("video/")
}

const ACCEPTED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
]

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

const FILE_TYPE_FILTERS = [
  { value: "all", label: "All Files", icon: HardDrive },
  { value: "image", label: "Images", icon: ImageIcon },
  { value: "document", label: "Documents", icon: FileText },
  { value: "video", label: "Videos", icon: Video },
]

const CATEGORIES = [
  { value: "all", label: "All Categories" },
  { value: "hero", label: "Hero" },
  { value: "project", label: "Project" },
  { value: "about", label: "About" },
  { value: "general", label: "General" },
]

/* ─── Main Component ────────────────────────────────────────────────────── */

export function MediaTab() {
  const { t } = useI18n()

  // State
  const [media, setMedia] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [fileTypeFilter, setFileTypeFilter] = useState("all")
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

  // Lightbox
  const [lightboxItem, setLightboxItem] = useState<MediaItem | null>(null)

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

  /* ── Client-side file type filter ── */

  const getFilteredMedia = () => {
    if (fileTypeFilter === "all") return media
    return media.filter((item) => {
      if (fileTypeFilter === "image") return isImageType(item.mimeType)
      if (fileTypeFilter === "document") return isDocumentType(item.mimeType)
      if (fileTypeFilter === "video") return isVideoType(item.mimeType)
      return true
    })
  }

  const filteredMedia = getFilteredMedia()

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
      if (lightboxItem?.id === deleteTarget.id) setLightboxItem(null)
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
        t("admin.media_deleted_plural") || `${selectedIds.size} file(s) deleted`
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

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredMedia.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filteredMedia.map((m) => m.id)))
    }
  }

  // ── Stats ──

  const imageCount = media.filter(isImageType).length
  const totalSize = media.reduce((sum, m) => sum + m.size, 0)

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold gradient-text flex items-center gap-2">
          <ImageIcon className="h-6 w-6 text-[oklch(0.78_0.14_82)]" />
          {t("admin.media_library") || "Media Library"}
        </h2>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1.5 text-xs border-[oklch(0.78_0.14_82/30%)] text-[oklch(0.78_0.14_82)]">
            <HardDrive className="h-3 w-3" />
            {media.length} {t("admin.files") || "files"}
          </Badge>
          <Badge variant="outline" className="gap-1.5 text-xs border-emerald-500/30% text-emerald-400">
            <ImageIcon className="h-3 w-3" />
            {imageCount} {t("admin.images") || "images"}
          </Badge>
          <Badge variant="outline" className="gap-1.5 text-xs border-sky-500/30% text-sky-400">
            <HardDrive className="h-3 w-3" />
            {formatFileSize(totalSize)}
          </Badge>
        </div>
      </div>

      <div className="glow-line-gold" />

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
          "relative rounded-2xl border-2 border-dashed transition-all duration-200 overflow-hidden",
          dragging
            ? "border-[oklch(0.78_0.14_82)] bg-[oklch(0.78_0.14_82/5%)] scale-[1.005]"
            : "border-[oklch(0.78_0.14_82/15%)] bg-[oklch(0.14_0.028_265/20%)] hover:border-[oklch(0.78_0.14_82/30%)]",
          uploading && "pointer-events-none opacity-60"
        )}
      >
        <div className="p-6">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[oklch(0.78_0.14_82/10%)] flex items-center justify-center shrink-0">
              {dragging ? (
                <UploadCloud className="h-7 w-7 text-[oklch(0.78_0.14_82)] animate-bounce" />
              ) : (
                <Upload className="h-7 w-7 text-[oklch(0.78_0.14_82/50%)]" />
              )}
            </div>
            <div className="flex-1 text-center sm:text-start">
              <p className="text-sm font-medium text-foreground">
                {dragging
                  ? (t("admin.drop_files") || "Drop files here")
                  : (t("admin.drag_drop_upload") || "Drag & drop files here, or click to browse")}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {t("admin.upload_hint_media") || "JPEG, PNG, GIF, WebP, SVG — Max 5MB each"}
              </p>
            </div>
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
              className="gap-2 bg-gradient-to-r from-[oklch(0.78_0.14_82)] to-[oklch(0.72_0.13_75)] text-[oklch(0.15_0.04_80)] hover:opacity-90 rounded-xl shrink-0"
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
          </div>
        </div>

        {/* Drag overlay */}
        <AnimatePresence>
          {dragging && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[oklch(0.78_0.14_82/5%)] flex items-center justify-center pointer-events-none"
            >
              <div className="flex flex-col items-center gap-2">
                <UploadCloud className="h-10 w-10 text-[oklch(0.78_0.14_82)] animate-bounce" />
                <span className="text-sm font-medium text-[oklch(0.78_0.14_82)]">
                  {t("admin.drop_files") || "Drop files here"}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Filter bar - File type pills + Category */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[oklch(0.14_0.028_265/40%)] border border-[oklch(0.78_0.14_82/8%)]">
          {FILE_TYPE_FILTERS.map((filter) => {
            const Icon = filter.icon
            return (
              <button
                key={filter.value}
                onClick={() => setFileTypeFilter(filter.value)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 flex items-center gap-1.5",
                  fileTypeFilter === filter.value
                    ? "bg-[oklch(0.78_0.14_82/15%)] text-[oklch(0.78_0.14_82)] shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-[oklch(0.78_0.14_82/5%)]"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {t(`admin.filter_${filter.value}`) || filter.label}
              </button>
            )
          })}
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-3.5 w-3.5 text-muted-foreground" />
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-40 rounded-xl h-8 text-xs bg-[oklch(0.14_0.028_265/40%)] border-[oklch(0.78_0.14_82/8%)]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat.value} value={cat.value} className="text-xs">
                  {t(`admin.category_${cat.value}`) || cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Select all toggle */}
        {filteredMedia.length > 0 && (
          <button
            onClick={toggleSelectAll}
            className={cn(
              "ms-auto flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
              selectedIds.size === filteredMedia.length
                ? "bg-[oklch(0.78_0.14_82/15%)] text-[oklch(0.78_0.14_82)]"
                : "text-muted-foreground hover:text-foreground hover:bg-[oklch(0.78_0.14_82/5%)]"
            )}
          >
            <Check className="h-3.5 w-3.5" />
            {t("admin.select_all") || "Select All"}
          </button>
        )}
      </div>

      {/* Media grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-xl" />
          ))}
        </div>
      ) : filteredMedia.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-20 text-center rounded-2xl border border-dashed border-[oklch(0.78_0.14_82/15%)] bg-[oklch(0.14_0.028_265/20%)]"
        >
          <div className="w-20 h-20 rounded-full bg-[oklch(0.78_0.14_82/8%)] flex items-center justify-center mb-6">
            <ImageIcon className="h-10 w-10 text-[oklch(0.78_0.14_82/30%)]" />
          </div>
          <h3 className="text-lg font-semibold text-muted-foreground mb-2">
            {fileTypeFilter !== "all" || category !== "all"
              ? (t("admin.no_matching_media") || "No matching media files")
              : (t("admin.no_media") || "No media files")}
          </h3>
          <p className="text-sm text-muted-foreground/70 max-w-sm">
            {fileTypeFilter !== "all" || category !== "all"
              ? (t("admin.no_matching_media_hint") || "Try a different filter or category")
              : (t("admin.no_media_hint") || "Upload images to build your media library.")}
          </p>
          {fileTypeFilter === "all" && category === "all" && (
            <Button
              variant="outline"
              className="mt-4 gap-2 border-[oklch(0.78_0.14_82/30%)] text-[oklch(0.78_0.14_82)] hover:bg-[oklch(0.78_0.14_82/10%)]"
              onClick={() => inputRef.current?.click()}
            >
              <Upload className="h-4 w-4" />
              {t("admin.upload_first") || "Upload your first file"}
            </Button>
          )}
        </motion.div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <AnimatePresence>
            {filteredMedia.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.03 }}
                className={cn(
                  "group relative rounded-xl border overflow-hidden transition-all duration-200 cursor-pointer",
                  "border-[oklch(0.78_0.14_82/8%)] bg-[oklch(0.14_0.028_265/35%)]",
                  "hover:border-[oklch(0.78_0.14_82/20%)] hover:shadow-lg hover:shadow-[oklch(0.78_0.14_82/5%)]",
                  selectedIds.has(item.id) &&
                    "ring-2 ring-[oklch(0.78_0.14_82)] border-[oklch(0.78_0.14_82/50%)]"
                )}
                onClick={() => toggleSelect(item.id)}
              >
                {/* Selection checkbox */}
                <div
                  className={cn(
                    "absolute top-2.5 start-2.5 z-10 transition-opacity",
                    selectedIds.has(item.id) ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                  )}
                >
                  <div
                    className={cn(
                      "h-5 w-5 rounded-md border-2 flex items-center justify-center transition-colors",
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
                <div className="absolute top-2.5 end-2.5 z-10">
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
                    <div className="w-full h-full flex items-center justify-center bg-[oklch(0.14_0.028_265/60%)]">
                      {isVideoType(item.mimeType) ? (
                        <Video className="h-8 w-8 text-muted-foreground/40" />
                      ) : (
                        <FileText className="h-8 w-8 text-muted-foreground/40" />
                      )}
                    </div>
                  )}

                  {/* Hover overlay with actions */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center gap-2">
                    {isImageType(item.mimeType) && (
                      <Button
                        size="sm"
                        variant="secondary"
                        className="h-8 gap-1.5 rounded-full"
                        onClick={(e) => {
                          e.stopPropagation()
                          setLightboxItem(item)
                        }}
                      >
                        <ZoomIn className="h-3.5 w-3.5" />
                        {t("admin.preview") || "Preview"}
                      </Button>
                    )}
                    <div className="flex items-center gap-2">
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
                        variant="secondary"
                        className="h-8 w-8 p-0 rounded-full"
                        onClick={(e) => {
                          e.stopPropagation()
                          // Download
                          const a = document.createElement("a")
                          a.href = item.url
                          a.download = item.originalName
                          a.click()
                        }}
                      >
                        <Download className="h-3.5 w-3.5" />
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

                  {/* File info overlay - always visible on hover */}
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-3 pt-8 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-white/80 font-medium uppercase">
                        {formatFileSize(item.size)}
                      </span>
                      <span className="text-[10px] text-white/60">
                        {formatDate(item.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* File info */}
                <div className="p-3 space-y-1">
                  <p className="text-xs font-medium truncate" title={item.originalName}>
                    {item.originalName}
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                    <span>{item.mimeType.split("/")[1]?.toUpperCase() || "File"}</span>
                    <span>{formatFileSize(item.size)}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* ── Image Preview Lightbox ── */}
      <Dialog open={!!lightboxItem} onOpenChange={() => setLightboxItem(null)}>
        <DialogContent className="max-w-4xl p-0 border-[oklch(0.78_0.14_82/15%)] bg-[oklch(0.14_0.028_265/98%)] dark:bg-[oklch(0.08_0.02_265/98%)] overflow-hidden rounded-2xl">
          <DialogTitle className="sr-only">
            {t("admin.image_preview") || "Image Preview"}
          </DialogTitle>
          {lightboxItem && (
            <div className="flex flex-col">
              {/* Lightbox image */}
              <div className="relative bg-black/50 flex items-center justify-center max-h-[70vh] overflow-hidden">
                <img
                  src={lightboxItem.url}
                  alt={lightboxItem.alt || lightboxItem.originalName}
                  className="max-w-full max-h-[70vh] object-contain"
                />
              </div>
              {/* Lightbox info bar */}
              <div className="flex items-center justify-between p-4 border-t border-[oklch(0.78_0.14_82/10%)]">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">
                    {lightboxItem.originalName}
                  </p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-xs text-muted-foreground">
                      {formatFileSize(lightboxItem.size)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {lightboxItem.mimeType}
                    </span>
                    <Badge variant="secondary" className="text-[10px] h-4">
                      {lightboxItem.category}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5 rounded-lg text-xs border-[oklch(0.78_0.14_82/20%)]"
                    onClick={() => handleCopyUrl(lightboxItem.url)}
                  >
                    <Copy className="h-3 w-3" />
                    {t("admin.copy_url") || "Copy URL"}
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="gap-1.5 rounded-lg text-xs"
                    onClick={() => {
                      setDeleteTarget(lightboxItem)
                      setLightboxItem(null)
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                    {t("common.delete") || "Delete"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-lg text-xs"
                    onClick={() => setLightboxItem(null)}
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete single confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent className="rounded-2xl border-[oklch(0.78_0.14_82/15%)] bg-[oklch(0.14_0.028_265/95%)]">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("admin.delete_media") || "Delete Media"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("admin.delete_media_confirm") ||
                `Are you sure you want to delete "${deleteTarget?.originalName}"? This action cannot be undone.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="rounded-xl">
              {t("common.cancel") || "Cancel"}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSingle}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl"
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
        <AlertDialogContent className="rounded-2xl border-[oklch(0.78_0.14_82/15%)] bg-[oklch(0.14_0.028_265/95%)]">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("admin.delete_media_plural") || "Delete Media Files"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("admin.delete_selected_media_confirm") ||
                `Are you sure you want to delete ${selectedIds.size} selected file(s)? This action cannot be undone.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="rounded-xl">
              {t("common.cancel") || "Cancel"}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSelected}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl"
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
