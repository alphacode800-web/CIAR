"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Mail, Calendar, User, Trash2, Reply, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
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
import { Separator } from "@/components/ui/separator"
import { useI18n } from "@/lib/i18n-context"

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

interface ContactDetailDialogProps {
  contact: ContactMessage | null
  open: boolean
  onClose: () => void
  onDelete: (id: string) => void
}

// ── Helpers ──────────────────────────────────────────────────────────────────

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

// ── Component ────────────────────────────────────────────────────────────────

export function ContactDetailDialog({
  contact,
  open,
  onClose,
  onDelete,
}: ContactDetailDialogProps) {
  const { t } = useI18n()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  if (!contact) return null

  const handleReply = () => {
    const subject = encodeURIComponent(
      `Re: ${contact.subject}`
    )
    const body = encodeURIComponent(
      `\n\n---\nOn ${formatFullDate(contact.createdAt)}, ${contact.name} wrote:\n\n${contact.message}`
    )
    window.open(`mailto:${contact.email}?subject=${subject}&body=${body}`)
  }

  const handleDelete = () => {
    setShowDeleteConfirm(true)
  }

  const confirmDelete = () => {
    onDelete(contact.id)
    setShowDeleteConfirm(false)
    onClose()
  }

  return (
    <>
      <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
        <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[oklch(0.78_0.14_82)]/15 flex items-center justify-center">
                <User className="h-4 w-4 text-[oklch(0.78_0.14_82)]" />
              </div>
              {contact.name}
            </DialogTitle>
            <DialogDescription className="sr-only">
              {t("admin.contact_message_details") || "Contact message details"}
            </DialogDescription>
          </DialogHeader>

          {/* Meta info */}
          <div className="space-y-3">
            {/* Email */}
            <div className="flex items-center gap-3 rounded-lg border border-border/50 bg-muted/20 p-3">
              <Mail className="h-4 w-4 text-[oklch(0.78_0.14_82)] shrink-0" />
              <a
                href={`mailto:${contact.email}`}
                className="text-sm text-[oklch(0.78_0.14_82)] hover:underline truncate"
              >
                {contact.email}
              </a>
              <ExternalLink className="h-3 w-3 text-muted-foreground ms-auto shrink-0" />
            </div>

            {/* Subject */}
            <div>
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {t("admin.subject") || "Subject"}
              </span>
              <p className="mt-1 text-sm font-medium">
                {contact.subject}
              </p>
            </div>

            {/* Date & Locale */}
            <div className="flex items-center gap-3 flex-wrap">
              <Badge variant="outline" className="gap-1.5 text-xs">
                <Calendar className="h-3 w-3" />
                {formatFullDate(contact.createdAt)}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {contact.locale?.toUpperCase() || "EN"}
              </Badge>
            </div>

            <Separator className="my-2" />

            {/* Message body */}
            <div>
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {t("admin.message") || "Message"}
              </span>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="mt-2 rounded-xl border border-border/50 bg-muted/10 p-4 backdrop-blur-sm"
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {contact.message}
                </p>
              </motion.div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-2">
            <Button
              size="sm"
              onClick={handleReply}
              className="gap-2 bg-[oklch(0.78_0.14_82)] text-[oklch(0.15_0.04_80)] hover:bg-[oklch(0.75_0.14_82)]"
            >
              <Reply className="h-3.5 w-3.5" />
              {t("admin.reply") || "Reply"}
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={handleDelete}
              className="gap-2"
            >
              <Trash2 className="h-3.5 w-3.5" />
              {t("common.delete") || "Delete"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={onClose}
              className="ms-auto"
            >
              {t("common.close") || "Close"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("admin.delete_message") || "Delete Message"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("admin.delete_message_confirm") ||
                "Are you sure you want to delete this message? This action cannot be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {t("common.cancel") || "Cancel"}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t("common.delete") || "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
