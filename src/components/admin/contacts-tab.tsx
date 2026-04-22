"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Mail,
  Search,
  Trash2,
  Eye,
  Filter,
  Inbox,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Loader2,
  MessageSquare,
  Clock,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
import { ContactDetailDialog } from "./contact-detail-dialog"
import { BulkActionsBar } from "./bulk-actions-bar"

// ── Types ────────────────────────────────────────────────────────────────────

interface ContactMessage {
  id: string
  name: string
  email: string
  subject: string
  message: string
  locale: string
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

// ── Helpers ──────────────────────────────────────────────────────────────────

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

function truncate(str: string, length: number): string {
  if (str.length <= length) return str
  return str.slice(0, length) + "..."
}

// ── Component ────────────────────────────────────────────────────────────────

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

  // Dialogs
  const [viewContact, setViewContact] = useState<ContactMessage | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ContactMessage | null>(null)
  const [deleteMultiple, setDeleteMultiple] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // ── Fetch contacts ──────────────────────────────────────────────────────

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

  // Reset page when filters change
  useEffect(() => {
    setPage(1)
  }, [search, dateFilter])

  // ── Delete handlers ─────────────────────────────────────────────────────

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

  // ── Selection handlers ─────────────────────────────────────────────────

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === contacts.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(contacts.map((c) => c.id)))
    }
  }

  // ── Date filter options ─────────────────────────────────────────────────

  const dateFilterOptions = [
    { value: "all", label: t("admin.all_time") || "All Time" },
    { value: "7d", label: t("admin.last_7_days") || "Last 7 Days" },
    { value: "30d", label: t("admin.last_30_days") || "Last 30 Days" },
    { value: "3m", label: t("admin.last_3_months") || "Last 3 Months" },
  ]

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold">
          {t("admin.contacts") || "Contact Messages"}
        </h2>
        <Badge variant="outline" className="gap-1.5 text-xs border-[oklch(0.78_0.14_82)]/30 text-[oklch(0.78_0.14_82)]">
          <Mail className="h-3 w-3" />
          {t("admin.inbox") || "Inbox"}
        </Badge>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0 }}
          className="rounded-xl border border-border/50 bg-card p-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[oklch(0.78_0.14_82)]/10 flex items-center justify-center">
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
          className="rounded-xl border border-border/50 bg-card p-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[oklch(0.55_0.18_160)]/10 flex items-center justify-center">
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
          className="rounded-xl border border-border/50 bg-card p-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[oklch(0.65_0.25_25)]/10 flex items-center justify-center">
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

      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 w-full sm:max-w-sm">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={
              t("admin.search_contacts") || "Search by name, email, subject..."
            }
            className="ps-9 rounded-xl"
          />
        </div>
        <Select value={dateFilter} onValueChange={setDateFilter}>
          <SelectTrigger className="w-44 rounded-xl">
            <SelectValue>
              <span className="flex items-center gap-2">
                <Filter className="h-3.5 w-3.5" />
                {dateFilterOptions.find((o) => o.value === dateFilter)?.label}
              </span>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {dateFilterOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Messages table */}
      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-10 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      ) : contacts.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-16 text-center"
        >
          <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mb-6">
            <Inbox className="h-10 w-10 text-muted-foreground/60" />
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
        <div className="rounded-xl border border-border/50 overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-10 ps-4">
                    <input
                      type="checkbox"
                      checked={
                        contacts.length > 0 &&
                        selectedIds.size === contacts.length
                      }
                      onChange={toggleSelectAll}
                      className="h-4 w-4 rounded border-border accent-[oklch(0.78_0.14_82)]"
                      aria-label={
                        t("admin.select_all") || "Select all messages"
                      }
                    />
                  </TableHead>
                  <TableHead>{t("admin.name") || "Name"}</TableHead>
                  <TableHead className="hidden md:table-cell">
                    {t("admin.email") || "Email"}
                  </TableHead>
                  <TableHead>{t("admin.subject") || "Subject"}</TableHead>
                  <TableHead className="hidden lg:table-cell">
                    {t("admin.preview") || "Preview"}
                  </TableHead>
                  <TableHead>{t("admin.date") || "Date"}</TableHead>
                  <TableHead className="text-end pe-4">
                    {t("admin.actions") || "Actions"}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence>
                  {contacts.map((contact, index) => (
                    <motion.tr
                      key={contact.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 8 }}
                      transition={{ delay: index * 0.03 }}
                      className={`border-b border-border/30 transition-colors hover:bg-muted/30 ${
                        selectedIds.has(contact.id)
                          ? "bg-[oklch(0.78_0.14_82)]/5"
                          : ""
                      }`}
                    >
                      <TableCell className="ps-4">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(contact.id)}
                          onChange={() => toggleSelect(contact.id)}
                          className="h-4 w-4 rounded border-border accent-[oklch(0.78_0.14_82)]"
                          aria-label={`Select message from ${contact.name}`}
                        />
                      </TableCell>
                      <TableCell className="font-medium max-w-[120px] truncate">
                        {contact.name}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground max-w-[160px] truncate text-xs">
                        {contact.email}
                      </TableCell>
                      <TableCell className="max-w-[160px] truncate text-sm">
                        {contact.subject}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-muted-foreground max-w-[200px] truncate text-xs">
                        {truncate(contact.message, 60)}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs whitespace-nowrap">
                        {formatRelativeTime(contact.createdAt)}
                      </TableCell>
                      <TableCell className="text-end pe-4">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => setViewContact(contact)}
                            className="h-8 w-8"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => setDeleteTarget(contact)}
                            className="h-8 w-8 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-border/30 bg-muted/10">
              <p className="text-xs text-muted-foreground">
                {t("admin.page_info") || `Page ${page} of ${totalPages}`}
              </p>
              <div className="flex items-center gap-1">
                <Button
                  size="icon"
                  variant="outline"
                  className="h-8 w-8"
                  disabled={page <= 1}
                  onClick={() => setPage(1)}
                >
                  <ChevronsLeft className="h-3.5 w-3.5" />
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  className="h-8 w-8"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </Button>
                <span className="px-3 text-sm font-medium">{page}</span>
                <Button
                  size="icon"
                  variant="outline"
                  className="h-8 w-8"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  className="h-8 w-8"
                  disabled={page >= totalPages}
                  onClick={() => setPage(totalPages)}
                >
                  <ChevronsRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Contact detail dialog */}
      <ContactDetailDialog
        contact={viewContact}
        open={!!viewContact}
        onClose={() => setViewContact(null)}
        onDelete={async (id) => {
          try {
            const res = await fetch(`/api/admin/contacts?id=${id}`, {
              method: "DELETE",
            })
            if (res.ok) {
              toast.success(t("admin.message_deleted") || "Message deleted")
              fetchContacts()
            }
          } catch {
            toast.error(t("admin.delete_failed") || "Failed to delete")
          }
        }}
      />

      {/* Delete single confirmation */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={() => setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("admin.delete_message") || "Delete Message"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("admin.delete_message_confirm") ||
                `Are you sure you want to delete the message from "${deleteTarget?.name}"? This action cannot be undone.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {t("common.cancel") || "Cancel"}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSingle}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
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
      <AlertDialog
        open={deleteMultiple}
        onOpenChange={setDeleteMultiple}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("admin.delete_messages") || "Delete Messages"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("admin.delete_selected_confirm") ||
                `Are you sure you want to delete ${selectedIds.size} selected message(s)? This action cannot be undone.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {t("common.cancel") || "Cancel"}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSelected}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
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
