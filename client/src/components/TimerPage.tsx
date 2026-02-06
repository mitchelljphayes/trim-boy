import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'wouter';
import { useCreateLog } from '@/hooks/use-trim';
import { useAudio } from '@/hooks/use-audio';
import { RetroButton } from '@/components/RetroButton';
import { ArrowLeft, Pause, Play, VolumeX, Volume2 } from 'lucide-react';

export interface Step {
  label: string;
  duration: number;
  type: 'intro' | 'warmup' | 'work' | 'rest' | 'cooldown';
}

interface RoutineProps {
  title: string;
  steps: Step[];
  category: string;
  skipLog?: boolean;
  redirectTo?: string;
}

export default function TimerPage({ title, steps, category, skipLog, redirectTo }: RoutineProps) {
  const [, setLocation] = useLocation();
  const { playHighBeep, playLowBlip, playCelebratoryIdent, playGentleIdent, initAudio, setMuted } = useAudio();
  const { mutate: logActivity } = useCreateLog();

  const [started, setStarted] = useState(false);
  const [paused, setPaused] = useState(false);
  const [muted, setMutedState] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [complete, setComplete] = useState(false);

  const listRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLDivElement>(null);

  const currentStep = steps[currentStepIndex];
  const isRest = currentStep?.type === 'rest';
  const isIntro = currentStep?.type === 'intro';

  const lastWorkStepIndex = (() => {
    for (let i = steps.length - 1; i >= 0; i--) {
      if (steps[i].type === 'work') return i;
    }
    return -1;
  })();

  const startRoutine = () => {
    initAudio();
    setStarted(true);
    setTimeLeft(steps[0].duration);
    playHighBeep();
  };

  const togglePause = () => setPaused((p) => !p);

  const toggleMute = () => {
    setMutedState((m) => {
      setMuted(!m);
      return !m;
    });
  };

  const advanceStep = useCallback(() => {
    const nextIndex = currentStepIndex + 1;

    if (currentStepIndex === lastWorkStepIndex) {
      playCelebratoryIdent();
    }

    if (nextIndex >= steps.length) {
      playGentleIdent();
      setComplete(true);
      if (!skipLog) {
        logActivity({ category, date: new Date() });
      }
      setTimeout(() => setLocation(redirectTo || '/dashboard'), 3500);
      return;
    }

    setCurrentStepIndex(nextIndex);
    setTimeLeft(steps[nextIndex].duration);

    if (steps[nextIndex].type === 'work') {
      playHighBeep();
    }
  }, [currentStepIndex, steps, lastWorkStepIndex, playCelebratoryIdent, playGentleIdent, playHighBeep, logActivity, category, setLocation]);

  useEffect(() => {
    if (!started || paused || complete) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          if (currentStep?.type === 'intro') {
            playHighBeep();
          }
          advanceStep();
          return 0;
        }
        if (prev <= 4 && prev > 1) {
          playLowBlip();
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [started, paused, complete, currentStepIndex, advanceStep, playLowBlip, playHighBeep, currentStep]);

  useEffect(() => {
    if (activeRef.current && listRef.current) {
      activeRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [currentStepIndex]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  if (!started) {
    return (
      <div className="min-h-screen bg-[hsl(var(--gb-lightest))] p-6 flex flex-col items-center justify-center text-center">
        <h1 className="text-xl font-bold mb-4 text-[hsl(var(--gb-darkest))]" data-testid="text-title">{title}</h1>
        <p className="mb-2 text-[10px] text-[hsl(var(--gb-dark))]">
          {steps.length} Steps / Hands-free
        </p>
        <div className="mb-6 w-full max-w-xs text-left bg-[hsl(var(--gb-light))] p-3 border-2 border-[hsl(var(--gb-dark))]">
          {steps.map((s, i) => (
            <div key={i} className="text-[8px] text-[hsl(var(--gb-dark))] py-0.5 flex justify-between gap-2">
              <span className="truncate">{s.label}</span>
              <span className="flex-shrink-0">{formatTime(s.duration)}</span>
            </div>
          ))}
        </div>
        <RetroButton onClick={startRoutine} className="w-full max-w-xs" data-testid="button-start">
          START ROUTINE
        </RetroButton>
        <button
          onClick={() => setLocation(redirectTo || '/dashboard')}
          className="mt-6 flex items-center gap-2 text-[hsl(var(--gb-dark))] text-xs"
          data-testid="button-back"
        >
          <ArrowLeft size={14} /> BACK
        </button>
      </div>
    );
  }

  if (complete) {
    return (
      <div className="min-h-screen bg-[hsl(var(--gb-lightest))] flex items-center justify-center text-center p-8">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(var(--gb-darkest))] mb-4" data-testid="text-complete">MISSION COMPLETE</h1>
          <p className="text-[10px] text-[hsl(var(--gb-dark))]">SYNCING DATA...</p>
        </div>
      </div>
    );
  }

  const bgClass = isRest || isIntro ? 'bg-[hsl(var(--gb-darkest))]' : 'bg-[hsl(var(--gb-lightest))]';
  const textClass = isRest || isIntro ? 'text-[hsl(var(--gb-lightest))]' : 'text-[hsl(var(--gb-darkest))]';
  const subTextClass = isRest || isIntro ? 'text-[hsl(var(--gb-light))]' : 'text-[hsl(var(--gb-dark))]';

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${bgClass}`}>
      {/* Top Zone - Phase Label */}
      <div className="flex-shrink-0 p-3 text-center">
        <p className={`text-[9px] uppercase tracking-widest ${subTextClass}`} data-testid="text-phase">
          {currentStep.type === 'intro' && 'GET READY'}
          {currentStep.type === 'warmup' && 'WARM-UP'}
          {currentStep.type === 'work' && 'WORK'}
          {currentStep.type === 'rest' && 'REST'}
          {currentStep.type === 'cooldown' && 'COOL-DOWN'}
        </p>
      </div>

      {/* Middle Zone - Timer + Exercise Name */}
      <div className="flex-shrink-0 flex flex-col items-center justify-center px-4 py-6">
        <h2 className={`text-sm font-bold mb-4 text-center leading-relaxed ${textClass}`} data-testid="text-exercise">
          {currentStep.label}
        </h2>

        <div className={`text-6xl font-bold mb-6 ${textClass}`} style={{ fontFamily: "'Press Start 2P', monospace" }} data-testid="text-timer">
          {formatTime(timeLeft)}
        </div>

        {/* Progress Bar */}
        <div className="w-full max-w-xs h-3 border-2 border-[hsl(var(--gb-dark))] p-0.5 mb-4">
          <div
            className={`h-full transition-all duration-1000 ${isRest || isIntro ? 'bg-[hsl(var(--gb-lightest))]' : 'bg-[hsl(var(--gb-darkest))]'}`}
            style={{ width: `${(timeLeft / currentStep.duration) * 100}%` }}
          />
        </div>

        {/* Controls */}
        <div className="flex gap-4 items-center">
          <button
            onClick={togglePause}
            className={`w-10 h-10 flex items-center justify-center border-2 border-current ${textClass}`}
            data-testid="button-pause"
          >
            {paused ? <Play size={18} /> : <Pause size={18} />}
          </button>
          <button
            onClick={toggleMute}
            className={`w-10 h-10 flex items-center justify-center border-2 border-current ${textClass}`}
            data-testid="button-mute"
          >
            {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
        </div>
      </div>

      {/* Bottom Zone - Step List */}
      <div ref={listRef} className="flex-1 overflow-y-auto px-3 pb-4">
        <div className="max-w-md mx-auto">
          {steps.map((step, i) => {
            const isActive = i === currentStepIndex;
            const isDone = i < currentStepIndex;

            return (
              <div
                key={i}
                ref={isActive ? activeRef : undefined}
                className={`flex items-center gap-2 py-1.5 px-2 text-[8px] leading-tight transition-all duration-200 ${
                  isActive
                    ? 'bg-[hsl(var(--gb-darkest))] text-[hsl(var(--gb-lightest))]'
                    : isDone
                      ? 'text-[hsl(var(--gb-dark))]/30'
                      : 'text-[hsl(var(--gb-dark))]'
                }`}
                data-testid={`step-${i}`}
              >
                <span className={`flex-shrink-0 w-3 font-bold ${isActive ? 'animate-pulse' : 'invisible'}`}>
                  {'>'}
                </span>
                <span className={`flex-1 truncate ${isDone ? 'line-through opacity-40' : ''}`}>
                  {step.label}
                </span>
                <span className="flex-shrink-0">{formatTime(step.duration)}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
