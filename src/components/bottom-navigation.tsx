"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  QrCode,
} from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
  {
    href: "/",
    label: "Tổng quan",
    icon: LayoutDashboard,
  },
  {
    href: "/scan",
    label: "Quét QR",
    icon: QrCode,
  },
  {
    href: "/reports",
    label: "Báo cáo",
    icon: FileText,
  },
];

export function BottomNavigation() {
  const pathname = usePathname();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 h-14 bg-card border-t z-20">
      <div className="grid h-full grid-cols-3">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || (item.href === "/" && pathname.startsWith("/rooms")) || (item.href === "/" && pathname.startsWith("/assets"));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center text-xs gap-0.5 transition-all duration-200",
                isActive 
                  ? "text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.6)] scale-105" 
                  : "text-muted-foreground hover:text-cyan-400 hover:drop-shadow-[0_0_4px_rgba(34,211,238,0.4)]"
              )}
            >
              <item.icon className={cn(
                "h-4 w-4 mb-0.5 transition-all duration-200",
                isActive ? "drop-shadow-[0_0_6px_rgba(34,211,238,0.8)]" : ""
              )} />
              <span className={cn(
                "transition-all duration-200",
                isActive ? "font-semibold" : ""
              )}>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
