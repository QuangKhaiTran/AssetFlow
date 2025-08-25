import { getAssetById, getRoomById, getUserById } from '@/lib/data';
import { notFound } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, MapPin, User, Calendar, Tag, QrCode, Move, Edit } from 'lucide-react';
import Link from 'next/link';
import { QRCodeComponent } from '@/components/qr-code';
import { type AssetStatus } from '@/lib/types';
import { CheckCircle, Wrench, XCircle, Trash2 } from 'lucide-react';

const statusConfig: Record<AssetStatus, { icon: React.ElementType, color: string }> = {
    'Đang sử dụng': { icon: CheckCircle, color: 'text-green-600' },
    'Đang sửa chữa': { icon: Wrench, color: 'text-amber-600' },
    'Bị hỏng': { icon: XCircle, color: 'text-red-600' },
    'Đã thanh lý': { icon: Trash2, color: 'text-gray-500' },
};


export default async function AssetDetailPage({ params }: { params: { id: string } }) {
  const asset = await getAssetById(params.id);
  if (!asset) {
    notFound();
  }

  const room = await getRoomById(asset.roomId);
  const manager = room ? await getUserById(room.managerId) : null;
  const { icon: Icon, color } = statusConfig[asset.status];

  // This should be replaced with the actual URL in a production environment
  const assetUrl = `http://localhost:9002/assets/${asset.id}`;

  return (
    <div className="flex flex-col gap-8">
       <div>
        <Button asChild variant="ghost" className="mb-4">
          <Link href={`/rooms/${asset.roomId}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại {room?.name || 'Phòng'}
          </Link>
        </Button>
      </div>
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
            <Card>
                <CardHeader>
                    <CardTitle className="text-3xl">{asset.name}</CardTitle>
                    <CardDescription>Thông tin chi tiết về tài sản.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Tag className="h-4 w-4" />
                            <span>Mã tài sản:</span>
                            <span className="font-mono text-foreground">{asset.id}</span>
                        </div>
                         <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>Ngày thêm:</span>
                            <span className="font-medium text-foreground">{new Date(asset.dateAdded).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            <span>Vị trí:</span>
                            <span className="font-medium text-foreground">{room?.name}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <User className="h-4 w-4" />
                            <span>Người quản lý:</span>
                            <span className="font-medium text-foreground">{manager?.name}</span>
                        </div>
                    </div>
                     <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Trạng thái:</span>
                        <Badge variant={
                                asset.status === 'Đang sử dụng' ? 'default' : 
                                asset.status === 'Đang sửa chữa' ? 'secondary' : 
                                asset.status === 'Bị hỏng' ? 'destructive' : 'outline'
                            } className="capitalize">
                            <Icon className={`mr-2 h-4 w-4 ${color}`} />
                            {asset.status}
                        </Badge>
                    </div>
                    <div className="flex gap-2 pt-4">
                        <Button>
                            <Move className="mr-2 h-4 w-4" />
                            Di dời tài sản
                        </Button>
                        <Button variant="outline">
                            <Edit className="mr-2 h-4 w-4" />
                            Cập nhật trạng thái
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
        <div className="md:col-span-1">
             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <QrCode className="h-5 w-5"/>
                        Mã QR
                    </CardTitle>
                    <CardDescription>Quét để xem chi tiết tài sản này.</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-center p-6">
                    <div className="p-4 bg-white rounded-lg border">
                        <QRCodeComponent value={assetUrl} size={200} />
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
