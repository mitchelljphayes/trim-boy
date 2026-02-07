import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'wouter';
import { startOfWeek, format } from 'date-fns';
import { ArrowLeft, X } from 'lucide-react';
import { RetroButton } from '@/components/RetroButton';
import rechargeSprite from '@assets/trimboyrest_1770442003899.png';

const ANIME = [
  { title: 'Cowboy Bebop', desc: 'Space bounty hunters and jazz. The ultimate cool-down.' },
  { title: 'Samurai Champloo', desc: 'Hip-hop meets feudal Japan. Perfect for post-surf flow.' },
  { title: 'Initial D', desc: 'Eurobeat and mountain drifting. For when you need mental speed.' },
  { title: 'Neon Genesis Evangelion', desc: 'Psychological depth and giant mechs. Heavy rest day vibes.' },
  { title: 'YuYu Hakusho', desc: 'Spirit detective battles. Classic 90s grit.' },
];

const HIPHOP = [
  { artist: 'Hieroglyphics', album: '3rd Eye Vision', desc: 'Pure Oakland flow for mental clarity.' },
  { artist: 'MF DOOM', album: 'Operation: Doomsday', desc: "The villain's guide to lyrical recovery." },
  { artist: 'The Pharcyde', album: 'Bizarre Ride II', desc: 'High energy, playful, and strictly 90s.' },
  { artist: 'Gang Starr', album: 'Moment of Truth', desc: "Guru's wisdom for your rest day discipline." },
  { artist: 'Souls of Mischief', album: "93 'til Infinity", desc: 'The ultimate soundtrack for a summer afternoon.' },
];

const TRIMBOY_DISAPPOINTED = `
    ___________
   |  _______  |
   | |  x  x | |
   | |   __  | |
   | |  (__) | |
   | |_______| |
   |___________|
   |  _  _  _  |
   | |_||_||_| |
   |___________|
`;

function getWeekKey(): string {
  const monday = startOfWeek(new Date(), { weekStartsOn: 1 });
  return format(monday, 'yyyy-MM-dd');
}

export function hasRechargedThisWeek(): boolean {
  const stored = localStorage.getItem('trim_recharge_week');
  return stored === getWeekKey();
}

function markRecharged(): void {
  localStorage.setItem('trim_recharge_week', getWeekKey());
}

function setRecharging(active: boolean): void {
  if (active) {
    localStorage.setItem('trim_recharging', 'true');
  } else {
    localStorage.removeItem('trim_recharging');
  }
  window.dispatchEvent(new Event('recharge-status-change'));
}

export function isRecharging(): boolean {
  return localStorage.getItem('trim_recharging') === 'true';
}

function getRandomPair(): { anime: typeof ANIME[0]; hiphop: typeof HIPHOP[0] } {
  return {
    anime: ANIME[Math.floor(Math.random() * ANIME.length)],
    hiphop: HIPHOP[Math.floor(Math.random() * HIPHOP.length)],
  };
}

export default function Recharge() {
  const [, setLocation] = useLocation();
  const [alreadyUsed] = useState(() => hasRechargedThisWeek());
  const [glitching, setGlitching] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);
  const [prescription] = useState(() => getRandomPair());
  const [rechargeActive, setRechargeActive] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!alreadyUsed) {
      markRecharged();
      setShowLibrary(true);
    }
  }, [alreadyUsed]);

  const enterLibrary = useCallback(() => {
    markRecharged();
    setShowLibrary(true);
  }, []);

  const forceOverride = useCallback(() => {
    setGlitching(true);
    setTimeout(() => {
      setGlitching(false);
      enterLibrary();
    }, 1500);
  }, [enterLibrary]);

  const startRecharge = useCallback(() => {
    setRechargeActive(true);
    setRecharging(true);
    setProgress(0);
  }, []);

  useEffect(() => {
    if (!rechargeActive) return;

    const duration = 30000;
    const interval = 100;
    const step = (interval / duration) * 100;

    const timer = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(timer);
          setRecharging(false);
          setTimeout(() => setLocation('/dashboard'), 1500);
          return 100;
        }
        return p + step;
      });
    }, interval);

    return () => {
      clearInterval(timer);
    };
  }, [rechargeActive, setLocation]);

  useEffect(() => {
    return () => {
      setRecharging(false);
    };
  }, []);

  // === GLITCH SCREEN ===
  if (glitching) {
    return (
      <div className="min-h-screen bg-[hsl(var(--gb-darkest))] flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 animate-pulse" style={{ animationDuration: '0.1s' }}>
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="h-[5vh] w-full"
              style={{
                backgroundColor: i % 2 === 0
                  ? 'hsl(var(--gb-lightest))'
                  : 'hsl(var(--gb-darkest))',
                opacity: Math.random() * 0.5 + 0.1,
                transform: `translateX(${(Math.random() - 0.5) * 40}px)`,
              }}
            />
          ))}
        </div>
        <p
          className="relative z-10 text-lg font-bold text-[hsl(var(--gb-lightest))] animate-pulse"
          style={{ fontFamily: "'Press Start 2P', monospace", animationDuration: '0.15s' }}
        >
          SYSTEM OVERRIDE
        </p>
      </div>
    );
  }

  // === RECHARGE IN PROGRESS ===
  if (rechargeActive) {
    const cancelRecharge = () => {
      localStorage.removeItem('trim_recharge_week');
      localStorage.removeItem('trim_recharging');
      window.dispatchEvent(new Event('recharge-status-change'));
      setLocation('/dashboard');
    };
    return (
      <div className="min-h-screen bg-[hsl(var(--gb-darkest))] flex flex-col items-center justify-center p-6 relative">
        <button
          onClick={cancelRecharge}
          className="absolute top-4 right-4 text-[hsl(var(--gb-light))]/50 hover:text-[hsl(var(--gb-lightest))] transition-colors p-2"
          data-testid="button-cancel-recharge"
          title="Cancel recharge"
        >
          <X size={20} />
        </button>
        <p className="text-[9px] text-[hsl(var(--gb-light))] uppercase tracking-widest mb-4">
          SYSTEM: RECHARGING
        </p>
        <h2 className="text-sm font-bold text-[hsl(var(--gb-lightest))] mb-8" data-testid="text-recharging">
          RECHARGE IN PROGRESS
        </h2>

        <div className="w-full max-w-xs mb-8">
          <div className="w-full h-4 border-2 border-[hsl(var(--gb-light))] p-0.5">
            <div
              className="h-full bg-[hsl(var(--gb-lightest))] transition-all duration-100"
              style={{ width: `${Math.min(progress, 100)}%` }}
              data-testid="recharge-bar"
            />
          </div>
          <p className="text-[8px] text-[hsl(var(--gb-light))]/50 text-center mt-2 uppercase tracking-widest">
            {Math.min(Math.floor(progress), 100)}%
          </p>
        </div>

        {progress >= 100 && (
          <p className="text-[10px] text-[hsl(var(--gb-lightest))] animate-pulse">
            RECHARGE COMPLETE
          </p>
        )}
      </div>
    );
  }

  // === DISAPPOINTED SCREEN (already recharged this week) ===
  if (alreadyUsed && !showLibrary) {
    return (
      <div className="min-h-screen bg-[hsl(var(--gb-lightest))] flex flex-col items-center justify-center p-6 text-center">
        <pre
          className="text-[7px] text-[hsl(var(--gb-darkest))] leading-tight mb-6 select-none"
          style={{ fontFamily: "'Press Start 2P', monospace" }}
          data-testid="text-disappointed"
        >
          {TRIMBOY_DISAPPOINTED}
        </pre>

        <p className="text-[9px] text-[hsl(var(--gb-darkest))] font-bold uppercase leading-relaxed mb-8 max-w-xs" data-testid="text-warning">
          COME ON TRIMBOY... YOU ALREADY RECHARGED THIS WEEK.
        </p>

        <button
          onClick={() => setLocation('/dashboard')}
          className="flex items-center gap-2 text-[hsl(var(--gb-dark))] text-xs mb-12"
          data-testid="button-back"
        >
          <ArrowLeft size={14} /> BACK TO HQ
        </button>

        <button
          onClick={forceOverride}
          className="text-[7px] text-[hsl(var(--gb-dark))]/25 uppercase tracking-widest hover:text-[hsl(var(--gb-dark))]/60 transition-colors"
          data-testid="button-force-override"
        >
          [FORCE SYSTEM OVERRIDE]
        </button>
      </div>
    );
  }

  // === CULTURE LIBRARY ===
  return (
    <div className="min-h-screen bg-[hsl(var(--gb-lightest))] p-6 flex flex-col items-center">
      <img
        src={rechargeSprite}
        alt="TrimBoy Resting"
        className="w-28 h-28 object-contain mb-4"
        style={{ imageRendering: 'pixelated' }}
        data-testid="img-recharge-sprite"
      />
      <h1 className="text-lg font-bold text-[hsl(var(--gb-darkest))] mb-2 text-center" data-testid="text-title">
        RECHARGE LIBRARY
      </h1>
      <p className="text-[8px] text-[hsl(var(--gb-dark))] uppercase tracking-widest mb-8">
        Cultural Prescriptions
      </p>

      {/* Anime Prescription */}
      <div className="w-full max-w-xs mb-6">
        <div className="border-2 border-[hsl(var(--gb-dark))] bg-[hsl(var(--gb-light))] p-4">
          <p className="text-[8px] text-[hsl(var(--gb-dark))] uppercase tracking-widest mb-2">
            ANIME RX
          </p>
          <h3 className="text-sm font-bold text-[hsl(var(--gb-darkest))] mb-2 uppercase" data-testid="text-anime-title">
            {prescription.anime.title}
          </h3>
          <p className="text-[9px] text-[hsl(var(--gb-dark))] leading-relaxed" data-testid="text-anime-desc">
            {prescription.anime.desc}
          </p>
        </div>
      </div>

      {/* Hip-Hop Prescription */}
      <div className="w-full max-w-xs mb-8">
        <div className="border-2 border-[hsl(var(--gb-dark))] bg-[hsl(var(--gb-light))] p-4">
          <p className="text-[8px] text-[hsl(var(--gb-dark))] uppercase tracking-widest mb-2">
            HIP-HOP RX
          </p>
          <h3 className="text-sm font-bold text-[hsl(var(--gb-darkest))] mb-1 uppercase" data-testid="text-hiphop-artist">
            {prescription.hiphop.artist}
          </h3>
          <p className="text-[10px] text-[hsl(var(--gb-darkest))] mb-2 italic" data-testid="text-hiphop-album">
            {prescription.hiphop.album}
          </p>
          <p className="text-[9px] text-[hsl(var(--gb-dark))] leading-relaxed" data-testid="text-hiphop-desc">
            {prescription.hiphop.desc}
          </p>
        </div>
      </div>

      {/* Start Recharge */}
      <RetroButton onClick={startRecharge} className="w-full max-w-xs mb-4" data-testid="button-recharge">
        BEGIN RECHARGE
      </RetroButton>

      <button
        onClick={() => setLocation('/dashboard')}
        className="flex items-center gap-2 text-[hsl(var(--gb-dark))] text-xs"
        data-testid="button-back"
      >
        <ArrowLeft size={14} /> BACK TO HQ
      </button>
    </div>
  );
}
