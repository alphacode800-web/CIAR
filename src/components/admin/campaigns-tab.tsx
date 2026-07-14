"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import {
  Mail,
  Plus,
  Save,
  Trash2,
  Loader2,
  Sparkles,
  Send,
  CheckCircle2,
  Users,
  AlertCircle,
  Pencil,
  List,
  Eye,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import {
  CAMPAIGN_SEGMENTS,
  CAMPAIGN_SEGMENT_META,
  getSegmentLabel,
  type CampaignSegment,
  type EmailCampaignRecord,
} from "@/lib/email-campaigns"

type CampaignsView = "list" | "editor"

type DraftForm = {
  id?: string
  name: string
  subject: string
  bodyHtml: string
  bodyText: string
  segment: CampaignSegment
  aiPrompt: string
  status?: EmailCampaignRecord["status"]
  stats?: EmailCampaignRecord["stats"]
  simulated?: boolean
}

const emptyForm = (): DraftForm => ({
  name: "",
  subject: "",
  bodyHtml: "",
  bodyText: "",
  segment: "all_with_email",
  aiPrompt: "",
})

function statusBadgeVariant(status: EmailCampaignRecord["status"]) {
  if (status === "completed") return "default"
  if (status === "approved" || status === "sending") return "secondary"
  if (status === "draft") return "outline"
  return "destructive"
}

function statusLabel(status: EmailCampaignRecord["status"], isAr: boolean) {
  const map: Record<EmailCampaignRecord["status"], { ar: string; en: string }> = {
    draft: { ar: "مسودة", en: "Draft" },
    approved: { ar: "معتمدة", en: "Approved" },
    sending: { ar: "جاري الإرسال", en: "Sending" },
    completed: { ar: "مكتملة", en: "Completed" },
    failed: { ar: "فشلت", en: "Failed" },
    cancelled: { ar: "ملغاة", en: "Cancelled" },
  }
  return isAr ? map[status].ar : map[status].en
}

export function CampaignsTab() {
  const { t, locale } = useI18n()
  const isAr = locale === "ar"
  const [view, setView] = useState<CampaignsView>("list")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [drafting, setDrafting] = useState(false)
  const [sending, setSending] = useState(false)
  const [campaigns, setCampaigns] = useState<EmailCampaignRecord[]>([])
  const [segmentCounts, setSegmentCounts] = useState<Record<string, number>>({})
  const [emailConfigured, setEmailConfigured] = useState(false)
  const [form, setForm] = useState<DraftForm>(emptyForm())
  const [approveOpen, setApproveOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const audienceCount = segmentCounts[form.segment] ?? 0
  const progressPercent = useMemo(() => {
    if (!form.stats?.total) return 0
    return Math.min(100, Math.round((form.stats.sent / form.stats.total) * 100))
  }, [form.stats])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/campaigns")
      const data = await res.json()
      setCampaigns(Array.isArray(data.campaigns) ? data.campaigns : [])
      setSegmentCounts(data.segmentCounts || {})
      setEmailConfigured(Boolean(data.emailConfigured))
    } catch {
      toast.error(t("admin.campaigns_load_failed") || "تعذر تحميل الحملات")
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => {
    load()
  }, [load])

  const openCreate = () => {
    setForm(emptyForm())
    setView("editor")
  }

  const openEdit = (campaign: EmailCampaignRecord) => {
    setForm({
      id: campaign.id,
      name: campaign.name,
      subject: campaign.subject,
      bodyHtml: campaign.bodyHtml,
      bodyText: campaign.bodyText,
      segment: campaign.segment,
      aiPrompt: campaign.aiPrompt || "",
      status: campaign.status,
      stats: campaign.stats,
      simulated: campaign.simulated,
    })
    setView("editor")
  }

  const generateDraft = async () => {
    if (!form.aiPrompt.trim()) {
      toast.error(isAr ? "اكتب وصفاً للرسالة أولاً" : "Describe the message first")
      return
    }
    setDrafting(true)
    try {
      const res = await fetch("/api/admin/campaigns/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: form.aiPrompt,
          segment: form.segment,
          locale,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setForm((prev) => ({
        ...prev,
        subject: data.draft.subject,
        bodyHtml: data.draft.bodyHtml,
        bodyText: data.draft.bodyText,
        name: prev.name || (isAr ? "حملة بريد جديدة" : "New email campaign"),
      }))
      toast.success(
        data.draft.source === "ai"
          ? t("admin.campaigns_ai_ready") || "تمت صياغة الرسالة بالذكاء الاصطناعي"
          : t("admin.campaigns_fallback_ready") || "تم إنشاء مسودة افتراضية"
      )
    } catch {
      toast.error(t("admin.campaigns_draft_failed") || "فشلت صياغة الرسالة")
    } finally {
      setDrafting(false)
    }
  }

  const saveCampaign = async () => {
    if (!form.name.trim() || !form.subject.trim() || !form.bodyHtml.trim()) {
      toast.error(isAr ? "أكمل الحقول المطلوبة" : "Complete required fields")
      return
    }
    setSaving(true)
    try {
      const payload = {
        name: form.name,
        subject: form.subject,
        bodyHtml: form.bodyHtml,
        bodyText: form.bodyText,
        segment: form.segment,
        locale,
        aiPrompt: form.aiPrompt,
      }
      const res = await fetch(form.id ? `/api/admin/campaigns/${form.id}` : "/api/admin/campaigns", {
        method: form.id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success(t("admin.campaigns_saved") || "تم حفظ الحملة")
      await load()
      if (data.campaign) openEdit(data.campaign)
      else setView("list")
    } catch {
      toast.error(t("admin.campaigns_save_failed") || "فشل حفظ الحملة")
    } finally {
      setSaving(false)
    }
  }

  const approveCampaign = async () => {
    if (!form.id) return
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/campaigns/${form.id}/approve`, { method: "POST" })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success(t("admin.campaigns_approved") || "تم اعتماد الحملة")
      setApproveOpen(false)
      if (data.campaign) openEdit(data.campaign)
      await load()
    } catch {
      toast.error(t("admin.campaigns_approve_failed") || "فشل اعتماد الحملة")
    } finally {
      setSaving(false)
    }
  }

  const sendNextBatch = async () => {
    if (!form.id) return
    setSending(true)
    try {
      const res = await fetch(`/api/admin/campaigns/${form.id}/send`, { method: "POST" })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      if (data.campaign) {
        openEdit(data.campaign)
      }

      if (data.done) {
        toast.success(t("admin.campaigns_send_done") || "اكتمل إرسال الحملة")
        await load()
      } else {
        toast.message(
          t("admin.campaigns_batch_sent") || `تم إرسال دفعة (${data.batchSent || 0})`
        )
      }
    } catch {
      toast.error(t("admin.campaigns_send_failed") || "فشل إرسال الدفعة")
    } finally {
      setSending(false)
    }
  }

  const sendAllBatches = async () => {
    if (!form.id) return
    setSending(true)
    try {
      let done = false
      while (!done) {
        const res = await fetch(`/api/admin/campaigns/${form.id}/send`, { method: "POST" })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error)
        if (data.campaign) {
          openEdit(data.campaign)
        }
        done = Boolean(data.done)
        if (!done) {
          await new Promise((resolve) => setTimeout(resolve, 400))
        }
      }
      toast.success(t("admin.campaigns_send_done") || "اكتمل إرسال الحملة")
      await load()
    } catch {
      toast.error(t("admin.campaigns_send_failed") || "فشل إرسال الحملة")
    } finally {
      setSending(false)
    }
  }

  const deleteCampaign = async () => {
    if (!deleteId) return
    try {
      const res = await fetch(`/api/admin/campaigns/${deleteId}`, { method: "DELETE" })
      if (!res.ok) throw new Error("delete failed")
      toast.success(t("admin.campaigns_deleted") || "تم حذف الحملة")
      setDeleteId(null)
      if (form.id === deleteId) {
        setView("list")
        setForm(emptyForm())
      }
      await load()
    } catch {
      toast.error(t("admin.campaigns_delete_failed") || "تعذر الحذف")
    }
  }

  const isEditable = !form.status || form.status === "draft"
  const canApprove = form.id && form.status === "draft"
  const canSend = form.id && (form.status === "approved" || form.status === "sending")

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            {t("admin.campaigns") || "حملات البريد"}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("admin.campaigns_subtitle") ||
              "صياغة رسائل بالذكاء الاصطناعي، اختيار الجمهور، الموافقة، ثم الإرسال على دفعات"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {view === "editor" ? (
            <Button variant="outline" className="rounded-xl" onClick={() => setView("list")}>
              <List className="h-4 w-4 me-2" />
              {t("admin.campaigns_all") || "كل الحملات"}
            </Button>
          ) : (
            <Button className="rounded-xl" onClick={openCreate}>
              <Plus className="h-4 w-4 me-2" />
              {t("admin.campaigns_new") || "حملة جديدة"}
            </Button>
          )}
        </div>
      </div>

      {!emailConfigured ? (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-500/25 bg-amber-500/8 p-4 text-sm">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
          <div>
            <p className="font-medium text-foreground">
              {t("admin.campaigns_no_provider") || "وضع المحاكاة — لم يُضبط RESEND_API_KEY"}
            </p>
            <p className="mt-1 text-muted-foreground">
              {isAr
                ? "يمكنك تجربة التدفق كاملاً. عند الإرسال الفعلي أضف مفتاح Resend في متغيرات البيئة."
                : "You can test the full flow. Add RESEND_API_KEY for real delivery."}
            </p>
          </div>
        </div>
      ) : null}

      {view === "list" ? (
        <section className="space-y-3">
          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : campaigns.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">
              {t("admin.campaigns_empty") || "لا حملات بعد — أنشئ أول حملة بريد"}
            </p>
          ) : (
            campaigns.map((campaign) => (
              <div
                key={campaign.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/40 bg-background/80 p-4"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-foreground">{campaign.name}</p>
                    <Badge variant={statusBadgeVariant(campaign.status)}>
                      {statusLabel(campaign.status, isAr)}
                    </Badge>
                    {campaign.simulated ? (
                      <Badge variant="outline">{isAr ? "محاكاة" : "Simulated"}</Badge>
                    ) : null}
                  </div>
                  <p className="mt-1 truncate text-sm text-muted-foreground">{campaign.subject}</p>
                  <p className="text-xs text-muted-foreground">
                    {getSegmentLabel(campaign.segment, isAr ? "ar" : "en")} ·{" "}
                    {campaign.stats.sent}/{campaign.stats.total || "—"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="rounded-full" onClick={() => openEdit(campaign)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  {campaign.status !== "sending" ? (
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-full text-destructive"
                      onClick={() => setDeleteId(campaign.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  ) : null}
                </div>
              </div>
            ))
          )}
        </section>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
          <div className="space-y-6">
            <section className="space-y-4 rounded-2xl border border-border/40 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Sparkles className="h-4 w-4 text-primary" />
                {t("admin.campaigns_ai_draft") || "صياغة بالذكاء الاصطناعي"}
              </div>
              <div className="space-y-2">
                <Label>{isAr ? "صف الرسالة المطلوبة" : "Describe the message"}</Label>
                <Textarea
                  rows={3}
                  value={form.aiPrompt}
                  disabled={!isEditable}
                  onChange={(e) => setForm((p) => ({ ...p, aiPrompt: e.target.value }))}
                  placeholder={
                    isAr
                      ? "مثال: أعلن العملاء بعرض خصم 20% على خدمات الشحن لمدة أسبوع"
                      : "e.g. Announce 20% off shipping services for one week"
                  }
                />
              </div>
              <Button
                variant="outline"
                className="rounded-xl"
                disabled={!isEditable || drafting}
                onClick={generateDraft}
              >
                {drafting ? <Loader2 className="h-4 w-4 me-2 animate-spin" /> : <Sparkles className="h-4 w-4 me-2" />}
                {t("admin.campaigns_generate") || "توليد المسودة"}
              </Button>
            </section>

            <section className="space-y-4 rounded-2xl border border-border/40 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Mail className="h-4 w-4 text-primary" />
                {t("admin.campaigns_content") || "محتوى الحملة"}
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label>{isAr ? "اسم الحملة" : "Campaign name"}</Label>
                  <Input
                    value={form.name}
                    disabled={!isEditable}
                    onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>{isAr ? "الموضوع" : "Subject"}</Label>
                  <Input
                    value={form.subject}
                    disabled={!isEditable}
                    onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{isAr ? "الجمهور" : "Audience"}</Label>
                  <Select
                    value={form.segment}
                    disabled={!isEditable}
                    onValueChange={(value) => setForm((p) => ({ ...p, segment: value as CampaignSegment }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CAMPAIGN_SEGMENTS.map((segment) => (
                        <SelectItem key={segment} value={segment}>
                          {getSegmentLabel(segment, isAr ? "ar" : "en")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <div className="flex items-center gap-2 rounded-xl border border-border/40 px-3 py-2 text-sm">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {audienceCount} {isAr ? "مستلم" : "recipients"}
                    </span>
                  </div>
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>{isAr ? "نص HTML" : "HTML body"}</Label>
                  <Textarea
                    rows={8}
                    dir="ltr"
                    className="font-mono text-xs"
                    value={form.bodyHtml}
                    disabled={!isEditable}
                    onChange={(e) => setForm((p) => ({ ...p, bodyHtml: e.target.value }))}
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>{isAr ? "نص عادي (اختياري)" : "Plain text (optional)"}</Label>
                  <Textarea
                    rows={4}
                    value={form.bodyText}
                    disabled={!isEditable}
                    onChange={(e) => setForm((p) => ({ ...p, bodyText: e.target.value }))}
                  />
                </div>
              </div>
            </section>

            <div className="flex flex-wrap gap-2">
              {isEditable ? (
                <Button className="rounded-xl" disabled={saving} onClick={saveCampaign}>
                  {saving ? <Loader2 className="h-4 w-4 me-2 animate-spin" /> : <Save className="h-4 w-4 me-2" />}
                  {t("admin.campaigns_save") || "حفظ المسودة"}
                </Button>
              ) : null}
              {canApprove ? (
                <Button variant="outline" className="rounded-xl" onClick={() => setApproveOpen(true)}>
                  <CheckCircle2 className="h-4 w-4 me-2" />
                  {t("admin.campaigns_approve") || "اعتماد الحملة"}
                </Button>
              ) : null}
              {canSend ? (
                <>
                  <Button className="rounded-xl" disabled={sending} onClick={sendNextBatch}>
                    {sending ? <Loader2 className="h-4 w-4 me-2 animate-spin" /> : <Send className="h-4 w-4 me-2" />}
                    {t("admin.campaigns_send_batch") || "إرسال دفعة"}
                  </Button>
                  <Button
                    variant="outline"
                    className="rounded-xl"
                    disabled={sending}
                    onClick={sendAllBatches}
                  >
                    {t("admin.campaigns_send_all") || "إرسال الكل تلقائياً"}
                  </Button>
                </>
              ) : null}
            </div>

            {form.stats && form.stats.total > 0 ? (
              <section className="space-y-2 rounded-2xl border border-border/40 p-4">
                <div className="flex justify-between text-sm">
                  <span>{t("admin.campaigns_progress") || "التقدم"}</span>
                  <span>
                    {form.stats.sent}/{form.stats.total}
                    {form.stats.failed > 0 ? ` · ${form.stats.failed} ${isAr ? "فشل" : "failed"}` : ""}
                  </span>
                </div>
                <Progress value={progressPercent} className="h-2" />
              </section>
            ) : null}
          </div>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-border/50 bg-[oklch(0.10_0.025_265)] p-4">
              <p className="mb-3 flex items-center gap-2 text-xs font-semibold text-[oklch(0.76_0.19_48)]">
                <Eye className="h-3.5 w-3.5" />
                {t("admin.campaigns_preview") || "معاينة الرسالة"}
              </p>
              <div className="rounded-xl bg-white p-4 text-slate-900 shadow-sm dark:bg-slate-100">
                <p className="text-xs text-slate-500">{isAr ? "الموضوع" : "Subject"}</p>
                <p className="font-semibold">{form.subject || "—"}</p>
                <hr className="my-3 border-slate-200" />
                <div
                  className="prose prose-sm max-w-none text-sm"
                  dangerouslySetInnerHTML={{
                    __html:
                      form.bodyHtml.replace(/\{\{\s*name\s*\}\}/gi, isAr ? "أحمد" : "Ahmad") ||
                      `<p>${isAr ? "لا محتوى بعد" : "No content yet"}</p>`,
                  }}
                />
              </div>
            </div>
            <div className="rounded-2xl border border-border/40 p-4 text-xs text-muted-foreground space-y-2">
              <p>{CAMPAIGN_SEGMENT_META[form.segment][isAr ? "descriptionAr" : "descriptionEn"]}</p>
              <p>{isAr ? "استخدم {{name}} لتخصيص اسم المستلم." : "Use {{name}} to personalize recipient name."}</p>
            </div>
          </aside>
        </div>
      )}

      <AlertDialog open={approveOpen} onOpenChange={setApproveOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("admin.campaigns_approve_title") || "اعتماد الحملة؟"}</AlertDialogTitle>
            <AlertDialogDescription>
              {isAr
                ? `سيتم تجهيز الإرسال إلى ${audienceCount} مستلم. لن تتمكن من تعديل المحتوى بعد الاعتماد.`
                : `Ready to send to ${audienceCount} recipients. Content cannot be edited after approval.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel") || "إلغاء"}</AlertDialogCancel>
            <AlertDialogAction onClick={approveCampaign} disabled={saving}>
              {t("admin.campaigns_approve") || "اعتماد"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={Boolean(deleteId)} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("admin.campaigns_delete_title") || "حذف الحملة؟"}</AlertDialogTitle>
            <AlertDialogDescription>
              {isAr ? "لا يمكن التراجع عن هذا الإجراء." : "This action cannot be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel") || "إلغاء"}</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive" onClick={deleteCampaign}>
              {t("common.delete") || "حذف"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
