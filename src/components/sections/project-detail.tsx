"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  ExternalLink,
  Eye,
  Calendar,
  X,
  ArrowUpRight,
} from "lucide-react"
import type { Project } from "./featured-projects"

interface ProjectDetailProps {
  project: Project | null
  open: boolean
  onClose: () => void
}

export function ProjectDetail({
  project,
  open,
  onClose,
}: ProjectDetailProps) {
  const [imgError, setImgError] = useState(false)

  if (!project) return null

  const technologies = JSON.parse(project.technologies) as string[]

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="w-full overflow-y-auto border-border/50 bg-background p-0 sm:max-w-2xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-background/80 text-muted-foreground backdrop-blur-sm transition-colors hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>

        <AnimatePresence>
          {project && (
            <motion.div
              key={project.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Hero Image */}
              <div className="relative aspect-[2/1] w-full overflow-hidden bg-gradient-to-br from-muted to-muted/50">
                {!imgError ? (
                  <img
                    src={project.imageUrl}
                    alt={project.name}
                    className="h-full w-full object-cover"
                    onError={() => setImgError(true)}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-emerald-900/20 to-teal-900/20">
                    <span className="text-6xl font-bold text-emerald-400/30">
                      {project.name[0]}
                    </span>
                  </div>
                )}
                {/* Gradient overlay at bottom */}
                <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-background to-transparent" />
              </div>

              {/* Content */}
              <div className="px-6 pb-8 pt-2 sm:px-8">
                <SheetHeader className="mb-4 text-left">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      variant="secondary"
                      className="rounded-md text-xs font-medium"
                    >
                      {project.category}
                    </Badge>
                    {project.featured && (
                      <Badge className="rounded-md border-0 bg-emerald-500/90 text-xs text-white">
                        Featured
                      </Badge>
                    )}
                  </div>
                  <SheetTitle className="mt-3 text-2xl font-bold tracking-tight">
                    {project.name}
                  </SheetTitle>
                  <p className="text-base text-muted-foreground">
                    {project.tagline}
                  </p>
                </SheetHeader>

                {/* Stats */}
                <div className="mb-6 flex items-center gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Eye className="h-4 w-4" />
                    <span>{project.views.toLocaleString()} views</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {new Date(project.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                      })}
                    </span>
                  </div>
                </div>

                <Separator className="mb-6" />

                {/* Description */}
                <div className="mb-6">
                  <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    About
                  </h3>
                  <p className="text-sm leading-relaxed text-foreground/80">
                    {project.description}
                  </p>
                </div>

                {/* Technologies */}
                <div className="mb-8">
                  <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    Technologies
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {technologies.map((tech) => (
                      <Badge
                        key={tech}
                        variant="outline"
                        className="rounded-lg border-border/50 px-3 py-1 text-xs font-medium"
                      >
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button
                    asChild
                    className="h-11 gap-2 rounded-xl"
                    onClick={() => {
                      fetch(`/api/projects/${project.slug}/view`, {
                        method: "POST",
                      })
                    }}
                  >
                    <a
                      href={project.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Visit Website
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-11 gap-2 rounded-xl"
                    onClick={onClose}
                  >
                    <ArrowUpRight className="h-4 w-4" />
                    Back to Projects
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </SheetContent>
    </Sheet>
  )
}
