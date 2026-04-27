"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import { useI18n } from "@/lib/i18n-context"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const faqs = [
  {
    key: "home.faq_1",
    question: "What platforms does CIAR manage?",
    answer: "CIAR manages eight integrated digital platforms: Real Estate, Car Rental, E-Commerce, Tourism, Food Delivery, Education, Healthcare, and Logistics. Each platform is designed to serve specific industry needs while sharing a unified user experience.",
  },
  {
    key: "home.faq_2",
    question: "Is there a single account for all platforms?",
    answer: "Yes, you can create one CIAR account that works across all eight platforms. This unified approach means you only need to register once to access real estate listings, car rentals, shopping, and all other services.",
  },
  {
    key: "home.faq_3",
    question: "Which languages are supported?",
    answer: "CIAR currently supports five languages: English, Arabic, French, Spanish, and German. We are continuously working to add more languages to serve our growing global user base.",
  },
  {
    key: "home.faq_4",
    question: "How do I contact customer support?",
    answer: "Our customer support is available 24/7 through multiple channels including live chat, email, and phone. You can reach us through the support section on any of our platforms, and our average response time is under 5 minutes.",
  },
  {
    key: "home.faq_5",
    question: "Are CIAR platforms secure for business use?",
    answer: "Absolutely. All CIAR platforms use enterprise-grade security including 256-bit SSL encryption, GDPR compliance, regular security audits, and data protection protocols. We are trusted by thousands of businesses across the region.",
  },
]

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" as const },
  transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] },
})

export function FAQSection() {
  const { t } = useI18n()
  const ref = useRef<HTMLDivElement>(null)

  return (
    <section ref={ref} className="relative py-20 sm:py-28">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div {...fadeUp(0)} className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            {t("home.faq_title") || "Frequently Asked Questions"}
          </h2>
          <div className="mt-4 mx-auto w-24 h-1 rounded-full bg-gradient-to-r from-[oklch(0.82_0.145_85)] via-[oklch(0.78_0.14_82)] to-[oklch(0.70_0.13_72)]" />
          <p className="mt-4 text-muted-foreground max-w-lg mx-auto">
            {t("home.faq_subtitle") || "Find answers to common questions about our platforms and services."}
          </p>
        </motion.div>

        {/* FAQ Accordion */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        >
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={faq.key}
                value={faq.key}
                className="glass-subtle rounded-xl border border-[oklch(0.78_0.14_82/10%)] px-6 data-[state=open]:border-[oklch(0.78_0.14_82/25%)] data-[state=open]:bg-[oklch(0.78_0.14_82/3%)] transition-all duration-300 overflow-hidden"
              >
                <AccordionTrigger className="text-start text-sm sm:text-base font-medium py-4 hover:no-underline [&[data-state=open]>svg]:text-[oklch(0.78_0.14_82)]">
                  {t(faq.key + "_q") || faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-4">
                  {t(faq.key + "_a") || faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  )
}
