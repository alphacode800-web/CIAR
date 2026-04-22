"use client"

import { useEffect, useCallback } from "react"
import {
  LayoutDashboard,
  BarChart3,
  Activity,
  FolderOpen,
  Languages,
  Settings,
  Search,
  Mail,
  Plus,
  Eye,
  Palette,
  Users,
  FileText,
  Globe,
} from "lucide-react"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { useI18n } from "@/lib/i18n-context"

/* ─── Types ──────────────────────────────────────────────────────────────── */

interface SearchCommandProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onNavigate?: (tab: string) => void
}

/* ─── Command Items Config ────────────────────────────────────────────────── */

interface CommandItemConfig {
  id: string
  label: string
  icon: React.ElementType
  shortcut?: string
  group: "pages" | "actions" | "projects"
  action: (onNavigate?: (tab: string) => void) => void
}

const COMMAND_ITEMS: CommandItemConfig[] = [
  // Pages
  {
    id: "overview",
    label: "Go to Dashboard",
    icon: LayoutDashboard,
    group: "pages",
    action: (nav) => nav?.("overview"),
  },
  {
    id: "analytics",
    label: "Go to Analytics",
    icon: BarChart3,
    group: "pages",
    action: (nav) => nav?.("analytics"),
  },
  {
    id: "activity",
    label: "Go to Activity Log",
    icon: Activity,
    group: "pages",
    action: (nav) => nav?.("activity"),
  },
  {
    id: "projects",
    label: "Go to Projects",
    icon: FolderOpen,
    group: "pages",
    action: (nav) => nav?.("projects"),
  },
  {
    id: "translations",
    label: "Go to Translations",
    icon: Languages,
    group: "pages",
    action: (nav) => nav?.("translations"),
  },
  {
    id: "settings",
    label: "Go to Settings",
    icon: Settings,
    group: "pages",
    action: (nav) => nav?.("settings"),
  },
  {
    id: "appearance",
    label: "Go to Appearance",
    icon: Palette,
    group: "pages",
    action: (nav) => nav?.("appearance"),
  },
  {
    id: "contacts",
    label: "Go to Contacts",
    icon: Mail,
    group: "pages",
    action: (nav) => nav?.("contacts"),
  },
  // Actions
  {
    id: "new-project",
    label: "Add New Project",
    icon: Plus,
    group: "actions",
    action: (nav) => nav?.("projects"),
  },
  {
    id: "view-analytics",
    label: "View Analytics",
    icon: Eye,
    group: "actions",
    action: (nav) => nav?.("analytics"),
  },
  {
    id: "manage-users",
    label: "Manage Users",
    icon: Users,
    group: "actions",
    action: () => {},
  },
  {
    id: "export-data",
    label: "Export Data",
    icon: FileText,
    group: "actions",
    action: () => {},
  },
  {
    id: "change-locale",
    label: "Change Language",
    icon: Globe,
    group: "actions",
    action: () => {},
  },
  // Projects
  {
    id: "project-real-estate",
    label: "Real Estate Platform",
    icon: FolderOpen,
    group: "projects",
    action: () => {},
  },
  {
    id: "project-car-rental",
    label: "Car Rental Platform",
    icon: FolderOpen,
    group: "projects",
    action: () => {},
  },
  {
    id: "project-ecommerce",
    label: "E-Commerce Platform",
    icon: FolderOpen,
    group: "projects",
    action: () => {},
  },
]

/* ─── Component ───────────────────────────────────────────────────────────── */

export function SearchCommand({ open, onOpenChange, onNavigate }: SearchCommandProps) {
  const { t } = useI18n()

  const handleSelect = useCallback(
    (id: string) => {
      const item = COMMAND_ITEMS.find((c) => c.id === id)
      if (item) {
        item.action(onNavigate)
      }
      onOpenChange(false)
    },
    [onNavigate, onOpenChange]
  )

  // Keyboard shortcut: Cmd+K / Ctrl+K
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        onOpenChange(!open)
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [open, onOpenChange])

  const pages = COMMAND_ITEMS.filter((i) => i.group === "pages")
  const actions = COMMAND_ITEMS.filter((i) => i.group === "actions")
  const projects = COMMAND_ITEMS.filter((i) => i.group === "projects")

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder={t("admin.search_placeholder") || "Search pages, actions, projects..."}
      />
      <CommandList>
        <CommandEmpty>
          {t("admin.no_results") || "No results found."}
        </CommandEmpty>

        {/* Pages Group */}
        <CommandGroup
          heading={t("admin.search_pages") || "Pages"}
        >
          {pages.map((item) => (
            <CommandItem
              key={item.id}
              onSelect={() => handleSelect(item.id)}
              className="gap-3 py-2.5 cursor-pointer"
            >
              <item.icon className="h-4 w-4 text-[oklch(0.78_0.14_82)] shrink-0" />
              <span className="flex-1">{item.label}</span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        {/* Actions Group */}
        <CommandGroup
          heading={t("admin.search_actions") || "Actions"}
        >
          {actions.map((item) => (
            <CommandItem
              key={item.id}
              onSelect={() => handleSelect(item.id)}
              className="gap-3 py-2.5 cursor-pointer"
            >
              <item.icon className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="flex-1">{item.label}</span>
              <span className="text-[10px] text-muted-foreground/50 bg-muted/50 px-1.5 py-0.5 rounded">
                {t("admin.action") || "Action"}
              </span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        {/* Projects Group */}
        <CommandGroup
          heading={t("admin.search_projects") || "Projects"}
        >
          {projects.map((item) => (
            <CommandItem
              key={item.id}
              onSelect={() => handleSelect(item.id)}
              className="gap-3 py-2.5 cursor-pointer"
            >
              <item.icon className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="flex-1">{item.label}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
