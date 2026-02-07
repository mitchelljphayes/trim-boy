import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { startOfWeek, format } from 'date-fns';
import { ArrowLeft } from 'lucide-react';
import rechargeSprite from '@assets/trimboyrest_1770442682195.png';
import burnoutSprite from '@assets/trimboy_burnout_1770442789993.png';

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

function getWeekKey(): string {
  const monday = startOfWeek(new Date(), { weekStartsOn: 1 });
  return format(monday, 'yyyy-MM-dd');
}

export function hasRechargedThisWeek(): boolean {
  const stored = localStorage.getItem('trim_recharge_week');
  return stored === getWeekKey();
}

function seededRandom(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

function getWeeklyPrescription(): { anime: typeof ANIME[0]; hiphop: typeof HIPHOP[0] } {
  const weekKey = getWeekKey();
  const seed = seededRandom(weekKey);
  return {
    anime: ANIME[seed % ANIME.length],
    hiphop: HIPHOP[(seed * 7) % HIPHOP.length],
  };
}

export default function Recharge() {
  const [, setLocation] = useLocation();
  const [alreadyViewed] = useState(() => hasRechargedThisWeek());
  const [glitching, setGlitching] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);
  const [prescription] = useState(() => getWeeklyPrescription());

  useEffect(() => {
    if (!alreadyViewed) {
      localStorage.setItem('trim_recharge_week', getWeekKey());
      setShowLibrary(true);
    }
  }, [alreadyViewed]);

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

  if (alreadyViewed && !showLibrary) {
    return (
      <div className="min-h-screen bg-[hsl(var(--gb-lightest))] flex flex-col items-center justify-center p-6 text-center">
        <img
          src={burnoutSprite}
          alt="TrimBoy Burnout"
          className="w-32 h-32 object-contain mb-4 pixelated"
          data-testid="img-burnout-sprite"
        />

        <p className="text-[9px] text-[hsl(var(--gb-darkest))] font-bold uppercase leading-relaxed mb-4 max-w-xs" data-testid="text-warning">
          COME ON TRIMBOY... YOU ALREADY GOT YOUR PRESCRIPTION THIS WEEK.
        </p>

        <p className="text-[7px] text-[hsl(var(--gb-dark))] uppercase tracking-widest mb-8 max-w-xs leading-relaxed" data-testid="text-weekly-hint">
          NEW PRESCRIPTIONS DROP EVERY MONDAY
        </p>

        <button
          onClick={() => setLocation('/dashboard')}
          className="flex items-center gap-2 text-[hsl(var(--gb-dark))] text-xs mb-12"
          data-testid="button-back"
        >
          <ArrowLeft size={14} /> BACK TO HQ
        </button>

        <button
          onClick={() => {
            setGlitching(true);
            setTimeout(() => {
              setGlitching(false);
              setShowLibrary(true);
            }, 1500);
          }}
          className="text-[7px] text-[hsl(var(--gb-dark))]/25 uppercase tracking-widest hover:text-[hsl(var(--gb-dark))]/60 transition-colors"
          data-testid="button-force-override"
        >
          [VIEW AGAIN]
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[hsl(var(--gb-lightest))] p-6 flex flex-col items-center">
      <img
        src={rechargeSprite}
        alt="TrimBoy Resting"
        className="w-32 h-32 object-contain mb-4 pixelated"
        data-testid="img-recharge-sprite"
      />
      <h1 className="text-sm font-bold text-[hsl(var(--gb-darkest))] mb-2 text-center" data-testid="text-title">
        WEEKLY PRESCRIPTION
      </h1>
      <p className="text-[8px] text-[hsl(var(--gb-dark))] uppercase tracking-widest mb-8">
        YOUR CULTURAL RX
      </p>

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
