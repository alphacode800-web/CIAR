"use client"

import { useState, useEffect, useMemo } from "react"
import { motion } from "framer-motion"
import { Languages } from "lucide-react"
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
import { PlatformCardImagesEditor } from "./platform-card-images-editor"
import {
  normalizePlatformImageUrls,
  platformImageSlotsToPayload,
  resolveProjectEditImages,
} from "@/lib/platform-card-images"
import { fetchPlatformBannerImageSlots } from "@/lib/sync-platform-banner-images"
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

const normalizeWebsiteUrl = (value: string) => {
  const raw = String(value || "").trim()
  if (!raw) return ""
  if (/^https?:\/\//i.test(raw)) return raw
  return `https://${raw}`
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
            imageUrls: resolveProjectEditImages(
              project.slug,
              Array.isArray(project.imageUrls) && project.imageUrls.length > 0
                ? project.imageUrls
                : project.imageUrl
                  ? [project.imageUrl]
                  : []
            ),
            category: project.category,
            externalUrl: project.externalUrl,
            tags: project.tags,
            featured: project.featured,
            published: project.published,
          }
        : {
            slug: "",
            imageUrl: "",
            imageUrls: [] as string[],
            category: "",
            externalUrl: "",
            tags: "[]",
            featured: false,
            published: true,
          },
    [project]
  )

  const [form, setForm] = useState(defaultForm)

  useEffect(() => {
    setForm(defaultForm)
  }, [defaultForm])

  useEffect(() => {
    if (!project || !open) return

    const projectUrls =
      Array.isArray(project.imageUrls) && project.imageUrls.length > 0
        ? project.imageUrls
        : project.imageUrl
          ? [project.imageUrl]
          : []

    void fetchPlatformBannerImageSlots(project.slug).then((bannerUrls) => {
      const merged = resolveProjectEditImages(project.slug, projectUrls, bannerUrls)
      setForm((prev) => ({
        ...prev,
        imageUrls: merged,
        imageUrl: merged.find((item) => item.trim()) || "",
      }))
    })
  }, [project, open])
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
    const imagePayload = platformImageSlotsToPayload(form.imageUrls)
    onSave(
      {
        slug: form.slug,
        imageUrls: imagePayload.imageUrls,
        imageUrl: imagePayload.imageUrl,
        category: form.category,
        externalUrl: normalizeWebsiteUrl(form.externalUrl),
        tags: form.tags,
        featured: form.featured,
        published: form.published,
      },
      effectiveTransFields
    )
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto bg-card border-border text-foreground">
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
                className="rounded-xl bg-background border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <div className="space-y-2">
              <Label>{t("admin.project_category") || "Category"}</Label>
              <Input
                value={form.category}
                onChange={(e) => updateForm("category", e.target.value)}
                placeholder="Infrastructure"
                className="rounded-xl bg-background border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <div className="space-y-2">
              <Label>
                {t("admin.project_website_url") || t("admin.project_external_url") || "Website URL"}
              </Label>
              <Input
                value={form.externalUrl}
                onChange={(e) => updateForm("externalUrl", e.target.value)}
                placeholder="https://your-domain.com"
                className="rounded-xl bg-background border-border text-foreground placeholder:text-muted-foreground"
              />
              <p className="text-[11px] text-muted-foreground">
                {t("admin.project_website_url_hint") || "ادخل رابط موقع المنصة (سيتم إضافة https:// تلقائياً عند الحاجة)."}
              </p>
            </div>
            <div className="space-y-2">
              <Label>{t("admin.project_tags") || "Tags (JSON)"}</Label>
              <Input
                value={form.tags}
                onChange={(e) => updateForm("tags", e.target.value)}
                placeholder='["React", "TypeScript"]'
                className="rounded-xl bg-background border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>
          </div>

          {/* ── Platform card images (3 slots like frontend cards) ── */}
          <div className="space-y-3">
            <div>
              <Label>{t("admin.project_images") || "صور كارت المنصة"}</Label>
              <p className="mt-1 text-[11px] text-muted-foreground">
                {t("admin.project_images_hint") ||
                  "أضف صوراً متعددة لكارت المنصة — يمكنك إضافتها وإعادة ترتيبها بالأسهم."}
              </p>
            </div>
            <PlatformCardImagesEditor
              values={form.imageUrls}
              onChange={(imageUrls) =>
                setForm((prev) => ({
                  ...prev,
                  imageUrls,
                  imageUrl: normalizePlatformImageUrls(imageUrls)[0] || "",
                }))
              }
            />
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
