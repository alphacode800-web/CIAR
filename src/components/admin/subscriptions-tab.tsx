"use client"

import { useCallback, useEffect, useState } from "react"
import { CheckCircle2, Crown, Loader2, Plus, Save, ShieldOff, Trash2, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useI18n } from "@/lib/i18n-context"
import { toast } from "sonner"
import {
  defaultSubscriptionPlansConfig,
  getPlanLabel,
  mergeMissingDefaultPlans,
  newSubscriptionPlan,
  slugifyPlanId,
  subscriptionStatusLabel,
  type SubscriptionPlansConfig,
  type UserSubscriptionRecord,
} from "@/lib/advertiser-subscription"
import {
  defaultSitePaymentMethodsStore,
  formatPaymentDetailsForDisplay,
  getPaymentMethodById,
  getPaymentMethodLabel,
  type SitePaymentMethodsStore,
} from "@/lib/site-payment-methods"

type AdminUser = { id: string; name: string; email?: string | null }

export function SubscriptionsTab() {
  const { locale } = useI18n()
  const isAr = locale === "ar"

  const [plans, setPlans] = useState<SubscriptionPlansConfig>(defaultSubscriptionPlansConfig())
  const [paymentMethods, setPaymentMethods] = useState<SitePaymentMethodsStore>(defaultSitePaymentMethodsStore())
  const [records, setRecords] = useState<UserSubscriptionRecord[]>([])
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [savingPlans, setSavingPlans] = useState(false)
  const [savingPaymentMethods, setSavingPaymentMethods] = useState(false)
  const [waiveUserId, setWaiveUserId] = useState("")
  const [waiveNote, setWaiveNote] = useState("")
  const [waiveDays, setWaiveDays] = useState("365")

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [subsRes, usersRes] = await Promise.all([
        fetch("/api/admin/subscriptions"),
        fetch("/api/admin/users"),
      ])
      const subsData = await subsRes.json()
      const usersData = await usersRes.json()
      if (subsData.plans) setPlans(subsData.plans)
      if (subsData.paymentMethods) setPaymentMethods(subsData.paymentMethods)
      if (subsData.subscriptions) setRecords(subsData.subscriptions)
      if (usersData.users) setUsers(usersData.users)
    } catch {
      toast.error(isAr ? "تعذّر تحميل الاشتراكات" : "Failed to load subscriptions")
    } finally {
      setLoading(false)
    }
  }, [isAr])

  useEffect(() => {
    void load()
  }, [load])

  const savePaymentMethods = async () => {
    setSavingPaymentMethods(true)
    try {
      const res = await fetch("/api/admin/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "save_payment_methods", paymentMethods }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error("save failed")
      setPaymentMethods(data.paymentMethods || paymentMethods)
      toast.success(isAr ? "تم حفظ طرق الدفع" : "Payment methods saved")
    } catch {
      toast.error(isAr ? "فشل حفظ طرق الدفع" : "Failed to save payment methods")
    } finally {
      setSavingPaymentMethods(false)
    }
  }

  const updatePaymentMethod = (methodId: string, patch: Partial<(typeof paymentMethods.methods)[0]>) => {
    setPaymentMethods((prev) => ({
      ...prev,
      methods: prev.methods.map((m) => (m.id === methodId ? { ...m, ...patch } : m)),
    }))
  }

  const savePlans = async () => {
    setSavingPlans(true)
    try {
      const res = await fetch("/api/admin/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "save_plans", plans }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error("save failed")
      setPlans(data.plans || plans)
      toast.success(isAr ? "تم حفظ خطط الاشتراك" : "Subscription plans saved")
    } catch {
      toast.error(isAr ? "فشل الحفظ" : "Save failed")
    } finally {
      setSavingPlans(false)
    }
  }

  const runAction = async (body: Record<string, unknown>) => {
    const res = await fetch("/api/admin/subscriptions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
    const data = await res.json()
    if (!res.ok) throw new Error("action failed")
    if (data.subscriptions) setRecords(data.subscriptions)
    if (data.plans) setPlans(data.plans)
  }

  const activate = async (subscriptionId: string) => {
    try {
      await runAction({ action: "activate", subscriptionId })
      toast.success(isAr ? "تم تفعيل الاشتراك" : "Subscription activated")
    } catch {
      toast.error(isAr ? "فشل التفعيل" : "Activation failed")
    }
  }

  const reject = async (subscriptionId: string) => {
    if (!confirm(isAr ? "رفض هذا الطلب؟" : "Reject this request?")) return
    try {
      await runAction({ action: "reject", subscriptionId })
      toast.success(isAr ? "تم الرفض" : "Rejected")
    } catch {
      toast.error(isAr ? "فشل الرفض" : "Reject failed")
    }
  }

  const waiveUser = async () => {
    if (!waiveUserId) {
      toast.error(isAr ? "اختر مستخدماً" : "Select a user")
      return
    }
    try {
      await runAction({
        action: "waive",
        userId: waiveUserId,
        adminNote: waiveNote,
        durationDays: Number(waiveDays) || 365,
      })
      toast.success(isAr ? "تم إعفاء المستخدم من الاشتراك" : "User waived from subscription")
      setWaiveNote("")
    } catch {
      toast.error(isAr ? "فشل الإعفاء" : "Waive failed")
    }
  }

  const revokeUser = async (userId: string) => {
    if (!confirm(isAr ? "إلغاء اشتراك هذا المستخدم؟" : "Revoke this user's subscription?")) return
    try {
      await runAction({ action: "revoke", userId })
      toast.success(isAr ? "تم الإلغاء" : "Revoked")
    } catch {
      toast.error(isAr ? "فشل الإلغاء" : "Revoke failed")
    }
  }

  const setFreeForAll = async (enabled: boolean) => {
    try {
      const res = await fetch("/api/admin/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: enabled ? "enable_payments" : "enable_free_for_all" }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error("failed")
      if (data.plans) setPlans(data.plans)
      toast.success(
        enabled
          ? isAr
            ? "تم تفعيل الدفع والخطط"
            : "Payments and plans enabled"
          : isAr
            ? "الخدمة مجانية للجميع الآن"
            : "Service is now free for everyone"
      )
    } catch {
      toast.error(isAr ? "فشل تحديث الإعداد" : "Failed to update setting")
    }
  }

  const removeExemptUser = async (userId: string) => {
    if (!confirm(isAr ? "إزالة الإعفاء عن هذا المستخدم؟" : "Remove exemption for this user?")) return
    try {
      const res = await fetch("/api/admin/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "remove_exempt", userId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error("failed")
      if (data.plans) setPlans(data.plans)
      toast.success(isAr ? "تمت إزالة الإعفاء" : "Exemption removed")
    } catch {
      toast.error(isAr ? "فشلت العملية" : "Operation failed")
    }
  }

  const updatePlan = (planId: string, patch: Partial<(typeof plans.plans)[0]>) => {
    setPlans((prev) => ({
      ...prev,
      plans: prev.plans.map((p) => (p.id === planId ? { ...p, ...patch } : p)),
    }))
  }

  const addPlan = () => {
    setPlans((prev) => ({ ...prev, plans: [...prev.plans, newSubscriptionPlan()] }))
  }

  const removePlan = (planId: string) => {
    if (plans.plans.length <= 1) {
      toast.error(isAr ? "يجب أن تبقى خطة واحدة على الأقل" : "At least one plan is required")
      return
    }
    setPlans((prev) => ({ ...prev, plans: prev.plans.filter((p) => p.id !== planId) }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  const pendingRecords = records.filter((r) => r.status === "pending")
  const activeRecords = records.filter((r) => r.status === "active" || r.status === "waived")
  const exemptUserIds = plans.exemptUserIds || []
  const exemptUsers = users.filter((u) => exemptUserIds.includes(u.id))
  const unknownExemptIds = exemptUserIds.filter((id) => !users.some((u) => u.id === id))

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Crown className="h-6 w-6 text-primary" />
          {isAr ? "إدارة اشتراكات المُعلِنين" : "Advertiser subscriptions"}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          {isAr
            ? "تحكم في خطط الاشتراك، طلبات الدفع، وإعفاء المستخدمين."
            : "Manage subscription plans, payment requests, and user waivers."}
        </p>
      </div>

      <section className="space-y-4 rounded-2xl border border-border/40 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-semibold">{isAr ? "إعدادات الاشتراك" : "Subscription settings"}</p>
          <Button type="button" variant="outline" className="gap-1 rounded-full" onClick={() => setPlans((p) => mergeMissingDefaultPlans(p))}>
            <Plus className="h-3.5 w-3.5" />
            {isAr ? "إضافة الباقات الافتراضية" : "Add default packages"}
          </Button>
          <Button disabled={savingPlans} className="gap-2 rounded-full btn-gold" onClick={savePlans}>
            {savingPlans ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {isAr ? "حفظ الخطط" : "Save plans"}
          </Button>
        </div>

        <div className="flex flex-wrap gap-6">
          <label className="flex items-center gap-2 text-sm">
            <Switch
              checked={plans.paymentsEnabled !== false}
              onCheckedChange={(v) => void setFreeForAll(v)}
            />
            {isAr ? "تفعيل الدفع والخطط" : "Enable payments & plans"}
          </label>
          <label className="flex items-center gap-2 text-sm">
            <Switch checked={plans.requireSubscription} onCheckedChange={(v) => setPlans((p) => ({ ...p, requireSubscription: v }))} />
            {isAr ? "اشتراك إلزامي لنشر الإعلانات" : "Require subscription to post ads"}
          </label>
          <label className="flex items-center gap-2 text-sm">
            <Switch checked={plans.autoActivateOnPayment} onCheckedChange={(v) => setPlans((p) => ({ ...p, autoActivateOnPayment: v }))} />
            {isAr ? "تفعيل تلقائي عند تأكيد الدفع" : "Auto-activate on payment submit"}
          </label>
        </div>

        {plans.paymentsEnabled === false ? (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm">
            {isAr
              ? "الخدمة مجانية للجميع — لن يُطلب من المُعلِنين اختيار خطة أو الدفع."
              : "The service is free for everyone — advertisers will not be asked to choose a plan or pay."}
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" className="rounded-full" onClick={() => void setFreeForAll(false)}>
              {isAr ? "جعل الخدمة مجانية للجميع" : "Make service free for all"}
            </Button>
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <Label>{isAr ? "العملة" : "Currency"}</Label>
            <Input value={plans.currency} onChange={(e) => setPlans((p) => ({ ...p, currency: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label>{isAr ? "البنك (عربي)" : "Bank (Arabic)"}</Label>
            <Input value={plans.bankNameAr} onChange={(e) => setPlans((p) => ({ ...p, bankNameAr: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label>{isAr ? "Bank (English)" : "Bank (English)"}</Label>
            <Input dir="ltr" value={plans.bankNameEn} onChange={(e) => setPlans((p) => ({ ...p, bankNameEn: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label>{isAr ? "رقم الحساب" : "Account number"}</Label>
            <Input dir="ltr" value={plans.bankAccount} onChange={(e) => setPlans((p) => ({ ...p, bankAccount: e.target.value }))} />
          </div>
          <div className="space-y-2 lg:col-span-2">
            <Label>IBAN</Label>
            <Input dir="ltr" value={plans.bankIban} onChange={(e) => setPlans((p) => ({ ...p, bankIban: e.target.value }))} />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>{isAr ? "ملاحظة الدفع (عربي)" : "Payment note (Arabic)"}</Label>
            <Textarea rows={2} value={plans.paymentNoteAr} onChange={(e) => setPlans((p) => ({ ...p, paymentNoteAr: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label>{isAr ? "Payment note (English)" : "Payment note (English)"}</Label>
            <Textarea rows={2} dir="ltr" value={plans.paymentNoteEn} onChange={(e) => setPlans((p) => ({ ...p, paymentNoteEn: e.target.value }))} />
          </div>
        </div>

        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-semibold">{isAr ? "خطط الاشتراك" : "Subscription plans"}</p>
          <Button type="button" size="sm" variant="outline" className="gap-1 rounded-full" onClick={addPlan}>
            <Plus className="h-3.5 w-3.5" />
            {isAr ? "خطة جديدة" : "New plan"}
          </Button>
        </div>

        {plans.plans.map((plan) => (
          <div key={plan.id} className="grid gap-3 rounded-xl border border-border/30 bg-muted/10 p-4 lg:grid-cols-4">
            <div className="space-y-2">
              <Label>{isAr ? "المعرّف" : "ID"}</Label>
              <Input
                dir="ltr"
                value={plan.id}
                onChange={(e) => {
                  const nextId = slugifyPlanId(e.target.value)
                  setPlans((prev) => ({
                    ...prev,
                    plans: prev.plans.map((p) => (p.id === plan.id ? { ...p, id: nextId } : p)),
                  }))
                }}
              />
            </div>
            <div className="space-y-2">
              <Label>{isAr ? "الاسم (عربي)" : "Name (AR)"}</Label>
              <Input value={plan.labelAr} onChange={(e) => updatePlan(plan.id, { labelAr: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>{isAr ? "Name (EN)" : "Name (EN)"}</Label>
              <Input dir="ltr" value={plan.labelEn} onChange={(e) => updatePlan(plan.id, { labelEn: e.target.value })} />
            </div>
            <div className="flex items-end gap-2">
              <label className="flex items-center gap-2 text-sm pb-2">
                <Switch checked={plan.enabled} onCheckedChange={(v) => updatePlan(plan.id, { enabled: v })} />
                {isAr ? "مفعّل" : "Enabled"}
              </label>
              <Button type="button" size="icon" variant="ghost" className="text-destructive ms-auto" onClick={() => removePlan(plan.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-2">
              <Label>{isAr ? "السعر" : "Price"}</Label>
              <Input type="number" min={0} value={plan.price} onChange={(e) => updatePlan(plan.id, { price: Number(e.target.value) || 0 })} />
            </div>
            <div className="space-y-2">
              <Label>{isAr ? "المدة (أيام)" : "Duration (days)"}</Label>
              <Input type="number" min={1} value={plan.durationDays} onChange={(e) => updatePlan(plan.id, { durationDays: Number(e.target.value) || 30 })} />
            </div>
            <div className="space-y-2 lg:col-span-2">
              <Label>{isAr ? "الوصف (عربي)" : "Description (AR)"}</Label>
              <Input value={plan.descriptionAr} onChange={(e) => updatePlan(plan.id, { descriptionAr: e.target.value })} />
            </div>
          </div>
        ))}
      </section>

      <section className="space-y-4 rounded-2xl border border-border/40 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-semibold">{isAr ? "طرق الدفع في الموقع" : "Site payment methods"}</p>
          <Button disabled={savingPaymentMethods} variant="outline" className="gap-2 rounded-full" onClick={savePaymentMethods}>
            {savingPaymentMethods ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {isAr ? "حفظ طرق الدفع" : "Save payment methods"}
          </Button>
        </div>
        {paymentMethods.methods.map((method) => (
          <div key={method.id} className="grid gap-3 rounded-xl border border-border/30 bg-muted/10 p-4 lg:grid-cols-4">
            <div className="flex items-center gap-3 lg:col-span-4">
              {method.iconUrl ? <img src={method.iconUrl} alt="" className="h-8 w-auto object-contain" /> : null}
              <p className="text-sm font-semibold">{getPaymentMethodLabel(method, isAr)}</p>
              <label className="ms-auto flex items-center gap-2 text-sm">
                <Switch checked={method.enabled} onCheckedChange={(v) => updatePaymentMethod(method.id, { enabled: v })} />
                {isAr ? "مفعّل" : "Enabled"}
              </label>
            </div>
            <div className="space-y-2">
              <Label>{isAr ? "الاسم (عربي)" : "Label (AR)"}</Label>
              <Input value={method.labelAr} onChange={(e) => updatePaymentMethod(method.id, { labelAr: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>{isAr ? "Label (EN)" : "Label (EN)"}</Label>
              <Input dir="ltr" value={method.labelEn} onChange={(e) => updatePaymentMethod(method.id, { labelEn: e.target.value })} />
            </div>
            <div className="space-y-2 lg:col-span-2">
              <Label>{isAr ? "تعليمات (عربي)" : "Instructions (AR)"}</Label>
              <Input value={method.instructionsAr} onChange={(e) => updatePaymentMethod(method.id, { instructionsAr: e.target.value })} />
            </div>
            <div className="space-y-2 lg:col-span-2">
              <Label>{isAr ? "بيانات الحساب (عربي)" : "Account info (AR)"}</Label>
              <Textarea rows={2} value={method.accountInfoAr || ""} onChange={(e) => updatePaymentMethod(method.id, { accountInfoAr: e.target.value })} />
            </div>
            <div className="space-y-2 lg:col-span-2">
              <Label>{isAr ? "عدد الحقول" : "Fields"}</Label>
              <p className="text-sm text-muted-foreground pt-2">{method.fields.length} {isAr ? "حقول" : "fields"}</p>
            </div>
          </div>
        ))}
      </section>

      <section className="space-y-4 rounded-2xl border border-border/40 p-4">
        <p className="text-sm font-semibold">{isAr ? "إعفاء مستخدم من الاشتراك" : "Waive user subscription"}</p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2 lg:col-span-2">
            <Label>{isAr ? "المستخدم" : "User"}</Label>
            <Select value={waiveUserId} onValueChange={setWaiveUserId}>
              <SelectTrigger><SelectValue placeholder={isAr ? "اختر مستخدماً" : "Select user"} /></SelectTrigger>
              <SelectContent>
                {users.map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.name} {u.email ? `(${u.email})` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>{isAr ? "مدة الإعفاء (أيام)" : "Waiver duration (days)"}</Label>
            <Input type="number" min={1} value={waiveDays} onChange={(e) => setWaiveDays(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>{isAr ? "ملاحظة" : "Note"}</Label>
            <Input value={waiveNote} onChange={(e) => setWaiveNote(e.target.value)} />
          </div>
        </div>
        <Button type="button" variant="outline" className="gap-2 rounded-full" onClick={waiveUser}>
          <ShieldOff className="h-4 w-4" />
          {isAr ? "إعفاء من الاشتراك" : "Waive subscription"}
        </Button>
      </section>

      {(exemptUsers.length > 0 || unknownExemptIds.length > 0) ? (
        <section className="space-y-3 rounded-2xl border border-border/40 p-4">
          <p className="text-sm font-semibold">{isAr ? "مستخدمون معفيون من الدفع" : "Payment-exempt users"}</p>
          {exemptUsers.map((u) => (
            <div key={u.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/30 bg-muted/10 p-3">
              <div>
                <p className="font-medium text-sm">{u.name}</p>
                {u.email ? <p className="text-xs text-muted-foreground">{u.email}</p> : null}
              </div>
              <Button size="sm" variant="outline" className="rounded-full" onClick={() => void removeExemptUser(u.id)}>
                {isAr ? "إزالة الإعفاء" : "Remove exemption"}
              </Button>
            </div>
          ))}
          {unknownExemptIds.map((id) => (
            <div key={id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/30 bg-muted/10 p-3">
              <p className="text-sm font-mono">{id}</p>
              <Button size="sm" variant="outline" className="rounded-full" onClick={() => void removeExemptUser(id)}>
                {isAr ? "إزالة الإعفاء" : "Remove exemption"}
              </Button>
            </div>
          ))}
        </section>
      ) : null}

      {pendingRecords.length > 0 ? (
        <section className="space-y-3">
          <p className="text-sm font-semibold">{isAr ? "طلبات بانتظار الموافقة" : "Pending requests"} ({pendingRecords.length})</p>
          {pendingRecords.map((record) => {
            const plan = plans.plans.find((p) => p.id === record.planId)
            const payMethod = record.paymentMethod
              ? getPaymentMethodById(paymentMethods, record.paymentMethod)
              : undefined
            const detailLines = payMethod
              ? formatPaymentDetailsForDisplay(payMethod, record.paymentDetails, isAr)
              : []
            return (
              <div key={record.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/40 bg-card p-4">
                <div className="space-y-1">
                  <p className="font-medium">{record.userName || record.userId}</p>
                  <p className="text-xs text-muted-foreground">
                    {plan ? getPlanLabel(plan, isAr) : record.planId} — {record.amount} {record.currency}
                  </p>
                  {payMethod ? (
                    <p className="text-xs font-medium">{getPaymentMethodLabel(payMethod, isAr)}</p>
                  ) : null}
                  {detailLines.map((line) => (
                    <p key={line} className="text-xs text-muted-foreground">{line}</p>
                  ))}
                  {!detailLines.length && record.paymentNote ? (
                    <p className="text-xs text-muted-foreground whitespace-pre-wrap">{record.paymentNote}</p>
                  ) : null}
                  <Badge variant="secondary">{subscriptionStatusLabel(record.status, isAr)}</Badge>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" className="gap-1 rounded-full btn-gold" onClick={() => void activate(record.id)}>
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {isAr ? "تفعيل" : "Activate"}
                  </Button>
                  <Button size="sm" variant="destructive" className="gap-1 rounded-full" onClick={() => void reject(record.id)}>
                    <XCircle className="h-3.5 w-3.5" />
                    {isAr ? "رفض" : "Reject"}
                  </Button>
                </div>
              </div>
            )
          })}
        </section>
      ) : null}

      <section className="space-y-3">
        <p className="text-sm font-semibold">{isAr ? "اشتراكات نشطة / معفاة" : "Active / waived"} ({activeRecords.length})</p>
        {activeRecords.length === 0 ? (
          <p className="text-sm text-muted-foreground">{isAr ? "لا توجد اشتراكات نشطة." : "No active subscriptions."}</p>
        ) : (
          activeRecords.slice(0, 30).map((record) => (
            <div key={record.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/30 bg-muted/10 p-4">
              <div className="space-y-1">
                <p className="font-medium">{record.userName || record.userId}</p>
                <p className="text-xs text-muted-foreground">
                  {subscriptionStatusLabel(record.status, isAr)}
                  {record.expiresAt ? ` · ${new Date(record.expiresAt).toLocaleDateString(isAr ? "ar" : "en")}` : ""}
                </p>
                {record.waivedByAdmin ? (
                  <Badge variant="outline">{isAr ? "معفى من الأدmin" : "Admin waived"}</Badge>
                ) : null}
              </div>
              <Button size="sm" variant="outline" className="rounded-full" onClick={() => void revokeUser(record.userId)}>
                {isAr ? "إلغاء" : "Revoke"}
              </Button>
            </div>
          ))
        )}
      </section>
    </div>
  )
}
