"use client"

import { useRef, useState } from "react"
import { motion, useInView } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowUpRight, Eye } from "lucide-react"

export interface Project {
  id: string
  name: string
  slug: string
  tagline: string
  description: string
  imageUrl: string
  category: string
  url: string
  technologies: string
  featured: boolean
  views: number
  order: number
}

interface FeaturedProjectsProps {
  projects: Project[]
  onSelect: (slug: string) => void
}

export function FeaturedProjects({ projects, onSelect }: FeaturedProjectsProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const featured = projects.filter((p) => p.featured).slice(0, 4)

  return (
    <div ref={ref}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="mb-8"
      >
        <Badge variant="secondary" className="mb-3 rounded-full px-3 py-1 text-xs">
          Featured
        </Badge>
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Spotlight Projects
        </h2>
        <p className="mt-2 text-muted-foreground">
          Our most impactful products driving innovation across industries.
        </p>
      </motion.div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {featured.map((project, i) => (
          <FeaturedCard
            key={project.id}
            project={project}
            index={i}
            isInView={isInView}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  )
}

function FeaturedCard({
  project,
  index,
  isInView,
  onSelect,
}: {
  project: Project
  index: number
  isInView: boolean
  onSelect: (slug: string) => void
}) {
  const [imgError, setImgError] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      onClick={() => onSelect(project.slug)}
      className="group cursor-pointer"
    >
      <div className="overflow-hidden rounded-xl border border-border/50 bg-card transition-all duration-300 hover:border-border hover:shadow-lg">
        {/* Image */}
        <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-muted to-muted/50">
          {!imgError ? (
            <img
              src={project.imageUrl}
              alt={project.name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-emerald-900/20 to-teal-900/20">
              <span className="text-3xl font-bold text-emerald-400/30">
                {project.name[0]}
              </span>
            </div>
          )}
          {project.featured && (
            <div className="absolute top-2 right-2">
              <Badge className="bg-emerald-500/90 text-[10px] text-white hover:bg-emerald-500">
                Featured
              </Badge>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="mb-1 flex items-center justify-between">
            <h3 className="font-semibold text-sm">{project.name}</h3>
            <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2">
            {project.tagline}
          </p>
          <div className="mt-3 flex items-center gap-2 text-[10px] text-muted-foreground">
            <Eye className="h-3 w-3" />
            {formatNumber(project.views)} views
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function formatNumber(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
  return n.toString()
}
