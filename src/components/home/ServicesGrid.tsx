"use client"

import { useRef, useCallback } from "react"
import { motion, useInView } from "framer-motion"
import { useI18n } from "@/lib/i18n-context"
import { useRouter } from "@/lib/router-context"
import { cn } from "@/lib/utils"
import {
  Building2,
  Car,
  ShoppingCart,
  Plane,
  UtensilsCrossed,
  GraduationCap,
  HeartPulse,
  Truck,
  ArrowLeft,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"

const services = [
  {
    icon: Building2,
    key: "home.service_real_estate",
    name: "Real Estate",
    description: "Browse properties, schedule viewings, and manage listings with our comprehensive real estate platform.",
    platformSlug: "REAL_ESTATE",
  },
  {
    icon: Car,
    key: "home.service_car_rental",
    name: "Car Rental",
    description: "Find and book vehicles with flexible rental plans, GPS tracking, and doorstep delivery options.",
    platformSlug: "CARS",
  },
  {
    icon: ShoppingCart,
    key: "home.service_ecommerce",
    name: "E-Commerce",
    description: "Shop from thousands of vendors with secure payments, fast shipping, and easy returns.",
    platformSlug: "MALL",
  },
  {
    icon: Plane,
    key: "home.service_tourism",
    name: "Tourism",
    description: "Discover travel destinations, book hotels and flights, and create unforgettable travel experiences.",
    platformSlug: "TOURISM",
  },
  {
    icon: UtensilsCrossed,
    key: "home.service_food",
    name: "Food Delivery",
    description: "Order from local restaurants with real-time tracking, scheduled delivery, and contactless pickup.",
    platformSlug: "MALL",
  },
  {
    icon: GraduationCap,
    key: "home.service_education",
    name: "Education",
    description: "Access online courses, certifications, and learning resources from top institutions worldwide.",
    platformSlug: "JOBS",
  },
  {
    icon: HeartPulse,
    key: "home.service_healthcare",
    name: "Healthcare",
    description: "Book appointments, access telemedicine, and manage health records securely in one platform.",
    platformSlug: "SERVICES",
  },
  {
    icon: Truck,
    key: "home.service_logistics",
    name: "Logistics",
    description: "Streamline shipping, track deliveries, and optimize supply chain operations with smart logistics tools.",
    platformSlug: "SHIPPING",
  },
]

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" as const },
  transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] },
})

export function ServicesGrid() {
  const { t } = useI18n()
  const ref = useRef<HTMLDivElement>(null)

  return (
    <section ref={ref} className="relative py-20 sm:py-28">
      <div className="absolute inset-0 dot-pattern opacity-20 pointer-events-none" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div {...fadeUp(0)} className="text-center mb-14">
          <Badge
            className={cn(
              "glass-strong border-[oklch(0.78_0.14_82/20%)] rounded-full px-4 py-1.5 text-xs font-medium gap-1.5 mb-4",
              "text-[oklch(0.78_0.14_82)]"
            )}
          >
            {t("home.services_badge") || "Our Services"}
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            {t("home.services_title") || "8 Integrated Platforms"}
          </h2>
          <div className="mt-4 mx-auto w-24 h-1 rounded-full bg-gradient-to-r from-[oklch(0.82_0.145_85)] via-[oklch(0.78_0.14_82)] to-[oklch(0.70_0.13_72)]" />
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
            {t("home.services_subtitle") ||
              "Comprehensive digital solutions designed to simplify your daily life and empower businesses."}
          </p>
        </motion.div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
          {services.map((service, i) => (
            <ServiceCard key={service.key} service={service} index={i} t={t} />
          ))}
        </div>
      </div>
    </section>
  )
}

function ServiceCard({
  service,
  index,
  t,
}: {
  service: (typeof services)[0]
  index: number
  t: (key: string) => string
}) {
  const { navigate } = useRouter()
  const { locale } = useI18n()
  const cardRef = useRef<HTMLButtonElement>(null)
  const isInView = useInView(cardRef, { once: true, margin: "-60px" })
  const Icon = service.icon

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const card = cardRef.current
    if (!card) return
    const rect = card.getBoundingClientRect()
    card.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`)
    card.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`)
  }, [])

  const handleClick = () => {
    navigate({ page: "platform", slug: service.platformSlug })
  }

  const title = t(service.key + "_name") || service.name

  return (
    <motion.button
      type="button"
      ref={cardRef}
      onClick={handleClick}
      onMouseMove={handleMouseMove}
      initial={{ opacity: 0, y: 24 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      aria-label={locale === "ar" ? `استكشف ${title}` : `Explore ${title}`}
      className={cn(
        "card-spotlight group rounded-2xl border border-primary/15 bg-card p-6 text-start w-full",
        "transition-all duration-300 cursor-pointer",
        "hover:border-primary/35 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2"
      )}
    >
      <div className="relative z-10">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="h-12 w-12 rounded-xl flex items-center justify-center bg-primary/10 transition-transform duration-300 group-hover:scale-110">
            <Icon className="h-6 w-6 text-primary" />
          </div>
          <ArrowLeft className="h-4 w-4 text-primary/40 transition-all duration-300 group-hover:text-primary group-hover:-translate-x-0.5 rtl:rotate-180 rtl:group-hover:translate-x-0.5 shrink-0 mt-1" />
        </div>

        <h3 className="text-lg font-bold mb-2 text-foreground group-hover:text-primary transition-colors duration-300">
          {title}
        </h3>

        <p className="text-sm text-foreground/70 leading-relaxed line-clamp-3">
          {t(service.key + "_desc") || service.description}
        </p>
      </div>
    </motion.button>
  )
}
