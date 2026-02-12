import { useEffect, useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';

export function PWAUpdatePrompt() {
  const [showNotice, setShowNotice] = useState(false);
  
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r: ServiceWorkerRegistration | undefined) {
      // Check for updates every 30 minutes
      if (r) {
        setInterval(() => r.update(), 30 * 60 * 1000);
      }
    },
    onRegisterError(error: Error) {
      console.error('SW registration error:', error);
    },
  });

  // Auto-reload when update is available
  useEffect(() => {
    if (needRefresh) {
      setShowNotice(true);
      // Auto-reload after 2 seconds
      const timer = setTimeout(() => {
        updateServiceWorker(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [needRefresh, updateServiceWorker]);

  if (!showNotice) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-[hsl(var(--gb-darkest))]">
      <div className="text-center">
        <p className="text-[12px] text-[hsl(var(--gb-lightest))] font-bold uppercase tracking-wider mb-2">
          UPDATING...
        </p>
        <p className="text-[9px] text-[hsl(var(--gb-light))]">
          Installing new version
        </p>
      </div>
    </div>
  );
}
