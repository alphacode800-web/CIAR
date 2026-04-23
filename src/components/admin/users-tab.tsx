"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
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
  UserPlus,
  Mail,
  Pencil,
  Ban,
  CheckCircle2,
  XCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
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
  active: boolean
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

function getRoleBadge(role: string) {
  switch (role) {
    case "admin":
      return {
        label: "Admin",
        className: "bg-[oklch(0.78_0.14_82/15%)] text-[oklch(0.78_0.14_82)] border-[oklch(0.78_0.14_82/25%)]",
        icon: Crown,
      }
    case "editor":
      return {
        label: "Editor",
        className: "bg-sky-500/15% text-sky-400 border-sky-500/25%",
        icon: Pencil,
      }
    default:
      return {
        label: "Viewer",
        className: "bg-slate-500/15% text-slate-400 border-slate-500/25%",
        icon: UserCircle,
      }
  }
}

/* ─── Main Component ────────────────────────────────────────────────────── */

export function UsersTab() {
  const { t } = useI18n()
  const [users, setUsers] = useState<UserData[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [updatingRole, setUpdatingRole] = useState<string | null>(null)

  // Add user dialog
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [newUser, setNewUser] = useState({ name: "", email: "", role: "user" })
  const [adding, setAdding] = useState(false)

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<UserData | null>(null)
  const [deleting, setDeleting] = useState(false)

  /* ── Fetch users ── */

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

  /* ── Filter ── */

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
    const matchesRole = roleFilter === "all" || u.role === roleFilter
    return matchesSearch && matchesRole
  })

  const admins = users.filter((u) => u.role === "admin")
  const editors = users.filter((u) => u.role === "editor")
  const viewers = users.filter((u) => u.role !== "admin" && u.role !== "editor")

  /* ── Role management ── */

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
        toast.success(t("admin.role_updated") || `User role updated to ${newRole}`)
      } else {
        toast.error(t("admin.role_update_failed") || "Failed to update user role")
      }
    } catch {
      toast.error(t("admin.role_update_failed") || "Failed to update user role")
    } finally {
      setUpdatingRole(null)
    }
  }

  /* ── Toggle active status ── */

  const toggleActive = async (userId: string, currentActive: boolean) => {
    try {
      const res = await fetch(`/api/admin/users`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: userId, active: !currentActive }),
      })
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === userId ? { ...u, active: !currentActive } : u
          )
        )
        toast.success(
          currentActive
            ? (t("admin.user_deactivated") || "User deactivated")
            : (t("admin.user_activated") || "User activated")
        )
      }
    } catch {
      toast.error(t("admin.status_update_failed") || "Failed to update status")
    }
  }

  /* ── Add user ── */

  const handleAddUser = async () => {
    if (!newUser.name.trim() || !newUser.email.trim()) {
      toast.error(t("admin.fill_required_fields") || "Please fill in all required fields")
      return
    }
    setAdding(true)
    try {
      const res = await fetch(`/api/admin/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      })
      if (res.ok) {
        toast.success(t("admin.user_added") || "User added successfully")
        setNewUser({ name: "", email: "", role: "user" })
        setAddDialogOpen(false)
        fetchUsers()
      } else {
        toast.error(t("admin.add_user_failed") || "Failed to add user")
      }
    } catch {
      toast.error(t("admin.add_user_failed") || "Failed to add user")
    } finally {
      setAdding(false)
    }
  }

  /* ── Delete user ── */

  const handleDeleteUser = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/admin/users`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: deleteTarget.id }),
      })
      if (res.ok) {
        setUsers((prev) => prev.filter((u) => u.id !== deleteTarget.id))
        toast.success(t("admin.user_deleted") || `User "${deleteTarget.name}" deleted`)
        setDeleteTarget(null)
      } else {
        toast.error(t("admin.delete_user_failed") || "Failed to delete user")
      }
    } catch {
      toast.error(t("admin.delete_user_failed") || "Failed to delete user")
    } finally {
      setDeleting(false)
    }
  }

  /* ── Role filter pills ── */

  const rolePills = [
    { value: "all", label: t("admin.all_roles") || "All", count: users.length },
    { value: "admin", label: t("admin.admins") || "Admins", count: admins.length },
    { value: "editor", label: t("admin.editors") || "Editors", count: editors.length },
    { value: "user", label: t("admin.viewers") || "Viewers", count: viewers.length },
  ]

  /* ── Stats cards ── */

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
      label: t("admin.active_users") || "Active",
      value: users.filter((u) => u.active !== false).length,
      icon: CheckCircle2,
      gradient: "from-emerald-500/15% to-green-500/8%",
      iconColor: "text-emerald-400",
    },
  ]

  /* ── Render ── */

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
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
        <Button
          onClick={() => setAddDialogOpen(true)}
          className="gap-2 bg-gradient-to-r from-[oklch(0.78_0.14_82)] to-[oklch(0.72_0.13_75)] text-[oklch(0.15_0.04_80)] hover:opacity-90 rounded-xl"
        >
          <UserPlus className="h-4 w-4" />
          {t("admin.add_user") || "Add User"}
        </Button>
      </div>

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

      {/* ── Search + Role filter pills ── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col sm:flex-row items-start sm:items-center gap-3"
      >
        <div className="relative flex-1 w-full sm:max-w-sm">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("admin.search_users") || "Search by name or email..."}
            className="ps-10 rounded-xl bg-[oklch(0.14_0.028_265/45%)] border-[oklch(0.78_0.14_82/10%)]"
          />
        </div>
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[oklch(0.14_0.028_265/40%)] border border-[oklch(0.78_0.14_82/8%)]">
          {rolePills.map((pill) => (
            <button
              key={pill.value}
              onClick={() => setRoleFilter(pill.value)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 flex items-center gap-1.5",
                roleFilter === pill.value
                  ? "bg-[oklch(0.78_0.14_82/15%)] text-[oklch(0.78_0.14_82)] shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-[oklch(0.78_0.14_82/5%)]"
              )}
            >
              {pill.label}
              <span className={cn(
                "text-[10px] px-1.5 py-0.5 rounded-full",
                roleFilter === pill.value
                  ? "bg-[oklch(0.78_0.14_82/20%)]"
                  : "bg-muted/50"
              )}>
                {pill.count}
              </span>
            </button>
          ))}
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
          className="flex flex-col items-center justify-center py-20 rounded-2xl border border-dashed border-[oklch(0.78_0.14_82/15%)] bg-[oklch(0.14_0.028_265/20%)]"
        >
          <div className="w-20 h-20 rounded-full bg-[oklch(0.78_0.14_82/8%)] flex items-center justify-center mb-6">
            <Users className="h-10 w-10 text-[oklch(0.78_0.14_82/30%)]" />
          </div>
          <h3 className="text-lg font-semibold text-muted-foreground mb-2">
            {search || roleFilter !== "all"
              ? (t("admin.no_matching_users") || "No users match your filters")
              : (t("admin.no_users") || "No users yet")}
          </h3>
          <p className="text-sm text-muted-foreground/70 text-center max-w-sm">
            {search || roleFilter !== "all"
              ? (t("admin.no_matching_users_hint") || "Try adjusting your search or role filter")
              : (t("admin.no_users_hint") || "Users will appear here once they register on the platform")}
          </p>
          {!search && roleFilter === "all" && (
            <Button
              variant="outline"
              className="mt-4 gap-2 border-[oklch(0.78_0.14_82/30%)] text-[oklch(0.78_0.14_82)] hover:bg-[oklch(0.78_0.14_82/10%)]"
              onClick={() => setAddDialogOpen(true)}
            >
              <UserPlus className="h-4 w-4" />
              {t("admin.add_first_user") || "Add your first user"}
            </Button>
          )}
        </motion.div>
      ) : (
        <motion.div
          variants={stagger}
          initial="initial"
          animate="animate"
          className="space-y-2"
        >
          {/* Table header - desktop */}
          <motion.div
            variants={fadeInUp}
            className="hidden lg:grid grid-cols-[auto_1fr_1fr_auto_auto_auto_auto] gap-4 px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider"
          >
            <div className="w-10" />
            <div>{t("admin.name") || "Name"}</div>
            <div>{t("admin.email") || "Email"}</div>
            <div>{t("admin.role") || "Role"}</div>
            <div>{t("admin.status") || "Status"}</div>
            <div>{t("admin.joined") || "Joined"}</div>
            <div className="w-10" />
          </motion.div>

          {/* User rows */}
          {filteredUsers.map((user, index) => {
            const badge = getRoleBadge(user.role)
            const BadgeIcon = badge.icon
            const isActive = user.active !== false

            return (
              <motion.div
                key={user.id}
                variants={fadeInUp}
                transition={{ delay: 0.1 + index * 0.04 }}
                className="group relative flex lg:grid lg:grid-cols-[auto_1fr_1fr_auto_auto_auto_auto] items-center gap-3 lg:gap-4 p-4 rounded-xl border border-[oklch(0.78_0.14_82/8%)] bg-[oklch(0.14_0.028_265/35%)] backdrop-blur-lg dark:bg-[oklch(0.12_0.03_265/45%)] hover:border-[oklch(0.78_0.14_82/18%)] hover:bg-[oklch(0.78_0.14_82/3%)] transition-all"
              >
                {/* Avatar */}
                <div className="shrink-0">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold overflow-hidden",
                      user.role === "admin"
                        ? "bg-gradient-to-br from-[oklch(0.78_0.14_82/25%)] to-[oklch(0.72_0.13_75/15%)] text-[oklch(0.78_0.14_82)]"
                        : user.role === "editor"
                          ? "bg-gradient-to-br from-sky-500/20% to-sky-400/10% text-sky-300"
                          : "bg-gradient-to-br from-slate-600/20% to-slate-500/10% text-slate-300"
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

                {/* Name + email on mobile */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {user.name}
                  </p>
                  <p className="text-xs text-muted-foreground lg:hidden truncate">
                    {user.email}
                  </p>
                </div>

                {/* Email (desktop) */}
                <div className="hidden lg:block min-w-0">
                  <p className="text-sm text-muted-foreground truncate">
                    {user.email}
                  </p>
                </div>

                {/* Role Badge */}
                <div className="shrink-0">
                  <Badge
                    variant="outline"
                    className={cn("text-[11px] gap-1 px-2.5 py-0.5", badge.className)}
                  >
                    <BadgeIcon className="h-3 w-3" />
                    {badge.label}
                  </Badge>
                </div>

                {/* Status Toggle */}
                <div className="shrink-0 hidden lg:flex items-center gap-2">
                  <Switch
                    checked={isActive}
                    onCheckedChange={() => toggleActive(user.id, isActive)}
                    className={cn(
                      "data-[state=checked]:bg-emerald-500",
                      !isActive && "data-[state=unchecked]:bg-red-500/50%"
                    )}
                  />
                  <span className={cn(
                    "text-[11px] font-medium",
                    isActive ? "text-emerald-400" : "text-red-400"
                  )}>
                    {isActive
                      ? (t("admin.active") || "Active")
                      : (t("admin.inactive") || "Inactive")}
                  </span>
                </div>

                {/* Mobile status */}
                <div className="shrink-0 lg:hidden">
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    isActive ? "bg-emerald-400" : "bg-red-400"
                  )} />
                </div>

                {/* Joined Date (desktop) */}
                <div className="hidden lg:block shrink-0">
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
                    <DropdownMenuContent align="end" className="w-52 rounded-xl border-[oklch(0.78_0.14_82/15%)] bg-[oklch(0.14_0.028_265/95%)]">
                      {user.role !== "admin" && (
                        <DropdownMenuItem
                          onClick={() => changeRole(user.id, "admin")}
                          className="gap-2 text-[oklch(0.78_0.14_82)] cursor-pointer"
                        >
                          <Crown className="h-4 w-4" />
                          {t("admin.promote_admin") || "Promote to Admin"}
                        </DropdownMenuItem>
                      )}
                      {user.role === "admin" && (
                        <DropdownMenuItem
                          onClick={() => changeRole(user.id, "user")}
                          className="gap-2 cursor-pointer"
                        >
                          <UserCheck className="h-4 w-4" />
                          {t("admin.demote_user") || "Demote to Viewer"}
                        </DropdownMenuItem>
                      )}
                      {user.role !== "editor" && (
                        <DropdownMenuItem
                          onClick={() => changeRole(user.id, "editor")}
                          className="gap-2 text-sky-400 cursor-pointer"
                        >
                          <Pencil className="h-4 w-4" />
                          {t("admin.make_editor") || "Make Editor"}
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => toggleActive(user.id, isActive)}
                        className="gap-2 cursor-pointer"
                      >
                        {isActive ? (
                          <>
                            <Ban className="h-4 w-4 text-red-400" />
                            <span className="text-red-400">{t("admin.deactivate") || "Deactivate"}</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                            <span className="text-emerald-400">{t("admin.activate") || "Activate"}</span>
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => setDeleteTarget(user)}
                        className="gap-2 text-red-400 focus:text-red-400 cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                        {t("admin.delete_user") || "Delete User"}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </motion.div>
            )
          })}
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
          {t("admin.showing_users") || `Showing ${filteredUsers.length} of ${users.length} users`}
        </motion.p>
      )}

      {/* ── Add User Dialog ── */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="rounded-2xl border-[oklch(0.78_0.14_82/15%)] bg-[oklch(0.14_0.028_265/95%)] dark:bg-[oklch(0.12_0.03_265/98%)] backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-[oklch(0.78_0.14_82)]" />
              {t("admin.add_new_user") || "Add New User"}
            </DialogTitle>
            <DialogDescription>
              {t("admin.add_user_desc") || "Create a new user account on the platform"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>{t("admin.user_name") || "Full Name"}</Label>
              <Input
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                placeholder={t("admin.enter_name") || "Enter full name"}
                className="rounded-xl bg-[oklch(0.14_0.028_265/60%)] border-[oklch(0.78_0.14_82/10%)]"
              />
            </div>
            <div className="space-y-2">
              <Label>{t("admin.user_email") || "Email Address"}</Label>
              <Input
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                placeholder={t("admin.enter_email") || "Enter email address"}
                className="rounded-xl bg-[oklch(0.14_0.028_265/60%)] border-[oklch(0.78_0.14_82/10%)]"
              />
            </div>
            <div className="space-y-2">
              <Label>{t("admin.user_role") || "Role"}</Label>
              <Select
                value={newUser.role}
                onValueChange={(v) => setNewUser({ ...newUser, role: v })}
              >
                <SelectTrigger className="rounded-xl bg-[oklch(0.14_0.028_265/60%)] border-[oklch(0.78_0.14_82/10%)]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">
                    <span className="flex items-center gap-2">
                      <Crown className="h-3.5 w-3.5 text-[oklch(0.78_0.14_82)]" />
                      Admin
                    </span>
                  </SelectItem>
                  <SelectItem value="editor">
                    <span className="flex items-center gap-2">
                      <Pencil className="h-3.5 w-3.5 text-sky-400" />
                      Editor
                    </span>
                  </SelectItem>
                  <SelectItem value="user">
                    <span className="flex items-center gap-2">
                      <UserCircle className="h-3.5 w-3.5 text-slate-400" />
                      Viewer
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setAddDialogOpen(false)}
              className="rounded-xl"
            >
              {t("common.cancel") || "Cancel"}
            </Button>
            <Button
              onClick={handleAddUser}
              disabled={adding}
              className="gap-2 rounded-xl bg-gradient-to-r from-[oklch(0.78_0.14_82)] to-[oklch(0.72_0.13_75)] text-[oklch(0.15_0.04_80)] hover:opacity-90"
            >
              {adding ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <UserPlus className="h-4 w-4" />
              )}
              {t("admin.add_user") || "Add User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirmation ── */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent className="rounded-2xl border-[oklch(0.78_0.14_82/15%)] bg-[oklch(0.14_0.028_265/95%)]">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("admin.delete_user") || "Delete User"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("admin.delete_user_confirm") ||
                `Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="rounded-xl">
              {t("common.cancel") || "Cancel"}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl"
            >
              {deleting ? (
                <Loader2 className="h-4 w-4 animate-spin me-2" />
              ) : null}
              {t("common.delete") || "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
