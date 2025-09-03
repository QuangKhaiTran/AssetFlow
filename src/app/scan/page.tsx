"use client";

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import jsQR from 'jsqr';
import { QrCode, VideoOff, RefreshCw, RotateCcw, CheckCircle, Wrench, XCircle, Trash2, Calendar, Building, User, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { getAssetById, getRoomById } from '@/lib/data';
import { type Asset, type Room, type AssetStatus } from '@/lib/types';
import { QRCodeComponent } from '@/components/qr-code';

const statusConfig: Record<AssetStatus, { icon: React.ElementType, color: string }> = {
  'Đang sử dụng': { icon: CheckCircle, color: 'text-green-600' },
  'Đang sửa chữa': { icon: Wrench, color: 'text-amber-600' },
  'Bị hỏng': { icon: XCircle, color: 'text-red-600' },
  'Đã thanh lý': { icon: Trash2, color: 'text-gray-500' },
};

export default function ScanPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [_scanResult, setScanResult] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [currentCameraIndex, setCurrentCameraIndex] = useState(0);
  const [currentStream, setCurrentStream] = useState<MediaStream | null>(null);
  const [isLoadingAsset, setIsLoadingAsset] = useState(false);
  const [assetData, setAssetData] = useState<{
    asset: Asset;
    room: Room | null;
  } | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const getCameraPermissionAndDevices = async () => {
      try {
        // Get camera permission first
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        setHasCameraPermission(true);
        
        // Get list of video devices
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        setCameras(videoDevices);
        
        // Stop the initial stream
        stream.getTracks().forEach(track => track.stop());
        
        // Find back camera (environment) or use first camera
        let defaultCameraIndex = 0;
        const backCameraIndex = videoDevices.findIndex(device => 
          device.label.toLowerCase().includes('back') || 
          device.label.toLowerCase().includes('environment') ||
          device.label.toLowerCase().includes('rear')
        );
        
        if (backCameraIndex !== -1) {
          defaultCameraIndex = backCameraIndex;
        }
        
        setCurrentCameraIndex(defaultCameraIndex);
        
        // Start camera with selected device
        await startCamera(videoDevices[defaultCameraIndex]?.deviceId);
        
      } catch (error) {
        console.error('Lỗi truy cập camera:', error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Từ chối truy cập camera',
          description: 'Vui lòng cho phép truy cập camera trong cài đặt trình duyệt.',
        });
      }
    };

    getCameraPermissionAndDevices();

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isScanning]);

  const startCamera = async (deviceId?: string) => {
    try {
      // Stop current stream if exists
      if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
      }
      
      const constraints: MediaStreamConstraints = {
        video: deviceId ? { deviceId: { exact: deviceId } } : { facingMode: 'environment' }
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setCurrentStream(stream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      setIsScanning(true);
    } catch (error) {
      console.error('Lỗi khởi động camera:', error);
      toast({
        variant: 'destructive',
        title: 'Lỗi camera',
        description: 'Không thể khởi động camera được chọn.',
      });
    }
  };
  
  const toggleCamera = async () => {
    if (cameras.length > 1) {
      const nextIndex = (currentCameraIndex + 1) % cameras.length;
      setCurrentCameraIndex(nextIndex);
      await startCamera(cameras[nextIndex].deviceId);
      
      toast({
        title: 'Chuyển đổi camera',
        description: `Đang sử dụng ${cameras[nextIndex].label || `Camera ${nextIndex + 1}`}`,
      });
    }
  };

  const handleResult = async (result: string) => {
    // Check if the result is a valid asset ID
    if (result && /^[a-zA-Z0-9]{10,}$/.test(result)) {
      setIsLoadingAsset(true);
      try {
        // Fetch asset information
        const asset = await getAssetById(result);
        
        if (!asset) {
          throw new Error('Asset not found');
        }
        
        // Fetch related information
        const room = await getRoomById(asset.roomId)
        
        setAssetData({
          asset,
          room: room || null,
        });
        
        toast({
          title: "Quét thành công!",
          description: "Thông tin tài sản đã được tải.",
        });
        
      } catch (error) {
        console.error('Error fetching asset:', error);
        toast({
          variant: "destructive",
          title: "Lỗi tải thông tin",
          description: "Không tìm thấy tài sản hoặc có lỗi xảy ra.",
        });
        
        // Resume scanning after error
        setTimeout(() => {
          setScanResult(null);
          setIsScanning(true);
        }, 2000);
      } finally {
        setIsLoadingAsset(false);
      }
    } else {
      toast({
        variant: "destructive",
        title: "Mã QR không hợp lệ",
        description: `Nội dung không phải là ID tài sản hợp lệ.`,
      });
      
      // Resume scanning after error
      setTimeout(() => {
        setScanResult(null);
        setIsScanning(true);
      }, 2000);
    }
  };

  const stopScan = () => {
    if (currentStream) {
      currentStream.getTracks().forEach(track => track.stop());
      setCurrentStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };


  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardContent className="p-0">
          <div className="relative aspect-square w-full bg-muted flex items-center justify-center overflow-hidden rounded-lg">
            {hasCameraPermission === false && (
                 <div className="flex flex-col items-center gap-4 text-center p-4">
                    <VideoOff className="h-12 w-12 text-destructive"/>
                    <Alert variant="destructive">
                        <AlertTitle>Yêu cầu truy cập Camera</AlertTitle>
                        <AlertDescription>
                            Bạn cần cấp quyền truy cập camera để sử dụng tính năng này.
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
                            <div className="w-2/3 h-2/3 border-4 border-dashed border-primary/70 rounded-lg" />
                        </div>
                    )}
                    {/* Camera Toggle Button */}
                    {cameras.length > 1 && (
                        <div className="absolute top-4 right-4">
                            <Button
                                onClick={toggleCamera}
                                size="icon"
                                variant="secondary"
                                className="bg-black/50 hover:bg-black/70 text-white border-0"
                            >
                                <RotateCcw className="h-4 w-4" />
                            </Button>
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
      
      {/* Loading State */}
      {isLoadingAsset && (
        <Alert>
          <QrCode className="h-4 w-4" />
          <AlertTitle>Đang tải thông tin...</AlertTitle>
          <AlertDescription>
            Vui lòng chờ trong giây lát.
          </AlertDescription>
        </Alert>
      )}
      
      {/* Asset Information Display */}
      {assetData && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5" />
                Thông tin tài sản
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Asset Basic Info */}
              <div className="space-y-2">
                <h3 className="font-semibold text-sm md:text-base">{assetData.asset.name}</h3>
                <div className="flex items-center gap-1.5">
                  {(() => {
                    const { icon: Icon, color } = statusConfig[assetData.asset.status];
                    return (
                      <>
                        <Icon className={`h-3.5 w-3.5 ${color}`} />
                        <span className={`text-xs font-medium ${color}`}>{assetData.asset.status}</span>
                      </>
                    );
                  })()}
                </div>
              </div>
              
              {/* Room Information */}
              {assetData.room && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Phòng:</span>
                    <span className="font-medium">{assetData.room.name}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Người quản lý:</span>
                    <span className="font-medium">{assetData.room.managerName}</span>
                  </div>
                </div>
              )}
              
              {/* Date Added */}
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Ngày thêm:</span>
                <span className="font-medium">{new Date(assetData.asset.dateAdded).toLocaleDateString('vi-VN')}</span>
              </div>
              
              {/* Asset ID QR */}
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Mã QR tài sản:</div>
                <div className="flex justify-center">
                  <QRCodeComponent value={assetData.asset.id} size={120} />
                </div>
                <div className="text-center text-xs font-mono text-muted-foreground">
                  {assetData.asset.id}
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button 
              onClick={() => {
                setAssetData(null);
                setScanResult(null);
                setIsScanning(true);
              }}
              variant="outline"
              className="flex-1"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Quét lại
            </Button>
            <Button 
              onClick={() => router.push(`/assets/${assetData.asset.id}`)}
              className="flex-1"
            >
              <Eye className="h-4 w-4 mr-2" />
              Xem chi tiết
            </Button>
          </div>
        </div>
      )}

    </div>
  );
}
