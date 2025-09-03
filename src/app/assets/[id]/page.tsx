import { getAssetById, getRoomById, getRooms } from '@/lib/data';
import { notFound } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MapPin, User, Calendar, Tag, QrCode, Move, Edit } from 'lucide-react';
import Link from 'next/link';
import { QRCodeComponent } from '@/components/qr-code';
import { type AssetStatus } from '@/lib/types';
import { CheckCircle, Wrench, XCircle, Trash2 } from 'lucide-react';
import { UpdateStatusDialog } from '@/components/update-status-dialog';
import { MoveAssetDialog } from '@/components/move-asset-dialog';

const statusConfig: Record<AssetStatus, { icon: React.ElementType, color: string }> = {
    'Đang sử dụng': { icon: CheckCircle, color: 'text-green-600' },
    'Đang sửa chữa': { icon: Wrench, color: 'text-amber-600' },
    'Bị hỏng': { icon: XCircle, color: 'text-red-600' },
    'Đã thanh lý': { icon: Trash2, color: 'text-gray-500' },
};


export default async function AssetDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const asset = await getAssetById(id);
  if (!asset) {
    notFound();
  }

  const room = await getRoomById(asset.roomId);
  const { icon: Icon, color } = statusConfig[asset.status];
  const allRooms = await getRooms();

  return (
    <div className="flex flex-col gap-4">
       <div>
        <Button asChild variant="ghost" className="mb-1 -ml-3 h-8">
          <Link href={`/rooms/${asset.roomId}`}>
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
            Quay lại {room?.name || 'Phòng'}
          </Link>
        </Button>
      </div>
      <div className="grid md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
            <Card>
                <CardHeader>
                    <CardTitle className="text-xl">{asset.name}</CardTitle>
                    <CardDescription>Thông tin chi tiết về tài sản.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Tag className="h-3.5 w-3.5" />
                            <span>Mã tài sản:</span>
                            <span className="font-mono text-foreground text-xs">{asset.id}</span>
                        </div>
                         <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>Ngày thêm:</span>
                            <span className="font-medium text-foreground">{new Date(asset.dateAdded).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                            <MapPin className="h-3.5 w-3.5" />
                            <span>Vị trí:</span>
                            <span className="font-medium text-foreground">{room?.name}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                            <User className="h-3.5 w-3.5" />
                            <span>Người quản lý:</span>
                            <span className="font-medium text-foreground">{room?.managerName}</span>
                        </div>
                    </div>
                     <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Trạng thái:</span>
                        <div className="flex items-center gap-1.5">
                          <Icon className={`h-3.5 w-3.5 ${color}`} />
                          <span className={`text-xs font-medium ${color}`}>{asset.status}</span>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-2">
                        <MoveAssetDialog asset={asset} rooms={allRooms}>
                            <Button size="sm">
                                <Move className="mr-1.5 h-3.5 w-3.5" />
                                Di dời
                            </Button>
                        </MoveAssetDialog>
                        <UpdateStatusDialog asset={asset}>
                            <Button variant="outline" size="sm">
                                <Edit className="mr-1.5 h-3.5 w-3.5" />
                                Cập nhật
                            </Button>
                        </UpdateStatusDialog>
                    </div>
                </CardContent>
            </Card>
        </div>
        <div className="md:col-span-1">
             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <QrCode className="h-4 w-4"/>
                        Mã QR
                    </CardTitle>
                    <CardDescription>Quét để xem chi tiết tài sản.</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-center p-2">
                    <div className="p-1.5 bg-white rounded-md border">
                        <QRCodeComponent value={asset.id} size={150} />
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
