'use client'

import { Bell, Bookmark, CircleSlash2, LayoutGrid, Rows3, Settings2, SquareDot, Tag } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { DarkModeToggle } from "./dark-mode-toggle"
import Link from "next/link"
import { useConfig } from "@/contexts/config"
import { useAlerts } from "@/contexts/alerts"
import { alertFilter, flattenAlerts } from "../alerts/utils"

const items = [
  {
    title: "Alerts",
    url: "/alerts",
    icon: Bell,
  },
  {
    title: "Silences",
    url: "/silences",
    icon: CircleSlash2,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings2,
  },
]


export function AppSidebar() {
  const { config } = useConfig()
  const { views } = config
  const { alerts } = useAlerts()

  const flatAlerts = flattenAlerts(alerts)

  return (
    <Sidebar>
      {/* <SidebarHeader>
        <div className="flex items-center justify-end">
          <SidebarTrigger />
        </div>
      </SidebarHeader> */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            Application
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>
            Views
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {Object.entries(views).map(([handle, view]) => (
                handle === 'default' ? null : (
                  <SidebarMenuItem key={handle}>
                    <SidebarMenuButton asChild>
                      <Link href={`/alerts/${handle}`}>
                        <SquareDot />
                        <div className="flex items-baseline gap-2 w-full">
                          <span className="shrink-0 grow">{view.name || handle}</span>
                          <span className="shrink-0 text-xs text-muted-foreground bg-secondary p-1 w-6 text-center rounded-sm">
                            {flatAlerts.filter(alertFilter(view.filters)).length}
                          </span>
                        </div>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

      </SidebarContent>
      <SidebarFooter className="flex items-end justify-end">
        <DarkModeToggle />
      </SidebarFooter>
    </Sidebar>
  )
}
