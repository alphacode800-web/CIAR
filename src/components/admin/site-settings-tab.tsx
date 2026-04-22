"use client"

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import {
  Settings,
  Globe,
  Palette,
  Megaphone,
  Footprints,
  Save,
  Loader2,
  Building2,
  Mail,
  Phone,
  MapPin,
  Moon,
  Languages,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useI18n, ALL_LOCALES, LOCALE_NAMES } from "@/lib/i18n-context"
import { toast } from "sonner"

/* ─── Animation variants ────────────────────────────────────────────────── */

const fadeInUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35 },
}

const stagger = {
  animate: { transition: { staggerChildren: 0.04 } },
}

/* ─── Glass Card wrapper ────────────────────────────────────────────────── */

function GlassCard({
  children,
  className = "",
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <motion.div
      {...fadeInUp}
      className={`
        relative rounded-2xl border border-[oklch(0.78_0.14_82/12%)]
        bg-[oklch(0.14_0.028_265/45%)] backdrop-blur-xl p-6
        dark:bg-[oklch(0.12_0.03_265/55%)]
        [html:not(.dark)_&]:bg-white/70 [html:not(.dark)_&]:border-[oklch(0.78_0.14_82/18%)]
        ${className}
      `}
    >
      {/* Gold corner accents */}
      <span className="absolute top-0 start-0 w-5 h-5 border-t border-s border-[oklch(0.78_0.14_82/30%)] rounded-tl-2xl pointer-events-none" />
      <span className="absolute bottom-0 end-0 w-5 h-5 border-b border-e border-[oklch(0.78_0.14_82/30%)] rounded-br-2xl pointer-events-none" />
      {children}
    </motion.div>
  )
}

/* ─── Section Header ────────────────────────────────────────────────────── */

function SectionHeader({
  icon: Icon,
  title,
}: {
  icon: React.ElementType
  title: string
}) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[oklch(0.78_0.14_82/20%)] to-[oklch(0.72_0.13_75/10%)] flex items-center justify-center">
        <Icon className="h-4.5 w-4.5 text-[oklch(0.78_0.14_82)]" />
      </div>
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
    </div>
  )
}

/* ─── Save Button ───────────────────────────────────────────────────────── */

function SaveSectionButton({
  loading,
  onClick,
}: {
  loading: boolean
  onClick: () => void
}) {
  return (
    <motion.div className="flex justify-end mt-5 pt-4 border-t border-[oklch(0.78_0.14_82/8%)]">
      <Button
        onClick={onClick}
        disabled={loading}
        className="gap-2 btn-gold rounded-xl px-6"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Save className="h-4 w-4" />
        )}
        Save Changes
      </Button>
    </motion.div>
  )
}

/* ─── Main Component ────────────────────────────────────────────────────── */

export function SiteSettingsTab() {
  const { t } = useI18n()
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)

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

  const update = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  const toggleSetting = (key: string) => {
    setSettings((prev) => ({
      ...prev,
      [key]: prev[key] === "true" ? "false" : "true",
    }))
  }

  const saveSection = async (keys: string[], sectionName: string) => {
    setSaving(sectionName)
    try {
      const sectionData: Record<string, string> = {}
      keys.forEach((k) => {
        sectionData[k] = settings[k] || ""
      })
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sectionData),
      })
      if (res.ok) {
        toast.success(`${sectionName} saved successfully`)
      } else {
        toast.error(`Failed to save ${sectionName}`)
      }
    } catch {
      toast.error(`Failed to save ${sectionName}`)
    } finally {
      setSaving(null)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64 rounded-xl" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-80 rounded-2xl" />
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
          <Settings className="h-6 w-6 text-[oklch(0.78_0.14_82)]" />
          {t("admin.site_settings") || "Site Settings"}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          {t("admin.site_settings_desc") || "Configure your website preferences and appearance"}
        </p>
      </motion.div>

      <div className="glow-line-gold" />

      {/* ── Tabbed Sections ── */}
      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="bg-[oklch(0.14_0.028_265/60%)] border border-[oklch(0.78_0.14_82/12%)] rounded-xl h-auto p-1 flex-wrap">
          <TabsTrigger
            value="general"
            className="gap-2 rounded-lg data-[state=active]:bg-[oklch(0.78_0.14_82/15%)] data-[state=active]:text-[oklch(0.78_0.14_82)]"
          >
            <Globe className="h-3.5 w-3.5" />
            General
          </TabsTrigger>
          <TabsTrigger
            value="theme"
            className="gap-2 rounded-lg data-[state=active]:bg-[oklch(0.78_0.14_82/15%)] data-[state=active]:text-[oklch(0.78_0.14_82)]"
          >
            <Palette className="h-3.5 w-3.5" />
            Theme
          </TabsTrigger>
          <TabsTrigger
            value="announcement"
            className="gap-2 rounded-lg data-[state=active]:bg-[oklch(0.78_0.14_82/15%)] data-[state=active]:text-[oklch(0.78_0.14_82)]"
          >
            <Megaphone className="h-3.5 w-3.5" />
            Announcement
          </TabsTrigger>
          <TabsTrigger
            value="footer"
            className="gap-2 rounded-lg data-[state=active]:bg-[oklch(0.78_0.14_82/15%)] data-[state=active]:text-[oklch(0.78_0.14_82)]"
          >
            <Footprints className="h-3.5 w-3.5" />
            Footer
          </TabsTrigger>
        </TabsList>

        {/* ── General Settings ── */}
        <TabsContent value="general">
          <GlassCard>
            <SectionHeader
              icon={Building2}
              title={t("admin.general_settings") || "General Settings"}
            />
            <motion.div
              variants={stagger}
              initial="initial"
              animate="animate"
              className="space-y-4"
            >
              <motion.div {...fadeInUp} className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                  {t("admin.site_name") || "Site Name"}
                </Label>
                <Input
                  value={settings.site_name || ""}
                  onChange={(e) => update("site_name", e.target.value)}
                  placeholder="CIAR"
                  className="rounded-xl bg-[oklch(0.14_0.028_265/60%)] border-[oklch(0.78_0.14_82/10%)]"
                />
              </motion.div>

              <motion.div {...fadeInUp} className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  {t("admin.site_description") || "Site Description"}
                </Label>
                <Textarea
                  value={settings.site_description || ""}
                  onChange={(e) => update("site_description", e.target.value)}
                  placeholder="A brief description of your company..."
                  rows={3}
                  className="rounded-xl bg-[oklch(0.14_0.028_265/60%)] border-[oklch(0.78_0.14_82/10%)] resize-none"
                />
              </motion.div>

              <motion.div {...fadeInUp} className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Languages className="h-3.5 w-3.5 text-muted-foreground" />
                  {t("admin.default_language") || "Default Language"}
                </Label>
                <Select
                  value={settings.default_locale || "en"}
                  onValueChange={(v) => update("default_locale", v)}
                >
                  <SelectTrigger className="rounded-xl bg-[oklch(0.14_0.028_265/60%)] border-[oklch(0.78_0.14_82/10%)]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ALL_LOCALES.map((loc) => (
                      <SelectItem key={loc} value={loc}>
                        {LOCALE_NAMES[loc]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </motion.div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <motion.div {...fadeInUp} className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                    {t("admin.company_email") || "Company Email"}
                  </Label>
                  <Input
                    value={settings.company_email || ""}
                    onChange={(e) => update("company_email", e.target.value)}
                    type="email"
                    placeholder="info@ciar.com"
                    className="rounded-xl bg-[oklch(0.14_0.028_265/60%)] border-[oklch(0.78_0.14_82/10%)]"
                  />
                </motion.div>

                <motion.div {...fadeInUp} className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                    {t("admin.company_phone") || "Company Phone"}
                  </Label>
                  <Input
                    value={settings.company_phone || ""}
                    onChange={(e) => update("company_phone", e.target.value)}
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    className="rounded-xl bg-[oklch(0.14_0.028_265/60%)] border-[oklch(0.78_0.14_82/10%)]"
                  />
                </motion.div>
              </div>

              <motion.div {...fadeInUp} className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                  {t("admin.company_address") || "Company Address"}
                </Label>
                <Textarea
                  value={settings.company_address || ""}
                  onChange={(e) => update("company_address", e.target.value)}
                  placeholder="123 Business Ave, Suite 100, City, Country"
                  rows={2}
                  className="rounded-xl bg-[oklch(0.14_0.028_265/60%)] border-[oklch(0.78_0.14_82/10%)] resize-none"
                />
              </motion.div>
            </motion.div>

            <SaveSectionButton
              loading={saving === "general"}
              onClick={() =>
                saveSection(
                  [
                    "site_name",
                    "site_description",
                    "default_locale",
                    "company_email",
                    "company_phone",
                    "company_address",
                  ],
                  "General settings"
                )
              }
            />
          </GlassCard>
        </TabsContent>

        {/* ── Theme Settings ── */}
        <TabsContent value="theme">
          <GlassCard>
            <SectionHeader
              icon={Palette}
              title={t("admin.theme_settings") || "Theme Settings"}
            />
            <motion.div
              variants={stagger}
              initial="initial"
              animate="animate"
              className="space-y-5"
            >
              <motion.div {...fadeInUp} className="space-y-2">
                <Label className="text-sm font-medium">
                  {t("admin.primary_color") || "Primary Color"}
                </Label>
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl border-2 border-[oklch(0.78_0.14_82/20%)] shadow-lg"
                    style={{ backgroundColor: settings.primary_color || "#d4af37" }}
                  />
                  <Input
                    value={settings.primary_color || "#d4af37"}
                    onChange={(e) => update("primary_color", e.target.value)}
                    type="color"
                    className="w-20 h-10 rounded-xl cursor-pointer bg-transparent border-[oklch(0.78_0.14_82/10%)]"
                  />
                  <Input
                    value={settings.primary_color || "#d4af37"}
                    onChange={(e) => update("primary_color", e.target.value)}
                    placeholder="#d4af37"
                    className="rounded-xl bg-[oklch(0.14_0.028_265/60%)] border-[oklch(0.78_0.14_82/10%)] flex-1"
                  />
                </div>
              </motion.div>

              <motion.div
                {...fadeInUp}
                className="flex items-center justify-between p-4 rounded-xl bg-[oklch(0.14_0.028_265/40%)] border border-[oklch(0.78_0.14_82/8%)]"
              >
                <div className="flex items-center gap-3">
                  <Moon className="h-4.5 w-4.5 text-[oklch(0.78_0.14_82)]" />
                  <div>
                    <Label className="text-sm font-medium">
                      {t("admin.enable_dark_mode") || "Enable Dark Mode"}
                    </Label>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {t("admin.dark_mode_desc") || "Use dark navy background by default"}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={settings.dark_mode !== "false"}
                  onCheckedChange={() => toggleSetting("dark_mode")}
                />
              </motion.div>

              <motion.div
                {...fadeInUp}
                className="flex items-center justify-between p-4 rounded-xl bg-[oklch(0.14_0.028_265/40%)] border border-[oklch(0.78_0.14_82/8%)]"
              >
                <div className="flex items-center gap-3">
                  <Languages className="h-4.5 w-4.5 text-[oklch(0.78_0.14_82)]" />
                  <div>
                    <Label className="text-sm font-medium">
                      {t("admin.enable_rtl") || "Enable RTL for Arabic"}
                    </Label>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {t("admin.rtl_desc") || "Automatically switch layout direction for Arabic"}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={settings.enable_rtl !== "false"}
                  onCheckedChange={() => toggleSetting("enable_rtl")}
                />
              </motion.div>
            </motion.div>

            <SaveSectionButton
              loading={saving === "theme"}
              onClick={() =>
                saveSection(
                  ["primary_color", "dark_mode", "enable_rtl"],
                  "Theme settings"
                )
              }
            />
          </GlassCard>
        </TabsContent>

        {/* ── Announcement Bar ── */}
        <TabsContent value="announcement">
          <GlassCard>
            <SectionHeader
              icon={Megaphone}
              title={t("admin.announcement_bar") || "Announcement Bar"}
            />
            <motion.div
              variants={stagger}
              initial="initial"
              animate="animate"
              className="space-y-5"
            >
              <motion.div
                {...fadeInUp}
                className="flex items-center justify-between p-4 rounded-xl bg-[oklch(0.14_0.028_265/40%)] border border-[oklch(0.78_0.14_82/8%)]"
              >
                <div className="flex items-center gap-3">
                  <Megaphone className="h-4.5 w-4.5 text-[oklch(0.78_0.14_82)]" />
                  <div>
                    <Label className="text-sm font-medium">
                      {t("admin.enable_announcement") || "Enable Announcement Bar"}
                    </Label>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {t("admin.announcement_desc") || "Show a promotional banner at the top of the site"}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={settings.announcement_enabled === "true"}
                  onCheckedChange={() => toggleSetting("announcement_enabled")}
                />
              </motion.div>

              <motion.div {...fadeInUp} className="space-y-2">
                <Label className="text-sm font-medium">
                  {t("admin.announcement_text") || "Announcement Text"}
                </Label>
                <Input
                  value={settings.announcement_text || ""}
                  onChange={(e) => update("announcement_text", e.target.value)}
                  placeholder="🎉 Special offer — 20% off all services this month!"
                  className="rounded-xl bg-[oklch(0.14_0.028_265/60%)] border-[oklch(0.78_0.14_82/10%)]"
                />
              </motion.div>

              <motion.div {...fadeInUp} className="space-y-2">
                <Label className="text-sm font-medium">
                  {t("admin.announcement_link") || "Announcement Link"}
                </Label>
                <Input
                  value={settings.announcement_link || ""}
                  onChange={(e) => update("announcement_link", e.target.value)}
                  placeholder="https://example.com/offer"
                  className="rounded-xl bg-[oklch(0.14_0.028_265/60%)] border-[oklch(0.78_0.14_82/10%)]"
                />
              </motion.div>

              <motion.div {...fadeInUp} className="space-y-2">
                <Label className="text-sm font-medium">
                  {t("admin.announcement_color") || "Announcement Color"}
                </Label>
                <Select
                  value={settings.announcement_color || "gold"}
                  onValueChange={(v) => update("announcement_color", v)}
                >
                  <SelectTrigger className="rounded-xl bg-[oklch(0.14_0.028_265/60%)] border-[oklch(0.78_0.14_82/10%)]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gold">
                      <span className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-[oklch(0.78_0.14_82)]" />
                        Gold
                      </span>
                    </SelectItem>
                    <SelectItem value="emerald">
                      <span className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-emerald-500" />
                        Emerald
                      </span>
                    </SelectItem>
                    <SelectItem value="red">
                      <span className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-red-500" />
                        Red
                      </span>
                    </SelectItem>
                    <SelectItem value="blue">
                      <span className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-blue-500" />
                        Blue
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </motion.div>

              {/* Preview */}
              <motion.div
                {...fadeInUp}
                className="p-3 rounded-xl bg-[oklch(0.14_0.028_265/30%)] border border-[oklch(0.78_0.14_82/6%)]"
              >
                <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wider">
                  Preview
                </p>
                <div
                  className={`
                    px-4 py-2.5 rounded-lg text-center text-sm font-medium
                    ${settings.announcement_color === "emerald" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : ""}
                    ${settings.announcement_color === "red" ? "bg-red-500/20 text-red-400 border border-red-500/30" : ""}
                    ${settings.announcement_color === "blue" ? "bg-blue-500/20 text-blue-400 border border-blue-500/30" : ""}
                    ${(!settings.announcement_color || settings.announcement_color === "gold") ? "bg-[oklch(0.78_0.14_82/15%)] text-[oklch(0.78_0.14_82)] border border-[oklch(0.78_0.14_82/25%)]" : ""}
                  `}
                >
                  {settings.announcement_text || "Your announcement will appear here..."}
                </div>
              </motion.div>
            </motion.div>

            <SaveSectionButton
              loading={saving === "announcement"}
              onClick={() =>
                saveSection(
                  [
                    "announcement_enabled",
                    "announcement_text",
                    "announcement_link",
                    "announcement_color",
                  ],
                  "Announcement settings"
                )
              }
            />
          </GlassCard>
        </TabsContent>

        {/* ── Footer Settings ── */}
        <TabsContent value="footer">
          <GlassCard>
            <SectionHeader
              icon={Footprints}
              title={t("admin.footer_settings") || "Footer Settings"}
            />
            <motion.div
              variants={stagger}
              initial="initial"
              animate="animate"
              className="space-y-5"
            >
              <motion.div {...fadeInUp} className="space-y-2">
                <Label className="text-sm font-medium">
                  {t("admin.footer_copyright") || "Footer Copyright Text"}
                </Label>
                <Input
                  value={settings.footer_copyright || ""}
                  onChange={(e) => update("footer_copyright", e.target.value)}
                  placeholder="© 2024 CIAR. All rights reserved."
                  className="rounded-xl bg-[oklch(0.14_0.028_265/60%)] border-[oklch(0.78_0.14_82/10%)]"
                />
              </motion.div>

              <motion.div {...fadeInUp} className="space-y-2">
                <Label className="text-sm font-medium">
                  {t("admin.footer_social_links") || "Footer Social Links (JSON)"}
                </Label>
                <Textarea
                  value={settings.footer_social_links || ""}
                  onChange={(e) => update("footer_social_links", e.target.value)}
                  placeholder='{"twitter": "https://twitter.com/ciar", "linkedin": "https://linkedin.com/company/ciar", "facebook": "https://facebook.com/ciar"}'
                  rows={4}
                  className="rounded-xl bg-[oklch(0.14_0.028_265/60%)] border-[oklch(0.78_0.14_82/10%)] font-mono text-sm resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  Enter social links as valid JSON with keys: twitter, linkedin, facebook, instagram, youtube
                </p>
              </motion.div>

              <motion.div
                {...fadeInUp}
                className="flex items-center justify-between p-4 rounded-xl bg-[oklch(0.14_0.028_265/40%)] border border-[oklch(0.78_0.14_82/8%)]"
              >
                <div>
                  <Label className="text-sm font-medium">
                    {t("admin.show_newsletter") || "Show Newsletter in Footer"}
                  </Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {t("admin.newsletter_footer_desc") || "Display email subscription form in the footer area"}
                  </p>
                </div>
                <Switch
                  checked={settings.footer_newsletter !== "false"}
                  onCheckedChange={() => toggleSetting("footer_newsletter")}
                />
              </motion.div>
            </motion.div>

            <SaveSectionButton
              loading={saving === "footer"}
              onClick={() =>
                saveSection(
                  [
                    "footer_copyright",
                    "footer_social_links",
                    "footer_newsletter",
                  ],
                  "Footer settings"
                )
              }
            />
          </GlassCard>
        </TabsContent>
      </Tabs>
    </div>
  )
}
