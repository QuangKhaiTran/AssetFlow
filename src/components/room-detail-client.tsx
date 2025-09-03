"use client";

import { useState, useEffect, useMemo } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, PlusCircle, CheckCircle, Wrench, XCircle, Trash2, FileDown, Search, Filter, X, ChevronDown, ChevronUp } from 'lucide-react';
import { type AssetStatus, type Room, type Asset, type AssetType, type User as UserType } from '@/lib/types';
import { AddAssetDialog } from '@/components/add-asset-dialog';
import { QRCodeComponent } from '@/components/qr-code';
import { Input } from '@/components/ui/input';
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

const statusConfig: Record<AssetStatus, { icon: React.ElementType, color: string }> = {
    'Đang sử dụng': { icon: CheckCircle, color: 'text-green-600' },
    'Đang sửa chữa': { icon: Wrench, color: 'text-amber-600' },
    'Bị hỏng': { icon: XCircle, color: 'text-red-600' },
    'Đã thanh lý': { icon: Trash2, color: 'text-gray-500' },
};

export function RoomDetailClient({ room, initialAssets, manager: _manager, assetTypes }: { room: Room, initialAssets: Asset[], manager: UserType | null, assetTypes: AssetType[] }) {
  const [assets, setAssets] = useState(initialAssets);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const router = useRouter();

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

  useEffect(() => {
    setAssets(initialAssets);
  }, [initialAssets]);

  const handleGeneratePdf = async () => {
    setIsGeneratingPdf(true);
    const pdf = new jsPDF('p', 'mm', 'a4');
    const qrCodeElements = document.getElementById('qr-code-grid-for-pdf');

    if (qrCodeElements) {
        try {
            const canvas = await html2canvas(qrCodeElements, {
                scale: 2,
                backgroundColor: '#ffffff',
            });
            const imgData = canvas.toDataURL('image/png');
            const imgWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            let heightLeft = imgHeight;
            let position = 0;

            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;

            while (heightLeft > 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }

            pdf.save(`qr-codes-${room.name.replace(/\s+/g, '-')}.pdf`);
        } catch (error) {
            console.error("Error generating PDF:", error);
        }
    }
    setIsGeneratingPdf(false);
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <Button asChild variant="ghost" className="mb-1 -ml-3 h-8">
          <Link href="/">
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
            Quay lại Tổng quan
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-y-2">
            <div className="flex items-center gap-2">
              <CardTitle>{room.name}</CardTitle>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Filter className="h-4 w-4" />
                <span>{filteredAssets.length}/{assets.length}</span>
              </div>
            </div>
             <div className="flex items-center gap-2">
                 <Button size="sm" variant="outline" onClick={handleGeneratePdf} disabled={isGeneratingPdf || assets.length === 0}>
                    <FileDown className="mr-1.5 h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Xuất PDF mã QR</span>
                     <span className="sm:hidden">PDF</span>
                </Button>
                <AddAssetDialog roomId={room.id} assetTypes={assetTypes}>
                  <Button size="sm">
                      <PlusCircle className="mr-1.5 h-3.5 w-3.5" />
                      Thêm
                  </Button>
                </AddAssetDialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Collapsible Filter Section */}
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
            
            <CollapsibleContent className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-muted/30 rounded-lg">
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
                      <SelectItem value="Đang sửa chữa">Đang sữa chữa</SelectItem>
                      <SelectItem value="Bị hỏng">Bị hỏng</SelectItem>
                      <SelectItem value="Đã thanh lý">Đã thanh lý</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {hasActiveFilters && (
                <div className="flex justify-end pt-1">
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
            </CollapsibleContent>
          </Collapsible>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40%]">Tên tài sản</TableHead>
                <TableHead className="w-[30%]">Trạng thái</TableHead>
                <TableHead className="w-[30%]">Ngày thêm</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAssets.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={3} className="text-center h-24">
                      {hasActiveFilters ? 'Không tìm thấy thiết bị phù hợp với bộ lọc.' : 'Chưa có tài sản nào.'}
                    </TableCell>
                </TableRow>
              ) : (
                filteredAssets.map((asset) => {
                    const { icon: Icon, color } = statusConfig[asset.status];
                    return (
                        <TableRow 
                          key={asset.id}
                          className="cursor-pointer hover:bg-muted/50 transition-colors"
                          onClick={() => router.push(`/assets/${asset.id}`)}
                        >
                            <TableCell className="font-medium w-[40%]">{asset.name}</TableCell>
                            <TableCell className="w-[30%]">
                              <div className="flex items-center gap-1.5 whitespace-nowrap">
                                <Icon className={`h-3.5 w-3.5 ${color} flex-shrink-0`} />
                                <span className={`text-xs font-medium ${color}`}>{asset.status}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-muted-foreground text-xs w-[30%]">
                                <div className='flex items-center gap-1.5'>
                                    <Calendar className="h-3.5 w-3.5" />
                                    <span>{new Date(asset.dateAdded).toLocaleDateString()}</span>
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
      
      {/* Hidden container for PDF generation */}
      <div id="qr-code-grid-for-pdf" className="absolute -left-[9999px] top-auto w-[210mm] bg-white p-[10mm]">
        <h1 style={{textAlign: 'center', marginBottom: '10px', fontSize: '18px'}}>Mã QR cho phòng: {room.name}</h1>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10mm', pageBreakInside: 'auto' }}>
            {assets.map((asset) => (
                <div key={asset.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '1px solid #eee', padding: '5mm', borderRadius: '4px', pageBreakInside: 'avoid' }}>
                    <QRCodeComponent value={asset.id} size={180} />
                    <p style={{ marginTop: '5px', fontSize: '10px', textAlign: 'center', fontWeight: 'bold' }}>{asset.name}</p>
                    <p style={{ fontSize: '8px', textAlign: 'center', fontFamily: 'monospace' }}>{asset.id}</p>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
}
