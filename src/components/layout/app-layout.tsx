import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./app-sidebar";
import { AppThemeColor } from "./app-theme-color";

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppThemeColor />
      <AppSidebar />
      <main className="grow relative">
        <div className="absolute inset-0">
          {children}
        </div>
      </main>
    </SidebarProvider>
  )
}
