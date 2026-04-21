"use client"

import { useRef } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  ArrowRight,
  Layers,
  Globe,
  Zap,
  TrendingUp,
} from "lucide-react"

interface HeroProps {
  onExplore: () => void
  stats: { totalViews: number; totalProjects: number }
}

export function Hero({ onExplore, stats }: HeroProps) {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  })

  const y = useTransform(scrollYProgress, [0, 1], [0, 200])
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])

  return (
    <section
      ref={ref}
      id="home"
      className="relative flex min-h-screen items-center justify-center overflow-hidden"
    >
      {/* Background effects */}
      <div className="pointer-events-none absolute inset-0">
        {/* Gradient orbs */}
        <div className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-600/10 blur-[100px]" />
        <div className="absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-gradient-to-br from-violet-500/15 to-fuchsia-600/10 blur-[100px]" />
        {/* Grid pattern */}
        <div className="grid-pattern absolute inset-0" />
      </div>

      <motion.div
        style={{ y, opacity }}
        className="relative z-10 mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8"
      >
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Badge
            variant="secondary"
            className="mb-6 gap-1.5 rounded-full border border-border/50 px-4 py-1.5 text-xs font-medium"
          >
            <Zap className="h-3 w-3 text-emerald-400" />
            {stats.totalProjects} products shipped
          </Badge>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mx-auto max-w-4xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
        >
          We build digital products{" "}
          <span className="gradient-text">that matter</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground sm:text-lg md:text-xl"
        >
          NexusLabs creates world-class tools for developers, designers, and
          teams. From cloud infrastructure to AI assistants — we ship products
          that push technology forward.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
        >
          <Button
            onClick={onExplore}
            size="lg"
            className="h-12 gap-2 rounded-xl px-8 text-sm font-semibold shadow-lg"
          >
            Explore Projects
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() =>
              document
                .getElementById("about")
                ?.scrollIntoView({ behavior: "smooth" })
            }
            className="h-12 rounded-xl px-8 text-sm font-semibold"
          >
            Learn More
          </Button>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-16 grid grid-cols-3 gap-8"
        >
          {[
            {
              icon: Layers,
              label: "Products",
              value: stats.totalProjects.toString(),
            },
            {
              icon: TrendingUp,
              label: "Total Views",
              value: formatNumber(stats.totalViews),
            },
            {
              icon: Globe,
              label: "Categories",
              value: "7+",
            },
          ].map((stat) => (
            <div key={stat.label} className="flex flex-col items-center gap-2">
              <stat.icon className="h-5 w-5 text-muted-foreground" />
              <div className="text-2xl font-bold tracking-tight sm:text-3xl">
                {stat.value}
              </div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="flex h-6 w-10 items-start justify-center rounded-full border border-border/50 p-1.5"
        >
          <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
        </motion.div>
      </motion.div>
    </section>
  )
}

function formatNumber(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
  return n.toString()
}
