"use client"

import { FormEvent, useEffect, useRef, useState } from "react"
import {
  ArrowLeft,
  Building2,
  Globe,
  ImageIcon,
  Link2,
  LogIn,
  Mail,
  Megaphone,
  MessageCircle,
  Send,
  ShieldCheck,
  Sparkles,
  Type,
  UserPlus,
  Users,
} from "lucide-react"
import { motion, useInView } from "framer-motion"
import { z } from "zod"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "@/lib/router-context"
import { useI18n } from "@/lib/i18n-context"
import { ContactSenderTypePicker } from "@/components/contact/contact-sender-type-picker"
import { CONTACT_SENDER_TYPE_IDS, type ContactSenderTypeId } from "@/lib/contact-sender-types"
import { setPostAuthRedirect } from "@/lib/post-auth-redirect"
import { normalizeOptionalUrl } from "@/lib/optional-url"
import type { AdNotifyChannel } from "@/lib/ad-notify"
import { AdvertiserPanel } from "@/components/pages/advertiser-panel"
import { AdProductDetailsForm } from "@/components/ads/ad-product-details-form"
import { cn } from "@/lib/utils"
import { adProductDetailsSchema, emptyAdProductDetails, type AdProductDetails } from "@/lib/ad-product-details"

const optionalUrlField = z.preprocess(
  (value) => normalizeOptionalUrl(value),
  z.union([z.literal(""), z.string().url()])
)

const adFormSchema = z.object({
  companyName: z.string().min(2),
  senderType: z.enum(CONTACT_SENDER_TYPE_IDS),
  title: z.string().min(3),
  description: z.string().min(10),
  link: optionalUrlField.optional().default(""),
  imageUrl: z.preprocess(
    (value) => normalizeOptionalUrl(value),
    z.string().max(500)
  ).optional().default(""),
  notifyVia: z.enum(["email", "whatsapp"]),
  productDetails: adProductDetailsSchema.optional(),
})

function AnimatedSection({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode
  className?: string
  delay?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-60px" })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
      transition={{ duration: 0.5, delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

function BenefitCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType
  title: string
  description: string
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border/50 glass-subtle p-5 transition-all duration-300",
        "hover:border-[oklch(0.78_0.14_82/20%)] hover:shadow-[0_0_24px_oklch(0.78_0.14_82/6%)]"
      )}
    >
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[oklch(0.78_0.14_82/20%)] to-[oklch(0.72_0.12_75/10%)]">
          <Icon className="h-5 w-5 text-[oklch(0.82_0.145_85)]" />
        </div>
        <div className="min-w-0 space-y-1">
          <p className="text-sm font-semibold text-foreground">{title}</p>
          <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
        </div>
      </div>
    </div>
  )
}

function StepItem({ step, title, description }: { step: number; title: string; description: string }) {
  return (
    <div className="flex gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[oklch(0.78_0.14_82/30%)] bg-[oklch(0.78_0.14_82/10%)] text-xs font-bold text-[oklch(0.78_0.14_82)]">
        {step}
      </div>
      <div className="space-y-0.5 pt-0.5">
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="text-xs leading-relaxed text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}

function FormSection({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-4">
      <div className="border-b border-border/40 pb-3">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {description ? <p className="mt-1 text-xs text-muted-foreground">{description}</p> : null}
      </div>
      {children}
    </div>
  )
}

export function AdvertisePage() {
  const { locale, t, dir } = useI18n()
  const { user, loading } = useAuth()
  const { navigate } = useRouter()
  const isAr = locale === "ar"

  const [companyName, setCompanyName] = useState("")
  const [senderType, setSenderType] = useState<ContactSenderTypeId | "">("")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [link, setLink] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [notifyVia, setNotifyVia] = useState<AdNotifyChannel>("email")
  const [productDetails, setProductDetails] = useState<AdProductDetails>(emptyAdProductDetails())
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!user) return
    if (user.email) setNotifyVia("email")
    else if (user.phone) setNotifyVia("whatsapp")
  }, [user])

  const goSubscribe = (mode: "login" | "register") => {
    setPostAuthRedirect("advertise")
    navigate({ page: "user-auth" })
    if (typeof window !== "undefined") {
      sessionStorage.setItem("ciar_auth_mode", mode)
    }
  }

  const fieldClasses = (field: string) =>
    cn(
      "rounded-xl border-2 border-foreground/15 bg-background text-foreground shadow-sm h-11",
      "focus-visible:border-primary focus-visible:ring-[3px] focus-visible:ring-primary/20",
      "placeholder:text-muted-foreground transition-all duration-200",
      errors[field] && "border-destructive focus-visible:ring-destructive/25 focus-visible:border-destructive"
    )

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!user) {
      goSubscribe("register")
      return
    }

    const parsed = adFormSchema.safeParse({
      companyName,
      senderType,
      title,
      description,
      link,
      imageUrl,
      notifyVia,
      productDetails,
    })

    if (!parsed.success) {
      const nextErrors: Record<string, string> = {}
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] || "form")
        if (!nextErrors[key]) {
          nextErrors[key] = isAr ? "يرجى التحقق من هذا الحقل" : "Please check this field"
        }
      }
      setErrors(nextErrors)
      return
    }

    setErrors({})
    setSubmitting(true)
    try {
      const token = localStorage.getItem("ciar_token")
      const res = await fetch("/api/advertise", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ ...parsed.data, locale }),
      })
      const data = await res.json()
      if (res.status === 401) {
        goSubscribe("register")
        return
      }
      if (!res.ok) {
        const message =
          data?.code === "DB_ERROR"
            ? isAr
              ? "تعذّر حفظ الطلب — جاري تحديث قاعدة البيانات، حاول بعد دقائق"
              : "Could not save your request — database is updating, try again shortly"
            : data?.code === "EMAIL_REQUIRED"
              ? isAr
                ? "أضف بريداً إلكترونياً لحسابك لإرسال الطلب عبر البريد"
                : "Add an email to your account to send via email"
              : data?.code === "PHONE_REQUIRED"
                ? isAr
                  ? "أضف رقم هاتف لحسابك لإرسال الطلب عبر واتساب"
                  : "Add a phone number to your account to send via WhatsApp"
                : typeof data?.error === "string"
                  ? data.error
                  : isAr
                    ? "فشل إرسال طلب الإعلان"
                    : "Failed to submit ad request"
        throw new Error(message)
      }

      if (typeof data?.deliveryUrl === "string" && data.deliveryUrl) {
        window.open(data.deliveryUrl, "_blank", "noopener,noreferrer")
      }

      toast.success(
        data?.notifyVia === "whatsapp"
          ? isAr
            ? "تم حفظ الطلب — أكّد الإرسال عبر واتساب في النافذة المفتوحة"
            : "Request saved — confirm sending via WhatsApp in the opened window"
          : data?.notifyVia === "email"
            ? isAr
              ? "تم حفظ الطلب — أكّد الإرسال عبر البريد في تطبيق البريد"
              : "Request saved — confirm sending via email in your mail app"
            : isAr
              ? "تم إرسال طلب الإعلان بنجاح — سيتواصل معك فريقنا قريباً"
              : "Your ad request was sent — our team will contact you soon"
      )
      setCompanyName("")
      setSenderType("")
      setTitle("")
      setDescription("")
      setLink("")
      setImageUrl("")
      setProductDetails(emptyAdProductDetails())
      setNotifyVia(user?.phone && !user?.email ? "whatsapp" : "email")
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : isAr
            ? "فشل إرسال طلب الإعلان"
            : "Failed to submit ad request"
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div dir={dir} className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden py-20 sm:py-28">
        <div className="absolute inset-0 mesh-gradient" />
        <div className="absolute inset-0 dot-pattern" />
        <div className="noise-overlay absolute inset-0" />
        <div
          className={cn(
            "absolute top-16 -start-32 h-[320px] w-[320px] rounded-full blur-3xl animate-float",
            "bg-gradient-to-br from-[oklch(0.78_0.14_82/18%)] to-[oklch(0.72_0.12_75/10%)]"
          )}
        />
        <div
          className={cn(
            "absolute bottom-0 -end-24 h-[280px] w-[280px] rounded-full blur-3xl animate-float-delayed",
            "bg-gradient-to-br from-[oklch(0.55_0.15_280/10%)] to-[oklch(0.65_0.2_330/5%)]"
          )}
        />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => navigate({ page: "home" })}
            className="mb-8 inline-flex items-center gap-1.5 rounded-full border border-border/50 bg-background/60 px-3 py-1.5 text-sm text-muted-foreground backdrop-blur-sm transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
            {isAr ? "العودة للرئيسية" : "Back to home"}
          </button>

          <AnimatedSection className="text-center">
            <Badge
              variant="secondary"
              className="mb-6 gap-1.5 border border-border/50 px-4 py-1.5 text-sm glass-subtle"
            >
              <Megaphone className="h-3.5 w-3.5 text-[oklch(0.82_0.145_85)]" />
              {t("nav.advertise") || (isAr ? "أعلن معنا" : "Advertise with us")}
            </Badge>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              {isAr ? "انشر إعلانك على " : "Publish your ad on "}
              <span className="gradient-text">CIAR</span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              {isAr
                ? "وصول لجمهور واسع عبر منصاتنا — للمؤسسات والشركات والأفراد. أرسل طلبك وسيراجعه فريقنا قبل النشر."
                : "Reach a wide audience across our platforms — for institutions, companies, and individuals. Submit your request and our team will review it before publishing."}
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Main content */}
      <div className="relative mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
        <div className="absolute inset-0 dot-pattern opacity-30" />
        <div
          className={cn(
            "pointer-events-none absolute top-0 start-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full blur-3xl",
            "bg-gradient-to-br from-[oklch(0.78_0.14_82/8%)] to-[oklch(0.72_0.12_75/5%)]"
          )}
        />

        <div className="relative grid grid-cols-1 gap-8 lg:grid-cols-5">
          {/* Sidebar */}
          <AnimatedSection delay={0.1} className="space-y-5 lg:col-span-2">
            <BenefitCard
              icon={Users}
              title={isAr ? "جمهور متنوع" : "Diverse audience"}
              description={
                isAr
                  ? "وصول لزوار منصات السياحة والعقارات والتجارة الإلكترونية."
                  : "Reach visitors across tourism, real estate, and e-commerce platforms."
              }
            />
            <BenefitCard
              icon={ShieldCheck}
              title={isAr ? "مراجعة قبل النشر" : "Review before publishing"}
              description={
                isAr
                  ? "يتحقق فريقنا من محتوى الإعلان لضمان الجودة والامتثال."
                  : "Our team verifies ad content to ensure quality and compliance."
              }
            />
            <BenefitCard
              icon={Sparkles}
              title={isAr ? "ظهور مميز" : "Premium visibility"}
              description={
                isAr
                  ? "إعلاناتك تظهر في مواقع استراتيجية ضمن منظومتنا الرقمية."
                  : "Your ads appear in strategic spots across our digital ecosystem."
              }
            />

            <div className="rounded-2xl border border-border/50 glass-subtle p-5 space-y-4">
              <p className="text-sm font-semibold text-foreground">
                {isAr ? "كيف يعمل؟" : "How it works"}
              </p>
              <div className="space-y-4">
                <StepItem
                  step={1}
                  title={isAr ? "أنشئ حساباً" : "Create an account"}
                  description={isAr ? "التسجيل مجاني وسريع." : "Free and quick registration."}
                />
                <StepItem
                  step={2}
                  title={isAr ? "أرسل تفاصيل الإعلان" : "Submit ad details"}
                  description={isAr ? "املأ النموذج بمعلومات جهتك وإعلانك." : "Fill in your organization and ad information."}
                />
                <StepItem
                  step={3}
                  title={isAr ? "انتظر الموافقة" : "Await approval"}
                  description={isAr ? "نتواصل معك خلال 24–48 ساعة." : "We contact you within 24–48 hours."}
                />
              </div>
            </div>
          </AnimatedSection>

          {/* Form / gate */}
          <AnimatedSection delay={0.2} className="lg:col-span-3">
            {loading ? (
              <div className="rounded-2xl border border-border/50 bg-card p-12 text-center text-muted-foreground shadow-sm">
                <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                {isAr ? "جاري التحميل..." : "Loading..."}
              </div>
            ) : !user ? (
              <div className="overflow-hidden rounded-2xl border border-border/50 bg-card shadow-sm">
                <div className="relative border-b border-border/40 bg-gradient-to-br from-[oklch(0.78_0.14_82/12%)] to-transparent px-6 py-8 sm:px-8">
                  <div className="absolute -end-8 -top-8 h-32 w-32 rounded-full bg-[oklch(0.78_0.14_82/10%)] blur-2xl" />
                  <div className="relative flex items-start gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[oklch(0.78_0.14_82/25%)] to-[oklch(0.72_0.12_75/15%)] shadow-[0_0_20px_oklch(0.78_0.14_82/15%)]">
                      <Building2 className="h-7 w-7 text-[oklch(0.82_0.145_85)]" />
                    </div>
                    <div className="space-y-2 text-start">
                      <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
                        {isAr ? "الاشتراك مطلوب لإضافة إعلان" : "Subscription required to post an ad"}
                      </h2>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {isAr
                          ? "يجب إنشاء حساب أو تسجيل الدخول قبل إرسال طلب إعلان. بعد الاشتراك ستتمكن من رفع تفاصيل إعلانك مباشرة."
                          : "You must sign up or log in before submitting an ad. After subscribing you can send your ad details immediately."}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 p-6 sm:p-8">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <Button type="button" className="btn-gold h-12 gap-2 rounded-xl text-sm font-semibold" onClick={() => goSubscribe("register")}>
                      <UserPlus className="h-4 w-4" />
                      {isAr ? "إنشاء حساب والاشتراك" : "Create account"}
                    </Button>
                    <Button type="button" variant="outline" className="h-12 gap-2 rounded-xl border-2 text-sm font-semibold" onClick={() => goSubscribe("login")}>
                      <LogIn className="h-4 w-4" />
                      {isAr ? "لدي حساب — تسجيل الدخول" : "I have an account — Log in"}
                    </Button>
                  </div>
                  <p className="text-center text-xs text-muted-foreground">
                    {isAr ? "التسجيل مجاني — لا يلزم بطاقة ائتمان" : "Free registration — no credit card required"}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <AdvertiserPanel />
              <div className="overflow-hidden rounded-2xl border border-border/50 bg-card shadow-sm">
                {/* User welcome strip removed — replaced by AdvertiserPanel above */}
                <form onSubmit={onSubmit} className="space-y-8 p-6 sm:p-8">
                  <FormSection
                    title={isAr ? "تصنيف المُعلِن" : "Advertiser category"}
                    description={
                      isAr
                        ? "اختر الفئة التي تمثّلها: شخص، شركة، مؤسسة، أو غيرها."
                        : "Select who you represent: individual, company, institution, or other."
                    }
                  >
                    <ContactSenderTypePicker
                      value={senderType}
                      onChange={setSenderType}
                      locale={locale}
                      label=""
                      error={errors.senderType}
                    />
                  </FormSection>

                  <FormSection
                    title={isAr ? "معلومات الجهة" : "Organization info"}
                    description={isAr ? "اسم الجهة أو الشركة المعلنة." : "Name of the advertising entity or company."}
                  >
                    <div className="space-y-2">
                      <Label htmlFor="ad-company" className="text-sm font-semibold">
                        {isAr ? "اسم الجهة / الشركة" : "Company / organization name"}
                      </Label>
                      <div className="relative">
                        <Building2 className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="ad-company"
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          placeholder={isAr ? "مثال: شركة النور للتجارة" : "e.g. Al-Noor Trading Co."}
                          required
                          className={cn(fieldClasses("companyName"), "ps-9")}
                        />
                      </div>
                      {errors.companyName ? (
                        <p className="text-xs text-destructive">{errors.companyName}</p>
                      ) : null}
                    </div>
                  </FormSection>

                  <FormSection
                    title={isAr ? "تفاصيل الإعلان" : "Ad details"}
                    description={isAr ? "عنوان جذاب ووصف واضح لمحتوى الإعلان." : "A catchy title and clear description of your ad."}
                  >
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="ad-title" className="text-sm font-semibold">
                          {isAr ? "عنوان الإعلان" : "Ad title"}
                        </Label>
                        <div className="relative">
                          <Type className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            id="ad-title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder={isAr ? "مثال: عروض خاصة على الوحدات السكنية" : "e.g. Special offers on residential units"}
                            required
                            className={cn(fieldClasses("title"), "ps-9")}
                          />
                        </div>
                        {errors.title ? <p className="text-xs text-destructive">{errors.title}</p> : null}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="ad-description" className="text-sm font-semibold">
                          {isAr ? "تفاصيل الإعلان" : "Ad description"}
                        </Label>
                        <Textarea
                          id="ad-description"
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          rows={5}
                          required
                          placeholder={
                            isAr
                              ? "صف منتجك أو خدمتك، العروض المتاحة، ومدة الإعلان..."
                              : "Describe your product, service, offers, and ad duration..."
                          }
                          className={cn(
                            "min-h-[130px] resize-none rounded-xl border-2 border-foreground/15 bg-background shadow-sm",
                            "focus-visible:border-primary focus-visible:ring-[3px] focus-visible:ring-primary/20",
                            "placeholder:text-muted-foreground transition-all duration-200",
                            errors.description && "border-destructive focus-visible:ring-destructive/25"
                          )}
                        />
                        {errors.description ? (
                          <p className="text-xs text-destructive">{errors.description}</p>
                        ) : null}
                      </div>
                    </div>
                  </FormSection>

                  <FormSection
                    title={isAr ? "تفاصيل المنتج / البسة" : "Product / clothing details"}
                    description={
                      isAr
                        ? "مثال: معلن بسة — أضف القماش، الألوان، المقاسات، السعر، الشحن، والدفع."
                        : "Example: clothing ad — add fabric, colors, sizes, price, shipping, and payment."
                    }
                  >
                    <AdProductDetailsForm
                      value={productDetails}
                      onChange={setProductDetails}
                      isAr={isAr}
                      showPlacement
                      showPayment
                    />
                  </FormSection>

                  <FormSection
                    title={isAr ? "روابط إضافية" : "Additional links"}
                    description={isAr ? "اختياري — رابط الهدف أو صورة الإعلان." : "Optional — destination link or ad image."}
                  >
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="ad-link" className="text-sm font-semibold">
                          {isAr ? "رابط (اختياري)" : "Link (optional)"}
                        </Label>
                        <div className="relative">
                          <Link2 className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            id="ad-link"
                            value={link}
                            onChange={(e) => setLink(e.target.value)}
                            placeholder="https://"
                            dir="ltr"
                            className={cn(fieldClasses("link"), "ps-9")}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="ad-image" className="text-sm font-semibold">
                          {isAr ? "رابط صورة (اختياري)" : "Image URL (optional)"}
                        </Label>
                        <div className="relative">
                          <ImageIcon className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            id="ad-image"
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                            placeholder="https://"
                            dir="ltr"
                            className={cn(fieldClasses("imageUrl"), "ps-9")}
                          />
                        </div>
                      </div>
                    </div>
                  </FormSection>

                  <FormSection
                    title={isAr ? "طريقة إرسال الطلب" : "How to send your request"}
                    description={
                      isAr
                        ? "اختر إرسال الطلب إلى فريق CIAR عبر البريد الإلكتروني أو واتساب."
                        : "Choose whether to send your request to the CIAR team via email or WhatsApp."
                    }
                  >
                    <div className="grid gap-3 sm:grid-cols-2">
                      <button
                        type="button"
                        onClick={() => setNotifyVia("email")}
                        disabled={!user?.email}
                        className={cn(
                          "flex items-center gap-3 rounded-xl border-2 p-4 text-start transition-all",
                          notifyVia === "email"
                            ? "border-primary bg-primary/8 shadow-sm"
                            : "border-border/40 hover:border-border/70",
                          !user?.email && "cursor-not-allowed opacity-50"
                        )}
                      >
                        <Mail className="h-5 w-5 shrink-0 text-primary" />
                        <div>
                          <p className="text-sm font-semibold">{isAr ? "بريد إلكتروني" : "Email"}</p>
                          <p className="text-xs text-muted-foreground">
                            {user?.email || (isAr ? "يتطلب بريداً في حسابك" : "Requires email on your account")}
                          </p>
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setNotifyVia("whatsapp")}
                        disabled={!user?.phone}
                        className={cn(
                          "flex items-center gap-3 rounded-xl border-2 p-4 text-start transition-all",
                          notifyVia === "whatsapp"
                            ? "border-primary bg-primary/8 shadow-sm"
                            : "border-border/40 hover:border-border/70",
                          !user?.phone && "cursor-not-allowed opacity-50"
                        )}
                      >
                        <MessageCircle className="h-5 w-5 shrink-0 text-primary" />
                        <div>
                          <p className="text-sm font-semibold">{isAr ? "واتساب" : "WhatsApp"}</p>
                          <p className="text-xs text-muted-foreground">
                            {user?.phone || (isAr ? "يتطلب رقم هاتف في حسابك" : "Requires phone on your account")}
                          </p>
                        </div>
                      </button>
                    </div>
                    {errors.notifyVia ? (
                      <p className="text-xs text-destructive">{errors.notifyVia}</p>
                    ) : null}
                  </FormSection>

                  <div className="flex flex-col gap-3 border-t border-border/40 pt-6 sm:flex-row sm:items-center sm:justify-between">
                    <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Globe className="h-3.5 w-3.5 shrink-0" />
                      {isAr ? "سيتم مراجعة طلبك خلال 24–48 ساعة عمل" : "Your request will be reviewed within 24–48 business hours"}
                    </p>
                    <Button
                      type="submit"
                      disabled={submitting}
                      className="btn-gold h-12 min-w-[200px] gap-2 rounded-xl text-sm font-semibold shadow-[0_4px_20px_oklch(0.78_0.14_82/25%)]"
                    >
                      {submitting ? (
                        isAr ? "جاري الإرسال..." : "Sending..."
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          {isAr ? "إرسال طلب الإعلان" : "Submit ad request"}
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </div>
              </div>
            )}
          </AnimatedSection>
        </div>
      </div>
    </div>
  )
}
