import { useRegisterSW } from 'virtual:pwa-register/react';
import { RetroButton } from './RetroButton';

export function PWAUpdatePrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r: ServiceWorkerRegistration | undefined) {
      // Check for updates every hour
      if (r) {
        setInterval(() => r.update(), 60 * 60 * 1000);
      }
    },
    onRegisterError(error: Error) {
      console.error('SW registration error:', error);
    },
  });

  const close = () => setNeedRefresh(false);

  if (!needRefresh) return null;

  return (
    <div className="fixed bottom-16 left-4 right-4 z-[10000] flex justify-center">
      <div className="bg-[hsl(var(--gb-lightest))] border-4 border-[hsl(var(--gb-darkest))] p-4 max-w-sm w-full shadow-[4px_4px_0px_0px_hsl(var(--gb-darkest))]">
        <p className="text-[10px] text-[hsl(var(--gb-darkest))] font-bold uppercase tracking-wider mb-1">
          UPDATE AVAILABLE
        </p>
        <p className="text-[8px] text-[hsl(var(--gb-dark))] mb-4">
          A new version of TRIM Boy is ready.
        </p>
        <div className="flex gap-2">
          <RetroButton
            onClick={close}
            className="text-[9px] py-2"
            fullWidth
          >
            LATER
          </RetroButton>
          <RetroButton
            onClick={() => updateServiceWorker(true)}
            className="text-[9px] py-2"
            fullWidth
          >
            UPDATE
          </RetroButton>
        </div>
      </div>
    </div>
  );
}
