"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Users, Shield, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useI18n } from "@/lib/i18n-context"
import { toast } from "sonner"

interface User {
  id: string
  name: string
  email: string
  role: string
  avatar: string
}

export function UsersTab() {
  const { t } = useI18n()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/settings")
        const data = await res.json()
        // Users are stored in settings for simplicity
      } catch {}
      setLoading(false)
    }
    load()
  }, [])

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Users className="h-5 w-5" />
        {t("admin.users") || "Users"}
      </h2>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-border/50 bg-card p-6"
      >
        <p className="text-muted-foreground text-sm">
          {t("admin.users_desc") || "User management. Registration and login are available through the platform."}
        </p>
      </motion.div>
    </div>
  )
}
