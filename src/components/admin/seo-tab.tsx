"use client"

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import {
  SearchCode,
  Globe,
  Share2,
  Map,
  Save,
  Loader2,
  Image as ImageIcon,
  Link,
  Eye,
  FileText,
  Code2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useI18n } from "@/lib/i18n-context"
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
      <span className="absolute top-0 start-0 w-5 h-5 border-t border-s border-[oklch(0.78_0.14_82/30%)] rounded-tl-2xl pointer-events-none" />
      <span className="absolute bottom-0 end-0 w-5 h-5 border-b border-e border-[oklch(0.78_0.14_82/30%)] rounded-br-2xl pointer-events-none" />
      {children}
    </motion.div>
  )
}

function SectionHeader({
  icon: Icon,
  title,
  badge,
}: {
  icon: React.ElementType
  title: string
  badge?: string
}) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[oklch(0.78_0.14_82/20%)] to-[oklch(0.72_0.13_75/10%)] flex items-center justify-center">
        <Icon className="h-4.5 w-4.5 text-[oklch(0.78_0.14_82)]" />
      </div>
      <div>
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        {badge && (
          <p className="text-xs text-muted-foreground mt-0.5">{badge}</p>
        )}
      </div>
    </div>
  )
}

/* ─── Main Component ────────────────────────────────────────────────────── */

export function SeoTab() {
  const { t } = useI18n()
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [ogPreviewUrl, setOgPreviewUrl] = useState("")

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch("/api/settings")
      const data = await res.json()
      setSettings(data)
      if (data.seo_og_image) setOgPreviewUrl(data.seo_og_image)
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

  const generateSitemapPreview = () => {
    const siteUrl = settings.seo_canonical || "https://ciar.com"
    const lines = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
      `  <url>`,
      `    <loc>${siteUrl}</loc>`,
      `    <changefreq>weekly</changefreq>`,
      `    <priority>1.0</priority>`,
      `  </url>`,
      `  <url>`,
      `    <loc>${siteUrl}/projects</loc>`,
      `    <changefreq>weekly</changefreq>`,
      `    <priority>0.9</priority>`,
      `  </url>`,
      `  <url>`,
      `    <loc>${siteUrl}/about</loc>`,
      `    <changefreq>monthly</changefreq>`,
      `    <priority>0.8</priority>`,
      `  </url>`,
      `  <url>`,
      `    <loc>${siteUrl}/contact</loc>`,
      `    <changefreq>monthly</changefreq>`,
      `    <priority>0.7</priority>`,
      `  </url>`,
      "</urlset>",
    ]
    return lines.join("\n")
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64 rounded-xl" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-80 rounded-2xl" />
          ))}
        </div>
      </div>
    )
  }

  const metaTitle = settings.seo_meta_title || ""
  const metaDesc = settings.seo_meta_description || ""
  const titleChars = metaTitle.length
  const descChars = metaDesc.length
  const titleStatus =
    titleChars === 0
      ? "neutral"
      : titleChars <= 60
        ? "good"
        : titleChars <= 70
          ? "warn"
          : "bad"
  const descStatus =
    descChars === 0
      ? "neutral"
      : descChars <= 160
        ? "good"
        : descChars <= 170
          ? "warn"
          : "bad"

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h2 className="text-2xl font-bold gradient-text flex items-center gap-2">
          <SearchCode className="h-6 w-6 text-[oklch(0.78_0.14_82)]" />
          {t("admin.seo_settings") || "SEO & Meta Tags"}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          {t("admin.seo_desc") || "Optimize your site for search engines and social media sharing"}
        </p>
      </motion.div>

      <div className="glow-line-gold" />

      <Tabs defaultValue="page-seo" className="space-y-6">
        <TabsList className="bg-[oklch(0.14_0.028_265/60%)] border border-[oklch(0.78_0.14_82/12%)] rounded-xl h-auto p-1 flex-wrap">
          <TabsTrigger
            value="page-seo"
            className="gap-2 rounded-lg data-[state=active]:bg-[oklch(0.78_0.14_82/15%)] data-[state=active]:text-[oklch(0.78_0.14_82)]"
          >
            <SearchCode className="h-3.5 w-3.5" />
            Page SEO
          </TabsTrigger>
          <TabsTrigger
            value="social"
            className="gap-2 rounded-lg data-[state=active]:bg-[oklch(0.78_0.14_82/15%)] data-[state=active]:text-[oklch(0.78_0.14_82)]"
          >
            <Share2 className="h-3.5 w-3.5" />
            Social Cards
          </TabsTrigger>
          <TabsTrigger
            value="sitemap"
            className="gap-2 rounded-lg data-[state=active]:bg-[oklch(0.78_0.14_82/15%)] data-[state=active]:text-[oklch(0.78_0.14_82)]"
          >
            <Map className="h-3.5 w-3.5" />
            Sitemap
          </TabsTrigger>
        </TabsList>

        {/* ── Page SEO Settings ── */}
        <TabsContent value="page-seo">
          <GlassCard>
            <SectionHeader
              icon={Globe}
              title={t("admin.page_seo") || "Page SEO Settings"}
              badge={t("admin.page_seo_desc") || "Configure meta tags for search engine optimization"}
            />
            <motion.div
              variants={stagger}
              initial="initial"
              animate="animate"
              className="space-y-5"
            >
              {/* Meta Title */}
              <motion.div {...fadeInUp} className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                    {t("admin.meta_title") || "Meta Title"}
                  </Label>
                  <Badge
                    variant={
                      titleStatus === "good"
                        ? "default"
                        : titleStatus === "warn"
                          ? "secondary"
                          : titleStatus === "bad"
                            ? "destructive"
                            : "outline"
                    }
                    className="text-[10px] px-2 h-5"
                  >
                    {titleChars}/60
                  </Badge>
                </div>
                <Input
                  value={settings.seo_meta_title || ""}
                  onChange={(e) => update("seo_meta_title", e.target.value)}
                  placeholder="CIAR — Premium Digital Services Platform"
                  className="rounded-xl bg-[oklch(0.14_0.028_265/60%)] border-[oklch(0.78_0.14_82/10%)]"
                />
                <p className="text-xs text-muted-foreground">
                  Optimal length: 50-60 characters. Currently shown in search results.
                </p>
              </motion.div>

              {/* Meta Description */}
              <motion.div {...fadeInUp} className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">
                    {t("admin.meta_description") || "Meta Description"}
                  </Label>
                  <Badge
                    variant={
                      descStatus === "good"
                        ? "default"
                        : descStatus === "warn"
                          ? "secondary"
                          : descStatus === "bad"
                            ? "destructive"
                            : "outline"
                    }
                    className="text-[10px] px-2 h-5"
                  >
                    {descChars}/160
                  </Badge>
                </div>
                <Textarea
                  value={settings.seo_meta_description || ""}
                  onChange={(e) => update("seo_meta_description", e.target.value)}
                  placeholder="CIAR delivers world-class digital services across real estate, logistics, education, and more..."
                  rows={3}
                  className="rounded-xl bg-[oklch(0.14_0.028_265/60%)] border-[oklch(0.78_0.14_82/10%)] resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  Optimal length: 150-160 characters.
                </p>
              </motion.div>

              {/* OG Image */}
              <motion.div {...fadeInUp} className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <ImageIcon className="h-3.5 w-3.5 text-muted-foreground" />
                  {t("admin.og_image") || "OG Image URL"}
                </Label>
                <div className="flex gap-3">
                  <Input
                    value={settings.seo_og_image || ""}
                    onChange={(e) => {
                      update("seo_og_image", e.target.value)
                      setOgPreviewUrl(e.target.value)
                    }}
                    placeholder="https://ciar.com/images/og-banner.png"
                    className="rounded-xl bg-[oklch(0.14_0.028_265/60%)] border-[oklch(0.78_0.14_82/10%)] flex-1"
                  />
                </div>
                {ogPreviewUrl && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-3 rounded-xl overflow-hidden border border-[oklch(0.78_0.14_82/10%)] bg-[oklch(0.14_0.028_265/30%)]"
                  >
                    <div className="relative aspect-[1.91/1] bg-gradient-to-br from-[oklch(0.78_0.14_82/10%)] to-[oklch(0.14_0.028_265/60%)] flex items-center justify-center">
                      <img
                        src={ogPreviewUrl}
                        alt="OG Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          ;(e.target as HTMLImageElement).style.display = "none"
                        }}
                      />
                    </div>
                    <div className="px-3 py-2 border-t border-[oklch(0.78_0.14_82/8%)] flex items-center gap-2">
                      <Eye className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Recommended: 1200×630px (1.91:1 ratio)</span>
                    </div>
                  </motion.div>
                )}
              </motion.div>

              {/* Canonical URL */}
              <motion.div {...fadeInUp} className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Link className="h-3.5 w-3.5 text-muted-foreground" />
                  {t("admin.canonical_url") || "Canonical URL"}
                </Label>
                <Input
                  value={settings.seo_canonical || ""}
                  onChange={(e) => update("seo_canonical", e.target.value)}
                  placeholder="https://ciar.com"
                  className="rounded-xl bg-[oklch(0.14_0.028_265/60%)] border-[oklch(0.78_0.14_82/10%)]"
                />
              </motion.div>

              {/* Robots Meta */}
              <motion.div {...fadeInUp} className="space-y-2">
                <Label className="text-sm font-medium">
                  {t("admin.robots_meta") || "Robots Meta"}
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  <Select
                    value={settings.seo_robots_index || "index"}
                    onValueChange={(v) => update("seo_robots_index", v)}
                  >
                    <SelectTrigger className="rounded-xl bg-[oklch(0.14_0.028_265/60%)] border-[oklch(0.78_0.14_82/10%)]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="index">Index</SelectItem>
                      <SelectItem value="noindex">No Index</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={settings.seo_robots_follow || "follow"}
                    onValueChange={(v) => update("seo_robots_follow", v)}
                  >
                    <SelectTrigger className="rounded-xl bg-[oklch(0.14_0.028_265/60%)] border-[oklch(0.78_0.14_82/10%)]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="follow">Follow</SelectItem>
                      <SelectItem value="nofollow">No Follow</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </motion.div>

              {/* Search Preview */}
              <motion.div
                {...fadeInUp}
                className="p-4 rounded-xl bg-[oklch(0.14_0.028_265/30%)] border border-[oklch(0.78_0.14_82/8%)]"
              >
                <p className="text-xs text-muted-foreground mb-3 font-medium uppercase tracking-wider">
                  {t("admin.search_preview") || "Google Search Preview"}
                </p>
                <div className="max-w-lg">
                  <p className="text-base text-[#8ab4f8] hover:underline truncate cursor-pointer">
                    {metaTitle || "Your Page Title Will Appear Here"}
                  </p>
                  <p className="text-xs text-[#bdc1c6] mt-0.5 truncate">
                    {settings.seo_canonical || "https://ciar.com"}
                  </p>
                  <p className="text-sm text-[#bdc1c6] mt-1 line-clamp-2 leading-relaxed">
                    {metaDesc || "Your meta description will be displayed here. Make it compelling and relevant to attract clicks from search results."}
                  </p>
                </div>
              </motion.div>
            </motion.div>

            <motion.div className="flex justify-end mt-5 pt-4 border-t border-[oklch(0.78_0.14_82/8%)]">
              <Button
                onClick={() =>
                  saveSection(
                    [
                      "seo_meta_title",
                      "seo_meta_description",
                      "seo_og_image",
                      "seo_canonical",
                      "seo_robots_index",
                      "seo_robots_follow",
                    ],
                    "Page SEO settings"
                  )
                }
                disabled={saving === "page-seo"}
                className="gap-2 btn-gold rounded-xl px-6"
              >
                {saving === "page-seo" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Save SEO Settings
              </Button>
            </motion.div>
          </GlassCard>
        </TabsContent>

        {/* ── Social Media Cards ── */}
        <TabsContent value="social">
          <GlassCard>
            <SectionHeader
              icon={Share2}
              title={t("admin.social_cards") || "Social Media Cards"}
              badge={t("admin.social_cards_desc") || "Control how your site looks when shared on social platforms"}
            />
            <motion.div
              variants={stagger}
              initial="initial"
              animate="animate"
              className="space-y-5"
            >
              <motion.div {...fadeInUp} className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                  {t("admin.og_title") || "OG Title"}
                </Label>
                <Input
                  value={settings.seo_og_title || ""}
                  onChange={(e) => update("seo_og_title", e.target.value)}
                  placeholder="CIAR — Premium Digital Services"
                  className="rounded-xl bg-[oklch(0.14_0.028_265/60%)] border-[oklch(0.78_0.14_82/10%)]"
                />
                <p className="text-xs text-muted-foreground">
                  Shown when page is shared on Facebook, LinkedIn, etc.
                </p>
              </motion.div>

              <motion.div {...fadeInUp} className="space-y-2">
                <Label className="text-sm font-medium">
                  {t("admin.og_description") || "OG Description"}
                </Label>
                <Textarea
                  value={settings.seo_og_description || ""}
                  onChange={(e) => update("seo_og_description", e.target.value)}
                  placeholder="Discover CIAR's comprehensive suite of digital services..."
                  rows={3}
                  className="rounded-xl bg-[oklch(0.14_0.028_265/60%)] border-[oklch(0.78_0.14_82/10%)] resize-none"
                />
              </motion.div>

              <motion.div {...fadeInUp} className="space-y-2">
                <Label className="text-sm font-medium">
                  {t("admin.twitter_card_type") || "Twitter Card Type"}
                </Label>
                <Select
                  value={settings.seo_twitter_card || "summary_large_image"}
                  onValueChange={(v) => update("seo_twitter_card", v)}
                >
                  <SelectTrigger className="rounded-xl bg-[oklch(0.14_0.028_265/60%)] border-[oklch(0.78_0.14_82/10%)]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="summary_large_image">Summary Large Image</SelectItem>
                    <SelectItem value="summary">Summary</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  "Summary Large Image" shows a big preview image. "Summary" is a compact card.
                </p>
              </motion.div>

              {/* Social Card Preview */}
              <motion.div
                {...fadeInUp}
                className="p-4 rounded-xl bg-[oklch(0.14_0.028_265/30%)] border border-[oklch(0.78_0.14_82/8%)]"
              >
                <p className="text-xs text-muted-foreground mb-3 font-medium uppercase tracking-wider">
                  Social Share Preview
                </p>
                <div className="rounded-xl border border-[oklch(0.78_0.14_82/12%)] overflow-hidden max-w-md bg-[oklch(0.14_0.028_265/60%)]">
                  {ogPreviewUrl && (
                    <div className="aspect-[1.91/1] bg-gradient-to-br from-[oklch(0.78_0.14_82/10%)] to-[oklch(0.14_0.028_265/80%)] relative">
                      <img
                        src={ogPreviewUrl}
                        alt="Social Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          ;(e.target as HTMLImageElement).style.display = "none"
                        }}
                      />
                    </div>
                  )}
                  <div className="p-3">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">
                      {settings.seo_canonical || "ciar.com"}
                    </p>
                    <p className="text-sm font-semibold text-foreground mt-1 line-clamp-1">
                      {settings.seo_og_title || settings.seo_meta_title || "Your Page Title"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {settings.seo_og_description || settings.seo_meta_description || "Your page description will appear here when shared on social media."}
                    </p>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            <motion.div className="flex justify-end mt-5 pt-4 border-t border-[oklch(0.78_0.14_82/8%)]">
              <Button
                onClick={() =>
                  saveSection(
                    [
                      "seo_og_title",
                      "seo_og_description",
                      "seo_twitter_card",
                    ],
                    "Social card settings"
                  )
                }
                disabled={saving === "social"}
                className="gap-2 btn-gold rounded-xl px-6"
              >
                {saving === "social" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Save Social Settings
              </Button>
            </motion.div>
          </GlassCard>
        </TabsContent>

        {/* ── Sitemap Preview ── */}
        <TabsContent value="sitemap">
          <GlassCard>
            <SectionHeader
              icon={Map}
              title={t("admin.sitemap_preview") || "Sitemap Preview"}
              badge={t("admin.sitemap_desc") || "Preview of how your XML sitemap will look"}
            />
            <motion.div {...fadeInUp}>
              <div className="relative">
                <div className="absolute top-3 end-3">
                  <Badge variant="outline" className="text-[10px] gap-1 bg-[oklch(0.78_0.14_82/8%)] border-[oklch(0.78_0.14_82/15%)]">
                    <Code2 className="h-3 w-3 text-[oklch(0.78_0.14_82)]" />
                    XML
                  </Badge>
                </div>
                <Textarea
                  readOnly
                  value={generateSitemapPreview()}
                  rows={18}
                  className="rounded-xl bg-[oklch(0.14_0.028_265/60%)] border-[oklch(0.78_0.14_82/10%)] font-mono text-xs leading-relaxed resize-none text-[oklch(0.78_0.14_82/80%)]"
                />
              </div>
              <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                <Map className="h-3.5 w-3.5" />
                <span>
                  {t("admin.sitemap_info") || "The sitemap will be auto-generated based on your canonical URL and published pages."}
                </span>
              </div>
            </motion.div>
          </GlassCard>
        </TabsContent>
      </Tabs>
    </div>
  )
}
