"use client"

import Link from "next/link"
import { useCallback, useEffect, useState } from "react"
import { LayoutDashboard, RefreshCw } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"

type ModuleRow = {
  id: string
  nameEn: string
  nameAr: string
  visibility: "VISIBLE" | "HIDDEN"
  isEnabled: boolean
}

type BannerRow = {
  id: string
  moduleId: string
  titleEn: string
  titleAr: string
  descriptionEn: string
  descriptionAr: string
  ctaTextEn: string
  ctaTextAr: string
  ctaHref: string
  imageUrl1: string
  imageUrl2: string
  imageUrl3: string
  isActive?: boolean
  module?: { nameEn: string; nameAr: string }
}

const ANALYTICS_LABELS: Record<string, string> = {
  modulesCount: "إجمالي الوحدات",
  visibleModules: "ظاهرة ومفعّلة",
  hiddenModules: "مخفية",
  activeBanners: "بنرات نشطة",
  adminsCount: "أعضاء الإدارة",
}

export function SuperPlatformAdmin() {
  const [modules, setModules] = useState<ModuleRow[]>([])
  const [banners, setBanners] = useState<BannerRow[]>([])
  const [analytics, setAnalytics] = useState<Record<string, number>>({})
  const [editing, setEditing] = useState<BannerRow | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [m, b, a] = await Promise.all([
        fetch("/api/super-platform/modules?includeHidden=true").then((r) => r.json()),
        fetch("/api/super-platform/banners").then((r) => r.json()),
        fetch("/api/super-platform/analytics").then((r) => r.json()),
      ])
      setModules(m.modules || [])
      setBanners(b.banners || [])
      setAnalytics(typeof a === "object" && a && !Array.isArray(a) ? a : {})
    } catch {
      toast.error("تعذر تحميل بيانات المنصات.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  async function updateModule(module: ModuleRow, patch: Partial<ModuleRow>) {
    const res = await fetch("/api/super-platform/modules", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: module.id,
        isEnabled: patch.isEnabled ?? module.isEnabled,
        visibility: patch.visibility ?? module.visibility,
      }),
    })
    if (!res.ok) {
      toast.error("فشل تحديث الوحدة.")
      return
    }
    await load()
    toast.success("تم حفظ الوحدة.")
  }

  async function saveBanner() {
    if (!editing) return
    const method = editing.id ? "PUT" : "POST"
    const url = editing.id ? `/api/super-platform/banners/${editing.id}` : "/api/super-platform/banners"
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editing),
    })
    if (!res.ok) {
      toast.error("فشل حفظ البنر.")
      return
    }
    setEditing(null)
    await load()
    toast.success("تم حفظ البنر.")
  }

  async function removeBanner(id: string) {
    const res = await fetch(`/api/super-platform/banners/${id}`, { method: "DELETE" })
    if (!res.ok) {
      toast.error("تعذر الحذف.")
      return
    }
    await load()
    toast.success("تم حذف البنر.")
  }

  const emptyBanner = (): BannerRow => ({
    id: "",
    moduleId: modules[0]?.id || "",
    titleEn: "",
    titleAr: "",
    descriptionEn: "",
    descriptionAr: "",
    ctaTextEn: "Explore",
    ctaTextAr: "استكشف",
    ctaHref: "/super-platform",
    imageUrl1: "",
    imageUrl2: "",
    imageUrl3: "",
    isActive: true,
  })

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <Alert className="border-[#c9a87a]/50 bg-gradient-to-br from-[#fdf8ef]/95 to-[#f3e6d4]/90 text-foreground shadow-[0_16px_40px_-24px_rgba(90,58,42,0.2)] ring-1 ring-[#8b5e34]/10">
        <LayoutDashboard className="h-5 w-5 text-[#6f1d1b]" />
        <AlertTitle className="text-base font-bold tracking-tight text-[#3d2c1f]">لوحة التحكم الكاملة — 15 قسمًا</AlertTitle>
        <AlertDescription className="text-[#4a3a2a]/90">
          أنت في «المنصات الفائقة» فقط. لإدارة الموقع بالكامل (الوسائط، الترجمات، SEO، المستخدمين، الإعدادات، …) انتقل إلى اللوحة الكاملة.
          <Link
            href="/admin/panel/overview"
            className="mt-3 inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-[#6f1d1b] to-[#4a1410] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#5c1815]/25 transition hover:brightness-110"
          >
            فتح اللوحة الكاملة
          </Link>
        </AlertDescription>
      </Alert>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">إدارة المنصات والبنرات</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            تحكم في ظهور وحدات المنصة على الموقع، وحرّر بنرات الصفحة الرئيسية (حتى ثلاث صور لكل بنر).
          </p>
        </div>
        <Button type="button" variant="outline" size="sm" className="gap-2" onClick={() => void load()} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          تحديث البيانات
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
        {loading
          ? Array.from({ length: 5 }).map((_, i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <Skeleton className="h-4 w-20" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-12" />
                </CardContent>
              </Card>
            ))
          : Object.entries(analytics).map(([k, v]) => (
              <Card key={k}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {ANALYTICS_LABELS[k] ?? k}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-2xl font-bold tabular-nums">{v}</CardContent>
              </Card>
            ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>وحدات المنصة</CardTitle>
          <CardDescription>إظهار أو إخفاء الوحدة، وتفعيلها أو إيقافها دون حذف البيانات.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full rounded-lg" />
              ))}
            </div>
          ) : modules.length === 0 ? (
            <p className="text-sm text-muted-foreground">لا توجد وحدات. تحقق من الاتصال بقاعدة البيانات والمهاجرات.</p>
          ) : (
            modules.map((module) => (
              <div
                key={module.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-card/50 p-4"
              >
                <div className="min-w-0">
                  <p className="font-semibold">{module.nameAr}</p>
                  <p className="text-sm text-muted-foreground">{module.nameEn}</p>
                </div>
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Label className="text-sm whitespace-nowrap">ظاهر</Label>
                    <Switch
                      checked={module.visibility === "VISIBLE"}
                      onCheckedChange={(v) => updateModule(module, { visibility: v ? "VISIBLE" : "HIDDEN" })}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="text-sm whitespace-nowrap">مفعّل</Label>
                    <Switch
                      checked={module.isEnabled}
                      onCheckedChange={(v) => updateModule(module, { isEnabled: v })}
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>البنرات</CardTitle>
          <CardDescription>كل بنر مرتبط بوحدة ويمكن أن يحتوي على ثلاث صور للعرض المتناوب.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-3 md:grid-cols-2">
            {loading ? (
              <>
                <Skeleton className="h-36 rounded-lg" />
                <Skeleton className="h-36 rounded-lg" />
              </>
            ) : (
              banners.map((banner) => (
                <div key={banner.id} className="rounded-lg border bg-card/50 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-medium">{banner.titleAr || banner.titleEn}</p>
                      {banner.titleAr && banner.titleEn && banner.titleAr !== banner.titleEn ? (
                        <p className="text-sm text-muted-foreground">{banner.titleEn}</p>
                      ) : null}
                      {banner.module ? (
                        <p className="mt-1 text-xs text-muted-foreground">
                          {banner.module.nameAr} · {banner.module.nameEn}
                        </p>
                      ) : null}
                    </div>
                    {banner.isActive === false ? (
                      <Badge variant="secondary">غير نشط</Badge>
                    ) : null}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" onClick={() => setEditing(banner)}>
                      تعديل
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => removeBanner(banner.id)}>
                      حذف
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="rounded-lg border bg-muted/30 p-4">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <p className="font-semibold">{editing?.id ? "تعديل بنر" : "إضافة بنر"}</p>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setEditing(emptyBanner())}
                disabled={loading || modules.length === 0}
              >
                بنر جديد
              </Button>
            </div>
            {editing && (
              <div className="grid gap-3 md:grid-cols-2">
                <div className="md:col-span-2 space-y-2">
                  <Label>الوحدة</Label>
                  <Select value={editing.moduleId} onValueChange={(v) => setEditing({ ...editing, moduleId: v })}>
                    <SelectTrigger className="w-full max-w-md">
                      <SelectValue placeholder="اختر وحدة" />
                    </SelectTrigger>
                    <SelectContent>
                      {modules.map((m) => (
                        <SelectItem key={m.id} value={m.id}>
                          {m.nameAr} ({m.nameEn})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>العنوان (عربي)</Label>
                  <Input value={editing.titleAr} onChange={(e) => setEditing({ ...editing, titleAr: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>العنوان (إنجليزي)</Label>
                  <Input value={editing.titleEn} onChange={(e) => setEditing({ ...editing, titleEn: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>الوصف (عربي)</Label>
                  <Input
                    value={editing.descriptionAr}
                    onChange={(e) => setEditing({ ...editing, descriptionAr: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>الوصف (إنجليزي)</Label>
                  <Input
                    value={editing.descriptionEn}
                    onChange={(e) => setEditing({ ...editing, descriptionEn: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>نص الزر (عربي)</Label>
                  <Input value={editing.ctaTextAr} onChange={(e) => setEditing({ ...editing, ctaTextAr: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>نص الزر (إنجليزي)</Label>
                  <Input value={editing.ctaTextEn} onChange={(e) => setEditing({ ...editing, ctaTextEn: e.target.value })} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>رابط الزر</Label>
                  <Input value={editing.ctaHref} onChange={(e) => setEditing({ ...editing, ctaHref: e.target.value })} dir="ltr" className="text-left" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>رابط الصورة 1</Label>
                  <Input value={editing.imageUrl1} onChange={(e) => setEditing({ ...editing, imageUrl1: e.target.value })} dir="ltr" className="text-left" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>رابط الصورة 2</Label>
                  <Input value={editing.imageUrl2} onChange={(e) => setEditing({ ...editing, imageUrl2: e.target.value })} dir="ltr" className="text-left" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>رابط الصورة 3</Label>
                  <Input value={editing.imageUrl3} onChange={(e) => setEditing({ ...editing, imageUrl3: e.target.value })} dir="ltr" className="text-left" />
                </div>
                <div className="flex items-center gap-2 md:col-span-2">
                  <Label>بنر نشط</Label>
                  <Switch checked={editing.isActive !== false} onCheckedChange={(v) => setEditing({ ...editing, isActive: v })} />
                </div>
                <div className="md:col-span-2 flex flex-wrap gap-2">
                  <Button type="button" onClick={() => void saveBanner()}>
                    حفظ البنر
                  </Button>
                  <Button type="button" variant="ghost" onClick={() => setEditing(null)}>
                    إلغاء
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
