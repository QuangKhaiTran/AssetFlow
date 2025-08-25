
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

const dynamicPageConfig: Record<string, { title: string; description: string; icon: React.ElementType }> = {
    "rooms": {
        title: "Chi tiết phòng",
        description: "Thông tin chi tiết về phòng và các tài sản bên trong.",
        icon: Building,
    },
    "assets": {
        title: "Chi tiết tài sản",
        description: "Thông tin chi tiết, trạng thái và lịch sử của tài sản.",
        icon: FileText, // Or another relevant icon
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
      <div>
        <h1 className="text-sm md:text-base font-bold tracking-tight">{config.title}</h1>
        <p className="text-muted-foreground text-xs">
          {config.description}
        </p>
      </div>
    </div>
  );
}
