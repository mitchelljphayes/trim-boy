import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { FolderArchive } from "lucide-react";
import { useWeeklyStats, useCreateLog } from "@/hooks/use-trim";
import { PowerCells } from "@/components/PowerCells";
import { HabitGrid } from "@/components/HabitGrid";
import { RetroButton } from "@/components/RetroButton";

// Main Game Dashboard
export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [userId, setUserId] = useState<number | null>(null);
  const [userName, setUserName] = useState<string>("");

  // Load user from local storage
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

  const { data: stats } = useWeeklyStats(userId);
  const { mutate: logActivity, isPending } = useCreateLog();

  const handleLog = (category: string) => {
    if (!userId) return;
    logActivity({ category, date: new Date() });
  };

  if (!userId) return null;

  return (
    <div className="min-h-screen bg-[hsl(var(--gb-lightest))] p-4 pb-20 max-w-xl mx-auto">
      
      {/* Header */}
      <header className="flex justify-between items-end mb-8 pt-2 border-b-4 border-[hsl(var(--gb-dark))] pb-2">
        <div className="flex flex-col">
          <span className="text-[10px] text-[hsl(var(--gb-dark))] mb-1">OPERATOR ID</span>
          <span className="text-xl font-bold text-[hsl(var(--gb-darkest))]">{userName}</span>
        </div>
        <button 
          className="p-2 hover:bg-[hsl(var(--gb-light))] border-2 border-transparent hover:border-[hsl(var(--gb-dark))] transition-colors"
          title="Archive"
        >
          <FolderArchive className="w-6 h-6 text-[hsl(var(--gb-darkest))]" />
        </button>
      </header>

      {/* Main Stats Display */}
      <main className="space-y-6">
        
        {/* Weekly Mission Tracker */}
        <PowerCells 
          strengthCount={stats?.strengthCount || 0} 
          runCount={stats?.runCount || 0} 
        />

        {/* 7-Day Habit Grid */}
        <HabitGrid habits={stats?.habits || []} />

        {/* Action Buttons */}
        <div className="space-y-3 mt-8">
          <h3 className="text-xs mb-4 text-[hsl(var(--gb-darkest))] uppercase tracking-widest text-center">
            Log Activity
          </h3>
          
          <RetroButton onClick={() => setLocation('/maintenance')} fullWidth disabled={isPending}>
            1. DAILY MAINTENANCE
          </RetroButton>

          <RetroButton onClick={() => handleLog('run')} fullWidth disabled={isPending}>
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

          <RetroButton onClick={() => handleLog('surf')} fullWidth disabled={isPending}>
            4. SURFING
          </RetroButton>

          <RetroButton onClick={() => handleLog('breath')} fullWidth disabled={isPending}>
            5. BREATHWORK
          </RetroButton>

          <div className="pt-4 border-t-4 border-[hsl(var(--gb-dark))]/20 border-dashed">
            <RetroButton 
              onClick={() => handleLog('recharge')} 
              fullWidth 
              disabled={isPending}
              className="opacity-75 hover:opacity-100"
            >
              6. RECHARGE
            </RetroButton>
          </div>
        </div>
      </main>

      {/* Retro Status Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-[hsl(var(--gb-darkest))] text-[hsl(var(--gb-lightest))] text-[10px] p-2 flex justify-between px-4 z-50">
        <span>STATUS: ONLINE</span>
        <span>BATTERY: 100%</span>
      </div>
    </div>
  );
}
