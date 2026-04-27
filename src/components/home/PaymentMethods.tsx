"use client"

import { motion } from "framer-motion"
import { useI18n } from "@/lib/i18n-context"

const paymentMethods = [
  { key: "mada", label: "mada", iconUrl: "/payment/mada.svg" },
  { key: "visa", label: "Visa", iconUrl: "/payment/visa.svg" },
  { key: "mastercard", label: "Mastercard", iconUrl: "/payment/mastercard.svg" },
  { key: "paypal", label: "PayPal", iconUrl: "/payment/paypal.svg" },
  { key: "applepay", label: "Apple Pay", iconUrl: "/payment/apple-pay.svg" },
  { key: "stcpay", label: "stc pay", iconUrl: "/payment/stc-pay.svg" },
  { key: "tamara", label: "tamara", iconUrl: "/payment/tamara.svg" },
]

export function PaymentMethods() {
  const { t } = useI18n()

  return (
    <section className="relative py-16 sm:py-20">
      <div className="absolute inset-0 dot-pattern opacity-20 pointer-events-none" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            {t("home.payments_title") || "Payment Methods"}
          </h2>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
            {t("home.payments_subtitle") || "Pay securely using trusted and officially supported payment options."}
          </p>
        </motion.div>

        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-8 sm:gap-x-10">
          {paymentMethods.map((method, idx) => (
            <motion.div
              key={method.key}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.45, delay: idx * 0.06 }}
              className="flex items-center justify-center"
            >
              <img
                src={method.iconUrl}
                alt={method.label}
                className="h-12 sm:h-14 w-auto object-contain shrink-0"
                loading="lazy"
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

