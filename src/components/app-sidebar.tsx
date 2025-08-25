"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Bot,
  FileText,
  Building,
  HardHat,
  LogOut,
  Settings,
} from "lucide-react";
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

export function AppSidebar() {
  const pathname = usePathname();
  const isActive = (path: string) => pathname === path;

  return (
    <>
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <div className="bg-primary p-2 rounded-lg">
            <HardHat className="text-primary-foreground" />
          </div>
          <h1 className="text-xl font-bold text-primary">AssetFlow</h1>
        </div>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.label}>
              <SidebarMenuButton
                asChild
                isActive={isActive(item.href)}
                className="justify-start"
              >
                <Link href={item.href}>
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.label}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center">
            <Building className="mr-2" />
            <span>Phòng</span>
          </SidebarGroupLabel>
          <SidebarMenu>
             <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/rooms/room-1")} className="justify-start pl-6">
                    <Link href="/rooms/room-1">Phòng họp A</Link>
                </SidebarMenuButton>
             </SidebarMenuItem>
             <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/rooms/room-2")} className="justify-start pl-6">
                    <Link href="/rooms/room-2">Văn phòng B</Link>
                </SidebarMenuButton>
             </SidebarMenuItem>
             <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/rooms/room-3")} className="justify-start pl-6">
                    <Link href="/rooms/room-3">Phòng thí nghiệm C</Link>
                </SidebarMenuButton>
             </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton className="justify-start">
              <Settings className="mr-2 h-4 w-4" /> Cài đặt
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <Button variant="ghost" className="w-full justify-start">
              <LogOut className="mr-2 h-4 w-4" /> Đăng xuất
            </Button>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </>
  );
}
