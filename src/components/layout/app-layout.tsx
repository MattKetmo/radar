import { SidebarProvider } from "@/components/ui/sidebar";
import { CommandMenu } from "@/components/command/command-menu";
import { AppSidebar } from "./app-sidebar";
import { AppThemeColor } from "./app-theme-color";

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppThemeColor />
      <AppSidebar />
      <CommandMenu />
      <main className="grow relative bg-sidebar">
        <div className="absolute inset-0 bg-background m-2 rounded-sm overflow-auto border">
          {children}
        </div>
      </main>
    </SidebarProvider>
  )
}
