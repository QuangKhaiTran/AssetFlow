"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Bot,
  FileText,
  Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/components/ui/sidebar";
import { Button } from "./ui/button";

const menuItems = [
  {
    href: "/",
    label: "Bảng điều khiển",
    icon: LayoutDashboard,
  },
  {
    href: "/maintenance",
    label: "Bảo trì AI",
    icon: Bot,
  },
  {
    href: "/reports",
    label: "Báo cáo",
    icon: FileText,
  },
];

export function BottomNavigation() {
  const pathname = usePathname();
  const { toggleSidebar } = useSidebar();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-card border-t z-20">
      <div className="grid h-full grid-cols-4">
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
        <Button
          variant="ghost"
          className="flex flex-col items-center justify-center text-xs gap-1 h-full w-full rounded-none text-muted-foreground"
          onClick={toggleSidebar}
        >
          <Menu className="h-5 w-5" />
          <span>Menu</span>
        </Button>
      </div>
    </div>
  );
}
