"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from "react"

interface AuthUser {
  id: string
  name: string
  email?: string | null
  phone?: string | null
  role: string
  avatar?: string
}

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  login: (identifier: string, password: string) => Promise<boolean>
  register: (name: string, password: string, email?: string, phone?: string) => Promise<boolean>
  logout: () => void
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => false,
  register: async () => false,
  logout: () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchUser = useCallback(async () => {
    try {
      const token = localStorage.getItem("ciar_token")
      const res = await fetch("/api/auth/me", token ? {
        headers: { Authorization: `Bearer ${token}` },
      } : undefined)
      if (res.ok) {
        const data = await res.json()
        setUser(data?.data?.user ?? data?.user ?? null)
      } else {
        localStorage.removeItem("ciar_token")
      }
    } catch {
      localStorage.removeItem("ciar_token")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchUser() }, [fetchUser])

  const login = async (identifier: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      })
      if (!res.ok) return false
      const data = await res.json()
      const payload = data?.data ?? data
      if (payload?.token) {
        localStorage.setItem("ciar_token", payload.token)
      }
      setUser(payload?.user ?? null)
      return true
    } catch {
      return false
    }
  }

  const register = async (name: string, password: string, email?: string, phone?: string): Promise<boolean> => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, password }),
      })
      if (!res.ok) return false
      const data = await res.json()
      const payload = data?.data ?? data
      if (payload?.token) {
        localStorage.setItem("ciar_token", payload.token)
      }
      setUser(payload?.user ?? null)
      return true
    } catch {
      return false
    }
  }

  const logout = () => {
    localStorage.removeItem("ciar_token")
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
