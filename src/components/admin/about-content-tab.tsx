"use client"

import { useEffect, useState } from "react"
import { Building2, Eye, Loader2, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useI18n } from "@/lib/i18n-context"
import { toast } from "sonner"
import { DEFAULT_ABOUT_COMPANY_INTRO, type AboutCompanyIntro } from "@/lib/about-content"

export function AboutContentTab() {
  const { t } = useI18n()
  const [intro, setIntro] = useState<AboutCompanyIntro>(DEFAULT_ABOUT_COMPANY_INTRO)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/admin/about-content")
        const data = await res.json()
        if (data?.intro) {
          setIntro(data.intro as AboutCompanyIntro)
        }
      } catch {
        setIntro(DEFAULT_ABOUT_COMPANY_INTRO)
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [])

  const save = async () => {
    setSaving(true)
    try {
      const res = await fetch("/api/admin/about-content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ intro }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(typeof data?.error === "string" ? data.error : "فشل الحفظ")
      }
      const data = await res.json()
      if (data?.intro) setIntro(data.intro)
      toast.success("تم حفظ النص التعريفي")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "فشل الحفظ")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[280px] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-bold gradient-text">
            <Building2 className="h-6 w-6 text-primary" />
            {t("admin.about_content") || "محتوى من نحن"}
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            {t("admin.about_content_desc") ||
              "تحكم في النص التعريفي للشركة الذي يظهر في صفحة «عن CIAR» تحت عنوان «قيمنا»."}
          </p>
        </div>
        <Button onClick={save} disabled={saving} className="gap-2">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          حفظ التغييرات
        </Button>
      </div>

      <section className="space-y-3 rounded-xl border border-border/40 bg-card/30 p-4">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Eye className="h-4 w-4 text-primary" />
          معاينة (عربي)
        </div>
        <div className="rounded-xl border border-border/30 bg-background/40 p-5 text-center">
          <h3 className="text-lg font-bold">قيمنا</h3>
          <p className="mx-auto mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            {intro.ar || DEFAULT_ABOUT_COMPANY_INTRO.ar}
          </p>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="space-y-2 rounded-xl border border-border/40 bg-card/30 p-4">
          <Label htmlFor="about-intro-ar">النص التعريفي (عربي)</Label>
          <Textarea
            id="about-intro-ar"
            value={intro.ar}
            onChange={(e) => setIntro((prev) => ({ ...prev, ar: e.target.value }))}
            rows={8}
            placeholder="اكتب نبذة تعريفية عن الشركة..."
            className="min-h-[180px] resize-y leading-relaxed"
          />
          <p className="text-xs text-muted-foreground">{intro.ar.length} / 2000 حرف</p>
        </div>

        <div className="space-y-2 rounded-xl border border-border/40 bg-card/30 p-4">
          <Label htmlFor="about-intro-en">النص التعريفي (إنجليزي)</Label>
          <Textarea
            id="about-intro-en"
            value={intro.en}
            onChange={(e) => setIntro((prev) => ({ ...prev, en: e.target.value }))}
            rows={8}
            placeholder="Write the company intro in English..."
            dir="ltr"
            className="min-h-[180px] resize-y leading-relaxed"
          />
          <p className="text-xs text-muted-foreground">{intro.en.length} / 2000 حرف</p>
        </div>
      </section>
    </div>
  )
}
