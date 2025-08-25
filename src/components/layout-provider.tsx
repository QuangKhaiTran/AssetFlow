"use client";

import { Header } from "@/components/header";
import { BottomNavigation } from "./bottom-navigation";
import { useAuth } from "./auth-provider";
import { usePathname } from "next/navigation";

export function LayoutProvider({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();

  // Don't show layout on login page
  if (pathname === "/login") {
    return <>{children}</>;
  }
  
  // You can show a global loader here if needed
  if (loading) {
    return (
       <div className="flex h-screen items-center justify-center">
          <p>Đang tải ứng dụng...</p>
        </div>
    );
  }

  // If user is not logged in, AuthProvider will handle the redirect.
  // This just prevents a flash of un-authenticated content.
  if (!user) {
    return null; 
  }

  return (
      <div className="flex flex-col flex-1">
        <Header />
        <main className="flex-1 p-3 md:p-6 bg-background/95">
          {children}
        </main>
        <BottomNavigation />
      </div>
  );
}
