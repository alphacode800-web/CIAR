"use client"

import { useEffect, useMemo, useState } from "react"
import { GripVertical, Loader2, Plus, Save, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import {
  AD_FIELD_INPUT_TYPES,
  defaultAdListingTypesStore,
  newListingField,
  newListingType,
  slugifyListingId,
  type AdListingFieldConfig,
  type AdListingTypeDefinition,
  type AdListingTypesStore,
} from "@/lib/ad-listing-types-config"
import { cn } from "@/lib/utils"

type AdListingTypesAdminPanelProps = {
  initialStore?: AdListingTypesStore
  isAr: boolean
  onSaved?: (store: AdListingTypesStore) => void
}

export function AdListingTypesAdminPanel({ initialStore, isAr, onSaved }: AdListingTypesAdminPanelProps) {
  const [store, setStore] = useState<AdListingTypesStore>(initialStore || defaultAdListingTypesStore())
  const [activeTypeId, setActiveTypeId] = useState(
    () => initialStore?.defaultTypeId || initialStore?.types[0]?.id || defaultAdListingTypesStore().defaultTypeId
  )
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!initialStore) return
    setStore(initialStore)
    setActiveTypeId((prev) =>
      initialStore.types.some((t) => t.id === prev) ? prev : initialStore.defaultTypeId || initialStore.types[0]?.id || prev
    )
  }, [initialStore])

  const activeType = useMemo(
    () => store.types.find((t) => t.id === activeTypeId) || store.types[0],
    [store.types, activeTypeId]
  )

  const updateType = (typeId: string, patch: Partial<AdListingTypeDefinition>) => {
    setStore((prev) => ({
      ...prev,
      types: prev.types.map((t) => (t.id === typeId ? { ...t, ...patch } : t)),
    }))
  }

  const updateField = (typeId: string, fieldId: string, patch: Partial<AdListingFieldConfig>) => {
    setStore((prev) => ({
      ...prev,
      types: prev.types.map((t) =>
        t.id !== typeId
          ? t
          : {
              ...t,
              fields: t.fields.map((f) => (f.id === fieldId ? { ...f, ...patch } : f)),
            }
      ),
    }))
  }

  const addType = () => {
    const created = newListingType()
    setStore((prev) => ({
      ...prev,
      types: [...prev.types, created],
      defaultTypeId: prev.defaultTypeId || created.id,
    }))
    setActiveTypeId(created.id)
  }

  const removeType = (typeId: string) => {
    if (store.types.length <= 1) {
      toast.error(isAr ? "يجب أن يبقى نوع واحد على الأقل" : "At least one type is required")
      return
    }
    if (!confirm(isAr ? "حذف هذا النوع؟" : "Delete this listing type?")) return
    setStore((prev) => {
      const types = prev.types.filter((t) => t.id !== typeId)
      const defaultTypeId = prev.defaultTypeId === typeId ? types[0]?.id || "general" : prev.defaultTypeId
      return { defaultTypeId, types }
    })
    if (activeTypeId === typeId) setActiveTypeId(store.types.find((t) => t.id !== typeId)?.id || "")
  }

  const addField = (typeId: string) => {
    setStore((prev) => ({
      ...prev,
      types: prev.types.map((t) =>
        t.id === typeId ? { ...t, fields: [...t.fields, newListingField()] } : t
      ),
    }))
  }

  const removeField = (typeId: string, fieldId: string) => {
    setStore((prev) => ({
      ...prev,
      types: prev.types.map((t) =>
        t.id === typeId ? { ...t, fields: t.fields.filter((f) => f.id !== fieldId) } : t
      ),
    }))
  }

  const save = async () => {
    setSaving(true)
    try {
      const res = await fetch("/api/admin/ads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "save_listing_types", listingTypes: store }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error("save failed")
      setStore(data.listingTypes || store)
      onSaved?.(data.listingTypes || store)
      toast.success(isAr ? "تم حفظ أنواع الإعلانات" : "Listing types saved")
    } catch {
      toast.error(isAr ? "فشل الحفظ" : "Save failed")
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="space-y-4 rounded-2xl border border-border/40 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold">{isAr ? "أنواع الإعلانات والخيارات" : "Listing types & fields"}</p>
          <p className="text-xs text-muted-foreground">
            {isAr
              ? "أضف أو احذف أنواع الإعلانات، وحدّد الحقول الخاصة بكل نوع."
              : "Add or remove listing types and configure fields for each type."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" className="gap-2 rounded-full" onClick={addType}>
            <Plus className="h-4 w-4" />
            {isAr ? "نوع جديد" : "New type"}
          </Button>
          <Button type="button" disabled={saving} className="gap-2 rounded-full btn-gold" onClick={save}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {isAr ? "حفظ الأنواع" : "Save types"}
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {store.types.map((type) => (
          <Button
            key={type.id}
            type="button"
            size="sm"
            variant={activeTypeId === type.id ? "default" : "outline"}
            className={cn("rounded-full", activeTypeId === type.id && "btn-gold")}
            onClick={() => setActiveTypeId(type.id)}
          >
            {isAr ? type.labelAr : type.labelEn}
            {!type.enabled ? (isAr ? " (معطل)" : " (off)") : ""}
          </Button>
        ))}
      </div>

      {activeType ? (
        <div className="space-y-4 rounded-xl border border-border/30 bg-muted/10 p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <p className="text-sm font-semibold">{isAr ? "تعديل النوع" : "Edit type"}</p>
            <Button type="button" size="sm" variant="destructive" className="gap-1 rounded-full" onClick={() => removeType(activeType.id)}>
              <Trash2 className="h-3.5 w-3.5" />
              {isAr ? "حذف النوع" : "Delete type"}
            </Button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <Label>{isAr ? "المعرّف (slug)" : "ID (slug)"}</Label>
              <Input
                dir="ltr"
                value={activeType.id}
                onChange={(e) => {
                  const nextId = slugifyListingId(e.target.value)
                  setStore((prev) => ({
                    defaultTypeId: prev.defaultTypeId === activeType.id ? nextId : prev.defaultTypeId,
                    types: prev.types.map((t) => (t.id === activeType.id ? { ...t, id: nextId } : t)),
                  }))
                  setActiveTypeId(nextId)
                }}
              />
            </div>
            <div className="space-y-2">
              <Label>{isAr ? "الاسم (عربي)" : "Name (Arabic)"}</Label>
              <Input value={activeType.labelAr} onChange={(e) => updateType(activeType.id, { labelAr: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>{isAr ? "الاسم (English)" : "Name (English)"}</Label>
              <Input dir="ltr" value={activeType.labelEn} onChange={(e) => updateType(activeType.id, { labelEn: e.target.value })} />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>{isAr ? "الوصف (عربي)" : "Description (Arabic)"}</Label>
              <Textarea rows={2} value={activeType.descriptionAr} onChange={(e) => updateType(activeType.id, { descriptionAr: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>{isAr ? "الوصف (English)" : "Description (English)"}</Label>
              <Textarea rows={2} dir="ltr" value={activeType.descriptionEn} onChange={(e) => updateType(activeType.id, { descriptionEn: e.target.value })} />
            </div>
          </div>

          <div className="flex flex-wrap gap-6">
            {(
              [
                ["enabled", isAr ? "مفعّل" : "Enabled"],
                ["showStock", isAr ? "إظهار المخزون" : "Show stock"],
                ["showShipping", isAr ? "إظهار الشحن" : "Show shipping"],
                ["showDiscount", isAr ? "إظهار الحسم" : "Show discount"],
              ] as const
            ).map(([key, label]) => (
              <label key={key} className="flex items-center gap-2 text-sm">
                <Switch
                  checked={activeType[key]}
                  onCheckedChange={(checked) => updateType(activeType.id, { [key]: checked })}
                />
                {label}
              </label>
            ))}
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold">{isAr ? "حقول هذا النوع" : "Fields for this type"}</p>
              <Button type="button" size="sm" variant="outline" className="gap-1 rounded-full" onClick={() => addField(activeType.id)}>
                <Plus className="h-3.5 w-3.5" />
                {isAr ? "حقل جديد" : "New field"}
              </Button>
            </div>

            {activeType.fields.length === 0 ? (
              <p className="text-xs text-muted-foreground">{isAr ? "لا حقول — أضف حقولاً لهذا النوع." : "No fields yet — add fields for this type."}</p>
            ) : (
              activeType.fields.map((field) => (
                <div key={field.id} className="grid gap-3 rounded-lg border border-border/30 bg-background/60 p-3 lg:grid-cols-[1fr_1fr_140px_auto]">
                  <div className="space-y-2">
                    <Label>{isAr ? "اسم الحقل (عربي)" : "Field label (AR)"}</Label>
                    <Input value={field.labelAr} onChange={(e) => updateField(activeType.id, field.id, { labelAr: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>{isAr ? "اسم الحقل (English)" : "Field label (EN)"}</Label>
                    <Input dir="ltr" value={field.labelEn} onChange={(e) => updateField(activeType.id, field.id, { labelEn: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>{isAr ? "نوع الإدخال" : "Input type"}</Label>
                    <Select value={field.type} onValueChange={(v) => updateField(activeType.id, field.id, { type: v as AdListingFieldConfig["type"] })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {AD_FIELD_INPUT_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button type="button" size="icon" variant="ghost" className="text-destructive" onClick={() => removeField(activeType.id, field.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-2 lg:col-span-2">
                    <Label>{isAr ? "معرّف الحقل" : "Field ID"}</Label>
                    <Input
                      dir="ltr"
                      value={field.id}
                      onChange={(e) => {
                        const nextId = slugifyListingId(e.target.value)
                        updateField(activeType.id, field.id, { id: nextId })
                      }}
                    />
                  </div>
                  <div className="space-y-2 lg:col-span-2">
                    <Label>{isAr ? "Placeholder (عربي)" : "Placeholder (AR)"}</Label>
                    <Input value={field.placeholderAr || ""} onChange={(e) => updateField(activeType.id, field.id, { placeholderAr: e.target.value })} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : null}

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <GripVertical className="h-3.5 w-3.5" />
        {isAr
          ? `النوع الافتراضي: ${store.defaultTypeId}`
          : `Default type: ${store.defaultTypeId}`}
      </div>
    </section>
  )
}
