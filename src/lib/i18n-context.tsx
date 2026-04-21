"use client"

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react"

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

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en")
  const [translations, setTranslations] = useState<Record<string, string>>({})
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
      return translations[key] || key
    },
    [translations]
  )

  const dir = RTL_LOCALES.includes(locale) ? "rtl" : "ltr"

  useEffect(() => {
    fetchTranslations(locale).then(() => setLoading(false))
  }, [locale, fetchTranslations])

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, dir, translations, loading }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  return useContext(I18nContext)
}
