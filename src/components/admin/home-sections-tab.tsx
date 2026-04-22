"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence, Reorder } from "framer-motion"
import {
  LayoutGrid,
  GripVertical,
  Eye,
  EyeOff,
  ChevronUp,
  ChevronDown,
  Save,
  Loader2,
  RotateCcw,
  Layers,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useI18n } from "@/lib/i18n-context"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

/* ─── Types ─────────────────────────────────────────────────────────────── */

interface HomeSection {
  id: string
  name: string
  visible: boolean
  order: number
}

/* ─── Default sections ──────────────────────────────────────────────────── */

const DEFAULT_SECTIONS: HomeSection[] = [
  { id: "hero-slideshow", name: "Hero Slideshow", visible: true, order: 0 },
  { id: "marquee-banner", name: "Marquee Banner", visible: true, order: 1 },
  { id: "about-brief", name: "About Brief", visible: true, order: 2 },
  { id: "trust-badges", name: "Trust Badges", visible: true, order: 3 },
  { id: "services-grid", name: "Services Grid", visible: true, order: 4 },
  { id: "how-it-works", name: "How It Works", visible: true, order: 5 },
  { id: "stats-section", name: "Stats Section", visible: true, order: 6 },
  { id: "platforms-grid", name: "Platforms Grid", visible: true, order: 7 },
  { id: "platform-showcase", name: "Platform Showcase", visible: true, order: 8 },
  { id: "tech-stack", name: "Tech Stack", visible: true, order: 9 },
  { id: "testimonials", name: "Testimonials", visible: true, order: 10 },
  { id: "global-presence", name: "Global Presence", visible: true, order: 11 },
  { id: "team-highlight", name: "Team Highlight", visible: true, order: 12 },
  { id: "awards-banner", name: "Awards Banner", visible: true, order: 13 },
  { id: "news-updates", name: "News & Updates", visible: true, order: 14 },
  { id: "faq-section", name: "FAQ Section", visible: true, order: 15 },
  { id: "newsletter-cta", name: "Newsletter CTA", visible: true, order: 16 },
]

/* ─── Section icon map ──────────────────────────────────────────────────── */

const SECTION_ICONS: Record<string, string> = {
  "hero-slideshow": "🎬",
  "marquee-banner": "📢",
  "about-brief": "🏢",
  "trust-badges": "🛡️",
  "services-grid": "⚡",
  "how-it-works": "📋",
  "stats-section": "📊",
  "platforms-grid": "🌐",
  "platform-showcase": "🖥️",
  "tech-stack": "🔧",
  testimonials: "💬",
  "global-presence": "🌍",
  "team-highlight": "👥",
  "awards-banner": "🏆",
  "news-updates": "📰",
  "faq-section": "❓",
  "newsletter-cta": "✉️",
}

/* ─── Main Component ────────────────────────────────────────────────────── */

export function HomeSectionsTab() {
  const { t } = useI18n()
  const [sections, setSections] = useState<HomeSection[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [resetting, setResetting] = useState(false)

  const fetchSections = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/home-sections")
      const data = await res.json()
      if (data.sections && data.sections.length > 0) {
        setSections(data.sections)
      } else {
        setSections(DEFAULT_SECTIONS)
      }
    } catch {
      setSections(DEFAULT_SECTIONS)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSections()
  }, [fetchSections])

  const toggleVisibility = (sectionId: string) => {
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId ? { ...s, visible: !s.visible } : s
      )
    )
  }

  const moveSection = (index: number, direction: "up" | "down") => {
    setSections((prev) => {
      const next = [...prev]
      const target = direction === "up" ? index - 1 : index + 1
      if (target < 0 || target >= next.length) return prev
      ;[next[index], next[target]] = [next[target], next[index]]
      return next.map((s, i) => ({ ...s, order: i }))
    })
  }

  const saveSections = async () => {
    setSaving(true)
    try {
      const ordered = sections.map((s, i) => ({ ...s, order: i }))
      const res = await fetch("/api/admin/home-sections", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sections: ordered }),
      })
      if (res.ok) {
        toast.success(t("admin.sections_saved") || "Section order saved successfully")
      } else {
        toast.error(t("admin.sections_save_failed") || "Failed to save section order")
      }
    } catch {
      toast.error(t("admin.sections_save_failed") || "Failed to save section order")
    } finally {
      setSaving(false)
    }
  }

  const resetToDefault = async () => {
    setResetting(true)
    try {
      const res = await fetch("/api/admin/home-sections", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sections: DEFAULT_SECTIONS }),
      })
      if (res.ok) {
        setSections(DEFAULT_SECTIONS)
        toast.success(t("admin.sections_reset") || "Sections reset to default order")
      } else {
        toast.error(t("admin.sections_reset_failed") || "Failed to reset sections")
      }
    } catch {
      toast.error(t("admin.sections_reset_failed") || "Failed to reset sections")
    } finally {
      setResetting(false)
    }
  }

  const visibleCount = sections.filter((s) => s.visible).length

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-72 rounded-xl" />
        <Skeleton className="h-16 rounded-xl" />
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h2 className="text-2xl font-bold gradient-text flex items-center gap-2">
          <LayoutGrid className="h-6 w-6 text-[oklch(0.78_0.14_82)]" />
          {t("admin.home_sections") || "Home Page Sections"}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          {t("admin.home_sections_desc") || "Drag to reorder and toggle visibility of home page sections"}
        </p>
      </motion.div>

      <div className="glow-line-gold" />

      {/* ── Stats Bar ── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-wrap items-center gap-3 p-4 rounded-2xl border border-[oklch(0.78_0.14_82/12%)] bg-[oklch(0.14_0.028_265/45%)] backdrop-blur-xl dark:bg-[oklch(0.12_0.03_265/55%)]"
      >
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-[oklch(0.78_0.14_82)]" />
          <span className="text-sm text-muted-foreground">
            {sections.length} sections total
          </span>
        </div>
        <div className="w-px h-4 bg-[oklch(0.78_0.14_82/15%)]" />
        <div className="flex items-center gap-2">
          <Eye className="h-4 w-4 text-emerald-400" />
          <span className="text-sm text-muted-foreground">
            {visibleCount} visible
          </span>
        </div>
        <div className="w-px h-4 bg-[oklch(0.78_0.14_82/15%)]" />
        <div className="flex items-center gap-2">
          <EyeOff className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {sections.length - visibleCount} hidden
          </span>
        </div>
      </motion.div>

      {/* ── Section List ── */}
      <div className="space-y-2">
        <AnimatePresence>
          <Reorder.Group
            axis="y"
            values={sections}
            onReorder={(newOrder) =>
              setSections(newOrder.map((s, i) => ({ ...s, order: i })))
            }
            className="space-y-2"
          >
            {sections.map((section, index) => (
              <Reorder.Item
                key={section.id}
                value={section}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ delay: index * 0.03, duration: 0.3 }}
                whileDrag={{ scale: 1.02, boxShadow: "0 0 24px oklch(0.78 0.14 82/15%)" }}
                className={cn(
                  "group relative flex items-center gap-3 sm:gap-4 p-4 rounded-xl border transition-all cursor-grab active:cursor-grabbing",
                  "border-[oklch(0.78_0.14_82/10%)] bg-[oklch(0.14_0.028_265/45%)] backdrop-blur-lg dark:bg-[oklch(0.12_0.03_265/55%)]",
                  "hover:border-[oklch(0.78_0.14_82/22%)] hover:bg-[oklch(0.78_0.14_82/4%)]",
                  !section.visible && "opacity-60"
                )}
              >
                {/* Order number */}
                <div className="hidden sm:flex w-7 h-7 rounded-lg bg-[oklch(0.78_0.14_82/10%)] items-center justify-center text-xs font-bold text-[oklch(0.78_0.14_82)] shrink-0">
                  {index + 1}
                </div>

                {/* Drag handle */}
                <div className="text-muted-foreground opacity-40 group-hover:opacity-80 transition-opacity shrink-0">
                  <GripVertical className="h-5 w-5" />
                </div>

                {/* Section emoji */}
                <span className="text-lg shrink-0">
                  {SECTION_ICONS[section.id] || "📦"}
                </span>

                {/* Section info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {section.name}
                  </p>
                  <p className="text-[11px] text-muted-foreground font-mono">
                    #{section.id}
                  </p>
                </div>

                {/* Visibility dot */}
                <div className="shrink-0">
                  <span
                    className={cn(
                      "inline-block w-2.5 h-2.5 rounded-full transition-colors",
                      section.visible
                        ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.4)]"
                        : "bg-muted-foreground/30"
                    )}
                  />
                </div>

                {/* Move buttons */}
                <div className="hidden sm:flex items-center gap-0.5 shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      moveSection(index, "up")
                    }}
                    disabled={index === 0}
                    className="p-1 rounded-md hover:bg-[oklch(0.78_0.14_82/10%)] text-muted-foreground hover:text-[oklch(0.78_0.14_82)] transition-colors disabled:opacity-20 disabled:pointer-events-none"
                  >
                    <ChevronUp className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      moveSection(index, "down")
                    }}
                    disabled={index === sections.length - 1}
                    className="p-1 rounded-md hover:bg-[oklch(0.78_0.14_82/10%)] text-muted-foreground hover:text-[oklch(0.78_0.14_82)] transition-colors disabled:opacity-20 disabled:pointer-events-none"
                  >
                    <ChevronDown className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Visibility switch */}
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="shrink-0"
                >
                  <Switch
                    checked={section.visible}
                    onCheckedChange={() => toggleVisibility(section.id)}
                    className="data-[state=checked]:bg-emerald-500"
                  />
                </div>
              </Reorder.Item>
            ))}
          </Reorder.Group>
        </AnimatePresence>
      </div>

      {/* ── Action Buttons ── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex flex-wrap items-center gap-3 pt-2"
      >
        <Button
          onClick={saveSections}
          disabled={saving}
          className="gap-2 btn-gold rounded-xl px-6"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {t("admin.save_order") || "Save Order"}
        </Button>

        <Button
          onClick={resetToDefault}
          disabled={resetting}
          variant="outline"
          className="gap-2 border-[oklch(0.78_0.14_82/20%)] text-[oklch(0.78_0.14_82)] hover:bg-[oklch(0.78_0.14_82/8%)] rounded-xl"
        >
          {resetting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RotateCcw className="h-4 w-4" />
          )}
          {t("admin.reset_default") || "Reset to Default"}
        </Button>
      </motion.div>
    </div>
  )
}
