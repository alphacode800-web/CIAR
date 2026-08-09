"use client"

import { useCallback, useId, useState } from "react"
import { motion } from "framer-motion"
import { ImagePlus, Loader2, ScanLine, Upload, X, FileText } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  imageValidationMessage,
  validateUserBodyImage,
  USER_IMAGE_CONSTRAINTS,
} from "@/lib/virtual-fitting/validate-user-image"
import type { UserImageState } from "@/lib/virtual-fitting/types"
import { Textarea } from "@/components/ui/textarea"

type ImageUploaderProps = {
  value: UserImageState | null
  onChange: (image: UserImageState | null) => void
  isAr: boolean
  disabled?: boolean
}

export function ImageUploader({ value, onChange, isAr, disabled }: ImageUploaderProps) {
  const inputId = useId()
  const [dragOver, setDragOver] = useState(false)
  const [validating, setValidating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notesDraft, setNotesDraft] = useState(value?.notes || "")

  const processFile = useCallback(
    async (file: File) => {
      setValidating(true)
      setError(null)
      try {
        const result = await validateUserBodyImage(file)
        if (!result.ok) {
          setError(imageValidationMessage(result.code, isAr))
          return
        }
        const previewUrl = URL.createObjectURL(file)
        onChange({
          file,
          previewUrl,
          width: result.width,
          height: result.height,
          notes: notesDraft || undefined,
        })
      } finally {
        setValidating(false)
      }
    },
    [isAr, notesDraft, onChange]
  )

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()
      event.stopPropagation()
      setDragOver(false)
      if (disabled || validating) return
      const file = event.dataTransfer.files?.[0]
      if (file) void processFile(file)
    },
    [disabled, processFile, validating]
  )

  const onFileInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) void processFile(file)
    event.target.value = ""
  }

  const clear = () => {
    onChange(null)
    setError(null)
  }

  const updateNotes = (notes: string) => {
    setNotesDraft(notes)
    if (value) {
      onChange({ ...value, notes })
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold flex items-center gap-2">
          <ScanLine className="h-4 w-4 text-[oklch(0.78_0.14_82)]" />
          {isAr ? "صورتك (جسم كامل)" : "Your photo (full body)"}
        </p>
        {value ? (
          <button
            type="button"
            onClick={clear}
            disabled={disabled}
            className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
          >
            <X className="h-3.5 w-3.5" />
            {isAr ? "إزالة" : "Remove"}
          </button>
        ) : null}
      </div>

      <input
        id={inputId}
        type="file"
        accept={USER_IMAGE_CONSTRAINTS.acceptAttr}
        className="sr-only"
        onChange={onFileInput}
        disabled={disabled || validating}
      />

      {value ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/20 shadow-inner"
        >
          <div className="aspect-[3/4] max-h-[420px] w-full">
            <img src={value.previewUrl} alt="" className="h-full w-full object-cover object-top" />
          </div>
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 text-xs text-white/90">
            {value.width}×{value.height}px
          </div>
          <label
            htmlFor={inputId}
            className={cn(
              "absolute top-3 end-3 cursor-pointer rounded-full border border-white/20 bg-black/55 px-3 py-1.5 text-xs text-white backdrop-blur-sm hover:bg-black/70",
              (disabled || validating) && "pointer-events-none opacity-60"
            )}
          >
            {isAr ? "تغيير الصورة" : "Change photo"}
          </label>
        </motion.div>
      ) : (
        <label
          htmlFor={inputId}
          onDragOver={(e) => {
            e.preventDefault()
            e.stopPropagation()
            if (!disabled) setDragOver(true)
          }}
          onDragLeave={(e) => {
            e.preventDefault()
            setDragOver(false)
          }}
          onDrop={onDrop}
          className={cn(
            "group relative flex min-h-[280px] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed p-6 text-center transition-all duration-300",
            "border-[oklch(0.78_0.14_82/25%)] bg-gradient-to-br from-[oklch(0.78_0.14_82/8%)] via-background/40 to-transparent",
            "backdrop-blur-md hover:border-[oklch(0.78_0.14_82/45%)] hover:shadow-[0_0_40px_oklch(0.78_0.14_82/12%)]",
            dragOver && "border-[oklch(0.78_0.14_82/60%)] scale-[1.01] shadow-[0_0_48px_oklch(0.78_0.14_82/18%)]",
            (disabled || validating) && "pointer-events-none opacity-60"
          )}
        >
          <div className="relative z-10 flex flex-col items-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[oklch(0.78_0.14_82/15%)] ring-1 ring-[oklch(0.78_0.14_82/30%)]">
              {validating ? (
                <Loader2 className="h-6 w-6 animate-spin text-[oklch(0.78_0.14_82)]" />
              ) : (
                <Upload className="h-6 w-6 text-[oklch(0.78_0.14_82)] transition group-hover:scale-110" />
              )}
            </div>
            <p className="text-sm font-semibold">
              {isAr ? "اسحب صورتك أو انقر للرفع" : "Drag your photo or click to upload"}
            </p>
            <p className="mt-2 max-w-xs text-xs text-muted-foreground">
              {isAr
                ? "صورة عمودية للجسم كاملاً — JPG/PNG/WebP حتى 10MB"
                : "Vertical full-body photo — JPG/PNG/WebP up to 10MB"}
            </p>
            <div className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-border/50 bg-background/60 px-3 py-1 text-[11px] text-muted-foreground">
              <ImagePlus className="h-3.5 w-3.5" />
              {isAr ? "نسبة مثالية ~3:4" : "Ideal ratio ~3:4"}
            </div>
          </div>
        </label>
      )}

      {error ? (
        <motion.p
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs text-destructive"
        >
          {error}
        </motion.p>
      ) : null}

      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <label className="text-sm font-medium flex items-center gap-2">
          <FileText className="h-4 w-4 text-[oklch(0.78_0.14_82)]" />
          {isAr ? "ملاحظات إضافية (اختياري)" : "Additional notes (optional)"}
        </label>
        <Textarea
          value={value?.notes ?? notesDraft}
          onChange={(e) => updateNotes(e.target.value)}
          placeholder={
            isAr
              ? "اكتب أي ملاحظات أو مواصفات تريد توضيحها (مثل: الطول، الوزن، نوع الجسم، المقاسات المفضلة...)"
              : "Write any notes or specifications you want to clarify (e.g., height, weight, body type, preferred sizes...)"
          }
          disabled={disabled}
          className="min-h-[100px] resize-none bg-muted/30 border-[oklch(0.78_0.14_82/25%)] focus:border-[oklch(0.78_0.14_82/45%)]"
          dir={isAr ? "rtl" : "ltr"}
        />
        <p className="text-xs text-muted-foreground">
          {isAr
            ? "هذه الملاحظات ستساعد في الحصول على نتائج أفضل وأكثر دقة"
            : "These notes will help get better and more accurate results"}
        </p>
      </motion.div>
    </div>
  )
}
