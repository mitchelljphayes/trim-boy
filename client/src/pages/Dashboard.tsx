import { useEffect, useState, useRef, useCallback } from "react";
import { useLocation } from "wouter";
import { FolderArchive, Star, BatteryCharging, Music, VolumeX, Power } from "lucide-react";
import { HardwareToggle } from "@/components/HardwareToggle";
import { useWeeklyStats, useCreateLog } from "@/hooks/use-trim";
import { PowerCells } from "@/components/PowerCells";
import { HabitGrid } from "@/components/HabitGrid";
import { RetroButton } from "@/components/RetroButton";
import { isRecharging } from "@/pages/Recharge";
import { hasYogaToday } from "@/pages/Yoga";
import { checkAndUpdateStreak, getStreak, isProtocolComplete } from "@/lib/streakManager";
import { playSecretCream } from "@/lib/chiptune";
import { playEvangelion } from "@/lib/evangelion";
import trimBoySprite from "@assets/trimboysprite01_1770372116288.png";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [userId, setUserId] = useState<number | null>(null);
  const [userName, setUserName] = useState<string>("");
  const [recharging, setRechargingState] = useState(isRecharging);
  const [yogaStar, setYogaStar] = useState(hasYogaToday);
  const [streak, setStreak] = useState(getStreak);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [secretActive, setSecretActive] = useState(false);
  const [secretFlash, setSecretFlash] = useState(false);
  const secretStopRef = useRef<(() => void) | null>(null);
  const [evaPlaying, setEvaPlaying] = useState(false);
  const evaStopRef = useRef<(() => void) | null>(null);
  const lastCheckedStats = useRef<string>("");

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

  useEffect(() => {
    if (!stats) return;
    const statsKey = `${stats.strengthCount}-${stats.runCount}`;
    if (lastCheckedStats.current === statsKey) return;
    lastCheckedStats.current = statsKey;
    const result = checkAndUpdateStreak(stats.strengthCount, stats.runCount);
    setStreak(result.streak);
    window.dispatchEvent(new Event('streak-update'));
    if (result.justCompleted) {
      setShowLevelUp(true);
      setTimeout(() => setShowLevelUp(false), 4000);
    }
  }, [stats]);

  const protocolComplete = stats ? isProtocolComplete(stats.strengthCount, stats.runCount) : false;

  const handleSecretTap = useCallback(() => {
    if (secretActive) {
      if (secretStopRef.current) {
        secretStopRef.current();
        secretStopRef.current = null;
      }
      setSecretActive(false);
      return;
    }
    if (evaPlaying && evaStopRef.current) {
      evaStopRef.current();
      evaStopRef.current = null;
      setEvaPlaying(false);
    }
    setSecretFlash(true);
    setTimeout(() => setSecretFlash(false), 600);
    const stop = playSecretCream();
    secretStopRef.current = stop;
    setSecretActive(true);
  }, [secretActive, evaPlaying]);

  const handleEvaToggle = useCallback(() => {
    if (evaPlaying) {
      if (evaStopRef.current) {
        evaStopRef.current();
        evaStopRef.current = null;
      }
      setEvaPlaying(false);
      return;
    }
    if (secretActive && secretStopRef.current) {
      secretStopRef.current();
      secretStopRef.current = null;
      setSecretActive(false);
    }
    const stop = playEvangelion();
    evaStopRef.current = stop;
    setEvaPlaying(true);
  }, [evaPlaying, secretActive]);

  useEffect(() => {
    if (!evaPlaying && !evaStopRef.current && !secretActive) {
      const stop = playEvangelion();
      evaStopRef.current = stop;
      setEvaPlaying(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleReset = useCallback(() => {
    if (secretStopRef.current) {
      secretStopRef.current();
      secretStopRef.current = null;
    }
    if (evaStopRef.current) {
      evaStopRef.current();
      evaStopRef.current = null;
    }
    const keys = Object.keys(localStorage).filter(k => k.startsWith('trim_'));
    keys.forEach(k => localStorage.removeItem(k));
    setLocation('/');
  }, [setLocation]);

  useEffect(() => {
    return () => {
      if (secretStopRef.current) {
        secretStopRef.current();
      }
      if (evaStopRef.current) {
        evaStopRef.current();
      }
    };
  }, []);

  if (!userId) return null;

  return (
    <div className="min-h-screen bg-[hsl(var(--gb-lightest))] p-4 pb-20 max-w-xl mx-auto">
      
      <header className="flex justify-between items-end mb-8 pt-2 border-b-4 border-[hsl(var(--gb-dark))] pb-2">
        <div className="flex flex-col">
          <span className="text-[10px] text-[hsl(var(--gb-dark))] mb-1">OPERATOR ID</span>
          <span className="text-xl font-bold text-[hsl(var(--gb-darkest))]">{userName}</span>
        </div>
        <div className="flex items-center gap-1">
          <span
            className={`text-[8px] uppercase tracking-widest mr-1 ${recharging ? 'text-[hsl(var(--gb-dark))] animate-pulse' : 'text-[hsl(var(--gb-dark))]/50'}`}
            data-testid="text-system-status"
          >
            {recharging ? 'SYS:RCH' : 'TRIMCORP'}
          </span>
          <HardwareToggle />
          <button
            className={`p-2 border-2 transition-colors ${evaPlaying ? 'bg-[hsl(var(--gb-dark))] border-[hsl(var(--gb-darkest))]' : 'hover:bg-[hsl(var(--gb-light))] border-transparent hover:border-[hsl(var(--gb-dark))]'}`}
            title={evaPlaying ? "Stop Music" : "Play Music"}
            onClick={handleEvaToggle}
            data-testid="button-eva-music"
          >
            {evaPlaying
              ? <VolumeX className="w-5 h-5 text-[hsl(var(--gb-lightest))]" />
              : <Music className="w-5 h-5 text-[hsl(var(--gb-darkest))]" />
            }
          </button>
          <button 
            className="p-2 hover:bg-[hsl(var(--gb-light))] border-2 border-transparent hover:border-[hsl(var(--gb-dark))] transition-colors"
            title="Archive"
            onClick={() => setLocation('/archive')}
            data-testid="button-archive"
          >
            <FolderArchive className="w-5 h-5 text-[hsl(var(--gb-darkest))]" />
          </button>
        </div>
      </header>

      {showLevelUp && (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[hsl(var(--gb-darkest))]/90 level-up-overlay" data-testid="level-up-overlay">
          <img
            src={trimBoySprite}
            alt="TrimBoy Meditating"
            className="w-28 h-auto pixelated mb-6 level-up-sprite"
            data-testid="img-level-up-sprite"
          />
          <p className="text-lg font-bold text-[hsl(var(--gb-lightest))] level-up-text mb-2">
            LEVEL UP
          </p>
          <p className="text-[9px] text-[hsl(var(--gb-light))] uppercase tracking-widest mb-1">
            4-2 Protocol Complete
          </p>
          <p className="text-sm font-bold text-[hsl(var(--gb-lightest))] level-up-text">
            STREAK: {streak}
          </p>
        </div>
      )}

      <main className="space-y-6">
        
        <div className="flex items-center justify-between mb-0">
          <div className="flex items-center gap-2">
            <svg
              width="20"
              height="24"
              viewBox="0 0 10 12"
              className={protocolComplete ? "streak-flame-active" : "streak-flame-dim"}
              data-testid="icon-streak-flame"
            >
              <path
                d="M5 0 C5 0 8 3 8 6 C8 7 8 8 7 9 C7 7 6 6 5 6 C5 8 6 9 7 10 C5 11 3 10 2 9 C1 8 1 7 1 6 C1 3 5 0 5 0Z"
                fill="currentColor"
              />
              <path
                d="M5 4 C5 4 7 6 6 8 C5 7 4 7 4 8 C4 9 5 9 5 9 C4 9 3 8 3 7 C3 5 5 4 5 4Z"
                fill="currentColor"
                opacity="0.5"
              />
            </svg>
            {streak > 0 && (
              <span
                className="text-[9px] font-bold uppercase tracking-widest text-[hsl(var(--gb-darkest))]"
                data-testid="text-streak-count"
              >
                x{streak}
              </span>
            )}
          </div>
          <span className="text-[8px] text-[hsl(var(--gb-dark))] uppercase tracking-widest">
            {protocolComplete ? '4-2 COMPLETE' : '4-2 PROTOCOL'}
          </span>
        </div>

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

          <div className="pt-4 border-t-4 border-[hsl(var(--gb-dark))]/20 border-dashed space-y-3">
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

            <RetroButton 
              onClick={() => setLocation('/recharge')} 
              fullWidth 
              disabled={isPending}
              className="retro-glow"
            >
              <span className="flex items-center gap-2">
                <BatteryCharging size={16} className={recharging ? "led-blink" : ""} />
                RECHARGE
              </span>
            </RetroButton>
          </div>
        </div>

        <div className="flex flex-col items-center pt-6 pb-2 gap-1">
          <button
            onClick={handleSecretTap}
            className="relative focus:outline-none"
            data-testid="button-secret-sprite"
          >
            <img
              src={trimBoySprite}
              alt="TrimBoy"
              className={`w-8 h-auto pixelated ${secretActive ? 'secret-sprite-bounce' : ''}`}
              data-testid="img-trimboy-sprite"
            />
            {secretActive && (
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-[hsl(var(--gb-darkest))] secret-led-blink" />
            )}
          </button>
          {secretActive && (
            <div className="flex flex-col items-center gap-0.5 mt-1" data-testid="secret-now-playing">
              <span className="text-[6px] text-[hsl(var(--gb-dark))] uppercase tracking-[3px]">
                NOW PLAYING
              </span>
              <span className="text-[7px] text-[hsl(var(--gb-darkest))] uppercase tracking-widest font-bold">
                C.R.E.A.M.
              </span>
              <div className="flex gap-[2px] mt-0.5">
                {[0,1,2,3].map(i => (
                  <div
                    key={i}
                    className="w-[3px] bg-[hsl(var(--gb-darkest))] secret-eq-bar"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="flex justify-center pt-4">
          <button
            onClick={() => setShowResetConfirm(true)}
            className="flex items-center gap-1.5 text-[8px] text-[hsl(var(--gb-dark))]/50 uppercase tracking-widest"
            data-testid="button-reset"
          >
            <Power size={10} /> RESET SYSTEM
          </button>
        </div>

        {secretFlash && (
          <div className="fixed inset-0 z-[9998] bg-[hsl(var(--gb-lightest))] pointer-events-none secret-flash-overlay" />
        )}

        {showResetConfirm && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60" data-testid="modal-reset-confirm">
            <div className="bg-[hsl(var(--gb-lightest))] border-4 border-[hsl(var(--gb-darkest))] p-6 max-w-xs w-full mx-4 text-center">
              <p className="text-[10px] text-[hsl(var(--gb-darkest))] font-bold uppercase tracking-wider mb-2">
                SYSTEM RESET
              </p>
              <p className="text-[8px] text-[hsl(var(--gb-dark))] mb-6 leading-relaxed">
                ALL LOCAL DATA WILL BE ERASED. THIS CANNOT BE UNDONE.
              </p>
              <div className="flex gap-3">
                <RetroButton
                  onClick={() => setShowResetConfirm(false)}
                  fullWidth
                  data-testid="button-reset-cancel"
                >
                  CANCEL
                </RetroButton>
                <RetroButton
                  onClick={handleReset}
                  fullWidth
                  data-testid="button-reset-confirm"
                >
                  CONFIRM
                </RetroButton>
              </div>
            </div>
          </div>
        )}
      </main>

      <div className="fixed bottom-0 left-0 right-0 bg-[hsl(var(--gb-darkest))] text-[hsl(var(--gb-lightest))] text-[10px] p-2 flex justify-between px-4 z-50">
        <span data-testid="text-status-bar">{recharging ? 'STATUS: RECHARGING' : 'STATUS: ONLINE'}</span>
        <span>BATTERY: 100%</span>
      </div>
    </div>
  );
}
