"use client"

import { useEffect, useState } from "react"
import {
  Bot,
  MessageSquare,
  Heart,
  SearchCode,
  Sparkles,
  Package,
  Shield,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  Send,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useI18n } from "@/lib/i18n-context"
import { toast } from "sonner"
import type { AiSettings } from "@/features/ai/settings"
import { DEFAULT_AI_SETTINGS } from "@/features/ai/settings"
import type { AiInsightCard } from "@/features/ai/insights"
import type { InventoryAlert } from "@/features/ai/inventory"
import type { FraudAlert } from "@/features/ai/fraud"

type FeatureCardProps = {
  icon: React.ElementType
  title: string
  description: string
  enabled: boolean
  onChange: (value: boolean) => void
  badge?: string
}

function FeatureCard({ icon: Icon, title, description, enabled, onChange, badge }: FeatureCardProps) {
  return (
    <div className="rounded-2xl border border-[oklch(0.76_0.19_48/12%)] bg-white/70 p-5 dark:bg-[oklch(0.12_0.03_265/55%)]">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[oklch(0.76_0.19_48/20%)] to-[oklch(0.58_0.17_38/10%)]">
            <Icon className="h-5 w-5 text-[oklch(0.76_0.19_48)]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-foreground">{title}</h3>
              {badge ? (
                <Badge variant="outline" className="text-[10px]">
                  {badge}
                </Badge>
              ) : null}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
        <Switch checked={enabled} onCheckedChange={onChange} />
      </div>
    </div>
  )
}

function toneClass(tone: AiInsightCard["tone"]) {
  if (tone === "positive") return "border-emerald-500/25 bg-emerald-500/5"
  if (tone === "warning") return "border-amber-500/25 bg-amber-500/5"
  if (tone === "danger") return "border-red-500/25 bg-red-500/5"
  return "border-[oklch(0.76_0.19_48/12%)] bg-white/60 dark:bg-[oklch(0.12_0.03_265/40%)]"
}

export function AiTab() {
  const { t } = useI18n()
  const [settings, setSettings] = useState<AiSettings>(DEFAULT_AI_SETTINGS)
  const [configured, setConfigured] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [insightsLoading, setInsightsLoading] = useState(true)
  const [insightCards, setInsightCards] = useState<AiInsightCard[]>([])
  const [insightSummary, setInsightSummary] = useState("")
  const [insightTips, setInsightTips] = useState<string[]>([])
  const [inventoryAlerts, setInventoryAlerts] = useState<InventoryAlert[]>([])
  const [inventorySummary, setInventorySummary] = useState({ healthy: 0, low: 0, critical: 0, overstock: 0 })
  const [fraudAlerts, setFraudAlerts] = useState<FraudAlert[]>([])
  const [fraudScanned, setFraudScanned] = useState(0)
  const [testMessage, setTestMessage] = useState("")
  const [testReply, setTestReply] = useState("")
  const [testLoading, setTestLoading] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/ai/settings")
        const data = await res.json()
        if (data.settings) setSettings({ ...DEFAULT_AI_SETTINGS, ...data.settings })
        setConfigured(Boolean(data.configured))
      } catch {
        toast.error(t("admin.ai_load_failed") || "تعذر تحميل إعدادات الذكاء الاصطناعي")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [t])

  useEffect(() => {
    async function loadPanels() {
      setInsightsLoading(true)
      try {
        const [insightsRes, inventoryRes, fraudRes] = await Promise.all([
          fetch("/api/ai/insights"),
          fetch("/api/ai/inventory"),
          fetch("/api/ai/fraud-scan"),
        ])
        if (insightsRes.ok) {
          const data = await insightsRes.json()
          setInsightCards(data.cards || [])
          setInsightSummary(data.summary || "")
          setInsightTips(data.recommendations || [])
        }
        if (inventoryRes.ok) {
          const data = await inventoryRes.json()
          setInventoryAlerts(data.alerts || [])
          setInventorySummary(data.summary || { healthy: 0, low: 0, critical: 0, overstock: 0 })
        }
        if (fraudRes.ok) {
          const data = await fraudRes.json()
          setFraudAlerts(data.alerts || [])
          setFraudScanned(data.scanned || 0)
        }
      } catch {
        // silent panel errors
      } finally {
        setInsightsLoading(false)
      }
    }
    loadPanels()
  }, [])

  const update = <K extends keyof AiSettings>(key: K, value: AiSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch("/api/ai/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      })
      if (!res.ok) throw new Error("save failed")
      toast.success(t("admin.ai_saved") || "تم حفظ إعدادات الذكاء الاصطناعي")
    } catch {
      toast.error(t("admin.ai_save_failed") || "فشل حفظ الإعدادات")
    } finally {
      setSaving(false)
    }
  }

  const runChatTest = async () => {
    if (!testMessage.trim()) return
    setTestLoading(true)
    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: testMessage, locale: "ar" }),
      })
      const data = await res.json()
      setTestReply(data.reply || "—")
    } catch {
      setTestReply(t("admin.ai_test_failed") || "فشل اختبار المساعد")
    } finally {
      setTestLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[320px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[oklch(0.76_0.19_48)]" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-bold text-foreground">
            <Bot className="h-7 w-7 text-[oklch(0.76_0.19_48)]" />
            {t("admin.ai") || "الذكاء الاصطناعي"}
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            {t("admin.ai_desc") ||
              "فعّل أدوات الذكاء الاصطناعي لتحسين تجربة العملاء، التسويق، الأتمتة، وتحسين محركات البحث."}
          </p>
        </div>
        <Badge
          variant="outline"
          className={`gap-1.5 px-3 py-1.5 ${
            configured
              ? "border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
              : "border-amber-500/30 text-amber-600 dark:text-amber-400"
          }`}
        >
          {configured ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertCircle className="h-3.5 w-3.5" />}
          {configured
            ? t("admin.ai_configured") || "محرك AI متصل"
            : t("admin.ai_fallback_mode") || "وضع ذكي محلي (بدون محرك خارجي)"}
        </Badge>
      </div>

      <div className="rounded-2xl border border-[oklch(0.76_0.19_48/12%)] bg-white/70 p-6 dark:bg-[oklch(0.12_0.03_265/55%)]">
        <div className="mb-4 flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-[oklch(0.76_0.19_48)]" />
          <h3 className="text-lg font-semibold">{t("admin.ai_insights") || "رؤى ذكية للإدارة"}</h3>
        </div>
        {insightsLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-[oklch(0.76_0.19_48)]" />
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {insightCards.map((card) => (
                <div key={card.id} className={`rounded-xl border p-4 ${toneClass(card.tone)}`}>
                  <p className="text-xs text-muted-foreground">{card.title}</p>
                  <p className="mt-1 text-2xl font-bold text-foreground">{card.value}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{card.hint}</p>
                </div>
              ))}
            </div>
            {insightSummary ? (
              <p className="mt-4 rounded-xl bg-muted/50 p-4 text-sm leading-relaxed text-foreground">
                {insightSummary}
              </p>
            ) : null}
            {insightTips.length > 0 ? (
              <ul className="mt-4 space-y-2">
                {insightTips.map((tip) => (
                  <li key={tip} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-[oklch(0.76_0.19_48)]" />
                    {tip}
                  </li>
                ))}
              </ul>
            ) : null}
          </>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <FeatureCard
          icon={MessageSquare}
          title={t("admin.ai_chat") || "الدردشة الآلية الذكية"}
          description={t("admin.ai_chat_desc") || "رد فوري على استفسارات العملاء عبر مساعد ذكي في الموقع."}
          enabled={settings.chatEnabled}
          onChange={(v) => update("chatEnabled", v)}
        />
        <FeatureCard
          icon={Heart}
          title={t("admin.ai_sentiment") || "تحليل المشاعر"}
          description={t("admin.ai_sentiment_desc") || "تحليل رسائل التواصل لمعرفة رضا العملاء ومستوى الأولوية."}
          enabled={settings.sentimentEnabled}
          onChange={(v) => update("sentimentEnabled", v)}
        />
        <FeatureCard
          icon={SearchCode}
          title={t("admin.ai_seo") || "اقتراحات SEO"}
          description={t("admin.ai_seo_desc") || "اقتراح عناوين ووصف وكلمات مفتاحية لتحسين الظهور في محركات البحث."}
          enabled={settings.seoEnabled}
          onChange={(v) => update("seoEnabled", v)}
        />
        <FeatureCard
          icon={Sparkles}
          title={t("admin.ai_recommendations") || "توصيات المنتجات"}
          description={t("admin.ai_recommendations_desc") || "عرض توصيات ذكية بناءً على سلوك الزوار والمنصات."}
          enabled={settings.recommendationsEnabled}
          onChange={(v) => update("recommendationsEnabled", v)}
        />
        <FeatureCard
          icon={Package}
          title={t("admin.ai_inventory") || "إدارة المخزون الذكية"}
          description={t("admin.ai_inventory_desc") || "التنبؤ بالطلب وتحسين إدارة المخزون لتقليل التكاليف."}
          enabled={settings.inventoryEnabled}
          onChange={(v) => update("inventoryEnabled", v)}
        />
        <FeatureCard
          icon={Shield}
          title={t("admin.ai_fraud") || "اكتشاف الاحتيال"}
          description={t("admin.ai_fraud_desc") || "تحليل المعاملات المالية واكتشاف الأنماط المشبوهة."}
          enabled={settings.fraudEnabled}
          onChange={(v) => update("fraudEnabled", v)}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-[oklch(0.76_0.19_48/12%)] bg-white/70 p-6 dark:bg-[oklch(0.12_0.03_265/55%)]">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="flex items-center gap-2 text-lg font-semibold">
              <Package className="h-5 w-5 text-[oklch(0.76_0.19_48)]" />
              {t("admin.ai_inventory_panel") || "تنبؤ المخزون"}
            </h3>
            <div className="flex flex-wrap gap-1">
              <Badge variant="outline">{inventorySummary.critical} حرج</Badge>
              <Badge variant="outline">{inventorySummary.low} منخفض</Badge>
            </div>
          </div>
          <div className="max-h-64 space-y-2 overflow-y-auto">
            {inventoryAlerts.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("admin.ai_no_inventory") || "لا منتجات للتحليل حالياً."}</p>
            ) : (
              inventoryAlerts.slice(0, 8).map((alert) => (
                <div key={alert.productId} className="rounded-xl border border-[oklch(0.76_0.19_48/10%)] p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium">{alert.title}</p>
                    <Badge variant={alert.status === "critical" ? "destructive" : "secondary"}>{alert.status}</Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    مخزون {alert.stock} · مبيعات 30 يوم: {alert.soldLast30Days}
                  </p>
                  <p className="mt-1 text-xs text-foreground/80">{alert.recommendation}</p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-[oklch(0.76_0.19_48/12%)] bg-white/70 p-6 dark:bg-[oklch(0.12_0.03_265/55%)]">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="flex items-center gap-2 text-lg font-semibold">
              <Shield className="h-5 w-5 text-[oklch(0.76_0.19_48)]" />
              {t("admin.ai_fraud_panel") || "مراقبة الاحتيال"}
            </h3>
            <Badge variant="outline">{fraudScanned} طلب مفحوص</Badge>
          </div>
          <div className="max-h-64 space-y-2 overflow-y-auto">
            {fraudAlerts.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("admin.ai_no_fraud") || "لا تنبيهات مشبوهة حالياً."}</p>
            ) : (
              fraudAlerts.slice(0, 8).map((alert) => (
                <div key={alert.orderId} className="rounded-xl border border-[oklch(0.76_0.19_48/10%)] p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium">{alert.totalPrice.toLocaleString("ar")}</p>
                    <Badge variant={alert.level === "high" ? "destructive" : "secondary"}>
                      {alert.riskScore}%
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{alert.reasons.join(" · ")}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-[oklch(0.76_0.19_48/12%)] bg-white/70 p-6 dark:bg-[oklch(0.12_0.03_265/55%)]">
        <h3 className="mb-4 text-lg font-semibold">{t("admin.ai_welcome_messages") || "رسائل الترحيب في المساعد"}</h3>
        <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-2">
            <Label>{t("admin.ai_welcome_ar") || "رسالة الترحيب (عربي)"}</Label>
            <Textarea
              value={settings.welcomeAr}
              onChange={(e) => update("welcomeAr", e.target.value)}
              rows={3}
              className="rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label>{t("admin.ai_welcome_en") || "رسالة الترحيب (إنجليزي)"}</Label>
            <Textarea
              value={settings.welcomeEn}
              onChange={(e) => update("welcomeEn", e.target.value)}
              rows={3}
              className="rounded-xl"
              dir="ltr"
            />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-[oklch(0.76_0.19_48/12%)] bg-white/70 p-6 dark:bg-[oklch(0.12_0.03_265/55%)]">
        <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
          <MessageSquare className="h-5 w-5 text-[oklch(0.76_0.19_48)]" />
          {t("admin.ai_live_test") || "اختبار المساعد مباشرة"}
        </h3>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Input
            value={testMessage}
            onChange={(e) => setTestMessage(e.target.value)}
            placeholder={t("admin.ai_test_placeholder") || "اكتب سؤالاً تجريبياً..."}
            className="rounded-xl"
          />
          <Button onClick={runChatTest} disabled={testLoading} className="gap-2 shrink-0">
            {testLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            {t("admin.ai_test_send") || "إرسال"}
          </Button>
        </div>
        {testReply ? (
          <p className="mt-4 rounded-xl bg-muted/50 p-4 text-sm leading-relaxed whitespace-pre-wrap">{testReply}</p>
        ) : null}
      </div>

      {!configured ? (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-sm text-muted-foreground">
          <p className="font-medium text-foreground">{t("admin.ai_setup_title") || "تفعيل المحرك الكامل (اختياري)"}</p>
          <p className="mt-1">
            {t("admin.ai_setup_hint") ||
              "لتفعيل الردود الذكية المتقدمة، أضف ملف .z-ai-config في جذر المشروع. بدون ذلك يعمل النظام بالوضع المحلي الذكي."}
          </p>
          <Input readOnly value=".z-ai-config" className="mt-3 max-w-xs font-mono text-xs" dir="ltr" />
        </div>
      ) : null}

      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="gap-2 bg-gradient-to-r from-[oklch(0.76_0.19_48)] to-[oklch(0.58_0.17_38)] text-[oklch(0.15_0.04_80)]"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {t("common.save") || "حفظ"}
        </Button>
      </div>
    </div>
  )
}
