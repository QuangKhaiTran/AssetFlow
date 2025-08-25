import { SidebarProvider, Sidebar, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Header } from "@/components/header";
import { BottomNavigation } from "./bottom-navigation";

export function LayoutProvider({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <Sidebar>
        <AppSidebar />
      </Sidebar>
      <div className="flex flex-col flex-1">
        <Header />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-background">
          {children}
        </main>
        <BottomNavigation />
      </div>
    </SidebarProvider>
  );
}
