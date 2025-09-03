"use client";

import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { ToastAction } from '@/components/ui/toast';

export function PWAInstaller() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then((registration) => {
            console.log('SW registered: ', registration);

            // Check for updates
            registration.addEventListener('updatefound', () => {
              const newWorker = registration.installing;
              if (newWorker) {
                newWorker.addEventListener('statechange', () => {
                  if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    // New version available
                    setUpdateAvailable(true);
                    toast({
                      title: "Cập nhật có sẵn",
                      description: "Phiên bản mới của AssetFlow đã sẵn sàng. Tải lại trang để cập nhật.",
                      action: (
                        <ToastAction
                          altText="Cập nhật ứng dụng"
                          onClick={() => {
                            newWorker.postMessage({ type: 'SKIP_WAITING' });
                            window.location.reload();
                          }}
                        >
                          Cập nhật
                        </ToastAction>
                      )
                    });
                  }
                });
              }
            });

            // Check if service worker is controlling the page
            if (navigator.serviceWorker.controller) {
              console.log('Service Worker is controlling the page');
            }
          })
          .catch((registrationError) => {
            console.log('SW registration failed: ', registrationError);
          });
      });
    }

    // Listen for online/offline events
    const handleOnline = () => {
      toast({
        title: "Kết nối mạng",
        description: "Đã khôi phục kết nối internet.",
      });
    };

    const handleOffline = () => {
      toast({
        title: "Mất kết nối mạng",
        description: "Ứng dụng sẽ hoạt động ở chế độ offline.",
        variant: "destructive"
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [toast]);

  // Show update notification if available
  useEffect(() => {
    if (updateAvailable) {
      // Auto-hide after 10 seconds
      const timer = setTimeout(() => setUpdateAvailable(false), 10000);
      return () => clearTimeout(timer);
    }
  }, [updateAvailable]);

  // Don't render any UI - installation is handled via avatar dropdown
  return null;
}
