"use client"

import React, { createContext, useContext, useState, useCallback } from "react"

interface Currency {
  code: string
  name: string
  flag: string
  symbol: string
}

export const CURRENCIES: Currency[] = [
  { code: "USD", name: "US Dollar", flag: "US", symbol: "$" },
  { code: "EUR", name: "Euro", flag: "EU", symbol: "€" },
  { code: "GBP", name: "British Pound", flag: "GB", symbol: "£" },
  { code: "SAR", name: "Saudi Riyal", flag: "SA", symbol: "ر.س" },
  { code: "AED", name: "UAE Dirham", flag: "AE", symbol: "د.إ" },
  { code: "QAR", name: "Qatari Riyal", flag: "QA", symbol: "ر.ق" },
  { code: "EGP", name: "Egyptian Pound", flag: "EG", symbol: "ج.م" },
  { code: "SDG", name: "Sudanese Pound", flag: "SD", symbol: "ج.س" },
  { code: "TRY", name: "Turkish Lira", flag: "TR", symbol: "₺" },
  { code: "CNY", name: "Chinese Yuan", flag: "CN", symbol: "¥" },
]

interface CurrencyContextType {
  currency: Currency
  setCurrency: (code: string) => void
  formatPrice: (amount: number) => string
}

const CurrencyContext = createContext<CurrencyContextType>({
  currency: CURRENCIES[0],
  setCurrency: () => {},
  formatPrice: (n: number) => n.toString(),
})

function getSavedCurrency(): Currency {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("ciar_currency")
    if (saved) {
      const found = CURRENCIES.find((c) => c.code === saved)
      if (found) return found
    }
  }
  return CURRENCIES[0]
}

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>(() => getSavedCurrency())

  const setCurrency = useCallback((code: string) => {
    const found = CURRENCIES.find((c) => c.code === code)
    if (found) {
      setCurrencyState(found)
      localStorage.setItem("ciar_currency", code)
    }
  }, [])

  const formatPrice = (amount: number) => {
    try {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency.code,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(amount)
    } catch {
      return `${currency.symbol}${amount}`
    }
  }

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatPrice }}>
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency() {
  return useContext(CurrencyContext)
}
