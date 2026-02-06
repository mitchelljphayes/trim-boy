import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'wouter';
import { useCreateLog } from '@/hooks/use-trim';
import { useAudio } from '@/hooks/use-audio';
import { RetroButton } from '@/components/RetroButton';
import { ArrowLeft, Pause, Play, VolumeX, Volume2, X } from 'lucide-react';

export interface RoutineConfig {
  title: string;
  exercises: string[];
  workDuration: number;
  restDuration: number;
  rounds: number;
  cooldown?: { label: string; duration: number };
  category: string;
  skipLog?: boolean;
  redirectTo?: string;
  spriteUrl?: string;
}

interface Step {
  label: string;
  duration: number;
  type: 'intro' | 'work' | 'rest' | 'cooldown';
  exerciseIndex?: number;
  round?: number;
}

function buildSteps(config: RoutineConfig): Step[] {
  const steps: Step[] = [];
  steps.push({ label: 'GET READY', duration: 5, type: 'intro' });

  for (let r = 0; r < config.rounds; r++) {
    for (let e = 0; e < config.exercises.length; e++) {
      steps.push({ label: config.exercises[e], duration: config.workDuration, type: 'work', exerciseIndex: e, round: r });
      const isLastExInRound = e === config.exercises.length - 1;
      const isLastRound = r === config.rounds - 1;
      if (config.restDuration > 0 && !(isLastExInRound && isLastRound)) {
        steps.push({ label: 'REST', duration: config.restDuration, type: 'rest', exerciseIndex: e, round: r });
      }
    }
  }

  if (config.cooldown) {
    steps.push({ label: config.cooldown.label, duration: config.cooldown.duration, type: 'cooldown' });
  }

  return steps;
}

export default function TimerPage(config: RoutineConfig) {
  const { title, category, skipLog, redirectTo, exercises, workDuration, restDuration, rounds, cooldown, spriteUrl } = config;
  const steps = buildSteps(config);

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
  const isCooldown = currentStep?.type === 'cooldown';
  const isIntro = currentStep?.type === 'intro';

  const currentRound = currentStep?.round ?? 0;
  const currentExerciseIndex = currentStep?.exerciseIndex ?? -1;

  const lastWorkStepIndex = (() => {
    for (let i = steps.length - 1; i >= 0; i--) {
      if (steps[i].type === 'work') return i;
    }
    return -1;
  })();

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const exitRoutine = () => {
    setLocation(redirectTo || '/dashboard');
  };

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
  }, [currentStepIndex, steps, lastWorkStepIndex, playCelebratoryIdent, playGentleIdent, playHighBeep, logActivity, category, setLocation, skipLog, redirectTo]);

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

  // === BRIEFING SCREEN ===
  if (!started) {
    const durationLabel = restDuration > 0
      ? `${workDuration}s/${restDuration}s${rounds > 1 ? ` x ${rounds}` : ''}`
      : `${workDuration}s${rounds > 1 ? ` x ${rounds}` : ''}`;
    return (
      <div className="min-h-screen bg-[hsl(var(--gb-lightest))] p-6 flex flex-col items-center justify-center text-center">
        {spriteUrl && (
          <img
            src={spriteUrl}
            alt={`${title} sprite`}
            className="w-48 h-auto mb-4 pixelated"
            style={{ imageRendering: 'pixelated' }}
            data-testid="img-briefing-sprite"
          />
        )}
        <h1 className="text-xl font-bold mb-2 text-[hsl(var(--gb-darkest))]" data-testid="text-title">{title}</h1>
        <p className="mb-6 text-[9px] text-[hsl(var(--gb-dark))] uppercase tracking-widest">
          {exercises.length} Exercises {rounds > 1 ? `/ ${rounds} Rounds` : ''} / Hands-free
        </p>

        <div className="mb-6 w-full max-w-xs text-left bg-[hsl(var(--gb-light))] p-4 border-2 border-[hsl(var(--gb-dark))]">
          {exercises.map((ex, i) => (
            <div key={i} className="text-[9px] text-[hsl(var(--gb-darkest))] py-1 flex justify-between gap-2 items-baseline" data-testid={`briefing-exercise-${i}`}>
              <span className="font-bold uppercase truncate">{ex}</span>
              <span className="text-[8px] text-[hsl(var(--gb-dark))] flex-shrink-0 tracking-wide">
                {durationLabel}
              </span>
            </div>
          ))}
          {cooldown && (
            <div className="text-[9px] text-[hsl(var(--gb-dark))] py-1 flex justify-between gap-2 items-baseline mt-2 pt-2 border-t border-[hsl(var(--gb-dark))]/30" data-testid="briefing-cooldown">
              <span className="uppercase truncate">{cooldown.label}</span>
              <span className="text-[8px] flex-shrink-0">{formatTime(cooldown.duration)}</span>
            </div>
          )}
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

  // === COMPLETE SCREEN ===
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

  // === COOLDOWN / SAVASANA (full screen dark with rays) ===
  if (isCooldown) {
    return (
      <div className="min-h-screen bg-[hsl(var(--gb-darkest))] flex flex-col items-center justify-center p-6 relative overflow-hidden">
        <button
          onClick={exitRoutine}
          className="absolute top-4 right-4 z-20 w-10 h-10 flex items-center justify-center border-2 border-[hsl(var(--gb-light))] text-[hsl(var(--gb-light))]"
          data-testid="button-exit"
        >
          <X size={18} />
        </button>

        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none" aria-hidden="true">
          <pre
            className="text-[hsl(var(--gb-dark))]/20 text-[10px] leading-tight text-center animate-pulse"
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

        <div className="relative z-10 flex flex-col items-center text-center">
          <p className="text-[9px] text-[hsl(var(--gb-light))] uppercase tracking-widest mb-4" data-testid="text-phase">
            COOL-DOWN
          </p>
          <h2 className="text-sm font-bold text-[hsl(var(--gb-lightest))] mb-6" data-testid="text-exercise">
            {currentStep.label}
          </h2>

          <div
            className="text-5xl font-bold text-[hsl(var(--gb-lightest))] mb-8"
            style={{ fontFamily: "'Press Start 2P', monospace" }}
            data-testid="text-timer"
          >
            {formatTime(timeLeft)}
          </div>

          <div className="w-48 h-3 border-2 border-[hsl(var(--gb-light))] p-0.5 mb-6">
            <div
              className="h-full bg-[hsl(var(--gb-lightest))] transition-all duration-1000"
              style={{ width: `${(timeLeft / currentStep.duration) * 100}%` }}
            />
          </div>

          <div className="flex gap-4 items-center">
            <button onClick={togglePause} className="w-10 h-10 flex items-center justify-center border-2 border-[hsl(var(--gb-lightest))] text-[hsl(var(--gb-lightest))]" data-testid="button-pause">
              {paused ? <Play size={18} /> : <Pause size={18} />}
            </button>
            <button onClick={toggleMute} className="w-10 h-10 flex items-center justify-center border-2 border-[hsl(var(--gb-lightest))] text-[hsl(var(--gb-lightest))]" data-testid="button-mute">
              {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // === ACTIVE TIMER UI ===
  const isDark = isRest || isIntro;
  const bgClass = isDark ? 'bg-[hsl(var(--gb-darkest))]' : 'bg-[hsl(var(--gb-lightest))]';
  const textClass = isDark ? 'text-[hsl(var(--gb-lightest))]' : 'text-[hsl(var(--gb-darkest))]';
  const textSub = isDark ? 'text-[hsl(var(--gb-light))]' : 'text-[hsl(var(--gb-dark))]';

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${bgClass}`}>
      {/* Top bar: phase + exit */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 pt-4">
        <p className={`text-[9px] uppercase tracking-widest ${textSub}`} data-testid="text-phase">
          {isIntro ? 'GET READY' : isRest ? 'REST' : 'WORK'}
        </p>
        <button
          onClick={exitRoutine}
          className={`w-10 h-10 flex items-center justify-center border-2 border-current ${textSub}`}
          data-testid="button-exit"
        >
          <X size={18} />
        </button>
      </div>

      {/* Timer + Current Exercise */}
      <div className="flex-shrink-0 flex flex-col items-center pb-3 px-4">
        <h2 className={`text-xs font-bold mb-3 uppercase text-center ${textClass}`} data-testid="text-exercise">
          {currentStep.label}
        </h2>

        <div
          className={`text-5xl font-bold mb-3 ${textClass}`}
          style={{ fontFamily: "'Press Start 2P', monospace" }}
          data-testid="text-timer"
        >
          {formatTime(timeLeft)}
        </div>

        {/* Progress bar */}
        <div className="w-full max-w-xs h-3 border-2 border-[hsl(var(--gb-dark))] p-0.5 mb-3">
          <div
            className={`h-full transition-all duration-1000 ${isDark ? 'bg-[hsl(var(--gb-lightest))]' : 'bg-[hsl(var(--gb-darkest))]'}`}
            style={{ width: `${(timeLeft / currentStep.duration) * 100}%` }}
          />
        </div>

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

      {/* Game Boy Menu - Exercise list (no rest rows) */}
      <div ref={listRef} className="flex-1 overflow-y-auto px-4 pb-4">
        <div className="max-w-xs mx-auto border-2 border-[hsl(var(--gb-dark))] bg-[hsl(var(--gb-light))]">
          {/* Set counter header */}
          {rounds > 1 && (
            <div className="border-b-2 border-[hsl(var(--gb-dark))] px-3 py-2 text-center" data-testid="text-round">
              <span className="text-[9px] font-bold text-[hsl(var(--gb-darkest))] uppercase tracking-widest">
                SET {currentRound + 1}/{rounds}
              </span>
            </div>
          )}

          {/* Exercise menu items */}
          {exercises.map((ex, i) => {
            const isActiveEx = !isIntro && currentExerciseIndex === i;
            const isDoneInRound = !isIntro && (
              currentExerciseIndex > i || 
              (isRest && currentExerciseIndex >= i)
            );

            return (
              <div
                key={i}
                ref={isActiveEx ? activeRef : undefined}
                className={`flex items-center gap-2 py-2 px-3 text-[9px] leading-tight transition-all duration-200 ${
                  isActiveEx
                    ? 'bg-[hsl(var(--gb-darkest))] text-[hsl(var(--gb-lightest))]'
                    : isDoneInRound
                      ? 'text-[hsl(var(--gb-dark))]/40'
                      : 'text-[hsl(var(--gb-darkest))]'
                }`}
                data-testid={`menu-exercise-${i}`}
              >
                <span className={`flex-shrink-0 w-3 font-bold ${isActiveEx ? 'animate-pulse' : 'invisible'}`}>
                  {'>'}
                </span>
                <span className={`flex-1 truncate uppercase font-bold ${isDoneInRound && !isActiveEx ? 'line-through opacity-40' : ''}`}>
                  {ex}
                </span>
                <span className={`flex-shrink-0 text-[8px] ${isActiveEx ? 'text-[hsl(var(--gb-light))]' : 'text-[hsl(var(--gb-dark))]'}`}>
                  {workDuration}s
                </span>
              </div>
            );
          })}

          {/* Savasana loading at bottom */}
          {cooldown && (
            <div className="border-t-2 border-[hsl(var(--gb-dark))]/30 px-3 py-2 flex items-center gap-2" data-testid="menu-cooldown">
              <span className="text-[8px] text-[hsl(var(--gb-dark))]/50 uppercase tracking-wider animate-pulse">
                {'>'} {cooldown.label}
              </span>
              <span className="flex-1" />
              <span className="text-[7px] text-[hsl(var(--gb-dark))]/40">
                {formatTime(cooldown.duration)}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
