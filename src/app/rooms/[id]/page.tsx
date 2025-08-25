
"use client";

import { getRoomById, getAssetsByRoomId, getUserById, getAssetTypes } from '@/lib/data';
import { notFound } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, User, Calendar, PlusCircle, CheckCircle, Wrench, XCircle, Trash2, FileDown } from 'lucide-react';
import Link from 'next/link';
import { type AssetStatus, type Room, type Asset, type AssetType, type User as UserType } from '@/lib/types';
import { AddAssetDialog } from '@/components/add-asset-dialog';
import { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { QRCodeComponent } from '@/components/qr-code';

const statusConfig: Record<AssetStatus, { icon: React.ElementType, color: string }> = {
    'Đang sử dụng': { icon: CheckCircle, color: 'text-green-600' },
    'Đang sửa chữa': { icon: Wrench, color: 'text-amber-600' },
    'Bị hỏng': { icon: XCircle, color: 'text-red-600' },
    'Đã thanh lý': { icon: Trash2, color: 'text-gray-500' },
};

function RoomDetailPageContent({ room, initialAssets, manager, assetTypes }: { room: Room, initialAssets: Asset[], manager: UserType | null, assetTypes: AssetType[] }) {
  const [assets, setAssets] = useState(initialAssets);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  useEffect(() => {
    // This could be used to refresh assets if they change, e.g. after adding a new one.
    // For now, we rely on server-side rendering for the initial list.
  }, []);

  const handleGeneratePdf = async () => {
    setIsGeneratingPdf(true);
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const margin = 10;
    const cellWidth = (pdfWidth - margin * 2) / 3;
    const cellHeight = cellWidth; // Make it square-ish
    const qrCodeElements = document.getElementById('qr-code-grid-for-pdf');

    if (qrCodeElements) {
        try {
            const canvas = await html2canvas(qrCodeElements, {
                scale: 2, // Higher scale for better quality
                backgroundColor: '#ffffff',
            });
            const imgData = canvas.toDataURL('image/png');
            const imgWidth = pdf.internal.pageSize.getWidth();
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            let heightLeft = imgHeight;
            let position = 0;

            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pdf.internal.pageSize.getHeight();

            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pdf.internal.pageSize.getHeight();
            }

            pdf.save(`qr-codes-${room.name.replace(/\s+/g, '-')}.pdf`);
        } catch (error) {
            console.error("Error generating PDF:", error);
        }
    }
    setIsGeneratingPdf(false);
  };

  const getAssetUrl = (assetId: string) => {
    return `http://localhost:9002/assets/${assetId}`;
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
        <h1 className="text-xl font-bold tracking-tight">{room.name}</h1>
        <div className="flex items-center gap-2 text-muted-foreground mt-1.5 text-[10px]">
            <div className='flex items-center gap-1.5'>
                <User className="h-3.5 w-3.5" />
                <span>Người quản lý: {manager?.name || 'N/A'}</span>
            </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
                <CardTitle>Tài sản trong phòng</CardTitle>
                <CardDescription>Danh sách tất cả tài sản trong phòng này.</CardDescription>
            </div>
             <div className="flex items-center gap-2">
                 <Button size="sm" variant="outline" onClick={handleGeneratePdf} disabled={isGeneratingPdf || assets.length === 0}>
                    <FileDown className="mr-1.5 h-3.5 w-3.5" />
                    {isGeneratingPdf ? 'Đang tạo...' : 'Xuất PDF mã QR'}
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tên tài sản</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Ngày thêm</TableHead>
                <TableHead className="w-[70px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assets.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={4} className="text-center h-24">Chưa có tài sản nào.</TableCell>
                </TableRow>
              ) : (
                assets.map((asset) => {
                    const { icon: Icon, color } = statusConfig[asset.status];
                    return (
                        <TableRow key={asset.id}>
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
                            <TableCell className="text-muted-foreground text-xs">
                                <div className='flex items-center gap-1.5'>
                                    <Calendar className="h-3.5 w-3.5" />
                                    <span>{new Date(asset.dateAdded).toLocaleDateString()}</span>
                                </div>
                            </TableCell>
                            <TableCell className="text-right">
                            <Button asChild variant="outline" size="sm">
                                <Link href={`/assets/${asset.id}`}>Chi tiết</Link>
                            </Button>
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
                    <QRCodeComponent value={getAssetUrl(asset.id)} size={180} />
                    <p style={{ marginTop: '5px', fontSize: '10px', textAlign: 'center', fontWeight: 'bold' }}>{asset.name}</p>
                    <p style={{ fontSize: '8px', textAlign: 'center', fontFamily: 'monospace' }}>{asset.id}</p>
                </div>
            ))}
        </div>
      </div>

    </div>
  );
}


export default async function RoomDetailPage({ params }: { params: { id: string } }) {
  const room = await getRoomById(params.id);
  if (!room) {
    notFound();
  }

  const assets = await getAssetsByRoomId(params.id);
  const manager = await getUserById(room.managerId);
  const assetTypes = await getAssetTypes();

  return <RoomDetailPageContent room={room} initialAssets={assets} manager={manager || null} assetTypes={assetTypes} />;
}
