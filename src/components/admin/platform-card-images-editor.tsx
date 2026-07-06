"use client"

import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ImageUpload } from "./image-upload"
import { toPlatformImageSlots } from "@/lib/platform-card-images"

interface PlatformCardImagesEditorProps {
  values: string[]
  onChange: (values: string[]) => void
  labels?: string[]
}

const DEFAULT_LABELS = ["الصورة 1", "الصورة 2", "الصورة 3"]

export function PlatformCardImagesEditor({
  values,
  onChange,
  labels = DEFAULT_LABELS,
}: PlatformCardImagesEditorProps) {
  const slots = toPlatformImageSlots(values)

  const updateAt = (idx: number, url: string) => {
    const next = [...slots]
    next[idx] = url
    onChange(next)
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {slots.map((img, idx) => (
        <div key={`platform-card-image-${idx}`} className="space-y-2 rounded-xl border border-border/40 bg-muted/20 p-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-muted-foreground">{labels[idx] || `صورة ${idx + 1}`}</span>
            {img ? (
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={() => updateAt(idx, "")}
                className="h-7 w-7 shrink-0 text-destructive hover:bg-destructive/10"
                aria-label={`إزالة ${labels[idx] || `الصورة ${idx + 1}`}`}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            ) : null}
          </div>
          <ImageUpload value={img} onChange={(url) => updateAt(idx, url)} showUrlInput />
        </div>
      ))}
    </div>
  )
}
