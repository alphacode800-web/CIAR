"use client"

import { useRef, useState, useMemo } from "react"
import { motion, useInView } from "framer-motion"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Search,
  SlidersHorizontal,
  Eye,
  ArrowUpRight,
  X,
} from "lucide-react"
import type { Project } from "./featured-projects"

interface ProjectsGridProps {
  projects: Project[]
  categories: string[]
  onSelect: (slug: string) => void
}

export function ProjectsGrid({
  projects,
  categories,
  onSelect,
}: ProjectsGridProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const [search, setSearch] = useState("")
  const [activeCategory, setActiveCategory] = useState("All")

  const filtered = useMemo(() => {
    let result = projects
    if (activeCategory !== "All") {
      result = result.filter((p) => p.category === activeCategory)
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.tagline.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      )
    }
    return result
  }, [projects, activeCategory, search])

  return (
    <div ref={ref}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="mb-8"
      >
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
          All Projects
        </h2>
        <p className="mt-2 text-muted-foreground">
          Explore our complete portfolio of digital products and tools.
        </p>
      </motion.div>

      {/* Search & Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="mb-8 space-y-4"
      >
        {/* Search */}
        <div className="relative">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search projects by name, category, or keyword..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-11 rounded-xl pl-10 pr-10"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Categories */}
        <div className="flex flex-wrap items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
          <button
            onClick={() => setActiveCategory("All")}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              activeCategory === "All"
                ? "bg-secondary text-foreground"
                : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                activeCategory === cat
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
          <span className="ml-auto text-xs text-muted-foreground">
            {filtered.length} project{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>
      </motion.div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/50 py-16"
        >
          <Search className="mb-4 h-10 w-10 text-muted-foreground/50" />
          <p className="text-sm font-medium">No projects found</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Try adjusting your search or filter criteria.
          </p>
        </motion.div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((project, i) => (
            <ProjectCard
              key={project.id}
              project={project}
              index={i}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function ProjectCard({
  project,
  index,
  onSelect,
}: {
  project: Project
  index: number
  onSelect: (slug: string) => void
}) {
  const [imgError, setImgError] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.3) }}
    >
      <div
        onClick={() => onSelect(project.slug)}
        className="group cursor-pointer overflow-hidden rounded-xl border border-border/50 bg-card transition-all duration-300 hover:border-border hover:shadow-lg"
      >
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
              <span className="text-4xl font-bold text-emerald-400/30">
                {project.name[0]}
              </span>
            </div>
          )}
          {/* Overlay on hover */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-all duration-300 group-hover:bg-black/40">
            <Button
              size="sm"
              className="gap-1.5 opacity-0 transition-all duration-300 group-hover:opacity-100"
            >
              View Details
              <ArrowUpRight className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="mb-2 flex items-start justify-between gap-2">
            <h3 className="font-semibold">{project.name}</h3>
            <Badge
              variant="secondary"
              className="shrink-0 rounded-md px-2 py-0.5 text-[10px] font-medium"
            >
              {project.category}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {project.tagline}
          </p>

          {/* Tech tags */}
          <div className="mt-3 flex flex-wrap gap-1">
            {JSON.parse(project.technologies)
              .slice(0, 3)
              .map((tech: string) => (
                <span
                  key={tech}
                  className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground"
                >
                  {tech}
                </span>
              ))}
            {JSON.parse(project.technologies).length > 3 && (
              <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                +{JSON.parse(project.technologies).length - 3}
              </span>
            )}
          </div>

          {/* Footer */}
          <div className="mt-3 flex items-center justify-between border-t border-border/50 pt-3">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Eye className="h-3 w-3" />
              {formatNumber(project.views)}
            </div>
            <div className="flex items-center gap-1 text-xs font-medium text-emerald-500 transition-colors group-hover:text-emerald-400">
              Visit
              <ArrowUpRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </div>
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
