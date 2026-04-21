"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Save, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
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
import { useI18n, ALL_LOCALES, LOCALE_NAMES } from "@/lib/i18n-context"
import { toast } from "sonner"

export function SettingsTab() {
  const { t } = useI18n()
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

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
      toast.success(t("admin.settings_saved") || "Settings saved")
    } catch {
      toast.error(t("admin.settings_save_failed") || "Failed to save settings")
    } finally {
      setSaving(false)
    }
  }

  const settingFields = [
    {
      key: "site_name",
      label: t("admin.setting_site_name") || "Site Name",
      type: "text" as const,
    },
    {
      key: "default_locale",
      label: t("admin.setting_default_locale") || "Default Locale",
      type: "select" as const,
      options: ALL_LOCALES,
    },
    {
      key: "available_locales",
      label: t("admin.setting_available_locales") || "Available Locales (JSON)",
      type: "text" as const,
    },
  ]

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">{t("admin.settings")}</h2>

      {loading ? (
        <Skeleton className="h-64 rounded-2xl" />
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="rounded-2xl border border-border/50 bg-card p-6 space-y-6"
        >
          {settingFields.map((field, index) => (
            <motion.div
              key={field.key}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
              className="space-y-2"
            >
              <Label>{field.label}</Label>
              {field.type === "select" ? (
                <Select
                  value={settings[field.key] || ""}
                  onValueChange={(v) => updateSetting(field.key, v)}
                >
                  <SelectTrigger className="rounded-xl">
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
              ) : (
                <Input
                  value={settings[field.key] || ""}
                  onChange={(e) => updateSetting(field.key, e.target.value)}
                  className="rounded-xl"
                />
              )}
            </motion.div>
          ))}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Button
              onClick={handleSave}
              disabled={saving}
              className="gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {t("common.save")}
            </Button>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}
