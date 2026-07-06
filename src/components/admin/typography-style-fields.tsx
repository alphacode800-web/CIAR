"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { TextStyle } from "@/lib/text-style"
import { NEWS_TICKER_FONT_OPTIONS, NEWS_TICKER_WEIGHT_OPTIONS } from "@/lib/news-ticker"

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  const safe = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value) ? value : "#ffffff"

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      <div className="flex items-center gap-3">
        <label className="relative h-10 w-10 shrink-0 cursor-pointer overflow-hidden rounded-xl border border-border">
          <input
            type="color"
            value={safe}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 h-full w-full cursor-pointer border-0 p-0"
          />
        </label>
        <Input value={value} onChange={(e) => onChange(e.target.value)} className="h-10 font-mono text-sm" dir="ltr" />
      </div>
    </div>
  )
}

export function TypographyStyleFields({
  label,
  value,
  onChange,
  showLineHeight,
}: {
  label: string
  value: TextStyle & { lineHeight?: number }
  onChange: (value: TextStyle & { lineHeight?: number }) => void
  showLineHeight?: boolean
}) {
  return (
    <div className="space-y-4 rounded-xl border border-border/40 bg-muted/10 p-4">
      <Label className="text-sm font-semibold">{label}</Label>
      <div className="grid gap-4 sm:grid-cols-2">
        <ColorField label="اللون" value={value.color} onChange={(color) => onChange({ ...value, color })} />
        <div className="space-y-2">
          <Label className="text-sm font-medium">الخط</Label>
          <Select
            value={value.fontFamily}
            onValueChange={(fontFamily) =>
              onChange({ ...value, fontFamily: fontFamily as TextStyle["fontFamily"] })
            }
          >
            <SelectTrigger className="h-10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {NEWS_TICKER_FONT_OPTIONS.map((font) => (
                <SelectItem key={font.key} value={font.key}>
                  {font.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-medium">حجم الخط ({value.fontSize}px)</Label>
          <Slider
            value={[value.fontSize]}
            min={10}
            max={72}
            step={1}
            onValueChange={([fontSize]) => onChange({ ...value, fontSize })}
          />
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-medium">سُمك الخط</Label>
          <Select
            value={String(value.fontWeight)}
            onValueChange={(weight) =>
              onChange({ ...value, fontWeight: Number(weight) as TextStyle["fontWeight"] })
            }
          >
            <SelectTrigger className="h-10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {NEWS_TICKER_WEIGHT_OPTIONS.map((weight) => (
                <SelectItem key={weight.value} value={String(weight.value)}>
                  {weight.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {showLineHeight ? (
          <div className="space-y-2 sm:col-span-2">
            <Label className="text-sm font-medium">ارتفاع السطر ({value.lineHeight?.toFixed(2)})</Label>
            <Slider
              value={[value.lineHeight ?? 1.7]}
              min={1.2}
              max={2.4}
              step={0.05}
              onValueChange={([lineHeight]) => onChange({ ...value, lineHeight })}
            />
          </div>
        ) : null}
      </div>
    </div>
  )
}

export { ColorField }
