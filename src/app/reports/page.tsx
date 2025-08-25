"use client";

import { useState, useEffect } from 'react';
import { getRooms, getAssetsByRoomId, type Room, type Asset } from '@/lib/data';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { FileText, Printer, CheckCircle, Wrench, XCircle, Trash2 } from 'lucide-react';
import type { AssetStatus } from '@/lib/types';

const statusConfig: Record<AssetStatus, { icon: React.ElementType, color: string }> = {
  'Đang sử dụng': { icon: CheckCircle, color: 'text-green-600' },
  'Đang sửa chữa': { icon: Wrench, color: 'text-amber-600' },
  'Bị hỏng': { icon: XCircle, color: 'text-red-600' },
  'Đã thanh lý': { icon: Trash2, color: 'text-gray-500' },
};

export default function ReportsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    getRooms().then(setRooms);
  }, []);

  const handleRoomChange = async (roomId: string) => {
    if (!roomId) {
        setSelectedRoom(null);
        setAssets([]);
        return;
    }
    setIsLoading(true);
    const room = rooms.find(r => r.id === roomId);
    setSelectedRoom(room || null);
    const roomAssets = await getAssetsByRoomId(roomId);
    setAssets(roomAssets);
    setIsLoading(false);
  };
  
  const handlePrint = () => {
    window.print();
  }

  return (
    <div className="flex flex-col gap-4">
        <style>{`
            @media print {
                body * {
                    visibility: hidden;
                }
                #print-section, #print-section * {
                    visibility: visible;
                }
                #print-section {
                    position: absolute;
                    left: 0;
                    top: 0;
                    width: 100%;
                }
                .no-print {
                    display: none;
                }
            }
        `}</style>

      <Card className="no-print">
        <CardHeader>
          <CardTitle>Chọn phòng</CardTitle>
          <CardDescription>
            Chọn một phòng để tạo báo cáo tài sản.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select onValueChange={handleRoomChange}>
            <SelectTrigger className="w-full md:w-1/2">
              <SelectValue placeholder="Chọn một phòng..." />
            </SelectTrigger>
            <SelectContent>
              {rooms.map((room) => (
                <SelectItem key={room.id} value={room.id}>
                  {room.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedRoom && (
        <Card id="print-section">
          <CardHeader>
             <div className="flex items-center justify-between">
                <div>
                    <CardTitle>Báo cáo: {selectedRoom.name}</CardTitle>
                    <CardDescription>
                        Tạo ngày {new Date().toLocaleDateString()}
                    </CardDescription>
                </div>
                <Button onClick={handlePrint} variant="outline" size="sm" className="no-print">
                    <Printer className="mr-1.5 h-3.5 w-3.5" />
                    In
                </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã tài sản</TableHead>
                  <TableHead>Tên</TableHead>
                  <TableHead>Trạng thái</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center">
                      Đang tải...
                    </TableCell>
                  </TableRow>
                ) : assets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center">
                      Không tìm thấy tài sản.
                    </TableCell>
                  </TableRow>
                ) : (
                  assets.map((asset) => {
                    const { icon: Icon, color } = statusConfig[asset.status];
                    return (
                        <TableRow key={asset.id}>
                            <TableCell className="font-mono text-[10px]">{asset.id}</TableCell>
                            <TableCell className="font-medium">{asset.name}</TableCell>
                            <TableCell>
                                <Badge variant={
                                    asset.status === 'Đang sử dụng' ? 'default' : 
                                    asset.status === 'Đang sửa chữa' ? 'secondary' : 
                                    asset.status === 'Bị hỏng' ? 'destructive' : 'outline'
                                } className="capitalize text-[10px]">
                                    <Icon className={`mr-1 h-3 w-3 ${color}`} />
                                    {asset.status}
                                </Badge>
                            </TableCell>
                        </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
