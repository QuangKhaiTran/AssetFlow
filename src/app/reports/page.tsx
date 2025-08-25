"use client";

import { useState } from 'react';
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
  'In Use': { icon: CheckCircle, color: 'text-green-600' },
  'Under Repair': { icon: Wrench, color: 'text-amber-600' },
  'Broken': { icon: XCircle, color: 'text-red-600' },
  'Disposed': { icon: Trash2, color: 'text-gray-500' },
};

export default function ReportsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useState(() => {
    getRooms().then(setRooms);
  });

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
    <div className="flex flex-col gap-8">
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

      <div className="flex items-center gap-4">
        <FileText className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
          <p className="text-muted-foreground">
            Generate and view asset reports by room.
          </p>
        </div>
      </div>

      <Card className="no-print">
        <CardHeader>
          <CardTitle>Select a Room</CardTitle>
          <CardDescription>
            Choose a room to generate an asset report.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select onValueChange={handleRoomChange}>
            <SelectTrigger className="w-full md:w-1/3">
              <SelectValue placeholder="Select a room..." />
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
                    <CardTitle>Asset Report: {selectedRoom.name}</CardTitle>
                    <CardDescription>
                        Generated on {new Date().toLocaleDateString()}
                    </CardDescription>
                </div>
                <Button onClick={handlePrint} variant="outline" className="no-print">
                    <Printer className="mr-2 h-4 w-4" />
                    Print Report
                </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Asset ID</TableHead>
                  <TableHead>Asset Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date Added</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : assets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      No assets found in this room.
                    </TableCell>
                  </TableRow>
                ) : (
                  assets.map((asset) => {
                    const { icon: Icon, color } = statusConfig[asset.status];
                    return (
                        <TableRow key={asset.id}>
                            <TableCell className="font-mono">{asset.id}</TableCell>
                            <TableCell className="font-medium">{asset.name}</TableCell>
                            <TableCell>
                                <Badge variant={
                                    asset.status === 'In Use' ? 'default' : 
                                    asset.status === 'Under Repair' ? 'secondary' : 
                                    asset.status === 'Broken' ? 'destructive' : 'outline'
                                } className="capitalize">
                                    <Icon className={`mr-2 h-4 w-4 ${color}`} />
                                    {asset.status}
                                </Badge>
                            </TableCell>
                            <TableCell>{new Date(asset.dateAdded).toLocaleDateString()}</TableCell>
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
