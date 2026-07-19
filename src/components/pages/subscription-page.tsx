"use client"

import { useEffect, useRef, useState } from "react"
import { ArrowLeft, Check, Crown, Loader2, LogIn, ShieldCheck, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "@/lib/router-context"
import { useI18n } from "@/lib/i18n-context"
import {
  getSelectedSubscriptionPlan,
  setPendingSubscriptionId,
  setPostAuthRedirect,
  setSelectedSubscriptionPlan,
} from "@/lib/post-auth-redirect"
import type { SubscriptionPlan } from "@/lib/advertiser-subscription"
import { getPlanLabel, subscriptionStatusLabel } from "@/lib/advertiser-subscription"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

type PlansResponse = {
  requireSubscription: boolean
  currency: string
  plans: SubscriptionPlan[]
}

type MeResponse = {
  canPost: boolean
  active: { status: string; expiresAt?: string } | null
  latest: { status: string } | null
}

export function SubscriptionPage() {
  const { locale } = useI18n()
  const { user, loading: authLoading } = useAuth()
  const { navigate } = useRouter()
  const isAr = locale === "ar"

  const [plansData, setPlansData] = useState<PlansResponse | null>(null)
  const [meData, setMeData] = useState<MeResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [checkingOut, setCheckingOut] = useState<string | null>(null)
  const autoCheckoutRef = useRef(false)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const plansRes = await fetch("/api/subscriptions/plans")
        const plansJson = await plansRes.json()
        if (plansRes.ok) setPlansData(plansJson)

        if (user) {
          const token = localStorage.getItem("ciar_token")
          const meRes = await fetch("/api/subscriptions/me", {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          })
          const meJson = await meRes.json()
          if (meRes.ok) setMeData(meJson)
        }
      } catch {
        toast.error(isAr ? "تعذّر تحميل خطط الاشتراك" : "Could not load subscription plans")
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [user, isAr])

  useEffect(() => {
    if (autoCheckoutRef.current || !user || !plansData || meData?.canPost) return
    const savedPlan = getSelectedSubscriptionPlan()
    if (savedPlan && plansData.plans.some((p) => p.id === savedPlan)) {
      autoCheckoutRef.current = true
      void selectPlan(savedPlan)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, plansData, meData?.canPost])

  const goAuth = () => {
    setPostAuthRedirect("subscription")
    navigate({ page: "user-auth" })
    if (typeof window !== "undefined") {
      sessionStorage.setItem("ciar_auth_mode", "register")
    }
  }

  const selectPlan = async (planId: string) => {
    if (!user) {
      setSelectedSubscriptionPlan(planId)
      goAuth()
      return
    }

    setCheckingOut(planId)
    try {
      const token = localStorage.getItem("ciar_token")
      const res = await fetch("/api/subscriptions/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ planId }),
      })
      const data = await res.json()
      if (res.status === 409) {
        navigate({ page: "advertise" })
        return
      }
      if (!res.ok) throw new Error("checkout failed")
      setPendingSubscriptionId(data.subscriptionId)
      setSelectedSubscriptionPlan(planId)
      navigate({ page: "subscription-payment" })
    } catch {
      toast.error(isAr ? "تعذّر بدء الاشتراك" : "Could not start checkout")
    } finally {
      setCheckingOut(null)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  const plans = plansData?.plans || []
  const currency = plansData?.currency || "SAR"

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:py-14 space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <Badge variant="outline" className="rounded-full">
            <Crown className="h-3.5 w-3.5 me-1" />
            {isAr ? "اشتراك المُعلِن" : "Advertiser subscription"}
          </Badge>
          <h1 className="text-3xl font-bold tracking-tight">
            {isAr ? "اختر خطة الاشتراك" : "Choose your subscription plan"}
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            {isAr
              ? "الاشتراك مطلوب لنشر الإعلانات على منصة CIAR. بعد اختيار الخطة ستنتقل إلى صفحة الدفع."
              : "A subscription is required to publish ads on CIAR. After choosing a plan you will proceed to payment."}
          </p>
        </div>
        <Button type="button" variant="ghost" className="gap-2 rounded-full" onClick={() => navigate({ page: "advertise" })}>
          <ArrowLeft className="h-4 w-4" />
          {isAr ? "العودة" : "Back"}
        </Button>
      </div>

      {!user ? (
        <div className="rounded-2xl border border-border/50 bg-card p-6 sm:p-8 space-y-4">
          <p className="text-sm text-muted-foreground">
            {isAr ? "سجّل الدخول أو أنشئ حساباً للمتابعة إلى الدفع." : "Sign in or create an account to continue to payment."}
          </p>
          <div className="flex flex-wrap gap-3">
            <Button className="btn-gold rounded-full gap-2" onClick={goAuth}>
              <LogIn className="h-4 w-4" />
              {isAr ? "تسجيل / دخول" : "Sign in / Register"}
            </Button>
          </div>
        </div>
      ) : meData?.canPost ? (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <ShieldCheck className="h-6 w-6 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">{isAr ? "اشتراكك نشط" : "Your subscription is active"}</p>
              {meData.active?.expiresAt ? (
                <p className="text-sm text-muted-foreground">
                  {isAr ? "ينتهي في:" : "Expires:"}{" "}
                  {new Date(meData.active.expiresAt).toLocaleDateString(isAr ? "ar" : "en")}
                </p>
              ) : null}
            </div>
          </div>
          <Button className="btn-gold rounded-full" onClick={() => navigate({ page: "advertise" })}>
            {isAr ? "انتقل لنشر إعلان" : "Go publish an ad"}
          </Button>
        </div>
      ) : meData?.latest?.status === "pending" ? (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm">
          {isAr
            ? "لديك طلب اشتراك بانتظار تأكيد الدفع. يمكنك إكمال الدفع أو انتظار موافقة الإدارة."
            : "You have a pending subscription awaiting payment confirmation. Complete payment or wait for admin approval."}
          <div className="mt-3">
            <Button size="sm" variant="outline" className="rounded-full" onClick={() => navigate({ page: "subscription-payment" })}>
              {isAr ? "إكمال الدفع" : "Complete payment"}
            </Button>
          </div>
        </div>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan) => {
          const features = isAr ? plan.featuresAr : plan.featuresEn
          return (
            <div
              key={plan.id}
              className={cn(
                "relative rounded-2xl border border-border/50 bg-card p-6 shadow-sm transition-all hover:border-[oklch(0.78_0.14_82/30%)] hover:shadow-md"
              )}
            >
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-bold">{getPlanLabel(plan, isAr)}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">{isAr ? plan.descriptionAr : plan.descriptionEn}</p>
                </div>
                <div className="flex items-end gap-2">
                  <span className="text-3xl font-bold text-[oklch(0.78_0.14_82)]">
                    {plan.price.toLocaleString()}
                  </span>
                  <span className="pb-1 text-sm text-muted-foreground">{currency}</span>
                  <span className="pb-1 text-xs text-muted-foreground">
                    / {plan.durationDays} {isAr ? "يوم" : "days"}
                  </span>
                </div>
                {features.length > 0 ? (
                  <ul className="space-y-2">
                    {features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <Check className="h-4 w-4 shrink-0 text-emerald-500 mt-0.5" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                ) : null}
                <Button
                  className="w-full btn-gold rounded-xl h-11 gap-2"
                  disabled={checkingOut === plan.id}
                  onClick={() => void selectPlan(plan.id)}
                >
                  {checkingOut === plan.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                  {isAr ? "اختيار والمتابعة للدفع" : "Select & continue to payment"}
                </Button>
              </div>
            </div>
          )
        })}
      </div>

      {meData?.active ? (
        <p className="text-center text-xs text-muted-foreground">
          {subscriptionStatusLabel(meData.active.status as "active", isAr)}
        </p>
      ) : null}
    </div>
  )
}
