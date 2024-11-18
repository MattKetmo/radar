'use client'

import { useEffect, useState } from "react"
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { useRouter } from "next/navigation"
import { Bell, ChevronRight, Settings2, SquareDot } from "lucide-react"
import { useConfig } from "@/contexts/config"

const navigation = [
  {
    title: "Alerts",
    url: "/alerts",
    icon: Bell,
  },
  // {
  //   title: "Silences",
  //   url: "/silences",
  //   icon: CircleSlash2,
  // },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings2,
  },
]

export function CommandMenu() {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const { config } = useConfig()
  const { views, viewCategories } = config

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Suggestions">
          {navigation.map((item) => (
            <CommandItem key={item.url} onSelect={() => { router.push(item.url); setOpen(false) }}>
              <item.icon className="w-6 h-6 mr-2" />
              {item.title}
            </CommandItem>
          ))}
          {Object.entries(views)
            .filter(([handle]) => handle !== "default")
            .map(([handle, view]) => (
              <CommandItem key={handle} onSelect={() => { router.push(`/alerts/${handle}`); setOpen(false) }}>
                <SquareDot className="w-6 h-6 mr-2" />
                {viewCategories[view.category]?.name ? `${viewCategories[view.category].name}` : view.category}
                {view.category ? <span className="px-1">»</span> : ''}
                {view.name || handle}
              </CommandItem>
            ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
