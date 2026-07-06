"use client"

import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ImageUpload } from "./image-upload"
import { MAX_PLATFORM_CARD_IMAGES } from "@/lib/platform-card-images"

interface PlatformCardImagesEditorProps {
  values: string[]
  onChange: (values: string[]) => void
  maxImages?: number
}

export function PlatformCardImagesEditor({
  values,
  onChange,
  maxImages = MAX_PLATFORM_CARD_IMAGES,
}: PlatformCardImagesEditorProps) {
  const items = Array.isArray(values)
    ? values.map((item) => String(item ?? "").trim())
    : []

  const updateAt = (idx: number, url: string) => {
    const next = [...items]
    next[idx] = url
    onChange(next)
  }

  const removeAt = (idx: number) => {
    onChange(items.filter((_, index) => index !== idx))
  }

  const moveItem = (from: number, to: number) => {
    if (to < 0 || to >= items.length || from === to) return
    const next = [...items]
    const [moved] = next.splice(from, 1)
    next.splice(to, 0, moved)
    onChange(next)
  }

  const addImage = () => {
    if (items.length >= maxImages) return
    onChange([...items, ""])
  }

  return (
    <div className="space-y-3">
      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border/60 bg-muted/20 px-4 py-6 text-center text-sm text-muted-foreground">
          لا توجد صور بعد — اضغط «إضافة صورة» لبدء رفع صور كارت المنصة.
        </div>
      ) : (
        items.map((img, idx) => (
          <div
            key={`platform-card-image-${idx}-${img || "empty"}`}
            className="rounded-xl border border-border/40 bg-muted/20 p-3"
          >
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-semibold text-muted-foreground">الصورة {idx + 1}</span>
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7"
                  disabled={idx === 0}
                  onClick={() => moveItem(idx, idx - 1)}
                  aria-label="تحريك لأعلى"
                >
                  <ArrowUp className="h-3.5 w-3.5" />
                </Button>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7"
                  disabled={idx === items.length - 1}
                  onClick={() => moveItem(idx, idx + 1)}
                  aria-label="تحريك لأسفل"
                >
                  <ArrowDown className="h-3.5 w-3.5" />
                </Button>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 text-destructive hover:bg-destructive/10"
                  onClick={() => removeAt(idx)}
                  aria-label={`إزالة الصورة ${idx + 1}`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
            <ImageUpload value={img} onChange={(url) => updateAt(idx, url)} showUrlInput />
          </div>
        ))
      )}

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="gap-1.5"
        onClick={addImage}
        disabled={items.length >= maxImages}
      >
        <Plus className="h-3.5 w-3.5" />
        إضافة صورة
        {items.length > 0 ? (
          <span className="text-[10px] text-muted-foreground">
            ({items.length}/{maxImages})
          </span>
        ) : null}
      </Button>
    </div>
  )
}
