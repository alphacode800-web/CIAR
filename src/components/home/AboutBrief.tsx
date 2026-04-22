"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import { useI18n } from "@/lib/i18n-context"
import { cn } from "@/lib/utils"
import { ArrowRight, Building2 } from "lucide-react"
import { Button } from "@/components/ui/button"

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" as const },
  transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] },
})

export function AboutBrief() {
  const { t, dir } = useI18n()
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-80px" })

  return (
    <section ref={ref} className="relative py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Text Content */}
          <motion.div
            initial={{ opacity: 0, x: dir === "rtl" ? 24 : -24 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className={cn("space-y-6", dir === "rtl" ? "lg:order-2 text-end" : "lg:order-1 text-start")}
          >
            {/* Gold decorative line */}
            <div className={cn("flex items-center gap-4", dir === "rtl" ? "flex-row-reverse" : "")}>
              <div className="h-px flex-1 max-w-16 bg-gradient-to-r from-[oklch(0.78_0.14_82/50%)] to-transparent" />
              <span className="text-xs font-semibold uppercase tracking-widest text-[oklch(0.78_0.14_82/70%)]">
                {t("home.about_label") || "About CIAR"}
              </span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              {t("home.about_title") || "Empowering Digital Services Across Industries"}
            </h2>

            <p className="text-muted-foreground leading-relaxed text-base sm:text-lg">
              {t("home.about_description") ||
                "CIAR is a leading digital services company managing 8 integrated platforms spanning real estate, car rental, e-commerce, tourism, food delivery, education, healthcare, and logistics. We build seamless, technology-driven experiences that connect businesses with their customers."}
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <Button
                className={cn(
                  "gap-2 rounded-xl px-6 h-11 text-sm font-semibold",
                  "btn-gold"
                )}
              >
                {t("home.about_cta") || "Learn More"}
                <ArrowRight className="h-4 w-4 rtl:rotate-180" />
              </Button>
            </div>
          </motion.div>

          {/* Right: Visual Card */}
          <motion.div
            initial={{ opacity: 0, x: dir === "rtl" ? -24 : 24 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className={cn("lg:order-2", dir === "rtl" ? "lg:order-1" : "")}
          >
            <div className="glass rounded-2xl border border-[oklch(0.78_0.14_82/15%)] p-8 relative overflow-hidden">
              {/* Background decoration */}
              <div className="absolute -top-12 -end-12 h-40 w-40 rounded-full bg-[oklch(0.78_0.14_82/8%)] blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 start-0 h-32 w-32 rounded-full bg-[oklch(0.22_0.04_265/15%)] blur-2xl pointer-events-none" />

              <div className="relative z-10 flex flex-col items-center gap-6 text-center">
                <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-[oklch(0.78_0.14_82/20%)] to-[oklch(0.72_0.13_75/8%)] flex items-center justify-center">
                  <Building2 className="h-10 w-10 text-[oklch(0.78_0.14_82)]" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">
                    {t("home.about_since") || "Since 2018"}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
                    {t("home.about_since_desc") ||
                      "Delivering innovative digital solutions and transforming how businesses operate across the Middle East and beyond."}
                  </p>
                </div>
                <div className="flex gap-8 pt-2">
                  <div className="text-center">
                    <div className="text-2xl font-bold gradient-text">6+</div>
                    <div className="text-xs text-muted-foreground mt-1">{t("home.about_years") || "Years"}</div>
                  </div>
                  <div className="h-12 w-px bg-[oklch(0.78_0.14_82/15%)]" />
                  <div className="text-center">
                    <div className="text-2xl font-bold gradient-text">8</div>
                    <div className="text-xs text-muted-foreground mt-1">{t("home.about_platforms") || "Platforms"}</div>
                  </div>
                  <div className="h-12 w-px bg-[oklch(0.78_0.14_82/15%)]" />
                  <div className="text-center">
                    <div className="text-2xl font-bold gradient-text">50K+</div>
                    <div className="text-xs text-muted-foreground mt-1">{t("home.about_users") || "Users"}</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
