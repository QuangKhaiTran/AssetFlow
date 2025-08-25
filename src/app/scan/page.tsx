"use client";

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import jsQR from 'jsqr';
import { QrCode, VideoOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function ScanPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const getCameraPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        setHasCameraPermission(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setIsScanning(true);
      } catch (error) {
        console.error('Lỗi truy cập camera:', error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Từ chối truy cập camera',
          description: 'Vui lòng cho phép truy cập camera trong cài đặt trình duyệt để sử dụng tính năng này.',
        });
      }
    };

    getCameraPermission();

    return () => {
      stopScan();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let animationFrameId: number;

    const tick = () => {
      if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA && canvasRef.current && isScanning) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        if (context) {
          canvas.height = video.videoHeight;
          canvas.width = video.videoWidth;
          context.drawImage(video, 0, 0, canvas.width, canvas.height);
          const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'dontInvert',
          });

          if (code) {
            setScanResult(code.data);
            setIsScanning(false);
            handleResult(code.data);
          }
        }
      }
      animationFrameId = requestAnimationFrame(tick);
    };

    if (isScanning) {
      animationFrameId = requestAnimationFrame(tick);
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isScanning]);

  const handleResult = (result: string) => {
    try {
      const url = new URL(result);
      // Basic validation if the URL is from our app
      if (url.origin === window.location.origin && url.pathname.startsWith('/assets/')) {
        toast({
          title: "Quét thành công!",
          description: "Đang chuyển hướng đến trang tài sản...",
        });
        router.push(url.pathname);
      } else {
        throw new Error("Mã QR không hợp lệ.");
      }
    } catch (error) {
       toast({
        variant: "destructive",
        title: "Mã QR không hợp lệ",
        description: `Nội dung mã: ${result}`,
      });
      setTimeout(() => setIsScanning(true), 2000);
    }
  };

  const stopScan = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };


  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-4">
        <QrCode className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quét mã QR</h1>
          <p className="text-muted-foreground">
            Hướng camera vào mã QR của tài sản để tra cứu thông tin.
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="relative aspect-video w-full bg-muted flex items-center justify-center">
            {hasCameraPermission === false && (
                 <div className="flex flex-col items-center gap-4 text-center p-4">
                    <VideoOff className="h-16 w-16 text-destructive"/>
                    <Alert variant="destructive">
                        <AlertTitle>Yêu cầu truy cập Camera</AlertTitle>
                        <AlertDescription>
                            Bạn cần cấp quyền truy cập camera để sử dụng tính năng quét mã QR.
                            Vui lòng kiểm tra cài đặt trình duyệt của bạn.
                        </AlertDescription>
                    </Alert>
                </div>
            )}
             {hasCameraPermission === true && (
                <>
                    <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline muted />
                    <canvas ref={canvasRef} style={{ display: 'none' }} />
                    {isScanning && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-2/3 h-2/3 border-4 border-dashed border-primary rounded-lg" />
                        </div>
                    )}
                </>
             )}
              {hasCameraPermission === null && (
                 <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <p>Đang chờ cấp quyền camera...</p>
                </div>
              )}
          </div>
        </CardContent>
      </Card>
      
      {scanResult && (
        <Alert>
          <QrCode className="h-4 w-4" />
          <AlertTitle>Quét thành công</AlertTitle>
          <AlertDescription>
            Đã tìm thấy mã QR. Đang xử lý...
          </AlertDescription>
        </Alert>
      )}

    </div>
  );
}
