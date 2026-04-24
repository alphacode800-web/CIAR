"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Pencil, Search, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useI18n, ALL_LOCALES, LOCALE_NAMES } from "@/lib/i18n-context"
import { toast } from "sonner"

interface TranslationRow {
  id: string
  key: string
  locale: string
  value: string
}

const PAGE_SIZE = 50

export function TranslationsTab() {
  const { t } = useI18n()
  const [rows, setRows] = useState<TranslationRow[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filterLocale, setFilterLocale] = useState("all")
  const [page, setPage] = useState(1)
  const [editRow, setEditRow] = useState<TranslationRow | null>(null)
  const [editValue, setEditValue] = useState("")
  const [editOpen, setEditOpen] = useState(false)

  const fetchTranslations = useCallback(async () => {
    setLoading(true)
    try {
      const promises = ALL_LOCALES.map(async (loc) => {
        const res = await fetch(`/api/translations?locale=${loc}`)
        const data = await res.json()
        return Object.entries(data).map(([key, value]) => ({
          id: `${loc}:${key}`,
          key,
          locale: loc,
          value: value as string,
        }))
      })
      const results = await Promise.all(promises)
      setRows(results.flat())
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTranslations()
  }, [fetchTranslations])

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (filterLocale !== "all" && r.locale !== filterLocale) return false
      if (
        search &&
        !r.key.toLowerCase().includes(search.toLowerCase()) &&
        !r.value.toLowerCase().includes(search.toLowerCase())
      )
        return false
      return true
    })
  }, [rows, filterLocale, search])

  // Reset page when filters change
  useEffect(() => {
    setPage(1)
  }, [search, filterLocale])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const handleEdit = (row: TranslationRow) => {
    setEditRow(row)
    setEditValue(row.value)
    setEditOpen(true)
  }

  const handleSaveTranslation = async () => {
    if (!editRow) return
    try {
      await fetch("/api/translations", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: editRow.key,
          locale: editRow.locale,
          value: editValue,
        }),
      })
      toast.success(t("admin.translation_updated") || "Translation updated")
      setRows((prev) =>
        prev.map((r) =>
          r.id === editRow.id ? { ...r, value: editValue } : r
        )
      )
      setEditOpen(false)
    } catch {
      toast.error(t("admin.translation_update_failed") || "Failed to update translation")
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">{t("admin.translations")}</h2>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4">
        <div className="relative flex-1 w-full sm:max-w-sm">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("common.search") || "Search translations..."}
            className="ps-9 rounded-xl"
          />
        </div>
        <Select value={filterLocale} onValueChange={setFilterLocale}>
          <SelectTrigger className="w-40 rounded-xl">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              {t("admin.all_locales") || "All Locales"}
            </SelectItem>
            {ALL_LOCALES.map((loc) => (
              <SelectItem key={loc} value={loc}>
                {LOCALE_NAMES[loc]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Results count */}
      {!loading && (
        <p className="text-xs text-muted-foreground mb-3">
          {t("admin.showing_results", {
            from: (page - 1) * PAGE_SIZE + 1,
            to: Math.min(page * PAGE_SIZE, filtered.length),
            total: filtered.length,
          }) ||
            `Showing ${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, filtered.length)} of ${filtered.length} results`}
        </p>
      )}

      {/* Table */}
      {loading ? (
        <Skeleton className="h-96 rounded-xl" />
      ) : (
        <div className="rounded-xl border border-border/50 overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-48">
                    {t("admin.translation_key") || "Key"}
                  </TableHead>
                  <TableHead className="w-24">
                    {t("admin.translation_locale") || "Locale"}
                  </TableHead>
                  <TableHead>
                    {t("admin.translation_value") || "Value"}
                  </TableHead>
                  <TableHead className="w-20 text-end">
                    {t("admin.action") || "Action"}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paged.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-mono text-xs">
                      {row.key}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="text-xs uppercase font-mono"
                      >
                        {row.locale}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                      {row.value}
                    </TableCell>
                    <TableCell className="text-end">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleEdit(row)}
                        className="h-8 w-8"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center py-12 text-muted-foreground"
                    >
                      {t("admin.no_translations") || "No translations found"}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-xs text-muted-foreground">
            {t("admin.page_info", { page, total: totalPages }) ||
              `Page ${page} of ${totalPages}`}
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum: number
              if (totalPages <= 5) {
                pageNum = i + 1
              } else if (page <= 3) {
                pageNum = i + 1
              } else if (page >= totalPages - 2) {
                pageNum = totalPages - 4 + i
              } else {
                pageNum = page - 2 + i
              }
              return (
                <Button
                  key={pageNum}
                  variant={page === pageNum ? "default" : "outline"}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setPage(pageNum)}
                >
                  {pageNum}
                </Button>
              )
            })}
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t("admin.edit_translation") || "Edit Translation"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs text-muted-foreground">
                {t("admin.translation_key") || "Key"}
              </Label>
              <p className="font-mono text-sm mt-1">{editRow?.key}</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">
                {t("admin.translation_locale") || "Locale"}
              </Label>
              <div className="mt-1">
                <Badge variant="outline" className="text-xs uppercase font-mono">
                  {editRow?.locale}
                </Badge>
              </div>
            </div>
            <div className="space-y-2">
              <Label>
                {t("admin.translation_value") || "Value"}
              </Label>
              <Textarea
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                rows={4}
                className="rounded-xl"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button
              onClick={handleSaveTranslation}
              className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white"
            >
              {t("common.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
