"use client";

import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Skeleton } from './ui/skeleton';
import Image from 'next/image';

interface QRCodeComponentProps {
  value: string;
  size?: number;
  publicUrl?: boolean; // If true, generate URL to public page, otherwise just the ID
}

export function QRCodeComponent({ value, size = 128, publicUrl = false }: QRCodeComponentProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);

  useEffect(() => {
    if (value) {
      // Generate URL based on whether it's for public access or internal use
      const qrValue = publicUrl
        ? `${window.location.origin}/public/asset/${value}`
        : value;

      QRCode.toDataURL(qrValue, {
        errorCorrectionLevel: 'L', // Changed from 'H' to 'L' for a simpler QR code
        margin: 2,
        width: size,
       })
        .then(url => {
          setQrCodeUrl(url);
        })
        .catch(err => {
          console.error(err);
        });
    }
  }, [value, size, publicUrl]);

  if (!qrCodeUrl) {
    return <Skeleton className="h-32 w-32" style={{ width: size, height: size }} />;
  }

  return <Image src={qrCodeUrl} alt={`QR code for ${value}`} width={size} height={size} />;
}
