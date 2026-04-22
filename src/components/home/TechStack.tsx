"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import { useI18n } from "@/lib/i18n-context"

const techStack = [
  { name: "React", key: "React" },
  { name: "Next.js", key: "Next.js" },
  { name: "Node.js", key: "Node.js" },
  { name: "TypeScript", key: "TypeScript" },
  { name: "Prisma", key: "Prisma" },
  { name: "Tailwind CSS", key: "Tailwind" },
  { name: "PostgreSQL", key: "PostgreSQL" },
  { name: "Redis", key: "Redis" },
  { name: "Docker", key: "Docker" },
  { name: "AWS", key: "AWS" },
  { name: "GraphQL", key: "GraphQL" },
  { name: "Figma", key: "Figma" },
]

export function TechStack() {
  const { t } = useI18n()
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-50px" })

  return (
    <section ref={ref} className="relative py-14 sm:py-16 overflow-hidden">
      <motion.div
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ duration: 0.6 }}
      >
        {/* Fade edges */}
        <div className="pointer-events-none absolute inset-y-0 start-0 z-10 w-16 bg-gradient-to-e from-background to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 end-0 z-10 w-16 bg-gradient-to-s from-background to-transparent" />

        <div className="flex animate-tech-scroll gap-3 sm:gap-4">
          {[...techStack, ...techStack].map((tech, i) => (
            <motion.div
              key={`${tech.name}-${i}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.4, delay: i * 0.03 }}
              className="glass-subtle flex-shrink-0 rounded-full px-4 sm:px-5 py-2.5 flex items-center gap-2 border border-[oklch(0.78_0.14_82/8%)] hover:border-[oklch(0.78_0.14_82/20%)] transition-all duration-300 hover:bg-[oklch(0.78_0.14_82/5%)]"
            >
              {/* Simple text icon indicator */}
              <div className="h-5 w-5 rounded-full bg-[oklch(0.78_0.14_82/15%)] flex items-center justify-center">
                <span className="text-[8px] font-bold text-[oklch(0.78_0.14_82)]">
                  {tech.key.charAt(0)}
                </span>
              </div>
              <span className="text-xs sm:text-sm font-medium text-muted-foreground whitespace-nowrap">
                {tech.name}
              </span>
            </motion.div>
          ))}
        </div>

        <style jsx>{`
          @keyframes tech-scroll {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .animate-tech-scroll {
            animation: tech-scroll 25s linear infinite;
          }
          @media (prefers-reduced-motion: reduce) {
            .animate-tech-scroll {
              animation: none;
            }
          }
        `}</style>
      </motion.div>
    </section>
  )
}
