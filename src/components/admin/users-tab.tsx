"use client"

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import {
  Users,
  Shield,
  UserCircle,
  Search,
  Loader2,
  Trash2,
  MoreHorizontal,
  UserCheck,
  Crown,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useI18n } from "@/lib/i18n-context"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

/* ─── Types ─────────────────────────────────────────────────────────────── */

interface UserData {
  id: string
  name: string
  email: string
  role: string
  avatar: string
  createdAt: string
  updatedAt: string
}

/* ─── Animation variants ────────────────────────────────────────────────── */

const fadeInUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35 },
}

const stagger = {
  animate: { transition: { staggerChildren: 0.05 } },
}

/* ─── Helpers ───────────────────────────────────────────────────────────── */

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  } catch {
    return dateStr
  }
}

/* ─── Main Component ────────────────────────────────────────────────────── */

export function UsersTab() {
  const { t } = useI18n()
  const [users, setUsers] = useState<UserData[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [updatingRole, setUpdatingRole] = useState<string | null>(null)

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/users")
      const data = await res.json()
      setUsers(data.users || [])
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  )

  const admins = users.filter((u) => u.role === "admin")
  const regularUsers = users.filter((u) => u.role !== "admin")

  const changeRole = async (userId: string, newRole: string) => {
    setUpdatingRole(userId)
    try {
      const res = await fetch(`/api/admin/users`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: userId, role: newRole }),
      })
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
        )
        toast.success(`User role updated to ${newRole}`)
      } else {
        toast.error("Failed to update user role")
      }
    } catch {
      toast.error("Failed to update user role")
    } finally {
      setUpdatingRole(null)
    }
  }

  const deleteUser = async (userId: string, name: string) => {
    try {
      const res = await fetch(`/api/admin/users`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: userId }),
      })
      if (res.ok) {
        setUsers((prev) => prev.filter((u) => u.id !== userId))
        toast.success(`User "${name}" deleted`)
      } else {
        toast.error("Failed to delete user")
      }
    } catch {
      toast.error("Failed to delete user")
    }
  }

  const statsCards = [
    {
      label: t("admin.total_users") || "Total Users",
      value: users.length,
      icon: Users,
      gradient: "from-[oklch(0.78_0.14_82/20%)] to-[oklch(0.72_0.13_75/10%)]",
      iconColor: "text-[oklch(0.78_0.14_82)]",
    },
    {
      label: t("admin.admin_users") || "Admins",
      value: admins.length,
      icon: Crown,
      gradient: "from-amber-500/15% to-orange-500/8%",
      iconColor: "text-amber-400",
    },
    {
      label: t("admin.regular_users") || "Regular Users",
      value: regularUsers.length,
      icon: UserCircle,
      gradient: "from-slate-500/15% to-gray-500/8%",
      iconColor: "text-slate-400",
    },
  ]

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h2 className="text-2xl font-bold gradient-text flex items-center gap-2">
          <Users className="h-6 w-6 text-[oklch(0.78_0.14_82)]" />
          {t("admin.user_management") || "User Management"}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          {t("admin.user_management_desc") || "Manage registered users, roles, and permissions"}
        </p>
      </motion.div>

      <div className="glow-line-gold" />

      {/* ── Stats Row ── */}
      <motion.div
        variants={stagger}
        initial="initial"
        animate="animate"
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
      >
        {statsCards.map((card, index) => (
          <motion.div
            key={card.label}
            variants={fadeInUp}
            transition={{ delay: index * 0.08 }}
            className="rounded-2xl border border-[oklch(0.78_0.14_82/12%)] bg-[oklch(0.14_0.028_265/45%)] backdrop-blur-xl p-5 dark:bg-[oklch(0.12_0.03_265/55%)]"
          >
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center",
                  card.gradient
                )}
              >
                <card.icon className={cn("h-5 w-5", card.iconColor)} />
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">
                  {card.value}
                </div>
                <div className="text-xs text-muted-foreground">
                  {card.label}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* ── Search ── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="relative max-w-sm">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("admin.search_users") || "Search by name or email..."}
            className="ps-10 rounded-xl bg-[oklch(0.14_0.028_265/45%)] border-[oklch(0.78_0.14_82/10%)] dark:bg-[oklch(0.12_0.03_265/55%)]"
          />
        </div>
      </motion.div>

      {/* ── Users Table ── */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>
      ) : filteredUsers.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-16 rounded-2xl border border-dashed border-[oklch(0.78_0.14_82/15%)] bg-[oklch(0.14_0.028_265/30%)]"
        >
          <Users className="h-12 w-12 text-muted-foreground/30 mb-4" />
          <p className="text-lg font-medium text-muted-foreground">
            {search ? "No users match your search" : "No users yet"}
          </p>
          <p className="text-sm text-muted-foreground/70 mt-1">
            {search
              ? "Try a different search term"
              : "Users will appear here once they register on the platform"}
          </p>
        </motion.div>
      ) : (
        <motion.div
          variants={stagger}
          initial="initial"
          animate="animate"
          className="space-y-2"
        >
          {/* Table Header */}
          <motion.div
            variants={fadeInUp}
            className="hidden sm:grid grid-cols-[auto_1fr_1fr_auto_auto_auto] gap-4 px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider"
          >
            <div className="w-10" />
            <div>Name</div>
            <div>Email</div>
            <div>Role</div>
            <div>Joined</div>
            <div className="w-10" />
          </motion.div>

          {/* User Rows */}
          {filteredUsers.map((user, index) => (
            <motion.div
              key={user.id}
              variants={fadeInUp}
              transition={{ delay: 0.1 + index * 0.04 }}
              className="group relative flex sm:grid sm:grid-cols-[auto_1fr_1fr_auto_auto_auto] items-center gap-3 sm:gap-4 p-4 rounded-xl border border-[oklch(0.78_0.14_82/8%)] bg-[oklch(0.14_0.028_265/35%)] backdrop-blur-lg dark:bg-[oklch(0.12_0.03_265/45%)] hover:border-[oklch(0.78_0.14_82/18%)] hover:bg-[oklch(0.78_0.14_82/3%)] transition-all"
            >
              {/* Avatar */}
              <div className="shrink-0">
                <div
                  className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold",
                    user.role === "admin"
                      ? "bg-gradient-to-br from-[oklch(0.78_0.14_82/25%)] to-[oklch(0.72_0.13_75/15%)] text-[oklch(0.78_0.14_82)]"
                      : "bg-gradient-to-br from-slate-600/20 to-slate-500/10% text-slate-300"
                  )}
                >
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-full h-full rounded-xl object-cover"
                    />
                  ) : (
                    getInitials(user.name)
                  )}
                </div>
              </div>

              {/* Name */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {user.name}
                </p>
                <p className="text-xs text-muted-foreground sm:hidden truncate">
                  {user.email}
                </p>
              </div>

              {/* Email (desktop) */}
              <div className="hidden sm:block min-w-0">
                <p className="text-sm text-muted-foreground truncate">
                  {user.email}
                </p>
              </div>

              {/* Role Badge */}
              <div className="shrink-0">
                {user.role === "admin" ? (
                  <Badge className="bg-[oklch(0.78_0.14_82/15%)] text-[oklch(0.78_0.14_82)] border-[oklch(0.78_0.14_82/25%)] text-[11px] gap-1 px-2.5 py-0.5">
                    <Shield className="h-3 w-3" />
                    Admin
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="text-[11px] gap-1 px-2.5 py-0.5">
                    <UserCircle className="h-3 w-3" />
                    User
                  </Badge>
                )}
              </div>

              {/* Joined Date (desktop) */}
              <div className="hidden sm:block shrink-0">
                <span className="text-xs text-muted-foreground">
                  {formatDate(user.createdAt)}
                </span>
              </div>

              {/* Actions */}
              <div className="shrink-0">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                      disabled={updatingRole === user.id}
                    >
                      {updatingRole === user.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <MoreHorizontal className="h-4 w-4" />
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    {user.role !== "admin" && (
                      <DropdownMenuItem
                        onClick={() => changeRole(user.id, "admin")}
                        className="gap-2 text-[oklch(0.78_0.14_82)] cursor-pointer"
                      >
                        <Crown className="h-4 w-4" />
                        Promote to Admin
                      </DropdownMenuItem>
                    )}
                    {user.role === "admin" && (
                      <DropdownMenuItem
                        onClick={() => changeRole(user.id, "user")}
                        className="gap-2 cursor-pointer"
                      >
                        <UserCheck className="h-4 w-4" />
                        Demote to User
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => deleteUser(user.id, user.name)}
                      className="gap-2 text-red-400 focus:text-red-400 cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete User
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* ── Footer count ── */}
      {!loading && filteredUsers.length > 0 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-xs text-muted-foreground text-center"
        >
          Showing {filteredUsers.length} of {users.length} users
        </motion.p>
      )}
    </div>
  )
}
