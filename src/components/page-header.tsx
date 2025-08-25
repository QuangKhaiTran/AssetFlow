
"use client";

import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    FileText,
    ClipboardList,
    QrCode,
    Users,
    Bot,
} from "lucide-react";

const pageConfig: Record<string, { title: string; description: string; icon: React.ElementType }> = {
  "/": {
    title: "Tổng quan",
    description: "Xem thông tin tổng quan về tài sản và phòng ban.",
    icon: LayoutDashboard,
  },
  "/asset-management": {
    title: "Quản lý loại tài sản",
    description: "Tạo và xem các loại tài sản trong hệ thống.",
    icon: ClipboardList,
  },
  "/scan": {
    title: "Quét mã QR",
    description: "Hướng camera vào mã QR của tài sản để tra cứu.",
    icon: QrCode,
  },
  "/reports": {
    title: "Báo cáo",
    description: "Tạo và xem báo cáo tài sản theo phòng.",
    icon: FileText,
  },
  "/users": {
    title: "Quản lý người dùng",
    description: "Tạo và xem danh sách người dùng trong hệ thống.",
    icon: Users,
  },
   "/maintenance": {
    title: "Bảo trì dự đoán",
    description: "Tận dụng AI để dự báo nhu cầu bảo trì và ngăn ngừa thời gian chết.",
    icon: Bot,
  },
};

export function PageHeader() {
  const pathname = usePathname();

  // Find the matching configuration, handle dynamic routes later
  const config = Object.keys(pageConfig).find(key => pathname.startsWith(key) && (key === '/' ? pathname.length === 1 : true) ) ? pageConfig[Object.keys(pageConfig).find(key => pathname.startsWith(key) && (key === '/' ? pathname.length === 1 : true))!] : null;

  // Don't render anything for dynamic routes for now, or routes not in config
  if (!config) {
    return null;
  }
  
  const Icon = config.icon;

  return (
    <div className="flex items-center gap-2">
      <Icon className="h-4 w-4 text-primary" />
      <div>
        <h1 className="text-sm font-bold tracking-tight">{config.title}</h1>
        <p className="text-muted-foreground text-[10px]">
          {config.description}
        </p>
      </div>
    </div>
  );
}
