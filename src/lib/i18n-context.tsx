"use client"

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react"
import { DEFAULT_TRANSLATIONS } from "@/lib/default-translations"

type Locale = "en" | "ar" | "fr" | "es" | "de"

interface I18nContextType {
  locale: Locale
  setLocale: (l: Locale) => void
  t: (key: string) => string
  dir: "ltr" | "rtl"
  translations: Record<string, string>
  loading: boolean
}

const I18nContext = createContext<I18nContextType>({
  locale: "en",
  setLocale: () => {},
  t: (key: string) => key,
  dir: "ltr",
  translations: {},
  loading: true,
})

export const RTL_LOCALES: Locale[] = ["ar"]
const ALL_LOCALES: Locale[] = ["en", "ar", "fr", "es", "de"]

const LOCALE_NAMES: Record<Locale, string> = {
  en: "English",
  ar: "العربية",
  fr: "Français",
  es: "Español",
  de: "Deutsch",
}

export { ALL_LOCALES, LOCALE_NAMES }
export type { Locale }

function normalizeBrand(value: string): string {
  return value.replace(/سيار/g, "CIAR")
}

function stripEmojis(value: string): string {
  // Removes emoji presentation characters and common symbols used as emojis.
  return value
    .replace(/[\u{1F300}-\u{1FAFF}]/gu, "")
    .replace(/[\u{2600}-\u{27BF}]/gu, "")
    .replace(/[\u{FE0F}]/gu, "")
    .trim()
}

function isPlaceholderValue(value: string): boolean {
  const v = value.trim()
  if (!v) return true

  const exactPlaceholders = new Set([
    "Title",
    "Subtitle",
    "Badge",
    "How Title",
    "How Subtitle",
    "Mission Title",
    "Mission Text",
    "Vision Title",
    "Vision Text",
    "Values Title",
    "No Results",
    "No Results Desc",
  ])
  if (exactPlaceholders.has(v)) return true

  // Common seeded placeholders: "Service Real Estate Name", "... Desc"
  if (/^Service .+ (Name|Desc)$/i.test(v)) return true
  if (/^(Title|Subtitle|Badge)(\s*\d+)?$/i.test(v)) return true
  if (/^(Name|Email|Subject|Message)\s+(Label|Placeholder)\d*$/i.test(v)) return true
  if (/^No Results(\s+Desc)?$/i.test(v)) return true

  return false
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en")
  const [translations, setTranslations] = useState<Record<string, string>>({})
  const [englishFallback, setEnglishFallback] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const cacheRef = useRef<Record<string, Record<string, string>>>({})

  const fetchTranslations = useCallback(async (loc: Locale) => {
    if (cacheRef.current[loc]) {
      setTranslations(cacheRef.current[loc])
      return
    }
    try {
      const res = await fetch(`/api/translations?locale=${loc}`)
      const data = await res.json()
      cacheRef.current[loc] = data
      setTranslations(data)
    } catch {
      setTranslations({})
    }
  }, [])

  const setLocale = useCallback(
    (l: Locale) => {
      setLocaleState(l)
      fetchTranslations(l)
    },
    [fetchTranslations]
  )

  const t = useCallback(
    (key: string): string => {
      const localizedValue = translations[key]
      if (typeof localizedValue === "string" && localizedValue.trim().length > 0 && !isPlaceholderValue(localizedValue)) {
        return stripEmojis(normalizeBrand(localizedValue))
      }

      const fallbackValue = englishFallback[key]
      if (typeof fallbackValue === "string" && fallbackValue.trim().length > 0 && !isPlaceholderValue(fallbackValue)) {
        return stripEmojis(normalizeBrand(fallbackValue))
      }

      const bundledLocaleValue = DEFAULT_TRANSLATIONS[locale]?.[key]
      if (typeof bundledLocaleValue === "string" && bundledLocaleValue.trim().length > 0) {
        return stripEmojis(normalizeBrand(bundledLocaleValue))
      }

      const bundledEnglishValue = DEFAULT_TRANSLATIONS.en?.[key]
      if (typeof bundledEnglishValue === "string" && bundledEnglishValue.trim().length > 0) {
        return stripEmojis(normalizeBrand(bundledEnglishValue))
      }

      // Last-resort readable fallback instead of raw key.
      return key
        .split(".")
        .pop()
        ?.replace(/_/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase()) || key
    },
    [translations, englishFallback, locale]
  )

  const dir = RTL_LOCALES.includes(locale) ? "rtl" : "ltr"

  useEffect(() => {
    fetchTranslations(locale).then(() => setLoading(false))
  }, [locale, fetchTranslations])

  useEffect(() => {
    const bootstrapEnglishFallback = async () => {
      if (cacheRef.current.en) {
        setEnglishFallback(cacheRef.current.en)
        return
      }

      try {
        const res = await fetch("/api/translations?locale=en")
        const data = await res.json()
        cacheRef.current.en = data
        setEnglishFallback(data)
      } catch {
        setEnglishFallback({})
      }
    }

    bootstrapEnglishFallback()
  }, [])

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, dir, translations, loading }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  return useContext(I18nContext)
}
