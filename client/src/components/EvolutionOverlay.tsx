import { useEffect, useState, useRef, useCallback } from 'react';
import { useAudio } from '@/hooks/use-audio';
import {
  getEvolutionTier,
  setGbcUnlocked,
  setGbcAnnounced,
  setGoldAnnouncedThisSession,
  setLightningUnlocked,
  setLightningAnnounced,
  setLightningAnnouncedThisSession,
  logEvolutionEvent,
} from '@/lib/streakManager';
import type { EvolutionTier } from '@/lib/streakManager';
import goldTrimBoy from "@assets/trimboy_gold_1770407871261.png";
import lightningTrimBoy from "@assets/lioghtning_boy_1770409502230.png";

const FW_COLORS = ['#FF3333', '#3366FF', '#FFDD00', '#33CC33', '#FF66CC', '#FF8800', '#00CCFF', '#FFFFFF'];
const PARTICLE_COUNT = 60;

function generateParticles() {
  return Array.from({ length: PARTICLE_COUNT }, (_, i) => {
    const angle = (Math.PI * 2 * i) / PARTICLE_COUNT + (Math.random() - 0.5) * 0.5;
    const dist = 80 + Math.random() * 180;
    const size = 3 + Math.random() * 6;
    const color = FW_COLORS[Math.floor(Math.random() * FW_COLORS.length)];
    const duration = 0.6 + Math.random() * 0.8;
    const delay = Math.random() * 0.3;

    return {
      key: i,
      size,
      color,
      x: Math.cos(angle) * dist,
      y: Math.sin(angle) * dist,
      duration,
      delay,
    };
  });
}

function FireworksEffect({ onComplete }: { onComplete: () => void }) {
  const [wave, setWave] = useState(0);
  const particles1 = useRef(generateParticles());
  const particles2 = useRef(generateParticles());
  const particles3 = useRef(generateParticles());
  const allWaves = [particles1.current, particles2.current, particles3.current];

  useEffect(() => {
    const t1 = setTimeout(() => setWave(1), 500);
    const t2 = setTimeout(() => setWave(2), 1000);
    const t3 = setTimeout(() => onComplete(), 2500);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[10000] pointer-events-none" data-testid="fireworks-overlay">
      {allWaves.slice(0, wave + 1).map((particles, wi) => {
        const cx = wi === 0 ? '50%' : wi === 1 ? '35%' : '65%';
        const cy = wi === 0 ? '45%' : wi === 1 ? '35%' : '55%';
        return (
          <div key={wi} className="absolute" style={{ left: cx, top: cy }}>
            {particles.map((p) => (
              <div
                key={p.key}
                className="firework-particle"
                style={{
                  width: p.size,
                  height: p.size,
                  backgroundColor: p.color,
                  '--fw-x': `${p.x}px`,
                  '--fw-y': `${p.y}px`,
                  '--fw-duration': `${p.duration}s`,
                  '--fw-delay': `${p.delay + wi * 0.5}s`,
                } as React.CSSProperties}
              />
            ))}
          </div>
        );
      })}
      <div className="firework-flash" />
    </div>
  );
}

const FLAME_COLS = 24;

function FlameTransition({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<'rising' | 'engulfed' | 'reveal'>('rising');

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('engulfed'), 600);
    const t2 = setTimeout(() => setPhase('reveal'), 1200);
    const t3 = setTimeout(() => onComplete(), 1800);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onComplete]);

  const flames = Array.from({ length: FLAME_COLS }, (_, i) => {
    const left = (i / FLAME_COLS) * 100;
    const width = (100 / FLAME_COLS) + 1;
    const height = 60 + Math.random() * 40;
    const delay = Math.random() * 0.15;
    const hue = 20 + Math.random() * 25;
    const lightness = 45 + Math.random() * 20;

    return (
      <div
        key={i}
        className="flame-pixel"
        style={{
          left: `${left}%`,
          bottom: 0,
          width: `${width}%`,
          height: `${height}%`,
          backgroundColor: `hsl(${hue}, 100%, ${lightness}%)`,
          '--fl-dur': `${0.3 + Math.random() * 0.3}s`,
          '--fl-delay': `${delay}s`,
          '--fl-drift': `${10 + Math.random() * 20}px`,
        } as React.CSSProperties}
      />
    );
  });

  return (
    <div
      className={`fixed inset-0 z-[10000] overflow-hidden ${phase === 'reveal' ? '' : ''}`}
      style={{ backgroundColor: phase === 'reveal' ? '#2d1b33' : '#000' }}
      data-testid="flame-overlay"
    >
      <div className="flame-column">
        {flames}
      </div>

      {phase === 'engulfed' && (
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, #FF4500, #FF8C00, #FFD700)' }}>
          {flames}
        </div>
      )}

      {phase === 'reveal' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ background: '#2d1b33' }}>
          <img
            src={goldTrimBoy}
            alt="Golden TrimBoy"
            className="w-32 h-auto pixelated gold-sprite-fadein"
            style={{ imageRendering: 'pixelated' }}
            data-testid="img-evolution-gold-sprite"
          />
          <p
            className="evolution-text text-[10px] uppercase tracking-widest mt-4"
            style={{ color: '#FFD700', fontFamily: "'Press Start 2P', monospace", animationDelay: '0.3s' }}
          >
            GOLD MODE ACTIVATED
          </p>
        </div>
      )}
    </div>
  );
}

const STATIC_COUNT = 12;

function StaticParticles() {
  const particles = Array.from({ length: STATIC_COUNT }, (_, i) => {
    const radius = 50 + Math.random() * 30;
    const dur = 1.5 + Math.random() * 2;
    const size = 2 + Math.random() * 3;
    const startAngle = (360 / STATIC_COUNT) * i;
    const color = Math.random() > 0.4 ? '#00f2ff' : '#9d00ff';

    return (
      <div
        key={i}
        className="static-particle"
        style={{
          width: size,
          height: size,
          backgroundColor: color,
          boxShadow: `0 0 4px 1px ${color}`,
          '--sp-radius': `${radius}px`,
          '--sp-dur': `${dur}s`,
          transform: `rotate(${startAngle}deg)`,
        } as React.CSSProperties}
      />
    );
  });
  return <>{particles}</>;
}

function LightningTransition({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<'shake' | 'flashes' | 'reveal'>('shake');
  const [flashCount, setFlashCount] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('flashes'), 500);
    const t2 = setTimeout(() => setFlashCount(1), 600);
    const t3 = setTimeout(() => setFlashCount(2), 750);
    const t4 = setTimeout(() => setFlashCount(3), 900);
    const t5 = setTimeout(() => setFlashCount(4), 1050);
    const t6 = setTimeout(() => setFlashCount(5), 1200);
    const t7 = setTimeout(() => setPhase('reveal'), 1400);
    const t8 = setTimeout(() => onComplete(), 2800);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); clearTimeout(t5); clearTimeout(t6); clearTimeout(t7); clearTimeout(t8); };
  }, [onComplete]);

  const boltPaths = [
    'M50,0 L48,15 L55,18 L47,35 L54,38 L42,60 L50,55 L38,80',
    'M30,0 L33,20 L26,24 L34,45 L27,48 L36,70',
    'M70,0 L67,18 L74,22 L66,40 L73,44 L64,65',
  ];

  return (
    <div
      className={`fixed inset-0 z-[10000] overflow-hidden ${phase === 'shake' ? 'screen-shake' : ''}`}
      style={{ backgroundColor: phase === 'reveal' ? '#1a0633' : '#000' }}
      data-testid="lightning-overlay"
    >
      {phase === 'flashes' && (
        <>
          {Array.from({ length: flashCount }, (_, i) => (
            <div
              key={i}
              className="lightning-flash"
              style={{ animationDelay: `${i * 0.05}s` }}
            />
          ))}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            {boltPaths.map((d, i) => (
              <path
                key={i}
                d={d}
                stroke="#00f2ff"
                strokeWidth="2"
                fill="none"
                opacity={flashCount > i ? 1 : 0}
                filter="drop-shadow(0 0 8px rgba(0, 242, 255, 0.9))"
              />
            ))}
          </svg>
        </>
      )}

      {phase === 'reveal' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ background: '#1a0633' }}>
          <div className="relative">
            <StaticParticles />
            <img
              src={lightningTrimBoy}
              alt="Lightning TrimBoy"
              className="w-32 h-auto pixelated storm-sprite-fadein relative z-10"
              style={{ imageRendering: 'pixelated' }}
              data-testid="img-evolution-storm-sprite"
            />
            <div
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              style={{
                filter: 'drop-shadow(0 0 20px rgba(0, 242, 255, 0.6))',
              }}
            />
          </div>
          <p
            className="evolution-text text-[10px] uppercase tracking-widest mt-4"
            style={{
              color: '#00f2ff',
              fontFamily: "'Press Start 2P', monospace",
              animationDelay: '0.3s',
              textShadow: '0 0 8px rgba(0, 242, 255, 0.8), 0 0 16px rgba(157, 0, 255, 0.4)',
            }}
          >
            LIGHTNING EDITION
          </p>
          <p
            className="evolution-text text-[7px] uppercase tracking-widest mt-2"
            style={{
              color: '#9d00ff',
              fontFamily: "'Press Start 2P', monospace",
              animationDelay: '0.6s',
              textShadow: '0 0 6px rgba(157, 0, 255, 0.6)',
            }}
          >
            STORM MODE ACTIVATED
          </p>
        </div>
      )}
    </div>
  );
}

interface EvolutionOverlayProps {
  onEvolutionComplete: (tier: EvolutionTier) => void;
}

export function EvolutionOverlay({ onEvolutionComplete }: EvolutionOverlayProps) {
  const [activeTier, setActiveTier] = useState<EvolutionTier>('NONE');
  const [phase, setPhase] = useState<'idle' | 'fireworks' | 'fireworks_text' | 'flame' | 'lightning' | 'done'>('idle');
  const { playFireworksBurst, playFlameRoar, playGoldenChime, playThunderclap, playStormChime, initAudio } = useAudio();
  const hasStarted = useRef(false);

  useEffect(() => {
    if (hasStarted.current) return;
    const tier = getEvolutionTier();
    if (tier === 'NONE') return;
    hasStarted.current = true;
    setActiveTier(tier);

    initAudio();

    if (tier === 'GBC_UNLOCK') {
      setPhase('fireworks');
      playFireworksBurst();
    } else if (tier === 'GOLD_UNLOCK') {
      setPhase('flame');
      playFlameRoar();
    } else if (tier === 'LIGHTNING_UNLOCK') {
      setPhase('lightning');
      playThunderclap();
    }
  }, [initAudio, playFireworksBurst, playFlameRoar, playThunderclap]);

  const handleFireworksComplete = useCallback(() => {
    setPhase('fireworks_text');
    setGbcUnlocked();
    setGbcAnnounced();
    logEvolutionEvent('GBC_UNLOCK');

    const root = document.getElementById('app-root');
    if (root) {
      root.classList.remove('theme-classic', 'theme-color', 'theme-gold', 'theme-storm');
      root.classList.add('theme-color');
      localStorage.setItem('trim_hardware_theme', 'color');
    }
    window.dispatchEvent(new Event('streak-update'));

    setTimeout(() => {
      setPhase('flame');
      playFlameRoar();
    }, 2500);
  }, [playFlameRoar]);

  const handleFlameComplete = useCallback(() => {
    setGoldAnnouncedThisSession();
    logEvolutionEvent('GOLD_UNLOCK');
    playGoldenChime();

    setTimeout(() => {
      setPhase('done');
      onEvolutionComplete(activeTier);
    }, 800);
  }, [onEvolutionComplete, activeTier, playGoldenChime]);

  const handleLightningComplete = useCallback(() => {
    setLightningUnlocked();
    setLightningAnnounced();
    setLightningAnnouncedThisSession();
    logEvolutionEvent('LIGHTNING_UNLOCK');
    playStormChime();

    const root = document.getElementById("app-root");
    if (root) {
      root.classList.remove("theme-classic", "theme-color", "theme-gold");
      root.classList.add("theme-storm");
      localStorage.setItem("trim_hardware_theme", "storm");
    }

    setTimeout(() => {
      setPhase('done');
      onEvolutionComplete(activeTier);
    }, 800);
  }, [onEvolutionComplete, activeTier, playStormChime]);

  if (phase === 'idle' || phase === 'done') return null;

  return (
    <>
      {phase === 'fireworks' && (
        <div className="fixed inset-0 z-[10000] bg-black" data-testid="evolution-fireworks">
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p
              className="text-[10px] uppercase tracking-widest z-[10002] relative"
              style={{ color: '#9bbc0f', fontFamily: "'Press Start 2P', monospace" }}
            >
              SYSTEM UPGRADE
            </p>
          </div>
          <FireworksEffect onComplete={handleFireworksComplete} />
        </div>
      )}

      {phase === 'fireworks_text' && (
        <div
          className="fixed inset-0 z-[10000] flex flex-col items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, #e6e6e6 0%, #b3c7d6 30%, #8b3a3a 60%, #2c2c36 100%)',
          }}
          data-testid="evolution-gbc-reveal"
        >
          <div className="mb-6 grid grid-cols-4 gap-1">
            {['#4a82c7', '#c73a3a', '#3a9e3a', '#c7b73a', '#c76e3a', '#7a3ac7', '#3ac7c7', '#c73a7a'].map((c, i) => (
              <div key={i} className="w-4 h-4" style={{ backgroundColor: c }} />
            ))}
          </div>
          <p
            className="evolution-text text-sm uppercase tracking-widest mb-2"
            style={{ color: '#1a1a2e', fontFamily: "'Press Start 2P', monospace" }}
          >
            GBC UNLOCKED
          </p>
          <p
            className="evolution-text text-[8px] uppercase tracking-widest"
            style={{ color: '#2d5a27', fontFamily: "'Press Start 2P', monospace", animationDelay: '0.4s' }}
          >
            FULL COLOR MODE AVAILABLE
          </p>
        </div>
      )}

      {phase === 'flame' && (
        <FlameTransition onComplete={handleFlameComplete} />
      )}

      {phase === 'lightning' && (
        <LightningTransition onComplete={handleLightningComplete} />
      )}
    </>
  );
}
