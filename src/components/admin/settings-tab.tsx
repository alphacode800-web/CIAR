"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Save,
  Loader2,
  ChevronDown,
  Settings,
  Globe,
  Phone,
  Share2,
  Wrench,
  Mail,
  Clock,
  MapPin,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { useI18n, ALL_LOCALES, LOCALE_NAMES } from "@/lib/i18n-context"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

/* ─── Animation variants ────────────────────────────────────────────────── */

const sectionVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: "easeOut" },
  }),
}

/* ─── Types ─────────────────────────────────────────────────────────────── */

interface SettingSection {
  id: string
  icon: React.ElementType
  titleKey: string
  titleFallback: string
  descKey: string
  descFallback: string
  defaultOpen: boolean
  fields: SettingField[]
}

interface SettingField {
  key: string
  labelKey: string
  labelFallback: string
  descKey?: string
  descFallback?: string
  type: "text" | "textarea" | "select" | "switch"
  options?: string[]
  placeholder?: string
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
    <div
      className={cn(
        "rounded-2xl border backdrop-blur-xl overflow-hidden",
        "border-[oklch(0.78_0.14_82/10%)] bg-[oklch(0.14_0.028_265/40%)]",
        "[html:not(.dark)_&]:bg-white/70 [html:not(.dark)_&]:border-[oklch(0.78_0.14_82/18%)]",
        className
      )}
    >
      <span className="absolute top-0 start-0 w-5 h-5 border-t border-s border-[oklch(0.78_0.14_82/30%)] rounded-tl-2xl pointer-events-none" />
      <span className="absolute bottom-0 end-0 w-5 h-5 border-b border-e border-[oklch(0.78_0.14_82/30%)] rounded-br-2xl pointer-events-none" />
      {children}
    </div>
  )
}

/* ─── Main Component ────────────────────────────────────────────────────── */

export function SettingsTab() {
  const { t } = useI18n()
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    general: true,
    contact: false,
    social: false,
    advanced: false,
  })

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/settings")
        const data = await res.json()
        setSettings(data)
      } catch {
        // ignore
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

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
      toast.success(t("admin.settings_saved") || "Settings saved successfully")
    } catch {
      toast.error(t("admin.settings_save_failed") || "Failed to save settings")
    } finally {
      setSaving(false)
    }
  }

  const toggleSection = (id: string) => {
    setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  /* ── Section definitions ── */

  const sections: SettingSection[] = [
    {
      id: "general",
      icon: Settings,
      titleKey: "admin.settings_general",
      titleFallback: "General Settings",
      descKey: "admin.settings_general_desc",
      descFallback: "Basic site configuration",
      defaultOpen: true,
      fields: [
        {
          key: "site_name",
          labelKey: "admin.setting_site_name",
          labelFallback: "Site Name",
          descKey: "admin.setting_site_name_desc",
          descFallback: "The name displayed in the browser tab and public pages",
          type: "text",
          placeholder: "CIAR",
        },
        {
          key: "site_description",
          labelKey: "admin.setting_site_desc",
          labelFallback: "Site Description",
          descKey: "admin.setting_site_desc_desc",
          descFallback: "A brief description used for SEO and social sharing",
          type: "textarea",
          placeholder: "CIAR - Digital Services Platform",
        },
        {
          key: "default_locale",
          labelKey: "admin.setting_default_locale",
          labelFallback: "Default Locale",
          descKey: "admin.setting_default_locale_desc",
          descFallback: "The default language for new visitors",
          type: "select",
          options: ALL_LOCALES,
        },
        {
          key: "available_locales",
          labelKey: "admin.setting_available_locales",
          labelFallback: "Available Locales",
          descKey: "admin.setting_available_locales_desc",
          descFallback: "Comma-separated locale codes (e.g. en,ar,fr,es,de)",
          type: "text",
          placeholder: "en,ar,fr,es,de",
        },
      ],
    },
    {
      id: "contact",
      icon: Phone,
      titleKey: "admin.settings_contact",
      titleFallback: "Contact Information",
      descKey: "admin.settings_contact_desc",
      descFallback: "Company contact details shown across the site",
      defaultOpen: false,
      fields: [
        {
          key: "contact_email",
          labelKey: "admin.setting_email",
          labelFallback: "Contact Email",
          descKey: "admin.setting_email_desc",
          descFallback: "Primary email address for inquiries",
          type: "text",
          placeholder: "info@ciar.com",
        },
        {
          key: "contact_phone",
          labelKey: "admin.setting_phone",
          labelFallback: "Phone Number",
          descKey: "admin.setting_phone_desc",
          descFallback: "Phone number for customer support",
          type: "text",
          placeholder: "+1 (555) 000-0000",
        },
        {
          key: "contact_address",
          labelKey: "admin.setting_address",
          labelFallback: "Address",
          descKey: "admin.setting_address_desc",
          descFallback: "Physical office or business address",
          type: "textarea",
          placeholder: "123 Business Street, City, Country",
        },
        {
          key: "working_hours",
          labelKey: "admin.setting_working_hours",
          labelFallback: "Working Hours",
          descKey: "admin.setting_working_hours_desc",
          descFallback: "Business operating hours displayed to visitors",
          type: "text",
          placeholder: "Mon-Fri: 9:00 AM - 6:00 PM",
        },
      ],
    },
    {
      id: "social",
      icon: Share2,
      titleKey: "admin.settings_social",
      titleFallback: "Social Media Links",
      descKey: "admin.settings_social_desc",
      descFallback: "Social media profile URLs for the website footer",
      defaultOpen: false,
      fields: [
        {
          key: "social_facebook",
          labelKey: "admin.setting_facebook",
          labelFallback: "Facebook",
          descKey: "admin.setting_facebook_desc",
          descFallback: "Your Facebook page URL",
          type: "text",
          placeholder: "https://facebook.com/ciar",
        },
        {
          key: "social_twitter",
          labelKey: "admin.setting_twitter",
          labelFallback: "Twitter / X",
          descKey: "admin.setting_twitter_desc",
          descFallback: "Your Twitter or X profile URL",
          type: "text",
          placeholder: "https://x.com/ciar",
        },
        {
          key: "social_linkedin",
          labelKey: "admin.setting_linkedin",
          labelFallback: "LinkedIn",
          descKey: "admin.setting_linkedin_desc",
          descFallback: "Your LinkedIn company page URL",
          type: "text",
          placeholder: "https://linkedin.com/company/ciar",
        },
        {
          key: "social_instagram",
          labelKey: "admin.setting_instagram",
          labelFallback: "Instagram",
          descKey: "admin.setting_instagram_desc",
          descFallback: "Your Instagram business profile URL",
          type: "text",
          placeholder: "https://instagram.com/ciar",
        },
        {
          key: "social_youtube",
          labelKey: "admin.setting_youtube",
          labelFallback: "YouTube",
          descKey: "admin.setting_youtube_desc",
          descFallback: "Your YouTube channel URL",
          type: "text",
          placeholder: "https://youtube.com/@ciar",
        },
      ],
    },
    {
      id: "advanced",
      icon: Wrench,
      titleKey: "admin.settings_advanced",
      titleFallback: "Advanced Settings",
      descKey: "admin.settings_advanced_desc",
      descFallback: "Performance and feature configuration",
      defaultOpen: false,
      fields: [
        {
          key: "maintenance_mode",
          labelKey: "admin.setting_maintenance",
          labelFallback: "Maintenance Mode",
          descKey: "admin.setting_maintenance_desc",
          descFallback: "Show a maintenance page to visitors. Admins can still access the site.",
          type: "switch",
        },
        {
          key: "items_per_page",
          labelKey: "admin.setting_items_per_page",
          labelFallback: "Items Per Page",
          descKey: "admin.setting_items_per_page_desc",
          descFallback: "Number of items displayed per page in public listings",
          type: "text",
          placeholder: "12",
        },
        {
          key: "enable_registrations",
          labelKey: "admin.setting_registrations",
          labelFallback: "Enable User Registrations",
          descKey: "admin.setting_registrations_desc",
          descFallback: "Allow new users to create accounts on the platform",
          type: "switch",
        },
        {
          key: "enable_contact_form",
          labelKey: "admin.setting_contact_form",
          labelFallback: "Enable Contact Form",
          descKey: "admin.setting_contact_form_desc",
          descFallback: "Display the contact form on the public website",
          type: "switch",
        },
      ],
    },
  ]

  /* ── Render ── */

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h2 className="text-2xl font-bold gradient-text flex items-center gap-2">
          <Settings className="h-6 w-6 text-[oklch(0.78_0.14_82)]" />
          {t("admin.settings") || "Settings"}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          {t("admin.settings_page_desc") ||
            "Manage your site configuration, contact details, and advanced options"}
        </p>
      </motion.div>

      <div className="glow-line-gold" />

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {sections.map((section, sectionIndex) => {
            const Icon = section.icon
            const isOpen = openSections[section.id] ?? section.defaultOpen

            return (
              <motion.div
                key={section.id}
                custom={sectionIndex}
                variants={sectionVariants}
                initial="hidden"
                animate="visible"
              >
                <GlassCard>
                  <Collapsible
                    open={isOpen}
                    onOpenChange={() => toggleSection(section.id)}
                  >
                    {/* Section Header / Trigger */}
                    <CollapsibleTrigger className="flex items-center gap-4 w-full p-5 text-start hover:bg-[oklch(0.78_0.14_82/3%)] transition-colors">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[oklch(0.78_0.14_82/20%)] to-[oklch(0.72_0.13_75/10%)] flex items-center justify-center shrink-0">
                        <Icon className="h-5 w-5 text-[oklch(0.78_0.14_82)]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-semibold text-foreground">
                          {t(section.titleKey) || section.titleFallback}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {t(section.descKey) || section.descFallback}
                        </p>
                      </div>
                      <motion.div
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.25 }}
                      >
                        <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                      </motion.div>
                    </CollapsibleTrigger>

                    {/* Section Content */}
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <CollapsibleContent>
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                          >
                            <div className="px-5 pb-5">
                              <Separator className="mb-5 bg-[oklch(0.78_0.14_82/10%)]" />
                              <div className="space-y-5">
                                {section.fields.map((field, fieldIndex) => (
                                  <motion.div
                                    key={field.key}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{
                                      delay: fieldIndex * 0.05,
                                      duration: 0.3,
                                    }}
                                    className="space-y-2"
                                  >
                                    <div className="flex items-center justify-between">
                                      <Label className="text-sm font-medium">
                                        {t(field.labelKey) || field.labelFallback}
                                      </Label>
                                      {field.type === "switch" && (
                                        <Switch
                                          checked={
                                            settings[field.key] === "true" ||
                                            settings[field.key] === "1"
                                          }
                                          onCheckedChange={(checked) =>
                                            updateSetting(
                                              field.key,
                                              checked ? "true" : "false"
                                            )
                                          }
                                          className="data-[state=checked]:bg-[oklch(0.78_0.14_82)]"
                                        />
                                      )}
                                    </div>
                                    {field.descKey && (
                                      <p className="text-xs text-muted-foreground">
                                        {t(field.descKey) || field.descFallback}
                                      </p>
                                    )}
                                    {field.type === "text" && (
                                      <Input
                                        value={settings[field.key] || ""}
                                        onChange={(e) =>
                                          updateSetting(field.key, e.target.value)
                                        }
                                        placeholder={field.placeholder}
                                        className="rounded-xl bg-[oklch(0.14_0.028_265/60%)] border-[oklch(0.78_0.14_82/10%)] focus:border-[oklch(0.78_0.14_82/30%)]"
                                      />
                                    )}
                                    {field.type === "textarea" && (
                                      <Textarea
                                        value={settings[field.key] || ""}
                                        onChange={(e) =>
                                          updateSetting(field.key, e.target.value)
                                        }
                                        placeholder={field.placeholder}
                                        rows={3}
                                        className="rounded-xl bg-[oklch(0.14_0.028_265/60%)] border-[oklch(0.78_0.14_82/10%)] focus:border-[oklch(0.78_0.14_82/30%)] resize-none"
                                      />
                                    )}
                                    {field.type === "select" && (
                                      <Select
                                        value={settings[field.key] || ""}
                                        onValueChange={(v) =>
                                          updateSetting(field.key, v)
                                        }
                                      >
                                        <SelectTrigger className="rounded-xl bg-[oklch(0.14_0.028_265/60%)] border-[oklch(0.78_0.14_82/10%)]">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {field.options?.map((opt) => (
                                            <SelectItem key={opt} value={opt}>
                                              {LOCALE_NAMES[opt as keyof typeof LOCALE_NAMES] || opt}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    )}
                                  </motion.div>
                                ))}
                              </div>
                            </div>
                          </motion.div>
                        </CollapsibleContent>
                      )}
                    </AnimatePresence>
                  </Collapsible>
                </GlassCard>
              </motion.div>
            )
          })}

          {/* Save Button */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.35 }}
            className="flex items-center justify-end pt-2"
          >
            <Button
              onClick={handleSave}
              disabled={saving}
              size="lg"
              className={cn(
                "gap-2 rounded-xl px-8 font-medium",
                "bg-gradient-to-r from-[oklch(0.78_0.14_82)] to-[oklch(0.72_0.13_75)]",
                "text-[oklch(0.15_0.04_80)] hover:opacity-90",
                "shadow-[0_4px_20px_oklch(0.78_0.14_82/25%)]"
              )}
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {t("common.save") || "Save All Settings"}
            </Button>
          </motion.div>
        </div>
      )}
    </div>
  )
}
