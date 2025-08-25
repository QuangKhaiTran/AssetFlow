"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from './ui/button';
import { QRCodeComponent } from './qr-code';
import type { Asset } from '@/lib/types';
import { ScrollArea } from './ui/scroll-area';
import { Printer } from 'lucide-react';

interface PrintQRCodesDialogProps {
  assets: Pick<Asset, 'id' | 'name'>[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PrintQRCodesDialog({ assets, open, onOpenChange }: PrintQRCodesDialogProps) {
  const handlePrint = () => {
    const printContent = document.getElementById('qr-print-area');
    if (printContent) {
      const originalContents = document.body.innerHTML;
      const printHtml = printContent.innerHTML;
      
      // Temporarily set body content to the printable area
      document.body.innerHTML = `
        <html>
          <head>
            <title>In mã QR</title>
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

  const getAssetUrl = (assetId: string) => {
    // This should be replaced with the actual URL in a production environment from environment variables
    return `http://localhost:9002/assets/${assetId}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>In mã QR cho tài sản mới</DialogTitle>
          <DialogDescription>
            Đây là các mã QR cho những tài sản bạn vừa tạo. Bạn có thể in chúng ra ngay bây giờ.
          </DialogDescription>
        </DialogHeader>

        <div id="qr-print-area">
          <ScrollArea className="h-[60vh] p-4 border rounded-md">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 qr-grid-print">
              {assets.map((asset) => (
                <div key={asset.id} className="flex flex-col items-center p-2 border rounded-lg qr-item-print">
                   <QRCodeComponent value={getAssetUrl(asset.id)} size={150} />
                   <p className="mt-2 text-xs text-center font-semibold">{asset.name}</p>
                   <p className="text-xs text-muted-foreground font-mono">{asset.id}</p>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Đóng</Button>
          <Button onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            In tất cả
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
