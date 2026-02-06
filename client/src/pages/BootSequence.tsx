
import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useAudio } from '@/hooks/use-audio';

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
    <div className="min-h-screen bg-black flex flex-col items-center justify-center text-[#9bbc0f] font-mono">
      {!started ? (
        <button 
          onClick={handleStart}
          className="text-xl animate-pulse hover:scale-110 transition-transform"
        >
          PRESS START
        </button>
      ) : (
        <div className="flex flex-col items-center space-y-8 animate-in fade-in duration-500">
          {/* TrimBoy Placeholder Sprite */}
          <div className="w-32 h-32 border-4 border-[#9bbc0f] relative overflow-hidden flex items-center justify-center bg-[#8bac0f]">
            <div className="w-24 h-24 bg-[#306230] rounded-sm relative">
                <div className="absolute top-4 left-4 w-4 h-4 bg-[#9bbc0f]"></div>
                <div className="absolute top-4 right-4 w-4 h-4 bg-[#9bbc0f]"></div>
                <div className="absolute bottom-4 left-4 w-16 h-4 bg-[#9bbc0f]"></div>
            </div>
          </div>
          
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold tracking-widest">TRIMBOY</h1>
            <p className="text-[10px] opacity-80">TRIMCORP © 1989-2026</p>
          </div>
        </div>
      )}
    </div>
  );
}
