import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./app-sidebar";

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="grow relative">
        <div className="absolute inset-0">
          {children}
        </div>
      </main>
    </SidebarProvider>
  )
}
