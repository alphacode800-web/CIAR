"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Mail,
  Search,
  Trash2,
  Eye,
  Inbox,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Loader2,
  MessageSquare,
  Clock,
  X,
  Reply,
  ExternalLink,
  Circle,
  User,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
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
import { BulkActionsBar } from "./bulk-actions-bar"

/* ─── Types ─────────────────────────────────────────────────────────────── */

interface ContactMessage {
  id: string
  name: string
  email: string
  subject: string
  message: string
  locale: string
  read: boolean
  createdAt: string
}

interface ContactsResponse {
  submissions: ContactMessage[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  stats: {
    total: number
    thisMonth: number
  }
}

/* ─── Helpers ───────────────────────────────────────────────────────────── */

function formatRelativeTime(dateStr: string): string {
  const now = Date.now()
  const date = new Date(dateStr).getTime()
  const seconds = Math.floor((now - date) / 1000)

  if (seconds < 60) return "just now"
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  const weeks = Math.floor(days / 7)
  if (weeks < 4) return `${weeks}w ago`

  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: new Date(dateStr).getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
  })
}

function formatFullDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function truncate(str: string, length: number): string {
  if (str.length <= length) return str
  return str.slice(0, length) + "..."
}

function getInitials(name: string): string {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
}

/* ─── Date filter helper ───────────────────────────────────────────────── */

function isToday(dateStr: string): boolean {
  const d = new Date(dateStr)
  const now = new Date()
  return d.toDateString() === now.toDateString()
}

function isThisWeek(dateStr: string): boolean {
  const d = new Date(dateStr)
  const now = new Date()
  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() - now.getDay())
  weekStart.setHours(0, 0, 0, 0)
  return d >= weekStart
}

function isThisMonth(dateStr: string): boolean {
  const d = new Date(dateStr)
  const now = new Date()
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
}

/* ─── Main Component ────────────────────────────────────────────────────── */

export function ContactsTab() {
  const { t } = useI18n()

  // State
  const [contacts, setContacts] = useState<ContactMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [dateFilter, setDateFilter] = useState("all")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [stats, setStats] = useState({ total: 0, thisMonth: 0 })
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  // Slide-over panel
  const [slideOverOpen, setSlideOverOpen] = useState(false)
  const [viewContact, setViewContact] = useState<ContactMessage | null>(null)

  // Dialogs
  const [deleteTarget, setDeleteTarget] = useState<ContactMessage | null>(null)
  const [deleteMultiple, setDeleteMultiple] = useState(false)
  const [deleting, setDeleting] = useState(false)

  /* ── Fetch contacts ── */

  const fetchContacts = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "10",
      })
      if (search) params.set("search", search)
      if (dateFilter !== "all") params.set("dateFilter", dateFilter)

      const res = await fetch(`/api/admin/contacts?${params}`)
      if (!res.ok) throw new Error("Failed to fetch")

      const data: ContactsResponse = await res.json()
      setContacts(data.submissions || [])
      setTotalPages(data.pagination?.totalPages || 1)
      setStats(data.stats || { total: 0, thisMonth: 0 })
    } catch {
      toast.error(t("admin.fetch_contacts_failed") || "Failed to load contact messages")
    } finally {
      setLoading(false)
    }
  }, [page, search, dateFilter, t])

  useEffect(() => {
    fetchContacts()
  }, [fetchContacts])

  useEffect(() => {
    setPage(1)
  }, [search, dateFilter])

  /* ── Client-side date filter for pill buttons ── */

  const getFilteredContacts = () => {
    if (dateFilter === "all") return contacts
    return contacts.filter((c) => {
      if (dateFilter === "today") return isToday(c.createdAt)
      if (dateFilter === "week") return isThisWeek(c.createdAt)
      if (dateFilter === "month") return isThisMonth(c.createdAt)
      return true
    })
  }

  const filteredContacts = getFilteredContacts()

  /* ── Delete handlers ── */

  const handleDeleteSingle = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/admin/contacts?id=${deleteTarget.id}`, {
        method: "DELETE",
      })
      if (!res.ok) throw new Error("Delete failed")

      toast.success(t("admin.message_deleted") || "Message deleted")
      setDeleteTarget(null)
      setSelectedIds((prev) => {
        const next = new Set(prev)
        next.delete(deleteTarget.id)
        return next
      })
      if (viewContact?.id === deleteTarget.id) {
        setViewContact(null)
        setSlideOverOpen(false)
      }
      fetchContacts()
    } catch {
      toast.error(t("admin.delete_failed") || "Failed to delete message")
    } finally {
      setDeleting(false)
    }
  }

  const handleDeleteSelected = async () => {
    if (selectedIds.size === 0) return
    setDeleting(true)
    try {
      await Promise.all(
        Array.from(selectedIds).map((id) =>
          fetch(`/api/admin/contacts?id=${id}`, { method: "DELETE" })
        )
      )

      toast.success(
        t("admin.messages_deleted") || `${selectedIds.size} message(s) deleted`
      )
      setSelectedIds(new Set())
      setDeleteMultiple(false)
      fetchContacts()
    } catch {
      toast.error(t("admin.delete_failed") || "Failed to delete messages")
    } finally {
      setDeleting(false)
    }
  }

  /* ── Selection handlers ── */

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredContacts.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filteredContacts.map((c) => c.id)))
    }
  }

  /* ── Open slide-over ── */

  const openContactDetail = (contact: ContactMessage) => {
    setViewContact(contact)
    setSlideOverOpen(true)
  }

  /* ── Date filter pills ── */

  const dateFilterPills = [
    { value: "all", label: t("admin.all_time") || "All" },
    { value: "today", label: t("admin.today") || "Today" },
    { value: "week", label: t("admin.this_week") || "This Week" },
    { value: "month", label: t("admin.this_month") || "This Month" },
  ]

  /* ── Reply handler ── */

  const handleReply = () => {
    if (!viewContact) return
    const subject = encodeURIComponent(`Re: ${viewContact.subject}`)
    const body = encodeURIComponent(
      `\n\n---\nOn ${formatFullDate(viewContact.createdAt)}, ${viewContact.name} wrote:\n\n${viewContact.message}`
    )
    window.open(`mailto:${viewContact.email}?subject=${subject}&body=${body}`)
  }

  /* ── Render ── */

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold gradient-text flex items-center gap-2">
          <Mail className="h-6 w-6 text-[oklch(0.78_0.14_82)]" />
          {t("admin.contacts") || "Contact Messages"}
        </h2>
        <Badge variant="outline" className="gap-1.5 text-xs border-[oklch(0.78_0.14_82/30%)] text-[oklch(0.78_0.14_82)]">
          <Mail className="h-3 w-3" />
          {t("admin.inbox") || "Inbox"}
        </Badge>
      </div>

      <div className="glow-line-gold" />

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0 }}
          className="rounded-2xl border border-[oklch(0.78_0.14_82/10%)] bg-[oklch(0.14_0.028_265/40%)] backdrop-blur-xl p-5"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[oklch(0.78_0.14_82/15%)] flex items-center justify-center">
              <MessageSquare className="h-5 w-5 text-[oklch(0.78_0.14_82)]" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-xs text-muted-foreground">
                {t("admin.total_messages") || "Total Messages"}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-2xl border border-[oklch(0.78_0.14_82/10%)] bg-[oklch(0.14_0.028_265/40%)] backdrop-blur-xl p-5"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[oklch(0.55_0.18_160/15%)] flex items-center justify-center">
              <Calendar className="h-5 w-5 text-[oklch(0.55_0.18_160)]" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.thisMonth}</p>
              <p className="text-xs text-muted-foreground">
                {t("admin.this_month") || "This Month"}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-[oklch(0.78_0.14_82/10%)] bg-[oklch(0.14_0.028_265/40%)] backdrop-blur-xl p-5"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[oklch(0.65_0.25_25/15%)] flex items-center justify-center">
              <Clock className="h-5 w-5 text-[oklch(0.65_0.25_25)]" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {contacts.length > 0 ? formatRelativeTime(contacts[0].createdAt) : "—"}
              </p>
              <p className="text-xs text-muted-foreground">
                {t("admin.latest_message") || "Latest Message"}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bulk actions bar */}
      <BulkActionsBar
        selectedCount={selectedIds.size}
        actions={[
          {
            id: "bulk-delete",
            label: t("common.delete") || "Delete",
            icon: Trash2,
            variant: "destructive",
            onClick: () => setDeleteMultiple(true),
            confirmMessage:
              t("admin.delete_selected_confirm") ||
              `Delete ${selectedIds.size} message(s)?`,
          },
        ]}
        onClearSelection={() => setSelectedIds(new Set())}
      />

      {/* Search + Date filter pills */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 w-full sm:max-w-sm">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("admin.search_contacts") || "Search by name, email, subject..."}
            className="ps-9 rounded-xl bg-[oklch(0.14_0.028_265/40%)] border-[oklch(0.78_0.14_82/10%)]"
          />
        </div>
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[oklch(0.14_0.028_265/40%)] border border-[oklch(0.78_0.14_82/8%)]">
          {dateFilterPills.map((pill) => (
            <button
              key={pill.value}
              onClick={() => setDateFilter(pill.value)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200",
                dateFilter === pill.value
                  ? "bg-[oklch(0.78_0.14_82/15%)] text-[oklch(0.78_0.14_82)] shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-[oklch(0.78_0.14_82/5%)]"
              )}
            >
              {pill.label}
            </button>
          ))}
        </div>
      </div>

      {/* Contact Cards List */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      ) : filteredContacts.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-20 text-center rounded-2xl border border-dashed border-[oklch(0.78_0.14_82/15%)] bg-[oklch(0.14_0.028_265/20%)]"
        >
          <div className="w-20 h-20 rounded-full bg-[oklch(0.78_0.14_82/8%)] flex items-center justify-center mb-6">
            <Inbox className="h-10 w-10 text-[oklch(0.78_0.14_82/30%)]" />
          </div>
          <h3 className="text-lg font-semibold text-muted-foreground mb-2">
            {search || dateFilter !== "all"
              ? (t("admin.no_matching_messages") || "No matching messages")
              : (t("admin.no_messages") || "No messages yet")}
          </h3>
          <p className="text-sm text-muted-foreground/70 max-w-sm">
            {search || dateFilter !== "all"
              ? (t("admin.no_matching_hint") || "Try adjusting your search or filter criteria.")
              : (t("admin.no_messages_hint") || "Contact form submissions will appear here when visitors send messages.")}
          </p>
        </motion.div>
      ) : (
        <>
          <div className="space-y-2">
            {/* Select all */}
            <div className="flex items-center gap-3 px-2">
              <input
                type="checkbox"
                checked={
                  filteredContacts.length > 0 &&
                  selectedIds.size === filteredContacts.length
                }
                onChange={toggleSelectAll}
                className="h-4 w-4 rounded border-border accent-[oklch(0.78_0.14_82)]"
                aria-label={t("admin.select_all") || "Select all messages"}
              />
              <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                {t("admin.name") || "Name"} / {t("admin.subject") || "Subject"}
              </span>
              <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium ms-auto">
                {t("admin.date") || "Date"}
              </span>
              <span className="w-20" />
            </div>

            <AnimatePresence>
              {filteredContacts.map((contact, index) => (
                <motion.div
                  key={contact.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 12 }}
                  transition={{ delay: index * 0.03 }}
                  onClick={() => openContactDetail(contact)}
                  className={cn(
                    "group relative flex items-center gap-3 sm:gap-4 p-4 rounded-xl border cursor-pointer transition-all duration-200",
                    "border-[oklch(0.78_0.14_82/8%)] bg-[oklch(0.14_0.028_265/35%)] backdrop-blur-lg",
                    "hover:border-[oklch(0.78_0.14_82/20%)] hover:bg-[oklch(0.78_0.14_82/3%)]",
                    selectedIds.has(contact.id) && "bg-[oklch(0.78_0.14_82/5%)] border-[oklch(0.78_0.14_82/25%)]",
                    !contact.read && "border-l-2 border-l-[oklch(0.78_0.14_82)]"
                  )}
                >
                  {/* Checkbox */}
                  <input
                    type="checkbox"
                    checked={selectedIds.has(contact.id)}
                    onChange={(e) => {
                      e.stopPropagation()
                      toggleSelect(contact.id)
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="h-4 w-4 rounded border-border accent-[oklch(0.78_0.14_82)] shrink-0"
                    aria-label={`Select message from ${contact.name}`}
                  />

                  {/* Unread indicator */}
                  {!contact.read && (
                    <Circle className="h-2.5 w-2.5 fill-[oklch(0.78_0.14_82)] text-[oklch(0.78_0.14_82)] shrink-0" />
                  )}

                  {/* Avatar */}
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[oklch(0.78_0.14_82/20%)] to-[oklch(0.72_0.13_75/10%)] flex items-center justify-center text-xs font-bold text-[oklch(0.78_0.14_82)] shrink-0">
                    {getInitials(contact.name)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={cn(
                        "text-sm font-medium truncate",
                        !contact.read ? "text-foreground" : "text-foreground/80"
                      )}>
                        {contact.name}
                      </p>
                      <span className="text-xs text-muted-foreground hidden sm:inline truncate">
                        — {contact.email}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className={cn(
                        "text-xs truncate",
                        !contact.read ? "text-muted-foreground" : "text-muted-foreground/70"
                      )}>
                        {contact.subject}
                      </p>
                    </div>
                    <p className="text-[11px] text-muted-foreground/60 truncate mt-0.5 sm:hidden">
                      {contact.email}
                    </p>
                  </div>

                  {/* Date */}
                  <div className="hidden sm:flex shrink-0">
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatRelativeTime(contact.createdAt)}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation()
                        setDeleteTarget(contact)
                      }}
                      className="h-8 w-8 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 rounded-xl border border-[oklch(0.78_0.14_82/8%)] bg-[oklch(0.14_0.028_265/30%)]">
              <p className="text-xs text-muted-foreground">
                {t("admin.page_info") || `Page ${page} of ${totalPages}`}
              </p>
              <div className="flex items-center gap-1">
                <Button size="icon" variant="outline" className="h-8 w-8" disabled={page <= 1} onClick={() => setPage(1)}>
                  <ChevronsLeft className="h-3.5 w-3.5" />
                </Button>
                <Button size="icon" variant="outline" className="h-8 w-8" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                  <ChevronLeft className="h-3.5 w-3.5" />
                </Button>
                <span className="px-3 text-sm font-medium">{page}</span>
                <Button size="icon" variant="outline" className="h-8 w-8" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
                <Button size="icon" variant="outline" className="h-8 w-8" disabled={page >= totalPages} onClick={() => setPage(totalPages)}>
                  <ChevronsRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* ── Slide-Over Panel for Contact Details ── */}
      <Sheet open={slideOverOpen} onOpenChange={setSlideOverOpen}>
        <SheetContent side="right" className="w-full sm:max-w-lg p-0 border-[oklch(0.78_0.14_82/15%)] bg-[oklch(0.14_0.028_265/98%)] dark:bg-[oklch(0.10_0.03_265/98%)] backdrop-blur-xl">
          {viewContact && (
            <div className="flex flex-col h-full">
              {/* Slide-over header */}
              <div className="flex items-center gap-4 p-5 border-b border-[oklch(0.78_0.14_82/10%)]">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[oklch(0.78_0.14_82/20%)] to-[oklch(0.72_0.13_75/10%)] flex items-center justify-center text-sm font-bold text-[oklch(0.78_0.14_82)]">
                  {getInitials(viewContact.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <SheetTitle className="text-base font-semibold text-foreground">
                    {viewContact.name}
                  </SheetTitle>
                  <SheetDescription className="text-xs text-muted-foreground truncate">
                    {viewContact.subject}
                  </SheetDescription>
                </div>
                <Badge variant="outline" className="text-[10px] gap-1 border-[oklch(0.78_0.14_82/20%)] text-[oklch(0.78_0.14_82)]">
                  <Mail className="h-2.5 w-2.5" />
                  {viewContact.locale?.toUpperCase() || "EN"}
                </Badge>
              </div>

              {/* Slide-over body */}
              <div className="flex-1 overflow-y-auto p-5 space-y-5">
                {/* Email */}
                <div className="flex items-center gap-3 rounded-xl border border-[oklch(0.78_0.14_82/10%)] bg-[oklch(0.78_0.14_82/3%)] p-3">
                  <Mail className="h-4 w-4 text-[oklch(0.78_0.14_82)] shrink-0" />
                  <a
                    href={`mailto:${viewContact.email}`}
                    className="text-sm text-[oklch(0.78_0.14_82)] hover:underline truncate"
                  >
                    {viewContact.email}
                  </a>
                  <ExternalLink className="h-3 w-3 text-muted-foreground ms-auto shrink-0" />
                </div>

                {/* Date */}
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {formatFullDate(viewContact.createdAt)}
                  </span>
                </div>

                <Separator className="bg-[oklch(0.78_0.14_82/10%)]" />

                {/* Subject */}
                <div>
                  <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {t("admin.subject") || "Subject"}
                  </span>
                  <p className="mt-1.5 text-sm font-medium text-foreground">
                    {viewContact.subject}
                  </p>
                </div>

                {/* Message body */}
                <div>
                  <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {t("admin.message") || "Message"}
                  </span>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.15 }}
                    className="mt-2 rounded-xl border border-[oklch(0.78_0.14_82/10%)] bg-[oklch(0.14_0.028_265/30%)] p-4"
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground/90">
                      {viewContact.message}
                    </p>
                  </motion.div>
                </div>
              </div>

              {/* Slide-over footer */}
              <div className="flex items-center gap-2 p-5 border-t border-[oklch(0.78_0.14_82/10%)]">
                <Button
                  size="sm"
                  onClick={handleReply}
                  className="gap-2 bg-gradient-to-r from-[oklch(0.78_0.14_82)] to-[oklch(0.72_0.13_75)] text-[oklch(0.15_0.04_80)] hover:opacity-90"
                >
                  <Reply className="h-3.5 w-3.5" />
                  {t("admin.reply") || "Reply"}
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => setDeleteTarget(viewContact)}
                  className="gap-2"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  {t("common.delete") || "Delete"}
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Delete single confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent className="rounded-2xl border-[oklch(0.78_0.14_82/15%)] bg-[oklch(0.14_0.028_265/95%)]">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("admin.delete_message") || "Delete Message"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("admin.delete_message_confirm") ||
                `Are you sure you want to delete the message from "${deleteTarget?.name}"? This action cannot be undone.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="rounded-xl">
              {t("common.cancel") || "Cancel"}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSingle}
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

      {/* Delete multiple confirmation */}
      <AlertDialog open={deleteMultiple} onOpenChange={setDeleteMultiple}>
        <AlertDialogContent className="rounded-2xl border-[oklch(0.78_0.14_82/15%)] bg-[oklch(0.14_0.028_265/95%)]">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("admin.delete_messages") || "Delete Messages"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("admin.delete_selected_confirm") ||
                `Are you sure you want to delete ${selectedIds.size} selected message(s)? This action cannot be undone.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="rounded-xl">
              {t("common.cancel") || "Cancel"}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSelected}
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
