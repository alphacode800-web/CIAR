"use client"

import React, { createContext, useContext, useState } from "react"

interface AuthModalContextType {
  openLogin: () => void
  openRegister: () => void
  close: () => void
  mode: "login" | "register" | null
}

const AuthModalContext = createContext<AuthModalContextType>({
  openLogin: () => {},
  openRegister: () => {},
  close: () => {},
  mode: null,
})

export function AuthModalProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<"login" | "register" | null>(null)

  return (
    <AuthModalContext.Provider value={{
      openLogin: () => setMode("login"),
      openRegister: () => setMode("register"),
      close: () => setMode(null),
      mode,
    }}>
      {children}
    </AuthModalContext.Provider>
  )
}

export function useAuthModal() {
  return useContext(AuthModalContext)
}
