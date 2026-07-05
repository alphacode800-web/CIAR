"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { ArrowRight, ChevronDown, FileText, Loader2, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { useAdminNav } from "@/lib/admin-nav-context"
import { getSectionByAdminTab } from "@/lib/section-admin-registry"
import { fieldLabelAr, getAllTranslationKeys, resolveKeyPatterns } from "@/lib/resolve-translation-keys"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

type LocaleValues = Record<string, { ar: string; en: string }>

function isLongContentField(key: string, ar: string, en: string): boolean {
  return (
    ar.length > 80 ||
    en.length > 80 ||
    key.includes("_desc") ||
    key.includes("_text") ||
    key.includes("_quote") ||
    key.includes("_excerpt") ||
    key.endsWith("_a") ||
    key.includes("subtitle") ||
    key.includes("description")
  )
}

type SectionContentTabProps = {
  tabId: string
}

export function SectionContentTab({ tabId }: SectionContentTabProps) {
  const { setTab } = useAdminNav()
  const section = useMemo(() => getSectionByAdminTab(tabId), [tabId])
  const [values, setValues] = useState<LocaleValues>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [openEnglish, setOpenEnglish] = useState<Record<string, boolean>>({})

  const keys = useMemo(() => {
    if (!section?.contentKeys) return []
    return resolveKeyPatterns(section.contentKeys, getAllTranslationKeys())
  }, [section])

  const load = useCallback(async () => {
    if (!section?.contentKeys || keys.length === 0) {
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const [arRes, enRes] = await Promise.all([
        fetch("/api/translations?locale=ar"),
        fetch("/api/translations?locale=en"),
      ])
      const arData = (await arRes.json()) as Record<string, string>
      const enData = (await enRes.json()) as Record<string, string>
      const next: LocaleValues = {}
      const englishOpen: Record<string, boolean> = {}
      for (const key of keys) {
        next[key] = {
          ar: arData[key] ?? "",
          en: enData[key] ?? "",
        }
        if ((enData[key] ?? "").trim().length > 0) {
          englishOpen[key] = true
        }
      }
      setValues(next)
      setOpenEnglish(englishOpen)
    } catch {
      toast.error("تعذر تحميل محتوى القسم")
    } finally {
      setLoading(false)
    }
  }, [section, keys])

  useEffect(() => {
    void load()
  }, [load])

  const updateField = (key: string, locale: "ar" | "en", value: string) => {
    setValues((prev) => ({
      ...prev,
      [key]: { ...prev[key], [locale]: value },
    }))
  }

  const save = async () => {
    setSaving(true)
    try {
      const updates: { key: string; locale: string; value: string }[] = []
      for (const [key, v] of Object.entries(values)) {
        updates.push({ key, locale: "ar", value: v.ar })
        updates.push({ key, locale: "en", value: v.en })
      }
      await Promise.all(
        updates.map((body) =>
          fetch("/api/translations", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          })
        )
      )
      toast.success("تم حفظ المحتوى بنجاح")
    } catch {
      toast.error("فشل حفظ المحتوى")
    } finally {
      setSaving(false)
    }
  }

  if (!section) {
    return (
      <div className="rounded-2xl border border-dashed border-border/50 p-8 text-center text-sm text-muted-foreground">
        لم يُعثر على إعدادات هذا القسم.
        <div className="mt-4">
          <Button type="button" variant="outline" onClick={() => setTab("overview")}>
            العودة للوحة التحكم
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="mb-2 gap-2 ps-0 text-muted-foreground hover:text-foreground"
            onClick={() => setTab("overview")}
          >
            <ArrowRight className="h-4 w-4" />
            لوحة التحكم
          </Button>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-2xl font-bold gradient-text">{section.titleAr}</h2>
            <Badge variant="outline" className="gap-1 text-xs">
              <FileText className="h-3 w-3" />
              إدارة القسم
            </Badge>
          </div>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{section.descAr}</p>
        </div>
        <Button type="button" onClick={save} disabled={saving || loading} className="gap-2">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          حفظ المحتوى
        </Button>
      </div>

      <div className="glow-line-gold" />

      {loading ? (
        <div className="flex min-h-[240px] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : keys.length === 0 ? (
        <p className="text-sm text-muted-foreground">لا توجد حقول محتوى قابلة للتحرير في هذا القسم.</p>
      ) : (
        <div className="space-y-4">
          {keys.map((key) => {
            const ar = values[key]?.ar ?? ""
            const en = values[key]?.en ?? ""
            const isLong = isLongContentField(key, ar, en)
            const englishOpen = openEnglish[key] ?? false

            return (
              <section
                key={key}
                className="rounded-2xl border border-border/40 bg-card/30 p-4 sm:p-5"
              >
                <Label className="mb-3 block text-sm font-semibold">{fieldLabelAr(key)}</Label>

                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">النص المعروض (عربي)</Label>
                  {isLong ? (
                    <Textarea
                      value={ar}
                      onChange={(e) => updateField(key, "ar", e.target.value)}
                      rows={4}
                      placeholder="اكتب النص الذي يظهر للزوار..."
                      className="min-h-[96px] resize-y leading-relaxed"
                    />
                  ) : (
                    <Input
                      value={ar}
                      onChange={(e) => updateField(key, "ar", e.target.value)}
                      placeholder="اكتب النص الذي يظهر للزوار..."
                    />
                  )}
                </div>

                <Collapsible
                  open={englishOpen}
                  onOpenChange={(open) => setOpenEnglish((prev) => ({ ...prev, [key]: open }))}
                  className="mt-3"
                >
                  <CollapsibleTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 gap-1.5 px-2 text-xs text-muted-foreground hover:text-foreground"
                    >
                      <ChevronDown
                        className={cn("h-3.5 w-3.5 transition-transform", englishOpen && "rotate-180")}
                      />
                      النسخة الإنجليزية (اختياري)
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-2 space-y-1.5">
                    <Label className="text-xs text-muted-foreground">English version</Label>
                    {isLong ? (
                      <Textarea
                        value={en}
                        onChange={(e) => updateField(key, "en", e.target.value)}
                        rows={4}
                        dir="ltr"
                        placeholder="Optional English text for visitors..."
                        className="min-h-[96px] resize-y leading-relaxed"
                      />
                    ) : (
                      <Input
                        value={en}
                        onChange={(e) => updateField(key, "en", e.target.value)}
                        dir="ltr"
                        placeholder="Optional English text..."
                      />
                    )}
                  </CollapsibleContent>
                </Collapsible>
              </section>
            )
          })}
        </div>
      )}
    </div>
  )
}