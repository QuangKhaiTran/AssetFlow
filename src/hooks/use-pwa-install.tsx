"use client";

import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    // Check if app is already installed
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Check if running in standalone mode (already installed)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    if (isStandalone) {
      setIsInstalled(true);
    }

    // For iOS, check if not in standalone mode to show as installable
    if (iOS && !isStandalone) {
      setIsInstallable(true);
    }

    // For debugging: always show as installable in development
    if (process.env.NODE_ENV === 'development') {
      setIsInstallable(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const installApp = async () => {
    if (isIOS) {
      // For iOS, we can't programmatically trigger install
      // Show instructions to user
      alert('Để cài đặt ứng dụng trên iOS:\n\n1. Nhấn nút Share (biểu tượng mũi tên)\n2. Chọn "Add to Home Screen"\n3. Nhấn "Add" để cài đặt');
      return;
    }

    if (!deferredPrompt) {
      // In development or when prompt not available, show manual instructions
      if (process.env.NODE_ENV === 'development') {
        alert('Development Mode: PWA installation\n\nTrên trình duyệt thật:\n1. Vào menu trình duyệt (3 chấm)\n2. Chọn "Install app" hoặc "Add to Home Screen"\n3. Xác nhận cài đặt');
      } else {
        alert('Để cài đặt ứng dụng:\n\n1. Vào menu trình duyệt (3 chấm)\n2. Chọn "Install app" hoặc "Add to Home Screen"\n3. Xác nhận cài đặt');
      }
      return;
    }

    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setIsInstalled(true);
      }
      
      setDeferredPrompt(null);
      setIsInstallable(false);
    } catch (error) {
      console.error('Error installing app:', error);
    }
  };

  return {
    isInstallable: isInstallable && !isInstalled,
    isInstalled,
    isIOS,
    installApp,
  };
}
