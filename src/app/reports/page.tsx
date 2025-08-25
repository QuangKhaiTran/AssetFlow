"use client";

import { useState, useEffect, useMemo } from 'react';
import { getRooms, getAssetsByRoomId } from '@/lib/data';
import { type Room, type Asset, type AssetStatus } from '@/lib/types';
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { FileText, Printer, CheckCircle, Wrench, XCircle, Trash2, QrCode, Search, Filter, X, ChevronDown, ChevronUp } from 'lucide-react';
import { QRCodeComponent } from '@/components/qr-code';
import { Input } from '@/components/ui/input';

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
  const [printType, setPrintType] = useState<'list' | 'qr'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    getRooms().then(setRooms);
  }, []);

  const handleRoomChange = async (roomId: string) => {
    if (!roomId) {
        setSelectedRoom(null);
        setAssets([]);
        setSearchTerm('');
        setSelectedStatus('');
        return;
    }
    setIsLoading(true);
    const room = rooms.find(r => r.id === roomId);
    setSelectedRoom(room || null);
    const roomAssets = await getAssetsByRoomId(roomId);
    setAssets(roomAssets);
    setIsLoading(false);
  };

  // Filter assets based on search criteria
  const filteredAssets = useMemo(() => {
    return assets.filter(asset => {
      const matchesSearch = searchTerm === '' || 
        asset.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = selectedStatus === '' || 
        asset.status === selectedStatus;
      
      return matchesSearch && matchesStatus;
    });
  }, [assets, searchTerm, selectedStatus]);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedStatus('');
  };

  const hasActiveFilters = searchTerm || selectedStatus;
  
  const handlePrint = () => {
    if (printType === 'list') {
      window.print();
    } else {
      handlePrintQR();
    }
  };

  const handlePrintQR = () => {
    const printContent = document.getElementById('qr-print-area');
    if (printContent) {
      const originalContents = document.body.innerHTML;
      const printHtml = printContent.innerHTML;
      
      // Temporarily set body content to the printable area
      document.body.innerHTML = `
        <html>
          <head>
            <title>In mã QR - ${selectedRoom?.name}</title>
            <style>
              @media print {
                @page {
                  size: auto;
                  margin: 10mm;
                }
                body {
                  -webkit-print-color-adjust: exact;
                  print-color-adjust: exact;
                }
                .qr-grid-print {
                  display: grid;
                  grid-template-columns: repeat(3, 1fr);
                  gap: 20px;
                }
                .qr-item-print {
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  justify-content: center;
                  border: 1px solid #ccc;
                  padding: 10px;
                  border-radius: 8px;
                  page-break-inside: avoid;
                }
                .qr-item-print img {
                  max-width: 100%;
                  height: auto;
                }
                .qr-item-print p {
                  margin-top: 5px;
                  font-size: 10px;
                  text-align: center;
                  font-family: sans-serif;
                }
              }
            </style>
          </head>
          <body>${printHtml}</body>
        </html>
      `;

      // Trigger print
      window.print();
      
      // Restore original content
      document.body.innerHTML = originalContents;
      // We need to reload to re-initialize the React app state that was lost
      window.location.reload();
    }
  };

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
          <div className="flex flex-col md:flex-row gap-4">
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
            
            {selectedRoom && (
              <>
                <Select value={printType} onValueChange={(value: 'list' | 'qr') => setPrintType(value)}>
                  <SelectTrigger className="w-full md:w-1/4">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="list">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        <span>In danh sách</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="qr">
                      <div className="flex items-center gap-2">
                        <QrCode className="h-4 w-4" />
                        <span>In mã QR</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {selectedRoom && (
        <Collapsible open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <div className="mb-4">
            <CollapsibleTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full h-8 justify-between text-xs"
              >
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <span>Bộ lọc tài sản</span>
                  {hasActiveFilters && (
                    <span className="text-xs bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full">
                      {filteredAssets.length}/{assets.length}
                    </span>
                  )}
                </div>
                {isFilterOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </CollapsibleTrigger>
          </div>
          
          <CollapsibleContent>
            <Card className="no-print mb-3">
              <CardContent className="pt-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Tìm thiết bị</label>
                    <div className="relative">
                      <Search className="absolute left-2 top-2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Nhập tên thiết bị..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8 h-8 text-xs"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Trạng thái</label>
                    <Select value={selectedStatus || undefined} onValueChange={(value) => setSelectedStatus(value || '')}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Tất cả" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Đang sử dụng">Đang sử dụng</SelectItem>
                        <SelectItem value="Đang sửa chữa">Đang sửa chữa</SelectItem>
                        <SelectItem value="Bị hỏng">Bị hỏng</SelectItem>
                        <SelectItem value="Đã thanh lý">Đã thanh lý</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {hasActiveFilters && (
                  <div className="flex justify-end mt-3">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={clearFilters}
                      className="h-8 text-xs"
                    >
                      <X className="mr-1.5 h-3.5 w-3.5" />
                      Xóa bộ lọc
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </CollapsibleContent>
        </Collapsible>
      )}

      {selectedRoom && (
        <>
          <Card id="print-section" className={printType === 'qr' ? 'hidden' : ''}>
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
                      {printType === 'list' ? 'In danh sách' : 'In mã QR'}
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
                  ) : filteredAssets.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="h-24 text-center">
                        {hasActiveFilters ? 'Không tìm thấy thiết bị phù hợp với bộ lọc.' : 'Không tìm thấy tài sản.'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAssets.map((asset) => {
                      const { icon: Icon, color } = statusConfig[asset.status];
                      return (
                          <TableRow key={asset.id}>
                              <TableCell className="font-mono text-xs">{asset.id}</TableCell>
                              <TableCell className="font-medium">{asset.name}</TableCell>
                              <TableCell>
                                  <div className="flex items-center gap-1.5">
                                    <Icon className={`h-3.5 w-3.5 ${color}`} />
                                    <span className={`text-xs font-medium ${color}`}>{asset.status}</span>
                                  </div>
                              </TableCell>
                          </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          
          {printType === 'qr' && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Mã QR: {selectedRoom.name}</CardTitle>
                    <CardDescription>
                      Tạo ngày {new Date().toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <Button onClick={handlePrint} variant="outline" size="sm" className="no-print">
                    <Printer className="mr-1.5 h-3.5 w-3.5" />
                    In mã QR
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div id="qr-print-area">
                  {isLoading ? (
                    <div className="h-24 flex items-center justify-center">
                      Đang tải...
                    </div>
                  ) : filteredAssets.length === 0 ? (
                    <div className="h-24 flex items-center justify-center">
                      {hasActiveFilters ? 'Không tìm thấy thiết bị phù hợp với bộ lọc.' : 'Không tìm thấy tài sản.'}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 qr-grid-print">
                      {filteredAssets.map((asset) => (
                        <div key={asset.id} className="flex flex-col items-center p-2 border rounded-lg qr-item-print">
                          <QRCodeComponent value={asset.id} size={150} />
                          <p className="mt-2 text-xs text-center font-semibold">{asset.name}</p>
                          <p className="text-xs text-muted-foreground font-mono">{asset.id}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
