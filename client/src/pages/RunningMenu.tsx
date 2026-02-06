import { useLocation } from 'wouter';
import { RetroButton } from '@/components/RetroButton';
import { ArrowLeft } from 'lucide-react';

export default function RunningMenu() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-[hsl(var(--gb-lightest))] p-6 flex flex-col items-center justify-center">
      <h1 className="text-xl font-bold text-[hsl(var(--gb-darkest))] mb-2" data-testid="text-title">
        RUNNING
      </h1>
      <p className="text-[9px] text-[hsl(var(--gb-dark))] mb-10 uppercase tracking-widest">
        Select Mission
      </p>

      <div className="w-full max-w-xs space-y-4">
        <RetroButton onClick={() => setLocation('/run/warmup')} fullWidth data-testid="button-run-warmup">
          WARM UP
        </RetroButton>
        <RetroButton onClick={() => setLocation('/run/log')} fullWidth data-testid="button-run-log">
          LOG ACTIVITY
        </RetroButton>
        <RetroButton onClick={() => setLocation('/run/cooldown')} fullWidth data-testid="button-run-cooldown">
          COOL DOWN
        </RetroButton>
      </div>

      <button
        onClick={() => setLocation('/dashboard')}
        className="mt-10 flex items-center gap-2 text-[hsl(var(--gb-dark))] text-xs"
        data-testid="button-back"
      >
        <ArrowLeft size={14} /> BACK
      </button>
    </div>
  );
}
