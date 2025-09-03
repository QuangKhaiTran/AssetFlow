
"use client";

import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    FileText,
    ClipboardList,
    QrCode,
    Users,
    Bot,
    Building
} from "lucide-react";

const pageConfig: Record<string, { title: string; icon: React.ElementType }> = {
  "/": {
    title: "Tổng quan",
    icon: LayoutDashboard,
  },
  "/asset-management": {
    title: "Quản lý loại tài sản",
    icon: ClipboardList,
  },
  "/scan": {
    title: "Quét mã QR",
    icon: QrCode,
  },
  "/reports": {
    title: "Báo cáo",
    icon: FileText,
  },
  "/users": {
    title: "Quản lý người dùng",
    icon: Users,
  },
   "/maintenance": {
    title: "Bảo trì dự đoán",
    icon: Bot,
  },
};

const dynamicPageConfig: Record<string, { title: string; icon: React.ElementType }> = {
    "rooms": {
        title: "Chi tiết phòng",
        icon: Building,
    },
    "assets": {
        title: "Chi tiết tài sản",
        icon: FileText, 
    }
}


export function PageHeader() {
  const pathname = usePathname();
  
  const pathSegments = pathname.split('/').filter(Boolean);

  let config = pageConfig[pathname];

  if (!config && pathSegments.length > 1) {
    const pageType = pathSegments[0];
    if (dynamicPageConfig[pageType]) {
        config = dynamicPageConfig[pageType]
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
}
