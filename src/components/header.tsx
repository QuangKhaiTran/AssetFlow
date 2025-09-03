"use client";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, LogOut, LayoutDashboard, FileText, ClipboardList, QrCode, Users, Download, Bot, Building } from "lucide-react";
import { useAuth } from "./auth-provider";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { usePWAInstall } from "@/hooks/use-pwa-install";

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
  {
    href: "/maintenance",
    label: "Bảo trì",
    icon: Bot,
  }
];

const pageConfig: Record<string, { title: string; icon: React.ElementType }> = {
  "/": {
    title: "Tổng quan",
    icon: LayoutDashboard,
  },
  "/scan": {
    title: "Quét mã QR",
    icon: QrCode,
  },
  "/reports": {
    title: "Báo cáo",
    icon: FileText,
  },
   "/maintenance": {
    title: "Bảo trì dự đoán",
    icon: Bot,
  },
    "rooms": {
        title: "Chi tiết phòng",
        icon: Building,
    },
    "assets": {
        title: "Chi tiết tài sản",
        icon: FileText, 
    }
};

const PageTitle = () => {
    const pathname = usePathname();
    const pathSegments = pathname.split('/').filter(Boolean);
    let config = pageConfig[pathname];

    if (!config && pathSegments.length > 0) {
        const pageType = pathSegments[0];
        if (pageConfig[pageType]) {
            config = pageConfig[pageType]
        }
    }
  
    if (!config) {
        return null;
    }
  
    const Icon = config.icon;

    return (
        <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-primary" />
            <h1 className="text-sm md:text-base font-bold tracking-tight">{config.title}</h1>
        </div>
    );
};


export function Header() {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { isInstallable, installApp } = usePWAInstall();

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  const getInitials = (email: string | null | undefined) => {
    if (!email) return "??";
    return email.substring(0, 2).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-10 flex h-12 items-center gap-4 border-b bg-card px-4 sm:px-6">
      <div className="flex-1 flex items-center gap-6">
        <PageTitle />
        {/* Desktop Navigation - Hidden on mobile */}
        <nav className="hidden md:flex items-center gap-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href || (item.href === "/" && pathname.startsWith("/rooms")) || (item.href === "/" && pathname.startsWith("/assets"));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200",
                  isActive 
                    ? "text-cyan-400 bg-cyan-400/10 drop-shadow-[0_0_8px_rgba(34,211,238,0.3)] scale-105" 
                    : "text-muted-foreground hover:text-cyan-400 hover:bg-cyan-400/5 hover:drop-shadow-[0_0_4px_rgba(34,211,238,0.2)]"
                )}
              >
                <item.icon className={cn(
                  "h-4 w-4 transition-all duration-200",
                  isActive ? "drop-shadow-[0_0_6px_rgba(34,211,238,0.8)]" : ""
                )} />
                <span className="text-xs">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Bell className="h-4 w-4" />
          <span className="sr-only">Thông báo</span>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                {/* Placeholder image, you can enhance this later */}
                <AvatarImage src="" alt="User avatar" />
                <AvatarFallback>{getInitials(user?.email)}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{user?.email || "Tài khoản"}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Hồ sơ</DropdownMenuItem>
            <DropdownMenuItem>Cài đặt</DropdownMenuItem>
            {isInstallable && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={installApp}>
                  <Download className="mr-2" />
                  Tải ứng dụng
                </DropdownMenuItem>
              </>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2" />
              Đăng xuất
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
