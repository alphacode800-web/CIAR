"use client"

import { createContext, useContext } from "react"

type AdminNavContextValue = {
  setTab: (tab: string) => void
}

export const AdminNavContext = createContext<AdminNavContextValue>({
  setTab: () => {},
})

export function useAdminNav() {
  return useContext(AdminNavContext)
}
