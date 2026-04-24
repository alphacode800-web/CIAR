"use client"

import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useI18n } from "@/lib/i18n-context"

// ── Types ────────────────────────────────────────────────────────────────────

interface BulkAction {
  id: string
  label: string
  icon: React.ElementType
  variant?: "default" | "destructive"
  onClick: () => void
  confirmMessage?: string
}

interface BulkActionsBarProps {
  selectedCount: number
  actions: BulkAction[]
  onClearSelection: () => void
}

// ── Component ────────────────────────────────────────────────────────────────

export function BulkActionsBar({
  selectedCount,
  actions,
  onClearSelection,
}: BulkActionsBarProps) {
  const { t } = useI18n()

  return (
    <AnimatePresence>
      {selectedCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="sticky top-0 z-20 flex items-center justify-between gap-4 rounded-xl border border-[oklch(0.78_0.14_82)]/30 bg-[oklch(0.78_0.14_82)]/10 backdrop-blur-xl px-4 py-3"
        >
          {/* Selected count */}
          <div className="flex items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[oklch(0.78_0.14_82)] text-[oklch(0.15_0.04_80)]">
              <span className="text-xs font-bold">{selectedCount}</span>
            </div>
            <span className="text-sm font-medium text-foreground">
              {t("admin.items_selected") || `${selectedCount} item${selectedCount > 1 ? "s" : ""} selected`}
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            {actions.map((action) => {
              const Icon = action.icon
              return (
                <Button
                  key={action.id}
                  size="sm"
                  variant={action.variant === "destructive" ? "destructive" : "outline"}
                  onClick={action.onClick}
                  className={cn(
                    "gap-2 h-8 text-xs",
                    action.variant !== "destructive" &&
                      "border-[oklch(0.78_0.14_82)]/30 text-[oklch(0.78_0.14_82)] hover:bg-[oklch(0.78_0.14_82)]/15 hover:text-[oklch(0.78_0.14_82)]"
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {action.label}
                </Button>
              )
            })}

            {/* Clear selection */}
            <Button
              size="sm"
              variant="ghost"
              onClick={onClearSelection}
              className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
              <span className="sr-only">
                {t("admin.clear_selection") || "Clear selection"}
              </span>
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
