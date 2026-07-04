"use client"

import { useEffect } from "react"
import { applyThemeSettings } from "@/lib/theme-settings"

type UpdatedSettingsEvent = CustomEvent<Record<string, string>>

export function ThemeSettingsApplier() {
  useEffect(() => {
    let mounted = true

    const fetchAndApply = async () => {
      try {
        const res = await fetch("/api/settings")
        if (!res.ok) return
        const data = await res.json()
        if (mounted && data && typeof data === "object") {
          applyThemeSettings(data as Record<string, string>)
        }
      } catch {
        // silent
      }
    }

    const onSettingsUpdated = (event: Event) => {
      const payload = (event as UpdatedSettingsEvent).detail
      if (payload && typeof payload === "object") {
        applyThemeSettings(payload)
      } else {
        void fetchAndApply()
      }
    }

    const onLocaleChanged = () => {
      void fetchAndApply()
    }

    void fetchAndApply()
    window.addEventListener("ciar:settings-updated", onSettingsUpdated as EventListener)
    window.addEventListener("ciar:locale-changed", onLocaleChanged)
    return () => {
      mounted = false
      window.removeEventListener("ciar:settings-updated", onSettingsUpdated as EventListener)
      window.removeEventListener("ciar:locale-changed", onLocaleChanged)
    }
  }, [])

  return null
}

export default ThemeSettingsApplier
