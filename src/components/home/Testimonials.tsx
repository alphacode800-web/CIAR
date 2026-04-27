"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import { useI18n } from "@/lib/i18n-context"
import { cn } from "@/lib/utils"
import { Star, Quote } from "lucide-react"

const testimonials = [
  {
    name: "Sarah Al-Rashid",
    role: "Real Estate Developer",
    quote: "CIAR's real estate platform transformed how we manage listings and connect with buyers. The user experience is seamless and our inquiries increased by 40% in just three months.",
    rating: 5,
    key: "home.testimonial_1",
  },
  {
    name: "Ahmed Hassan",
    role: "Restaurant Owner",
    quote: "The food delivery platform has been a game-changer for our business. Order management is effortless, and the customer support team is always available when we need them.",
    rating: 5,
    key: "home.testimonial_2",
  },
  {
    name: "Maria Gonzalez",
    role: "Travel Agency Director",
    quote: "We integrated CIAR's tourism platform into our operations and saw immediate improvements in booking efficiency. The multi-language support helps us serve clients worldwide.",
    rating: 4,
    key: "home.testimonial_3",
  },
]

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" as const },
  transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] },
})

export function Testimonials() {
  const { t } = useI18n()
  const ref = useRef<HTMLDivElement>(null)

  return (
    <section ref={ref} className="relative py-20 sm:py-28">
      <div className="absolute inset-0 mesh-gradient opacity-30 pointer-events-none" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div {...fadeUp(0)} className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            {t("home.testimonials_title") || "What Our Partners Say"}
          </h2>
          <div className="mt-4 mx-auto w-24 h-1 rounded-full bg-gradient-to-r from-[oklch(0.82_0.145_85)] via-[oklch(0.78_0.14_82)] to-[oklch(0.70_0.13_72)]" />
          <p className="mt-4 text-muted-foreground max-w-lg mx-auto">
            {t("home.testimonials_subtitle") || "Trusted by businesses across the region. Hear their stories."}
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {testimonials.map((testimonial, i) => (
            <TestimonialCard key={testimonial.key} testimonial={testimonial} index={i} t={t} />
          ))}
        </div>
      </div>
    </section>
  )
}

function TestimonialCard({
  testimonial,
  index,
  t,
}: {
  testimonial: (typeof testimonials)[0]
  index: number
  t: (key: string) => string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-60px" })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.12, ease: [0.22, 1, 0.36, 1] }}
      className="glass-subtle rounded-2xl border border-[oklch(0.78_0.14_82/10%)] p-6 relative"
    >
      {/* Gold quote mark */}
      <div className="absolute -top-3 start-6">
        <div className="h-8 w-8 rounded-full bg-[oklch(0.78_0.14_82)] flex items-center justify-center shadow-lg shadow-[oklch(0.78_0.14_82/20%)]">
          <Quote className="h-3.5 w-3.5 text-[oklch(0.12_0.03_265)]" />
        </div>
      </div>

      {/* Stars */}
      <div className="flex gap-1 mt-3 mb-4">
        {Array.from({ length: 5 }).map((_, si) => (
          <Star
            key={si}
            className={cn(
              "h-4 w-4",
              si < testimonial.rating
                ? "text-[oklch(0.78_0.14_82)] fill-[oklch(0.78_0.14_82)]"
                : "text-muted-foreground/30"
            )}
          />
        ))}
      </div>

      {/* Quote text */}
      <p className="text-sm text-muted-foreground leading-relaxed mb-6">
        {t(testimonial.key + "_quote") || testimonial.quote}
      </p>

      {/* Author */}
      <div className="flex items-center gap-3 pt-4 border-t border-[oklch(0.78_0.14_82/10%)]">
        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[oklch(0.78_0.14_82/30%)] to-[oklch(0.72_0.13_75/15%)] flex items-center justify-center">
          <span className="text-sm font-bold text-[oklch(0.78_0.14_82)]">
            {testimonial.name.charAt(0)}
          </span>
        </div>
        <div>
          <p className="text-sm font-semibold">
            {t(testimonial.key + "_name") || testimonial.name}
          </p>
          <p className="text-xs text-muted-foreground">
            {t(testimonial.key + "_role") || testimonial.role}
          </p>
        </div>
      </div>
    </motion.div>
  )
}
