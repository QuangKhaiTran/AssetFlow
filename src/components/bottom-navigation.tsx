"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  ClipboardList,
} from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
  {
    href: "/",
    label: "Tổng quan",
    icon: LayoutDashboard,
  },
  {
    href: "/asset-management",
    label: "Quản lý",
    icon: ClipboardList,
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
    <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-card border-t z-20">
      <div className="grid h-full grid-cols-3">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center text-xs gap-1",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
