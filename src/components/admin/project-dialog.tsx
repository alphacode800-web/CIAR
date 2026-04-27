"use client"

import { useState, useEffect, useMemo } from "react"
import { motion } from "framer-motion"
import { Languages, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { useI18n, ALL_LOCALES, LOCALE_NAMES } from "@/lib/i18n-context"
import { ImageUpload } from "./image-upload"
import type { Project } from "./projects-tab"

interface ProjectDialogProps {
  project: Project | null
  open: boolean
  onClose: () => void
  onSave: (
    data: Record<string, unknown>,
    translations: Record<string, { name: string; tagline: string; description: string }>
  ) => void
}

interface TranslationFields {
  name: string
  tagline: string
  description: string
}

/**
 * ProjectDialog accepts a `key` prop from its parent so that React remounts
 * the component each time the dialog opens. This avoids the need for a
 * "reset state on open" effect (which triggers cascading renders).
 */
export function ProjectDialog({
  project,
  open,
  onClose,
  onSave,
}: ProjectDialogProps) {
  const { t } = useI18n()
  const isEdit = !!project

  // ── Form state (initialized once on mount / key change) ──
  const defaultForm = useMemo(
    () =>
      project
        ? {
            slug: project.slug,
            imageUrl: project.imageUrl,
            imageUrls: Array.isArray(project.imageUrls) && project.imageUrls.length > 0
              ? project.imageUrls.slice(0, 5)
              : (project.imageUrl ? [project.imageUrl] : []),
            category: project.category,
            externalUrl: project.externalUrl,
            tags: project.tags,
            featured: project.featured,
            published: project.published,
          }
        : {
            slug: "",
            imageUrl: "",
            imageUrls: [""],
            category: "",
            externalUrl: "",
            tags: "[]",
            featured: false,
            published: true,
          },
    [project]
  )

  const [form, setForm] = useState(defaultForm)
  const normalizedImageUrls = useMemo(
    () => (Array.isArray(form.imageUrls) ? form.imageUrls : []),
    [form.imageUrls]
  )

  const updateImageAt = (idx: number, url: string) => {
    setForm((prev) => {
      const arr = [...(Array.isArray(prev.imageUrls) ? prev.imageUrls : [])]
      arr[idx] = url
      return { ...prev, imageUrls: arr, imageUrl: arr.find((item) => item.trim()) || "" }
    })
  }

  const addImageSlot = () => {
    setForm((prev) => {
      const arr = [...(Array.isArray(prev.imageUrls) ? prev.imageUrls : [])]
      if (arr.length >= 5) return prev
      return { ...prev, imageUrls: [...arr, ""] }
    })
  }

  const removeImageSlot = (idx: number) => {
    setForm((prev) => {
      const arr = [...(Array.isArray(prev.imageUrls) ? prev.imageUrls : [])]
      arr.splice(idx, 1)
      const next = arr.length > 0 ? arr : [""]
      return { ...prev, imageUrls: next, imageUrl: next.find((item) => item.trim()) || "" }
    })
  }


  const updateForm = (key: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  // ── Translation fields ──
  const initialTransFields = useMemo(() => {
    if (project) {
      return Object.fromEntries(
        project.translations.map((tr) => [
          tr.locale,
          { name: tr.name, tagline: tr.tagline, description: tr.description },
        ])
      )
    }
    return Object.fromEntries(
      ALL_LOCALES.map((loc) => [loc, { name: "", tagline: "", description: "" }])
    )
  }, [project])

  const [transFields, setTransFields] = useState<
    Record<string, TranslationFields>
  >({})

  const effectiveTransFields =
    Object.keys(transFields).length > 0 ? transFields : initialTransFields

  const updateTransField = (locale: string, field: string, value: string) => {
    setTransFields((prev) => ({
      ...prev,
      [locale]: { ...prev[locale], [field]: value },
    }))
  }

  // ── Fetch full translations for edit mode ──
  // Merge is done inside the async callback, not synchronously in the effect.
  useEffect(() => {
    if (project && open) {
      fetch(`/api/projects/${project.id}/translations`)
        .then((r) => r.json())
        .then((data) => {
          const merged: Record<string, TranslationFields> = { ...initialTransFields }
          for (const tr of data) {
            merged[tr.locale] = {
              name: tr.name,
              tagline: tr.tagline,
              description: tr.description,
            }
          }
          setTransFields(merged)
        })
        .catch(() => {
          // ignore — fall back to initialTransFields from project prop
        })
    }
  }, [project?.id, open])

  const handleSubmit = () => {
    onSave(
      {
        slug: form.slug,
        imageUrls: normalizedImageUrls.map((item) => item.trim()).filter(Boolean).slice(0, 5),
        imageUrl: normalizedImageUrls.map((item) => item.trim()).find(Boolean) || "",
        category: form.category,
        externalUrl: form.externalUrl,
        tags: form.tags,
        featured: form.featured,
        published: form.published,
      },
      effectiveTransFields
    )
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? t("admin.edit_project") : t("admin.add_project")}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* ── Basic Fields ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t("admin.project_slug") || "Slug"}</Label>
              <Input
                value={form.slug}
                onChange={(e) => updateForm("slug", e.target.value)}
                placeholder="my-project"
                disabled={isEdit}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label>{t("admin.project_category") || "Category"}</Label>
              <Input
                value={form.category}
                onChange={(e) => updateForm("category", e.target.value)}
                placeholder="Infrastructure"
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label>{t("admin.project_external_url") || "External URL"}</Label>
              <Input
                value={form.externalUrl}
                onChange={(e) => updateForm("externalUrl", e.target.value)}
                placeholder="https://example.com"
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label>{t("admin.project_tags") || "Tags (JSON)"}</Label>
              <Input
                value={form.tags}
                onChange={(e) => updateForm("tags", e.target.value)}
                placeholder='["React", "TypeScript"]'
                className="rounded-xl"
              />
            </div>
          </div>

          {/* ── Multi Image Upload (up to 5) ── */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>{t("admin.project_image") || "Project Images"}</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addImageSlot}
                disabled={normalizedImageUrls.length >= 5}
                className="gap-1.5"
              >
                <Plus className="h-3.5 w-3.5" />
                {(t("common.add") || "Add")} ({normalizedImageUrls.length}/5)
              </Button>
            </div>
            <div className="space-y-3">
              {normalizedImageUrls.map((img, idx) => (
                <div key={`image-slot-${idx}`} className="rounded-xl border border-border/40 p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {(t("admin.project_image") || "Image")} {idx + 1}
                    </span>
                    {normalizedImageUrls.length > 1 && (
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={() => removeImageSlot(idx)}
                        className="h-7 w-7 text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                  <ImageUpload
                    value={img}
                    onChange={(url) => updateImageAt(idx, url)}
                    showUrlInput
                  />
                </div>
              ))}
            </div>
          </div>

          {/* ── Toggles ── */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Switch
                checked={form.featured}
                onCheckedChange={(v) => updateForm("featured", v)}
              />
              <Label>{t("admin.project_featured") || "Featured"}</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={form.published}
                onCheckedChange={(v) => updateForm("published", v)}
              />
              <Label>{t("admin.project_published") || "Published"}</Label>
            </div>
          </div>

          <Separator />

          {/* ── Translations Accordion ── */}
          <div>
            <motion.h3
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm font-semibold mb-4 flex items-center gap-2"
            >
              <Languages className="h-4 w-4" />
              {t("admin.translations") || "Translations"}
            </motion.h3>
            <Accordion type="multiple" className="space-y-2">
              {ALL_LOCALES.map((loc) => {
                const fields =
                  effectiveTransFields[loc] ||
                  ({ name: "", tagline: "", description: "" } as TranslationFields)
                return (
                  <AccordionItem
                    key={loc}
                    value={loc}
                    className="rounded-xl border border-border/50 px-4 data-[state=open]:border-primary/30"
                  >
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="secondary"
                          className="text-xs uppercase font-mono"
                        >
                          {loc}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {LOCALE_NAMES[loc]}
                        </span>
                        {fields.name && (
                          <span className="text-xs text-foreground/70 truncate max-w-[120px]">
                            — {fields.name}
                          </span>
                        )}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3 pt-1">
                        <div className="space-y-1">
                          <Label className="text-xs">
                            {t("admin.translation_name") || "Name"}
                          </Label>
                          <Input
                            value={fields.name}
                            onChange={(e) =>
                              updateTransField(loc, "name", e.target.value)
                            }
                            placeholder="Project name"
                            className="rounded-lg"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">
                            {t("admin.translation_tagline") || "Tagline"}
                          </Label>
                          <Input
                            value={fields.tagline}
                            onChange={(e) =>
                              updateTransField(loc, "tagline", e.target.value)
                            }
                            placeholder="Short tagline"
                            className="rounded-lg"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">
                            {t("admin.translation_description") || "Description"}
                          </Label>
                          <Textarea
                            value={fields.description}
                            onChange={(e) =>
                              updateTransField(
                                loc,
                                "description",
                                e.target.value
                              )
                            }
                            placeholder="Full description"
                            rows={3}
                            className="rounded-lg resize-none"
                          />
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                )
              })}
            </Accordion>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t("common.cancel")}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!form.slug.trim()}
            className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white"
          >
            {t("common.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
