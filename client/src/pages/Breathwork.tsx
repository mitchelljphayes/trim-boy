import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useLocation } from 'wouter';
import { useCreateLog } from '@/hooks/use-trim';
import { useAudio } from '@/hooks/use-audio';
import { RetroButton } from '@/components/RetroButton';
import { ArrowLeft, VolumeX, Volume2, X } from 'lucide-react';
import medSprite from '@assets/trimboy_med_1770441675206.png';

interface Starling {
  id: number;
  x: number;
  y: number;
  driftX: number;
  driftY: number;
  duration: number;
  delay: number;
  size: number;
}

function StarlingField() {
  const flocks = useMemo(() => {
    const groups: Starling[] = [];
    const flockCount = 7;
    let id = 0;

    for (let f = 0; f < flockCount; f++) {
      const cx = 10 + Math.random() * 80;
      const cy = 10 + Math.random() * 80;
      const flockSize = 20 + Math.floor(Math.random() * 16);
      const baseDriftX = (Math.random() - 0.5) * 160;
      const baseDriftY = (Math.random() - 0.5) * 120;
      const baseDuration = 10 + Math.random() * 8;

      for (let i = 0; i < flockSize; i++) {
        groups.push({
          id: id++,
          x: cx + (Math.random() - 0.5) * 10,
          y: cy + (Math.random() - 0.5) * 7,
          driftX: baseDriftX + (Math.random() - 0.5) * 40,
          driftY: baseDriftY + (Math.random() - 0.5) * 30,
          duration: baseDuration + (Math.random() - 0.5) * 6,
          delay: Math.random() * -8,
          size: 2 + Math.random() * 3,
        });
      }
    }
    return groups;
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none select-none overflow-hidden" aria-hidden="true">
      {flocks.map((s) => (
        <div
          key={s.id}
          className="absolute bg-[hsl(var(--gb-light))] starling-swarm"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: `${s.size}px`,
            height: `${s.size}px`,
            opacity: 0.18,
            animationDuration: `${s.duration}s`,
            animationDelay: `${s.delay}s`,
            ['--drift-x' as string]: `${s.driftX}px`,
            ['--drift-y' as string]: `${s.driftY}px`,
          }}
        />
      ))}
    </div>
  );
}

const CYCLE_DURATION = 16;
const PHASE_DURATION = 4;
const TOTAL_DURATION = 5 * 60;
const TOTAL_CYCLES = Math.floor(TOTAL_DURATION / CYCLE_DURATION);

type BreathPhase = 'inhale' | 'hold-in' | 'exhale' | 'hold-out';

const PHASE_LABELS: Record<BreathPhase, string> = {
  'inhale': 'INHALE',
  'hold-in': 'HOLD',
  'exhale': 'EXHALE',
  'hold-out': 'HOLD',
};

const BOX_MIN = 80;
const BOX_MAX = 160;

export default function Breathwork() {
  const [, setLocation] = useLocation();
  const { playInhaleSweep, playExhaleSweep, playHoldChime, playGentleIdent, initAudio, setMuted } = useAudio();
  const { mutate: logActivity } = useCreateLog();

  const [started, setStarted] = useState(false);
  const [complete, setComplete] = useState(false);
  const [muted, setMutedState] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [phaseTime, setPhaseTime] = useState(0);
  const [currentPhase, setCurrentPhase] = useState<BreathPhase>('inhale');

  const animFrameRef = useRef<number>(0);
  const startTimeRef = useRef(0);
  const lastPhaseRef = useRef<BreathPhase | null>(null);

  const toggleMute = () => {
    setMutedState((m) => {
      setMuted(!m);
      return !m;
    });
  };

  const startSession = () => {
    initAudio();
    setStarted(true);
    startTimeRef.current = performance.now();
    lastPhaseRef.current = null;
  };

  const getPhaseFromElapsed = useCallback((totalElapsed: number): { phase: BreathPhase; progress: number } => {
    const cyclePos = totalElapsed % CYCLE_DURATION;
    let phase: BreathPhase;
    let phaseProgress: number;

    if (cyclePos < PHASE_DURATION) {
      phase = 'inhale';
      phaseProgress = cyclePos / PHASE_DURATION;
    } else if (cyclePos < PHASE_DURATION * 2) {
      phase = 'hold-in';
      phaseProgress = (cyclePos - PHASE_DURATION) / PHASE_DURATION;
    } else if (cyclePos < PHASE_DURATION * 3) {
      phase = 'exhale';
      phaseProgress = (cyclePos - PHASE_DURATION * 2) / PHASE_DURATION;
    } else {
      phase = 'hold-out';
      phaseProgress = (cyclePos - PHASE_DURATION * 3) / PHASE_DURATION;
    }

    return { phase, progress: phaseProgress };
  }, []);

  const getBoxSize = useCallback((phase: BreathPhase, progress: number): number => {
    switch (phase) {
      case 'inhale':
        return BOX_MIN + (BOX_MAX - BOX_MIN) * progress;
      case 'hold-in':
        return BOX_MAX;
      case 'exhale':
        return BOX_MAX - (BOX_MAX - BOX_MIN) * progress;
      case 'hold-out':
        return BOX_MIN;
    }
  }, []);

  const getLungProgress = useCallback((phase: BreathPhase, progress: number): number => {
    switch (phase) {
      case 'inhale':
        return progress;
      case 'hold-in':
        return 1;
      case 'exhale':
        return 1 - progress;
      case 'hold-out':
        return 0;
    }
  }, []);

  useEffect(() => {
    if (!started || complete) return;

    let lastSecond = -1;

    const tick = () => {
      const now = performance.now();
      const totalElapsed = (now - startTimeRef.current) / 1000;

      if (totalElapsed >= TOTAL_DURATION) {
        setComplete(true);
        playGentleIdent();
        logActivity({ category: 'breath', date: new Date() });
        setTimeout(() => setLocation('/dashboard'), 3500);
        return;
      }

      setElapsed(totalElapsed);
      const { phase, progress } = getPhaseFromElapsed(totalElapsed);
      setCurrentPhase(phase);
      setPhaseTime(progress);

      const currentSecond = Math.floor(totalElapsed);
      if (currentSecond !== lastSecond) {
        lastSecond = currentSecond;
        if (lastPhaseRef.current !== phase) {
          lastPhaseRef.current = phase;
          if (phase === 'inhale') playInhaleSweep();
          else if (phase === 'exhale') playExhaleSweep();
          else playHoldChime();
        }
      }

      animFrameRef.current = requestAnimationFrame(tick);
    };

    animFrameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [started, complete, getPhaseFromElapsed, playInhaleSweep, playExhaleSweep, playHoldChime, playGentleIdent, logActivity, setLocation]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  if (!started) {
    return (
      <div className="min-h-screen bg-[hsl(var(--gb-darkest))] p-6 flex flex-col items-center justify-center text-center relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none opacity-10" aria-hidden="true">
          <pre
            className="text-[hsl(var(--gb-light))] text-[8px] leading-tight text-center animate-pulse"
            style={{ fontFamily: "'Press Start 2P', monospace" }}
          >
{`        |
       |||
      |||||
     |||||||
    |||||||||
   \\  |||||  /
    \\ ||||| /
     \\|||||/
      \\|||/
       \\|/
        *
       /|\\
      /|||\\
     /|||||\\
    / ||||| \\
   /  |||||  \\
    |||||||||
     |||||||
      |||||
       |||
        |`}
          </pre>
        </div>

        <div className="relative z-10">
          <div
            className="w-32 h-32 mb-4 mx-auto relative"
            style={{ filter: 'drop-shadow(0 0 6px hsl(var(--gb-light))) drop-shadow(0 0 12px hsl(var(--gb-light)))' }}
          >
            <img
              src={medSprite}
              alt="TrimBoy Meditating"
              className="w-full h-full object-contain pixelated"
              data-testid="img-breathwork-sprite"
            />
          </div>
          <h1 className="text-xl font-bold mb-4 text-[hsl(var(--gb-lightest))]" data-testid="text-title">BREATHWORK</h1>
          <p className="text-[9px] text-[hsl(var(--gb-light))] uppercase tracking-widest mb-2">Box Breathing / 4-4-4-4</p>
          <p className="text-[9px] text-[hsl(var(--gb-light))] uppercase tracking-widest mb-8">5 Minutes / {TOTAL_CYCLES} Cycles</p>

          <div className="mb-6 w-full max-w-xs mx-auto text-left bg-[hsl(var(--gb-dark))]/20 p-4 border-2 border-[hsl(var(--gb-dark))]">
            <div className="text-[8px] text-[hsl(var(--gb-light))] space-y-2">
              <p>4s INHALE (box expands)</p>
              <p>4s HOLD</p>
              <p>4s EXHALE (box contracts)</p>
              <p>4s HOLD</p>
            </div>
          </div>

          <RetroButton onClick={startSession} className="w-full max-w-xs" data-testid="button-start">
            BEGIN SESSION
          </RetroButton>
          <button
            onClick={() => setLocation('/dashboard')}
            className="mt-6 flex items-center gap-2 text-[hsl(var(--gb-light))] text-xs mx-auto"
            data-testid="button-back"
          >
            <ArrowLeft size={14} /> BACK
          </button>
        </div>
      </div>
    );
  }

  if (complete) {
    return (
      <div className="min-h-screen bg-[hsl(var(--gb-darkest))] flex items-center justify-center text-center p-8">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(var(--gb-lightest))] mb-4" data-testid="text-complete">SESSION COMPLETE</h1>
          <p className="text-[10px] text-[hsl(var(--gb-light))]">SYNCING DATA...</p>
        </div>
      </div>
    );
  }

  const { phase, progress } = getPhaseFromElapsed(elapsed);
  const boxSize = getBoxSize(phase, progress);
  const lungFill = getLungProgress(phase, progress);
  const remaining = Math.max(0, TOTAL_DURATION - elapsed);

  return (
    <div className="min-h-screen bg-[hsl(var(--gb-darkest))] flex flex-col items-center justify-between p-6 relative overflow-hidden">
      <StarlingField />

      <div className="relative z-10 flex-shrink-0 flex items-center justify-between w-full">
        <p className="text-[9px] text-[hsl(var(--gb-light))] uppercase tracking-widest" data-testid="text-remaining">
          {formatTime(remaining)}
        </p>
        <div className="flex gap-2">
          <button
            onClick={toggleMute}
            className="w-10 h-10 flex items-center justify-center border-2 border-[hsl(var(--gb-light))] text-[hsl(var(--gb-light))]"
            data-testid="button-mute"
          >
            {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
          <button
            onClick={() => setLocation('/dashboard')}
            className="w-10 h-10 flex items-center justify-center border-2 border-[hsl(var(--gb-light))] text-[hsl(var(--gb-light))]"
            data-testid="button-exit"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      <div className="relative z-10 flex-1 flex items-center justify-center w-full">
        <div className="relative" style={{ width: BOX_MAX, height: BOX_MAX }}>
          <div
            className="border-4 border-[hsl(var(--gb-lightest))] transition-none absolute"
            style={{
              width: boxSize,
              height: boxSize,
              left: (BOX_MAX - boxSize) / 2,
              top: (BOX_MAX - boxSize) / 2,
              boxShadow: `0 0 ${12 + lungFill * 16}px hsl(var(--gb-light) / ${0.15 + lungFill * 0.2})`,
            }}
            data-testid="breath-box"
          />
        </div>

        <div className="absolute left-0 right-0 text-center" style={{ top: `calc(50% + ${BOX_MAX / 2 + 24}px)` }}>
          <span
            className="text-sm font-bold text-[hsl(var(--gb-lightest))] uppercase tracking-widest block"
            data-testid="text-phase"
          >
            {PHASE_LABELS[currentPhase]}
          </span>
          <p className="text-[8px] text-[hsl(var(--gb-light))]/50 uppercase tracking-widest mt-3" data-testid="text-cycle">
            CYCLE {Math.min(Math.floor(elapsed / CYCLE_DURATION) + 1, TOTAL_CYCLES)} / {TOTAL_CYCLES}
          </p>
        </div>
      </div>

      <div className="relative z-10 flex-shrink-0 w-full max-w-xs">
        <p className="text-[7px] text-[hsl(var(--gb-light))]/50 uppercase tracking-widest text-center mb-2">
          Lung Capacity
        </p>
        <div className="w-full h-2 border border-[hsl(var(--gb-light))]/40 p-px">
          <div
            className="h-full bg-[hsl(var(--gb-lightest))] transition-none"
            style={{ width: `${lungFill * 100}%` }}
            data-testid="lung-bar"
          />
        </div>
      </div>
    </div>
  );
}
