import { getAssetById, getRoomById } from '@/lib/data';
import { notFound } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MapPin, User, Calendar, Tag, QrCode } from 'lucide-react';
import { type AssetStatus } from '@/lib/types';
import { CheckCircle, Wrench, XCircle, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const statusConfig: Record<AssetStatus, { icon: React.ElementType, color: string, bgColor: string }> = {
    'Đang sử dụng': { icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-50' },
    'Đang sửa chữa': { icon: Wrench, color: 'text-amber-600', bgColor: 'bg-amber-50' },
    'Bị hỏng': { icon: XCircle, color: 'text-red-600', bgColor: 'bg-red-50' },
    'Đã thanh lý': { icon: Trash2, color: 'text-gray-500', bgColor: 'bg-gray-50' },
};

export default async function PublicAssetPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const asset = await getAssetById(id);
  if (!asset) {
    notFound();
  }

  const room = await getRoomById(asset.roomId);
  const { icon: Icon, color, bgColor } = statusConfig[asset.status];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Thông tin tài sản</h1>
          <p className="text-sm text-gray-600">Quét mã QR để xem chi tiết</p>
        </div>

        {/* Main Asset Card */}
        <Card className="mb-6 shadow-lg border-0">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl text-center">{asset.name}</CardTitle>
            <CardDescription className="text-center">
              Thông tin chi tiết về tài sản
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Asset ID */}
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Tag className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Mã tài sản</span>
              </div>
              <p className="font-mono text-sm text-gray-900 font-semibold">{asset.id}</p>
            </div>

            {/* Room Information */}
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <MapPin className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-700">Vị trí</span>
              </div>
              <p className="text-sm text-blue-900 font-medium">{room?.name || 'Không xác định'}</p>
            </div>

            {/* Manager */}
            <div className="bg-purple-50 p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <User className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-700">Người quản lý</span>
              </div>
              <p className="text-sm text-purple-900 font-medium">{room?.managerName || 'Không xác định'}</p>
            </div>

            {/* Date Added */}
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-700">Ngày dán nhãn</span>
              </div>
              <p className="text-sm text-green-900 font-medium">
                {new Date(asset.dateAdded).toLocaleDateString('vi-VN')}
              </p>
            </div>

            {/* Status */}
            <div className={`p-3 rounded-lg ${bgColor}`}>
              <div className="flex items-center gap-2 mb-1">
                <QrCode className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Tình trạng hiện tại</span>
              </div>
              <div className="flex items-center gap-2">
                <Icon className={`h-4 w-4 ${color}`} />
                <span className={`text-sm font-medium ${color}`}>{asset.status}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center space-y-4">
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <p className="text-xs text-gray-500 mb-2">Để chỉnh sửa thông tin tài sản,</p>
            <p className="text-xs text-gray-500">vui lòng liên hệ quản lý phòng.</p>
          </div>

          <Button asChild variant="outline" size="sm">
            <Link href="/">
              Quay về trang chủ
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
