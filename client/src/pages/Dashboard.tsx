import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { FolderArchive, Star } from "lucide-react";
import { useWeeklyStats, useCreateLog } from "@/hooks/use-trim";
import { PowerCells } from "@/components/PowerCells";
import { HabitGrid } from "@/components/HabitGrid";
import { RetroButton } from "@/components/RetroButton";
import { isRecharging } from "@/pages/Recharge";
import { hasYogaToday } from "@/pages/Yoga";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [userId, setUserId] = useState<number | null>(null);
  const [userName, setUserName] = useState<string>("");
  const [recharging, setRechargingState] = useState(isRecharging);
  const [yogaStar, setYogaStar] = useState(hasYogaToday);

  useEffect(() => {
    const storedId = localStorage.getItem("trim_user_id");
    const storedName = localStorage.getItem("trim_user_name");

    if (!storedId || !storedName) {
      setLocation("/");
      return;
    }

    setUserId(parseInt(storedId));
    setUserName(storedName);
  }, [setLocation]);

  useEffect(() => {
    const handler = () => setRechargingState(isRecharging());
    window.addEventListener('recharge-status-change', handler);
    return () => window.removeEventListener('recharge-status-change', handler);
  }, []);

  useEffect(() => {
    const handler = () => setYogaStar(hasYogaToday());
    window.addEventListener('yoga-status-change', handler);
    return () => window.removeEventListener('yoga-status-change', handler);
  }, []);

  const { data: stats } = useWeeklyStats(userId);
  const { isPending } = useCreateLog();

  if (!userId) return null;

  return (
    <div className="min-h-screen bg-[hsl(var(--gb-lightest))] p-4 pb-20 max-w-xl mx-auto">
      
      <header className="flex justify-between items-end mb-8 pt-2 border-b-4 border-[hsl(var(--gb-dark))] pb-2">
        <div className="flex flex-col">
          <span className="text-[10px] text-[hsl(var(--gb-dark))] mb-1">OPERATOR ID</span>
          <span className="text-xl font-bold text-[hsl(var(--gb-darkest))]">{userName}</span>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`text-[8px] uppercase tracking-widest ${recharging ? 'text-[hsl(var(--gb-dark))] animate-pulse' : 'text-[hsl(var(--gb-dark))]/50'}`}
            data-testid="text-system-status"
          >
            {recharging ? 'SYSTEM: RECHARGING' : 'SYSTEM: ACTIVE'}
          </span>
          <button 
            className="p-2 hover:bg-[hsl(var(--gb-light))] border-2 border-transparent hover:border-[hsl(var(--gb-dark))] transition-colors"
            title="Archive"
            onClick={() => setLocation('/archive')}
            data-testid="button-archive"
          >
            <FolderArchive className="w-6 h-6 text-[hsl(var(--gb-darkest))]" />
          </button>
        </div>
      </header>

      <main className="space-y-6">
        
        <PowerCells 
          strengthCount={stats?.strengthCount || 0} 
          runCount={stats?.runCount || 0} 
        />

        <div className="flex items-start gap-3">
          <div className="flex-1">
            <HabitGrid habits={stats?.habits || []} />
          </div>
          {yogaStar && (
            <div
              className="flex flex-col items-center pt-10 flex-shrink-0"
              data-testid="yoga-gold-star"
            >
              <Star size={28} fill="#FFD700" color="#FFD700" strokeWidth={1.5} />
              <span className="text-[7px] mt-1 uppercase tracking-widest text-[hsl(var(--gb-dark))]">
                BONUS
              </span>
            </div>
          )}
        </div>

        <div className="space-y-3 mt-8">
          <h3 className="text-xs mb-4 text-[hsl(var(--gb-darkest))] uppercase tracking-widest text-center">
            Log Activity
          </h3>
          
          <RetroButton onClick={() => setLocation('/maintenance')} fullWidth disabled={isPending}>
            1. DAILY MAINTENANCE
          </RetroButton>

          <RetroButton onClick={() => setLocation('/running')} fullWidth disabled={isPending}>
            2. RUNNING
          </RetroButton>

          <div className="grid grid-cols-2 gap-2">
            <RetroButton onClick={() => setLocation('/strength-a')} fullWidth disabled={isPending}>
              3A. STR. A
            </RetroButton>
            <RetroButton onClick={() => setLocation('/strength-b')} fullWidth disabled={isPending}>
              3B. STR. B
            </RetroButton>
          </div>

          <RetroButton onClick={() => setLocation('/surfing')} fullWidth disabled={isPending}>
            4. SURFING
          </RetroButton>

          <RetroButton onClick={() => setLocation('/breathwork')} fullWidth disabled={isPending}>
            5. BREATHWORK
          </RetroButton>

          <div className="pt-4 border-t-4 border-[hsl(var(--gb-dark))]/20 border-dashed">
            <RetroButton 
              onClick={() => setLocation('/recharge')} 
              fullWidth 
              disabled={isPending}
              className="opacity-75 hover:opacity-100"
            >
              6. RECHARGE
            </RetroButton>
          </div>

          <div className="pt-2">
            <RetroButton
              onClick={() => setLocation('/yoga')}
              fullWidth
              disabled={isPending}
              style={yogaStar ? { background: '#8B7300', color: '#FFF3C4', borderColor: '#FFD700' } : undefined}
              data-testid="button-yoga"
            >
              BONUS: ASHTANGA FLOW
              {yogaStar && <span className="text-[8px] ml-1" style={{ color: '#FFD700' }}>COMPLETED</span>}
            </RetroButton>
          </div>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 bg-[hsl(var(--gb-darkest))] text-[hsl(var(--gb-lightest))] text-[10px] p-2 flex justify-between px-4 z-50">
        <span data-testid="text-status-bar">{recharging ? 'STATUS: RECHARGING' : 'STATUS: ONLINE'}</span>
        <span>BATTERY: 100%</span>
      </div>
    </div>
  );
}
