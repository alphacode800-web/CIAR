"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import {
  Target,
  Lightbulb,
  Users,
  Rocket,
  Shield,
  Globe,
} from "lucide-react"

export function AboutSection() {
  const ref = useRef<HTMLElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  const values = [
    {
      icon: Lightbulb,
      title: "Innovation First",
      description:
        "We push boundaries with every product. Innovation isn't a department — it's our DNA.",
    },
    {
      icon: Target,
      title: "User Obsessed",
      description:
        "Every pixel, every interaction is designed with the end user in mind. We build what people love.",
    },
    {
      icon: Shield,
      title: "Trust & Security",
      description:
        "Security is embedded in our architecture, not bolted on. Your data is sacred.",
    },
    {
      icon: Rocket,
      title: "Ship Fast, Ship Often",
      description:
        "We believe in rapid iteration. Small releases, quick feedback loops, continuous improvement.",
    },
    {
      icon: Users,
      title: "Team Excellence",
      description:
        "We hire the best and invest in their growth. Great products come from great teams.",
    },
    {
      icon: Globe,
      title: "Global Impact",
      description:
        "Our tools serve millions of users worldwide. We build for scale from day one.",
    },
  ]

  return (
    <section id="about" ref={ref} className="relative py-24 sm:py-32">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="grid-pattern absolute inset-0 opacity-50" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mx-auto mb-16 max-w-3xl text-center"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border/50 bg-secondary/50 px-4 py-1.5 text-xs font-medium text-muted-foreground">
            About NexusLabs
          </div>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            We&apos;re building the{" "}
            <span className="gradient-text">future of tech</span>
          </h2>
          <p className="mt-4 text-base text-muted-foreground sm:text-lg">
            NexusLabs was founded with a singular mission: create digital
            products that empower teams and individuals to do their best work.
            From developer tools to AI platforms, we build products that matter.
          </p>
        </motion.div>

        {/* Mission & Vision */}
        <div className="mb-16 grid gap-6 md:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="rounded-2xl border border-border/50 bg-card p-8"
          >
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500/20 to-teal-600/20">
              <Target className="h-5 w-5 text-emerald-400" />
            </div>
            <h3 className="mb-2 text-lg font-semibold">Our Mission</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              To democratize access to powerful technology. We believe that
              world-class tools should be available to everyone — from solo
              developers to enterprise teams. Our mission drives every product
              decision, every line of code, and every design choice we make.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="rounded-2xl border border-border/50 bg-card p-8"
          >
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500/20 to-fuchsia-600/20">
              <Lightbulb className="h-5 w-5 text-violet-400" />
            </div>
            <h3 className="mb-2 text-lg font-semibold">Our Vision</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              A world where technology seamlessly enhances human potential.
              We envision a future where our products form the invisible
              infrastructure behind millions of successful projects, businesses,
              and creative endeavors — powering the next generation of digital
              innovation.
            </p>
          </motion.div>
        </div>

        {/* Values grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <h3 className="mb-8 text-center text-lg font-semibold">
            Our Values
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {values.map((value, i) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: 0.3 + i * 0.05 }}
                className="rounded-xl border border-border/50 bg-card/50 p-5 transition-all duration-300 hover:border-border hover:bg-card"
              >
                <value.icon className="mb-3 h-5 w-5 text-emerald-400" />
                <h4 className="mb-1 text-sm font-semibold">{value.title}</h4>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-16 grid grid-cols-2 gap-6 rounded-2xl border border-border/50 bg-card p-8 sm:grid-cols-4"
        >
          {[
            { value: "9+", label: "Products" },
            { value: "500K+", label: "Users" },
            { value: "99.9%", label: "Uptime" },
            { value: "24/7", label: "Support" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl font-bold tracking-tight sm:text-3xl">
                {stat.value}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
