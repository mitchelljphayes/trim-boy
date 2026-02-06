
import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useAudio } from '@/hooks/use-audio';
import trimBoySprite from "@assets/trimboysprite01_1770372116288.png";

export default function BootSequence() {
  const [, setLocation] = useLocation();
  const { playStartupSound } = useAudio();
  const [started, setStarted] = useState(false);

  const handleStart = () => {
    setStarted(true);
    playStartupSound();
    setTimeout(() => {
      setLocation('/dashboard');
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--gb-lightest))] flex flex-col items-center justify-center text-[hsl(var(--gb-darkest))] font-mono">
      {!started ? (
        <button 
          onClick={handleStart}
          className="text-xl animate-pulse hover:scale-110 transition-transform text-[hsl(var(--gb-darkest))]"
        >
          PRESS START
        </button>
      ) : (
        <div className="flex flex-col items-center space-y-8 animate-in fade-in duration-500">
          <img 
            src={trimBoySprite} 
            alt="TrimBoy" 
            className="w-48 h-auto pixelated"
          />
          
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold tracking-widest">TRIMBOY</h1>
            <p className="text-[10px] opacity-80">TRIMCORP © 1989-2026</p>
          </div>
        </div>
      )}
    </div>
  );
}
