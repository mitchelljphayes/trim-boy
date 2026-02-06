import { useEffect, useState, useRef, useCallback } from 'react';
import { useAudio } from '@/hooks/use-audio';
import {
  getEvolutionTier,
  setGbcUnlocked,
  setGbcAnnounced,
  setGoldAnnouncedThisSession,
  logEvolutionEvent,
} from '@/lib/streakManager';
import type { EvolutionTier } from '@/lib/streakManager';
import goldTrimBoy from "@assets/trimboy_gold_1770407871261.png";

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

interface EvolutionOverlayProps {
  onEvolutionComplete: (tier: EvolutionTier) => void;
}

export function EvolutionOverlay({ onEvolutionComplete }: EvolutionOverlayProps) {
  const [activeTier, setActiveTier] = useState<EvolutionTier>('NONE');
  const [phase, setPhase] = useState<'idle' | 'fireworks' | 'fireworks_text' | 'flame' | 'done'>('idle');
  const { playFireworksBurst, playFlameRoar, playGoldenChime, initAudio } = useAudio();
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
    }
  }, [initAudio, playFireworksBurst, playFlameRoar]);

  const handleFireworksComplete = useCallback(() => {
    setPhase('fireworks_text');
    setGbcUnlocked();
    setGbcAnnounced();
    logEvolutionEvent('GBC_UNLOCK');

    const root = document.getElementById('app-root');
    if (root) {
      root.classList.remove('theme-classic', 'theme-color', 'theme-gold');
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
    </>
  );
}
