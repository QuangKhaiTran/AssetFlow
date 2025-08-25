import { Header } from "@/components/header";
import { BottomNavigation } from "./bottom-navigation";

export function LayoutProvider({ children }: { children: React.ReactNode }) {
  return (
      <div className="flex flex-col flex-1">
        <Header />
        <main className="flex-1 p-3 md:p-6 bg-background">
          {children}
        </main>
        <BottomNavigation />
      </div>
  );
}
