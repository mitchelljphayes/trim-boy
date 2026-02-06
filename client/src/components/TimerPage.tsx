import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'wouter';
import { useCreateLog } from '@/hooks/use-trim';
import { useAudio } from '@/hooks/use-audio';
import { RetroButton } from '@/components/RetroButton';
import { ArrowLeft, Pause, Play, VolumeX, Volume2 } from 'lucide-react';

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
}

type Phase = 'briefing' | 'intro' | 'work' | 'rest' | 'cooldown' | 'complete';

export default function TimerPage({
  title,
  exercises,
  workDuration,
  restDuration,
  rounds,
  cooldown,
  category,
  skipLog,
  redirectTo,
}: RoutineConfig) {
  const [, setLocation] = useLocation();
  const { playHighBeep, playLowBlip, playCelebratoryIdent, playGentleIdent, initAudio, setMuted } = useAudio();
  const { mutate: logActivity } = useCreateLog();

  const [phase, setPhase] = useState<Phase>('briefing');
  const [paused, setPaused] = useState(false);
  const [muted, setMutedState] = useState(false);
  const [currentRound, setCurrentRound] = useState(1);
  const [currentExIndex, setCurrentExIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(5);

  const togglePause = () => setPaused((p) => !p);
  const toggleMute = () => {
    setMutedState((m) => {
      setMuted(!m);
      return !m;
    });
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const startRoutine = () => {
    initAudio();
    setPhase('intro');
    setTimeLeft(5);
    playHighBeep();
  };

  const isLastRep = currentRound === rounds && currentExIndex === exercises.length - 1;

  const advanceFromWork = useCallback(() => {
    if (isLastRep) {
      playCelebratoryIdent();
      if (cooldown) {
        setPhase('cooldown');
        setTimeLeft(cooldown.duration);
      } else {
        setPhase('complete');
        if (!skipLog) logActivity({ category, date: new Date() });
        playGentleIdent();
        setTimeout(() => setLocation(redirectTo || '/dashboard'), 3500);
      }
      return;
    }

    if (restDuration > 0) {
      setPhase('rest');
      setTimeLeft(restDuration);
    } else {
      const nextEx = currentExIndex + 1;
      if (nextEx >= exercises.length) {
        setCurrentExIndex(0);
        setCurrentRound((r) => r + 1);
      } else {
        setCurrentExIndex(nextEx);
      }
      setTimeLeft(workDuration);
      playHighBeep();
    }
  }, [isLastRep, restDuration, currentExIndex, exercises.length, workDuration, cooldown, playCelebratoryIdent, playGentleIdent, playHighBeep, skipLog, logActivity, category, setLocation, redirectTo]);

  const advanceFromRest = useCallback(() => {
    const nextEx = currentExIndex + 1;
    if (nextEx >= exercises.length) {
      setCurrentExIndex(0);
      setCurrentRound((r) => r + 1);
    } else {
      setCurrentExIndex(nextEx);
    }
    setPhase('work');
    setTimeLeft(workDuration);
    playHighBeep();
  }, [currentExIndex, exercises.length, workDuration, playHighBeep]);

  const advanceFromCooldown = useCallback(() => {
    setPhase('complete');
    if (!skipLog) logActivity({ category, date: new Date() });
    playGentleIdent();
    setTimeout(() => setLocation(redirectTo || '/dashboard'), 3500);
  }, [skipLog, logActivity, category, playGentleIdent, setLocation, redirectTo]);

  const advanceFromIntro = useCallback(() => {
    playHighBeep();
    setPhase('work');
    setTimeLeft(workDuration);
  }, [playHighBeep, workDuration]);

  useEffect(() => {
    if (phase === 'briefing' || phase === 'complete' || paused) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          if (phase === 'intro') advanceFromIntro();
          else if (phase === 'work') advanceFromWork();
          else if (phase === 'rest') advanceFromRest();
          else if (phase === 'cooldown') advanceFromCooldown();
          return 0;
        }
        if (prev <= 4 && prev > 1) playLowBlip();
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [phase, paused, advanceFromIntro, advanceFromWork, advanceFromRest, advanceFromCooldown, playLowBlip]);

  // === BRIEFING SCREEN ===
  if (phase === 'briefing') {
    const durationLabel = restDuration > 0
      ? `${workDuration}s/${restDuration}s${rounds > 1 ? ` x ${rounds}` : ''}`
      : `${workDuration}s${rounds > 1 ? ` x ${rounds}` : ''}`;
    return (
      <div className="min-h-screen bg-[hsl(var(--gb-lightest))] p-6 flex flex-col items-center justify-center text-center">
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
  if (phase === 'complete') {
    return (
      <div className="min-h-screen bg-[hsl(var(--gb-lightest))] flex items-center justify-center text-center p-8">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(var(--gb-darkest))] mb-4" data-testid="text-complete">MISSION COMPLETE</h1>
          <p className="text-[10px] text-[hsl(var(--gb-dark))]">SYNCING DATA...</p>
        </div>
      </div>
    );
  }

  // === COOLDOWN / SAVASANA ===
  if (phase === 'cooldown' && cooldown) {
    return (
      <div className="min-h-screen bg-[hsl(var(--gb-darkest))] flex flex-col items-center justify-center p-6 relative overflow-hidden">
        {/* Pulsing pixel-art rays */}
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
            {cooldown.label}
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
              style={{ width: `${(timeLeft / cooldown.duration) * 100}%` }}
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

  // === INTRO SCREEN ===
  if (phase === 'intro') {
    return (
      <div className="min-h-screen bg-[hsl(var(--gb-darkest))] flex flex-col items-center justify-center p-6">
        <p className="text-[9px] text-[hsl(var(--gb-light))] uppercase tracking-widest mb-4" data-testid="text-phase">GET READY</p>
        <div
          className="text-7xl font-bold text-[hsl(var(--gb-lightest))] animate-pulse"
          style={{ fontFamily: "'Press Start 2P', monospace" }}
          data-testid="text-timer"
        >
          {timeLeft}
        </div>
      </div>
    );
  }

  // === ORBITAL ACTIVE UI (work + rest) ===
  const isDark = phase === 'rest';
  const bgClass = isDark ? 'bg-[hsl(var(--gb-darkest))]' : 'bg-[hsl(var(--gb-lightest))]';
  const textMain = isDark ? 'text-[hsl(var(--gb-lightest))]' : 'text-[hsl(var(--gb-darkest))]';
  const textSub = isDark ? 'text-[hsl(var(--gb-light))]' : 'text-[hsl(var(--gb-dark))]';

  const circleRadius = Math.min(140, 120 + exercises.length * 4);
  const angleStep = (2 * Math.PI) / exercises.length;
  const startAngle = -Math.PI / 2;

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${bgClass}`}>
      {/* Phase label */}
      <div className="flex-shrink-0 p-3 text-center">
        <p className={`text-[9px] uppercase tracking-widest ${textSub}`} data-testid="text-phase">
          {phase === 'work' ? 'WORK' : 'REST'}
        </p>
      </div>

      {/* Orbital circle area */}
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        <div className="relative" style={{ width: circleRadius * 2 + 80, height: circleRadius * 2 + 80 }}>
          {/* Exercise nodes around circle */}
          {exercises.map((ex, i) => {
            const angle = startAngle + i * angleStep;
            const cx = circleRadius + 40;
            const cy = circleRadius + 40;
            const x = cx + circleRadius * Math.cos(angle);
            const y = cy + circleRadius * Math.sin(angle);
            const isActive = i === currentExIndex;

            return (
              <div
                key={i}
                className={`absolute flex items-center justify-center text-center transition-all duration-300 ${
                  isActive
                    ? 'bg-[hsl(var(--gb-darkest))] text-[hsl(var(--gb-lightest))] z-10 scale-110'
                    : `${textSub} z-0`
                }`}
                style={{
                  left: x,
                  top: y,
                  transform: 'translate(-50%, -50%)',
                  width: exercises.length <= 3 ? 80 : 68,
                  height: exercises.length <= 3 ? 80 : 68,
                  padding: '4px',
                  border: isActive ? '3px solid hsl(var(--gb-lightest))' : '2px solid hsl(var(--gb-dark))',
                }}
                data-testid={`orbital-exercise-${i}`}
              >
                <span className="text-[7px] font-bold leading-tight uppercase break-words">{ex}</span>
              </div>
            );
          })}

          {/* Center timer */}
          <div
            className="absolute flex flex-col items-center justify-center"
            style={{
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          >
            <div
              className={`text-4xl font-bold mb-2 ${textMain}`}
              style={{ fontFamily: "'Press Start 2P', monospace" }}
              data-testid="text-timer"
            >
              {formatTime(timeLeft)}
            </div>
            {rounds > 1 && (
              <p className={`text-[8px] uppercase tracking-widest ${textSub}`} data-testid="text-round">
                ROUND {currentRound}/{rounds}
              </p>
            )}
          </div>
        </div>

        {/* Current exercise name (during rest show upcoming) */}
        <div className="mt-4 text-center">
          {phase === 'rest' ? (
            <p className={`text-[9px] ${textSub}`}>
              Up next: <span className="font-bold">{exercises[(currentExIndex + 1) % exercises.length]}</span>
            </p>
          ) : (
            <p className={`text-xs font-bold uppercase ${textMain}`} data-testid="text-exercise">
              {exercises[currentExIndex]}
            </p>
          )}
        </div>
      </div>

      {/* Progress bar + controls */}
      <div className="flex-shrink-0 px-6 pb-6 flex flex-col items-center gap-3">
        <div className="w-full max-w-xs h-3 border-2 border-[hsl(var(--gb-dark))] p-0.5">
          <div
            className={`h-full transition-all duration-1000 ${isDark ? 'bg-[hsl(var(--gb-lightest))]' : 'bg-[hsl(var(--gb-darkest))]'}`}
            style={{ width: `${(timeLeft / (phase === 'work' ? workDuration : restDuration)) * 100}%` }}
          />
        </div>
        <div className="flex gap-4 items-center">
          <button onClick={togglePause} className={`w-10 h-10 flex items-center justify-center border-2 border-current ${textMain}`} data-testid="button-pause">
            {paused ? <Play size={18} /> : <Pause size={18} />}
          </button>
          <button onClick={toggleMute} className={`w-10 h-10 flex items-center justify-center border-2 border-current ${textMain}`} data-testid="button-mute">
            {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
        </div>

        {/* Savasana teaser at bottom with pulsing pixel-art rays */}
        {cooldown && (
          <div className="mt-4 text-center relative">
            <pre
              className={`text-[7px] leading-none ${textSub} opacity-30 animate-pulse select-none`}
              style={{ fontFamily: "'Press Start 2P', monospace" }}
              aria-hidden="true"
            >
{`  \\  |  /
   \\ | /
    \\|/`}
            </pre>
            <div className={`text-[8px] font-bold uppercase tracking-widest ${textSub} opacity-50 mt-1`}>
              {cooldown.label}
            </div>
            <pre
              className={`text-[7px] leading-none ${textSub} opacity-30 animate-pulse select-none`}
              style={{ fontFamily: "'Press Start 2P', monospace" }}
              aria-hidden="true"
            >
{`    /|\\
   / | \\
  /  |  \\`}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
