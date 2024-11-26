'use client'

import Link from "next/link"
import { Bell, ChevronRight, MessageCircleQuestion, Settings2, SquareArrowOutUpRight, SquareDot } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { useConfig } from "@/contexts/config"
import { useAlerts } from "@/contexts/alerts"
import { alertFilter, flattenAlerts } from "@/components/alerts/utils"
import { ViewConfig } from "@/config/types"
import { usePathname } from "next/navigation"

const items = [
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

type CategorizedViews = { [key: string]: { handle: string, view: ViewConfig }[] }

export function AppSidebar() {
  const pathname = usePathname()
  const { config } = useConfig()
  const { views, viewCategories } = config
  const { alerts } = useAlerts()

  const flatAlerts = flattenAlerts(alerts)

  // Group views by category
  const categorizedViews = Object.entries(views).reduce((acc: CategorizedViews, [handle, view]) => {
    if (handle !== 'default') {
      const category = view.category || '__uncategorized__';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push({ handle, view });
    }
    return acc;
  }, {});
  const uncategorizedViews = categorizedViews.__uncategorized__ || [];
  delete categorizedViews.__uncategorized__;

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
                  <SidebarMenuButton asChild isActive={pathname === item.url}>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a target="_blank" href="https://github.com/MattKetmo/radar/issues">
                    <MessageCircleQuestion />
                    <span>Feedback</span>
                  </a>
                </SidebarMenuButton>
                <SidebarMenuBadge className="text-muted-foreground">
                  <SquareArrowOutUpRight size={14} />
                </SidebarMenuBadge>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>
            Views
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {Object.entries(categorizedViews).map(([category, views]) => (
                <Collapsible defaultOpen className="group/collapsible" key={category}>
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton >
                        <SquareDot />
                        <span className="truncate">{viewCategories[category]?.name || category}</span>
                        <ChevronRight className="transition-transform ml-auto group-data-[state=open]/collapsible:rotate-90" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {views.map(({ handle, view }) => (
                          <SidebarMenuItem key={handle}>
                            <SidebarMenuButton asChild isActive={pathname === `/alerts/${handle}`}>
                              <Link href={`/alerts/${handle}`}>
                                <div className="flex items-baseline gap-2 w-full pr-12">
                                  <span className="truncate grow">{view.name || handle}</span>
                                </div>
                              </Link>
                            </SidebarMenuButton>
                            <SidebarMenuBadge className="text-muted-foreground bg-secondary rounded-sm">
                              {flatAlerts.filter(alertFilter(view.filters)).length}
                            </SidebarMenuBadge>
                          </SidebarMenuItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              ))}
              {uncategorizedViews.map(({ handle, view }) => (
                <SidebarMenuItem key={handle}>
                  <SidebarMenuButton asChild>
                    <Link href={`/alerts/${handle}`}>
                      <div className="flex items-baseline gap-2 w-full pr-12">
                        <span className="truncate grow">{view.name || handle}</span>
                      </div>
                    </Link>
                  </SidebarMenuButton>
                  <SidebarMenuBadge className="text-muted-foreground bg-secondary rounded-sm">
                    {flatAlerts.filter(alertFilter(view.filters)).length}
                  </SidebarMenuBadge>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent >

      {/* <SidebarFooter className="flex items-end justify-end border-t">
      </SidebarFooter> */}

      <SidebarRail />
    </Sidebar >
  )
}
