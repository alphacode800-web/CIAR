"use client"

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import {
  Save,
  Loader2,
  Palette,
  Type,
  Layout,
  Sparkles,
  Eye,
  RotateCcw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useI18n } from "@/lib/i18n-context"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

/* ─── Glassmorphism Card Wrapper ──────────────────────────────────────────── */

function GlassCard({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode
  className?: string
  delay?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
      className={cn(
        "rounded-2xl border border-[oklch(0.78_0.14_82/8%)] bg-[oklch(0.14_0.028_265/30%)] backdrop-blur-lg p-6 transition-all duration-200 hover:border-[oklch(0.78_0.14_82/18%)]",
        "dark:bg-[oklch(0.12_0.03_265/40%)]",
        className
      )}
    >
      {children}
    </motion.div>
  )
}

/* ─── Color Input ─────────────────────────────────────────────────────────── */

function ColorInput({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (val: string) => void
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <Label className="text-sm font-medium text-muted-foreground min-w-32">
        {label}
      </Label>
      <div className="flex items-center gap-3">
        <div className="relative">
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-9 h-9 rounded-lg border border-[oklch(0.78_0.14_82/20%)] cursor-pointer bg-transparent appearance-none [&::-webkit-color-swatch-wrapper]:p-0.5 [&::-webkit-color-swatch]:rounded-md [&::-webkit-color-swatch]:border-none"
          />
        </div>
        <span className="text-xs font-mono text-muted-foreground bg-muted/50 px-2.5 py-1 rounded-md min-w-[72px] text-center">
          {value}
        </span>
      </div>
    </div>
  )
}

/* ─── Range Field ─────────────────────────────────────────────────────────── */

function RangeField({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  unit = "px",
  icon,
}: {
  label: string
  value: number
  onChange: (val: number) => void
  min: number
  max: number
  step?: number
  unit?: string
  icon?: React.ReactNode
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <Label className="text-sm font-medium text-muted-foreground">
            {label}
          </Label>
        </div>
        <span className="text-xs font-mono text-[oklch(0.78_0.14_82)] bg-[oklch(0.78_0.14_82/8%)] px-2 py-0.5 rounded-md">
          {value}{unit}
        </span>
      </div>
      <Slider
        value={[value]}
        onValueChange={(v) => onChange(v[0])}
        min={min}
        max={max}
        step={step}
        className="w-full [&_[data-slot=slider-range]]:bg-[oklch(0.78_0.14_82)] [&_[data-slot=slider-thumb]]:border-[oklch(0.78_0.14_82)]"
      />
    </div>
  )
}

/* ─── Default Values ──────────────────────────────────────────────────────── */

const DEFAULTS: Record<string, string> = {
  theme_primary_color: "#d4af37",
  theme_secondary_color: "#1a2744",
  theme_accent_color: "#c9a227",
  theme_background_color: "#0a0f1e",
  theme_heading_font: "Geist Sans",
  theme_body_font: "Geist Sans",
  theme_base_font_size: "16",
  theme_max_content_width: "1280",
  theme_sidebar_width: "256",
  theme_border_radius: "12",
  theme_card_padding: "20",
  theme_glassmorphism: "true",
  theme_animations: "true",
  theme_blur_intensity: "12",
}

/* ─── Component ───────────────────────────────────────────────────────────── */

export function AppearanceTab() {
  const { t } = useI18n()
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch("/api/settings")
      const data = await res.json()
      setSettings(data)
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  const get = (key: string) => settings[key] || DEFAULTS[key] || ""

  const updateSetting = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      })
      toast.success(t("admin.settings_saved") || "Appearance settings saved successfully")
    } catch {
      toast.error(t("admin.settings_save_failed") || "Failed to save appearance settings")
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    setSettings(DEFAULTS)
    toast.info(t("admin.settings_reset") || "Settings reset to defaults")
  }

  /* ── Derived preview values ── */
  const primaryColor = get("theme_primary_color")
  const secondaryColor = get("theme_secondary_color")
  const accentColor = get("theme_accent_color")
  const bgColor = get("theme_background_color")
  const borderRadius = parseInt(get("theme_border_radius")) || 12
  const cardPadding = parseInt(get("theme_card_padding")) || 20
  const blurIntensity = parseInt(get("theme_blur_intensity")) || 12
  const glassEnabled = get("theme_glassmorphism") === "true"
  const animationsEnabled = get("theme_animations") === "true"

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48 rounded-xl" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-72 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-80 rounded-2xl" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h2 className="text-2xl font-bold gradient-text">
            {t("admin.appearance") || "Appearance"}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {t("admin.appearance_subtitle") || "Customize the visual theme and layout of your platform."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="gap-2 border-[oklch(0.78_0.14_82/20%)] hover:bg-[oklch(0.78_0.14_82/8%)]"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            {t("admin.reset") || "Reset"}
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={saving}
            className="gap-2 bg-[oklch(0.78_0.14_82)] text-[oklch(0.14_0.028_265)] hover:bg-[oklch(0.73_0.14_82)] font-semibold"
          >
            {saving ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            {t("common.save") || "Save"}
          </Button>
        </div>
      </motion.div>

      <div className="glow-line-gold" />

      {/* ── Grid Layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── Color Palette ── */}
        <GlassCard delay={0.1}>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-lg bg-[oklch(0.78_0.14_82/15%)] flex items-center justify-center">
              <Palette className="h-4 w-4 text-[oklch(0.78_0.14_82)]" />
            </div>
            <h3 className="text-base font-semibold">
              {t("admin.color_palette") || "Color Palette"}
            </h3>
          </div>

          <div className="space-y-4">
            <ColorInput
              label={t("admin.primary_color") || "Primary Color"}
              value={primaryColor}
              onChange={(v) => updateSetting("theme_primary_color", v)}
            />
            <ColorInput
              label={t("admin.secondary_color") || "Secondary Color"}
              value={secondaryColor}
              onChange={(v) => updateSetting("theme_secondary_color", v)}
            />
            <ColorInput
              label={t("admin.accent_color") || "Accent Color"}
              value={accentColor}
              onChange={(v) => updateSetting("theme_accent_color", v)}
            />
            <ColorInput
              label={t("admin.background_color") || "Background Color"}
              value={bgColor}
              onChange={(v) => updateSetting("theme_background_color", v)}
            />
          </div>

          {/* Live swatches */}
          <div className="flex items-center gap-2 mt-5 pt-4 border-t border-border/50">
            <span className="text-xs text-muted-foreground mr-1">
              {t("admin.preview") || "Preview"}
            </span>
            {[primaryColor, secondaryColor, accentColor, bgColor].map((color, i) => (
              <motion.div
                key={i}
                layoutId={`swatch-${i}`}
                className="w-8 h-8 rounded-lg border border-white/10 shadow-sm"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </GlassCard>

        {/* ── Typography ── */}
        <GlassCard delay={0.15}>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-lg bg-[oklch(0.78_0.14_82/15%)] flex items-center justify-center">
              <Type className="h-4 w-4 text-[oklch(0.78_0.14_82)]" />
            </div>
            <h3 className="text-base font-semibold">
              {t("admin.typography") || "Typography"}
            </h3>
          </div>

          <div className="space-y-5">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">
                {t("admin.heading_font") || "Heading Font"}
              </Label>
              <Select
                value={get("theme_heading_font")}
                onValueChange={(v) => updateSetting("theme_heading_font", v)}
              >
                <SelectTrigger className="w-full rounded-xl border-[oklch(0.78_0.14_82/15%)]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["Geist Sans", "Inter", "Plus Jakarta Sans", "Space Grotesk"].map((font) => (
                    <SelectItem key={font} value={font}>
                      {font}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">
                {t("admin.body_font") || "Body Font"}
              </Label>
              <Select
                value={get("theme_body_font")}
                onValueChange={(v) => updateSetting("theme_body_font", v)}
              >
                <SelectTrigger className="w-full rounded-xl border-[oklch(0.78_0.14_82/15%)]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["Geist Sans", "Inter", "Plus Jakarta Sans", "Space Grotesk"].map((font) => (
                    <SelectItem key={font} value={font}>
                      {font}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <RangeField
              label={t("admin.base_font_size") || "Base Font Size"}
              value={parseInt(get("theme_base_font_size")) || 16}
              onChange={(v) => updateSetting("theme_base_font_size", String(v))}
              min={14}
              max={18}
              icon={<Type className="h-3.5 w-3.5 text-muted-foreground" />}
            />
          </div>

          {/* Font preview */}
          <div className="mt-5 pt-4 border-t border-border/50 rounded-lg bg-muted/30 p-4">
            <p className="text-xs text-muted-foreground mb-2">
              {t("admin.font_preview") || "Preview"}
            </p>
            <p className="text-lg font-bold" style={{ fontSize: `${parseInt(get("theme_base_font_size")) + 6}px` }}>
              {t("admin.heading_preview") || "Heading Text Preview"}
            </p>
            <p className="text-sm text-muted-foreground mt-1" style={{ fontSize: `${get("theme_base_font_size")}px` }}>
              {t("admin.body_preview") || "The quick brown fox jumps over the lazy dog. This is body text preview."}
            </p>
          </div>
        </GlassCard>

        {/* ── Layout ── */}
        <GlassCard delay={0.2}>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-lg bg-[oklch(0.78_0.14_82/15%)] flex items-center justify-center">
              <Layout className="h-4 w-4 text-[oklch(0.78_0.14_82)]" />
            </div>
            <h3 className="text-base font-semibold">
              {t("admin.layout") || "Layout"}
            </h3>
          </div>

          <div className="space-y-5">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">
                {t("admin.max_content_width") || "Max Content Width"}
              </Label>
              <Select
                value={get("theme_max_content_width")}
                onValueChange={(v) => updateSetting("theme_max_content_width", v)}
              >
                <SelectTrigger className="w-full rounded-xl border-[oklch(0.78_0.14_82/15%)]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1200">1200px</SelectItem>
                  <SelectItem value="1280">1280px</SelectItem>
                  <SelectItem value="1440">1440px</SelectItem>
                  <SelectItem value="full">{t("admin.full_width") || "Full Width"}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <RangeField
              label={t("admin.sidebar_width") || "Sidebar Width"}
              value={parseInt(get("theme_sidebar_width")) || 256}
              onChange={(v) => updateSetting("theme_sidebar_width", String(v))}
              min={240}
              max={320}
              icon={<Layout className="h-3.5 w-3.5 text-muted-foreground" />}
            />

            <RangeField
              label={t("admin.border_radius") || "Border Radius"}
              value={parseInt(get("theme_border_radius")) || 12}
              onChange={(v) => updateSetting("theme_border_radius", String(v))}
              min={0}
              max={24}
              icon={<div className="w-3.5 h-3.5 border-2 border-muted-foreground rounded" />}
            />

            <RangeField
              label={t("admin.card_padding") || "Card Padding"}
              value={parseInt(get("theme_card_padding")) || 20}
              onChange={(v) => updateSetting("theme_card_padding", String(v))}
              min={16}
              max={32}
              icon={<div className="w-3.5 h-3.5 border border-muted-foreground rounded-sm" />}
            />
          </div>
        </GlassCard>

        {/* ── Effects ── */}
        <GlassCard delay={0.25}>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-lg bg-[oklch(0.78_0.14_82/15%)] flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-[oklch(0.78_0.14_82)]" />
            </div>
            <h3 className="text-base font-semibold">
              {t("admin.effects") || "Effects"}
            </h3>
          </div>

          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">
                  {t("admin.enable_glassmorphism") || "Enable Glassmorphism"}
                </Label>
                <p className="text-xs text-muted-foreground">
                  {t("admin.glassmorphism_desc") || "Frosted glass effect on cards and panels"}
                </p>
              </div>
              <Switch
                checked={glassEnabled}
                onCheckedChange={(checked) =>
                  updateSetting("theme_glassmorphism", String(checked))
                }
                className="data-[state=checked]:bg-[oklch(0.78_0.14_82)]"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">
                  {t("admin.enable_animations") || "Enable Animations"}
                </Label>
                <p className="text-xs text-muted-foreground">
                  {t("admin.animations_desc") || "Smooth transitions and motion effects"}
                </p>
              </div>
              <Switch
                checked={animationsEnabled}
                onCheckedChange={(checked) =>
                  updateSetting("theme_animations", String(checked))
                }
                className="data-[state=checked]:bg-[oklch(0.78_0.14_82)]"
              />
            </div>

            <RangeField
              label={t("admin.blur_intensity") || "Blur Intensity"}
              value={blurIntensity}
              onChange={(v) => updateSetting("theme_blur_intensity", String(v))}
              min={4}
              max={24}
              icon={<Sparkles className="h-3.5 w-3.5 text-muted-foreground" />}
            />
          </div>
        </GlassCard>
      </div>

      {/* ── Live Preview Panel ── */}
      <GlassCard delay={0.3}>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 rounded-lg bg-[oklch(0.78_0.14_82/15%)] flex items-center justify-center">
            <Eye className="h-4 w-4 text-[oklch(0.78_0.14_82)]" />
          </div>
          <h3 className="text-base font-semibold">
            {t("admin.live_preview") || "Live Preview"}
          </h3>
        </div>

        <div
          className="rounded-xl overflow-hidden"
          style={{
            backgroundColor: bgColor,
            border: `1px solid ${primaryColor}22`,
          }}
        >
          {/* Preview top bar */}
          <div
            className="flex items-center gap-2 px-4 py-3"
            style={{ borderBottom: `1px solid ${primaryColor}15` }}
          >
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-400/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-400/60" />
            </div>
            <div className="flex-1 flex justify-center">
              <div
                className="px-3 py-1 rounded-md text-[10px] text-white/50"
                style={{ backgroundColor: `${secondaryColor}80` }}
              >
                ciar.com/dashboard
              </div>
            </div>
          </div>

          {/* Preview content */}
          <div className="p-6 flex flex-col sm:flex-row gap-4">
            {/* Sidebar preview */}
            <div
              className="hidden sm:flex flex-col gap-2 shrink-0"
              style={{ width: `${Math.min(parseInt(get("theme_sidebar_width")) || 256, 200)}px` }}
            >
              {["Dashboard", "Projects", "Settings"].map((item, i) => (
                <div
                  key={item}
                  className={cn(
                    "text-xs px-3 py-2 transition-all",
                    i === 0
                      ? "font-medium"
                      : "text-white/40"
                  )}
                  style={{
                    backgroundColor: i === 0 ? `${primaryColor}15` : "transparent",
                    color: i === 0 ? primaryColor : "white",
                    borderRadius: `${borderRadius * 0.4}px`,
                  }}
                >
                  {item}
                </div>
              ))}
            </div>

            {/* Main content preview */}
            <div className="flex-1 space-y-4">
              {/* Stats row */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Projects", value: "8" },
                  { label: "Views", value: "1.2K" },
                  { label: "Translations", value: "620" },
                ].map((stat) => (
                  <motion.div
                    key={stat.label}
                    animate={animationsEnabled ? { scale: [1, 1.02, 1] } : {}}
                    transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                    className="text-center p-3"
                    style={{
                      backgroundColor: glassEnabled ? `${secondaryColor}40` : `${secondaryColor}90`,
                      backdropFilter: glassEnabled ? `blur(${blurIntensity}px)` : "none",
                      borderRadius: `${borderRadius * 0.6}px`,
                      border: glassEnabled ? `1px solid ${primaryColor}15` : "1px solid transparent",
                    }}
                  >
                    <div className="text-base font-bold" style={{ color: primaryColor }}>
                      {stat.value}
                    </div>
                    <div className="text-[10px] text-white/40 mt-0.5">
                      {stat.label}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Sample card */}
              <motion.div
                animate={animationsEnabled ? { y: [0, -2, 0] } : {}}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                style={{
                  backgroundColor: glassEnabled ? `${secondaryColor}30` : `${secondaryColor}80`,
                  backdropFilter: glassEnabled ? `blur(${blurIntensity}px)` : "none",
                  borderRadius: `${borderRadius}px`,
                  border: glassEnabled ? `1px solid ${primaryColor}15` : "1px solid transparent",
                  padding: `${cardPadding}px`,
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: accentColor }}
                  />
                  <span className="text-xs font-medium text-white/70">
                    Real Estate Platform
                  </span>
                </div>
                <p className="text-[10px] text-white/40 leading-relaxed">
                  Discover premium properties across the region. Advanced search, virtual tours, and expert consultation.
                </p>
                <div className="mt-3 inline-block px-3 py-1 text-[10px] font-medium"
                  style={{
                    backgroundColor: primaryColor,
                    color: secondaryColor,
                    borderRadius: `${borderRadius * 0.4}px`,
                  }}
                >
                  View Details
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  )
}
