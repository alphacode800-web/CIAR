"use client"

import { motion, AnimatePresence } from "framer-motion"
import { AlertTriangle, Info, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
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
import { cn } from "@/lib/utils"

/* ─── Types ──────────────────────────────────────────────────────────────── */

interface ConfirmationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: "default" | "destructive"
  onConfirm: () => void
  loading?: boolean
}

/* ─── Component ───────────────────────────────────────────────────────────── */

export function ConfirmationDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  cancelLabel,
  variant = "default",
  onConfirm,
  loading = false,
}: ConfirmationDialogProps) {
  const { t } = useI18n()

  const resolvedConfirmLabel = confirmLabel || (variant === "destructive"
    ? (t("admin.delete") || "Delete")
    : (t("common.confirm") || "Confirm")
  )

  const resolvedCancelLabel = cancelLabel || (t("common.cancel") || "Cancel")

  const isDestructive = variant === "destructive"
  const Icon = isDestructive ? AlertTriangle : Info

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent
        className={cn(
          "rounded-2xl border overflow-hidden max-w-[440px]",
          isDestructive
            ? "border-red-500/20 bg-[oklch(0.12_0.028_265/98%)]"
            : "border-[oklch(0.78_0.14_82/12%)] bg-[oklch(0.12_0.028_265/98%)]"
        )}
      >
        <AlertDialogHeader className="space-y-4">
          {/* Icon */}
          <AnimatePresence mode="wait">
            {open && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className={cn(
                  "mx-auto w-12 h-12 rounded-full flex items-center justify-center",
                  isDestructive
                    ? "bg-red-500/10 border border-red-500/20"
                    : "bg-[oklch(0.78_0.14_82/10%)] border border-[oklch(0.78_0.14_82/20%)]"
                )}
              >
                <Icon
                  className={cn(
                    "h-6 w-6",
                    isDestructive ? "text-red-400" : "text-[oklch(0.78_0.14_82)]"
                  )}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Title */}
          <AlertDialogTitle
            className={cn(
              "text-center text-lg",
              isDestructive ? "text-red-400" : "text-foreground"
            )}
          >
            {title}
          </AlertDialogTitle>

          {/* Description */}
          <AlertDialogDescription className="text-center text-sm text-muted-foreground leading-relaxed">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* Actions */}
        <AlertDialogFooter className="flex-col-reverse sm:flex-row gap-2 pt-2">
          <AlertDialogCancel
            disabled={loading}
            className={cn(
              "rounded-xl h-10 text-sm transition-all duration-200",
              "border-[oklch(0.78_0.14_82/15%)] hover:bg-[oklch(0.78_0.14_82/8%)]",
              "focus:ring-[oklch(0.78_0.14_82)/20%]"
            )}
          >
            {resolvedCancelLabel}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault()
              if (!loading) {
                onConfirm()
              }
            }}
            disabled={loading}
            className={cn(
              "rounded-xl h-10 text-sm font-semibold transition-all duration-200",
              "focus:ring-offset-[oklch(0.12_0.028_265)]",
              isDestructive
                ? "bg-red-500/90 hover:bg-red-500 text-white focus:ring-red-500/30 shadow-[0_0_20px_red-500/10%] hover:shadow-[0_0_24px_red-500/15%]"
                : "bg-[oklch(0.78_0.14_82)] hover:bg-[oklch(0.73_0.14_82)] text-[oklch(0.14_0.028_265)] focus:ring-[oklch(0.78_0.14_82)/30%] shadow-[0_0_20px_oklch(0.78_0.14_82/10%)] hover:shadow-[0_0_24px_oklch(0.78_0.14_82/15%)]"
            )}
          >
            <span className="flex items-center gap-2">
              {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {resolvedConfirmLabel}
            </span>
          </AlertDialogAction>
        </AlertDialogFooter>

        {/* Destructive glow accent */}
        {isDestructive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-red-500/30 to-transparent"
          />
        )}
        {!isDestructive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[oklch(0.78_0.14_82/30%)] to-transparent"
          />
        )}
      </AlertDialogContent>
    </AlertDialog>
  )
}
