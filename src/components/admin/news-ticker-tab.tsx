"use client"

import { useEffect, useState } from "react"
import { Newspaper, Plus, Trash2, Save, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useI18n } from "@/lib/i18n-context"
import { toast } from "sonner"

const DEFAULT_ITEMS = [
  "Launching new enterprise platforms this quarter",
  "24/7 technical support now available for all clients",
  "New AI-powered modules added to our ecosystem",
  "International expansion across multiple industries",
]

export function NewsTickerTab() {
  const { t } = useI18n()
  const [items, setItems] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function loadItems() {
      try {
        const res = await fetch("/api/admin/news-ticker")
        const data = await res.json()
        setItems(Array.isArray(data.items) && data.items.length > 0 ? data.items : DEFAULT_ITEMS)
      } catch {
        setItems(DEFAULT_ITEMS)
      } finally {
        setLoading(false)
      }
    }
    loadItems()
  }, [])

  const updateItem = (index: number, value: string) => {
    setItems((prev) => prev.map((item, idx) => (idx === index ? value : item)))
  }

  const addItem = () => {
    setItems((prev) => [...prev, ""])
  }

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, idx) => idx !== index))
  }

  const saveItems = async () => {
    const cleaned = items.map((item) => item.trim()).filter(Boolean)
    if (cleaned.length === 0) {
      toast.error(t("admin.action_failed") || "Add at least one news item")
      return
    }

    setSaving(true)
    try {
      const res = await fetch("/api/admin/news-ticker", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: cleaned }),
      })
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}))
        const message =
          typeof payload?.error === "string"
            ? payload.error
            : t("admin.settings_save_failed") || "Failed to save"
        throw new Error(message)
      }
      setItems(cleaned)
      toast.success(t("admin.settings_saved") || "Saved successfully")
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : t("admin.settings_save_failed") || "Failed to save"
      toast.error(message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-10 w-72 rounded-xl bg-muted/40 animate-pulse" />
        <div className="h-24 rounded-xl bg-muted/30 animate-pulse" />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Newspaper className="h-6 w-6 text-[oklch(0.78_0.14_82)]" />
          {t("admin.news_ticker") || "News Ticker"}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          {t("admin.news_ticker_desc") || "Edit the top scrolling news bar on homepage hero."}
        </p>
      </div>

      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={`ticker-${index}`} className="flex items-center gap-2">
            <Input
              value={item}
              onChange={(e) => updateItem(index, e.target.value)}
              placeholder={t("admin.message") || "News item"}
              className="rounded-xl"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => removeItem(index)}
              disabled={items.length <= 1}
              className="shrink-0"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <Button type="button" variant="outline" onClick={addItem} className="gap-2 rounded-xl">
          <Plus className="h-4 w-4" />
          {t("admin.add") || "Add item"}
        </Button>
        <Button type="button" onClick={saveItems} className="gap-2 rounded-xl btn-gold" disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {t("common.save") || "Save"}
        </Button>
      </div>
    </div>
  )
}

