"use client"

import { useState, useCallback, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Upload, X, ImageIcon, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useI18n } from "@/lib/i18n-context"

interface ImageUploadProps {
  value: string
  onChange: (url: string) => void
  label?: string
  showUrlInput?: boolean
}

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"]
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

export function ImageUpload({ value, onChange, label, showUrlInput = true }: ImageUploadProps) {
  const { t } = useI18n()
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const processFile = useCallback(
    async (file: File) => {
      setError(null)

      if (!ACCEPTED_TYPES.includes(file.type)) {
        setError(t("admin.upload_invalid_type") || "Invalid file type. Use JPEG, PNG, GIF, WebP, or SVG.")
        return
      }

      if (file.size > MAX_FILE_SIZE) {
        setError(t("admin.upload_too_large") || "File too large. Maximum 5MB.")
        return
      }

      setUploading(true)
      try {
        const reader = new FileReader()
        const base64 = await new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string)
          reader.onerror = reject
          reader.readAsDataURL(file)
        })

        const data = base64.split(",")[1]
        const ext = file.name.split(".").pop() || "png"
        const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`

        const res = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filename, data }),
        })

        if (!res.ok) throw new Error("Upload failed")

        const result = await res.json()
        onChange(result.url)
      } catch {
        setError(t("admin.upload_failed") || "Upload failed. Please try again.")
      } finally {
        setUploading(false)
      }
    },
    [onChange, t]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragging(false)
      const file = e.dataTransfer.files[0]
      if (file) processFile(file)
    },
    [processFile]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
  }, [])

  const handleClick = () => {
    inputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processFile(file)
    // Reset input so the same file can be re-selected
    e.target.value = ""
  }

  const handleClear = () => {
    onChange("")
    setError(null)
  }

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value)
    setError(null)
  }

  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {label}
        </label>
      )}

      {showUrlInput && (
        <input
          type="url"
          value={value}
          onChange={handleUrlChange}
          placeholder={t("admin.image_url") || "https://example.com/image.jpg"}
          className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary/50"
        />
      )}

      {value ? (
        <div className="relative group rounded-xl border border-border/50 overflow-hidden bg-muted/30">
          <div className="relative aspect-video w-full">
            <img
              src={value}
              alt="Preview"
              className="object-cover w-full h-full"
            />
          </div>
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={handleClick}
              className="gap-2"
            >
              <Upload className="h-3.5 w-3.5" />
              {t("common.replace") || "Replace"}
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={handleClear}
              className="gap-2"
            >
              <X className="h-3.5 w-3.5" />
              {t("common.remove") || "Remove"}
            </Button>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED_TYPES.join(",")}
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={handleClick}
          className={cn(
            "relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 cursor-pointer transition-all duration-200",
            dragging
              ? "border-primary bg-primary/5 scale-[1.01]"
              : "border-border/50 hover:border-primary/50 hover:bg-muted/30",
            uploading && "pointer-events-none opacity-60"
          )}
        >
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED_TYPES.join(",")}
            onChange={handleFileChange}
            className="hidden"
          />

          <AnimatePresence mode="wait">
            {uploading ? (
              <motion.div
                key="uploading"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex flex-col items-center gap-3"
              >
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
                <span className="text-sm text-muted-foreground">
                  {t("admin.uploading") || "Uploading..."}
                </span>
              </motion.div>
            ) : (
              <motion.div
                key="idle"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex flex-col items-center gap-3"
              >
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                  {dragging ? (
                    <Upload className="h-5 w-5 text-primary" />
                  ) : (
                    <ImageIcon className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium">
                    {dragging
                      ? (t("admin.drop_image") || "Drop image here")
                      : (t("admin.upload_image") || "Upload image")}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t("admin.upload_hint") || "Drag & drop or click to browse. JPEG, PNG, GIF, WebP, SVG. Max 5MB."}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -4, height: 0 }}
            className="text-xs text-destructive"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}
