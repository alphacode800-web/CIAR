"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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

export function SuperPlatformAdmin() {
  const [modules, setModules] = useState<ModuleRow[]>([])
  const [banners, setBanners] = useState<BannerRow[]>([])
  const [analytics, setAnalytics] = useState<Record<string, number>>({})
  const [editing, setEditing] = useState<BannerRow | null>(null)

  async function load() {
    const [m, b, a] = await Promise.all([
      fetch("/api/super-platform/modules?includeHidden=true").then((r) => r.json()),
      fetch("/api/super-platform/banners").then((r) => r.json()),
      fetch("/api/super-platform/analytics").then((r) => r.json()),
    ])
    setModules(m.modules || [])
    setBanners(b.banners || [])
    setAnalytics(a || {})
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      load().catch(() => toast.error("Failed to load super platform data"))
    }, 0)
    return () => clearTimeout(timer)
  }, [])

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
    if (!res.ok) return toast.error("Module update failed")
    await load()
    toast.success("Module updated")
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
    if (!res.ok) return toast.error("Banner save failed")
    setEditing(null)
    await load()
    toast.success("Banner saved")
  }

  async function removeBanner(id: string) {
    const res = await fetch(`/api/super-platform/banners/${id}`, { method: "DELETE" })
    if (!res.ok) return toast.error("Delete failed")
    await load()
    toast.success("Banner deleted")
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8">
      <h1 className="text-3xl font-bold">CIAR Super Platform Admin</h1>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        {Object.entries(analytics).map(([k, v]) => (
          <Card key={k}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm capitalize">{k.replace(/([A-Z])/g, " $1")}</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-bold">{v}</CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Modules (15 total including hidden internal modules)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {modules.map((module) => (
            <div key={module.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-4">
              <div>
                <p className="font-semibold">{module.nameEn}</p>
                <p className="text-sm text-muted-foreground">{module.nameAr}</p>
              </div>
              <div className="flex items-center gap-2">
                <Label>Visible</Label>
                <Switch
                  checked={module.visibility === "VISIBLE"}
                  onCheckedChange={(v) => updateModule(module, { visibility: v ? "VISIBLE" : "HIDDEN" })}
                />
                <Label>Enabled</Label>
                <Switch checked={module.isEnabled} onCheckedChange={(v) => updateModule(module, { isEnabled: v })} />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Banner Management (3 images per module)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            {banners.map((banner) => (
              <div key={banner.id} className="rounded-lg border p-4">
                <p className="font-medium">{banner.titleEn} {banner.isActive === false ? "(inactive)" : ""}</p>
                <p className="text-sm text-muted-foreground">{banner.titleAr}</p>
                {banner.module && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {banner.module.nameEn} / {banner.module.nameAr}
                  </p>
                )}
                <div className="mt-3 flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setEditing(banner)}>Edit</Button>
                  <Button size="sm" variant="destructive" onClick={() => removeBanner(banner.id)}>Delete</Button>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-lg border p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="font-semibold">{editing?.id ? "Edit Banner" : "Create/Upsert Banner"}</p>
              <Button
                variant="outline"
                onClick={() =>
                  setEditing({
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
                }
              >
                New
              </Button>
            </div>
            {editing && (
              <div className="grid gap-3 md:grid-cols-2">
                <Input value={editing.moduleId} onChange={(e) => setEditing({ ...editing, moduleId: e.target.value })} placeholder="moduleId" />
                <Input value={editing.titleEn} onChange={(e) => setEditing({ ...editing, titleEn: e.target.value })} placeholder="Title EN" />
                <Input value={editing.titleAr} onChange={(e) => setEditing({ ...editing, titleAr: e.target.value })} placeholder="Title AR" />
                <Input value={editing.descriptionEn} onChange={(e) => setEditing({ ...editing, descriptionEn: e.target.value })} placeholder="Description EN" />
                <Input value={editing.descriptionAr} onChange={(e) => setEditing({ ...editing, descriptionAr: e.target.value })} placeholder="Description AR" />
                <Input value={editing.ctaTextEn} onChange={(e) => setEditing({ ...editing, ctaTextEn: e.target.value })} placeholder="CTA EN" />
                <Input value={editing.ctaTextAr} onChange={(e) => setEditing({ ...editing, ctaTextAr: e.target.value })} placeholder="CTA AR" />
                <Input value={editing.ctaHref} onChange={(e) => setEditing({ ...editing, ctaHref: e.target.value })} placeholder="CTA HREF" />
                <Input value={editing.imageUrl1} onChange={(e) => setEditing({ ...editing, imageUrl1: e.target.value })} placeholder="Image URL 1" />
                <Input value={editing.imageUrl2} onChange={(e) => setEditing({ ...editing, imageUrl2: e.target.value })} placeholder="Image URL 2" />
                <Input value={editing.imageUrl3} onChange={(e) => setEditing({ ...editing, imageUrl3: e.target.value })} placeholder="Image URL 3" />
                <div className="flex items-center gap-2">
                  <Label>Banner Active</Label>
                  <Switch checked={editing.isActive !== false} onCheckedChange={(v) => setEditing({ ...editing, isActive: v })} />
                </div>
                <div>
                  <Button onClick={saveBanner}>Save Banner</Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
