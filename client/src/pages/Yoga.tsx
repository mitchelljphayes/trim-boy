import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'wouter';
import { useAudio } from '@/hooks/use-audio';
import { useCreateLog } from '@/hooks/use-trim';
import { RetroButton } from '@/components/RetroButton';
import { ArrowLeft, Pause, Play, VolumeX, Volume2, X } from 'lucide-react';
import ashtangaSprite from '@assets/trimboy_sashtanga_1770441896395.png';
import spriteSunSalutation from '@/assets/sprites/yoga-sun-salutation.png';
import spriteBigToe from '@/assets/sprites/yoga-big-toe.png';
import spriteTriangle from '@/assets/sprites/yoga-triangle.png';
import spriteSideAngle from '@/assets/sprites/yoga-side-angle.png';
import spriteWideFold from '@/assets/sprites/yoga-wide-fold.png';
import spritePyramid from '@/assets/sprites/yoga-pyramid.png';
import spriteChair from '@/assets/sprites/yoga-chair.png';
import spriteWarrior from '@/assets/sprites/yoga-warrior.png';
import spriteSeatedFold from '@/assets/sprites/yoga-seated-fold.png';
import spriteSavasana from '@/assets/sprites/yoga-savasana.png';

const POSE_SPRITES: Record<string, string> = {
  'Surya Namaskara': spriteSunSalutation,
  'Padangusthasana': spriteBigToe,
  'Trikonasana': spriteTriangle,
  'Parsvakonasana': spriteSideAngle,
  'Prasarita Padottanasana': spriteWideFold,
  'Parsvottanasana': spritePyramid,
  'Utkatasana': spriteChair,
  'Virabhadrasana': spriteWarrior,
  'Paschimottanasana': spriteSeatedFold,
  'Savasana': spriteSavasana,
};

interface YogaStep {
  label: string;
  sanskritName: string;
  englishName: string;
  duration: number;
  section: string;
}

const YOGA_SEQUENCE: YogaStep[] = [
  { label: 'GET READY', sanskritName: 'GET READY', englishName: '', duration: 5, section: 'PREP' },
  { label: 'SURYA NAMASKARA (1)', sanskritName: 'Surya Namaskara', englishName: 'Sun Salutations', duration: 60, section: 'SUN SALUTATIONS' },
  { label: 'SURYA NAMASKARA (2)', sanskritName: 'Surya Namaskara', englishName: 'Sun Salutations', duration: 60, section: 'SUN SALUTATIONS' },
  { label: 'SURYA NAMASKARA (3)', sanskritName: 'Surya Namaskara', englishName: 'Sun Salutations', duration: 60, section: 'SUN SALUTATIONS' },
  { label: 'SURYA NAMASKARA (4)', sanskritName: 'Surya Namaskara', englishName: 'Sun Salutations', duration: 60, section: 'SUN SALUTATIONS' },
  { label: 'SURYA NAMASKARA (5)', sanskritName: 'Surya Namaskara', englishName: 'Sun Salutations', duration: 60, section: 'SUN SALUTATIONS' },
  { label: 'PADANGUSTHASANA', sanskritName: 'Padangusthasana', englishName: 'Big Toe Pose', duration: 150, section: 'STANDING POSES' },
  { label: 'TRIKONASANA', sanskritName: 'Trikonasana', englishName: 'Triangle Pose', duration: 150, section: 'STANDING POSES' },
  { label: 'PARSVAKONASANA', sanskritName: 'Parsvakonasana', englishName: 'Side Angle Pose', duration: 150, section: 'STANDING POSES' },
  { label: 'PRASARITA PADOTTANASANA', sanskritName: 'Prasarita Padottanasana', englishName: 'Wide-Legged Fold', duration: 150, section: 'STANDING POSES' },
  { label: 'PARSVOTTANASANA', sanskritName: 'Parsvottanasana', englishName: 'Pyramid Pose', duration: 150, section: 'STANDING POSES' },
  { label: 'UTKATASANA', sanskritName: 'Utkatasana', englishName: 'Chair Pose', duration: 150, section: 'STANDING POSES' },
  { label: 'VIRABHADRASANA', sanskritName: 'Virabhadrasana', englishName: 'Warrior Pose', duration: 150, section: 'STANDING POSES' },
  { label: 'PASCHIMOTTANASANA', sanskritName: 'Paschimottanasana', englishName: 'Seated Forward Fold', duration: 150, section: 'SEATED & FINISHING' },
  { label: 'SAVASANA', sanskritName: 'Savasana', englishName: 'Corpse Pose (Rest)', duration: 180, section: 'CLOSING' },
];

const EXERCISES_ONLY = YOGA_SEQUENCE.filter(s => s.section !== 'PREP');

const SECTION_SUBTITLES: Record<string, string> = {
  'SUN SALUTATIONS': 'Flowing Breath-to-Movement',
  'STANDING POSES': 'Root & Extend',
  'SEATED & FINISHING': 'Fold & Strengthen',
  'CLOSING': 'Surrender',
};

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

export function hasYogaToday(): boolean {
  const stored = localStorage.getItem('trim_yoga_date');
  if (!stored) return false;
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  return stored === todayStr;
}

function markYogaComplete() {
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  localStorage.setItem('trim_yoga_date', todayStr);
  window.dispatchEvent(new Event('yoga-status-change'));
}

export default function Yoga() {
  const [, setLocation] = useLocation();
  const { playInhaleSweep, playExhaleSweep, playHoldChime, playGentleIdent, initAudio, setMuted } = useAudio();
  const { mutate: logActivity } = useCreateLog();

  const [started, setStarted] = useState(false);
  const [paused, setPaused] = useState(false);
  const [muted, setMutedState] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [complete, setComplete] = useState(false);

  const listRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLDivElement>(null);

  const currentStep = YOGA_SEQUENCE[currentStepIndex];
  const isPrep = currentStep?.section === 'PREP';
  const isClosing = currentStep?.section === 'CLOSING';

  const exitRoutine = () => setLocation('/dashboard');

  const startRoutine = () => {
    initAudio();
    setStarted(true);
    setTimeLeft(YOGA_SEQUENCE[0].duration);
    playInhaleSweep();
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

    if (nextIndex >= YOGA_SEQUENCE.length) {
      playGentleIdent();
      setComplete(true);
      markYogaComplete();
      // Log yoga activity to database
      logActivity({ category: 'yoga', date: new Date() });
      setTimeout(() => setLocation('/dashboard'), 3500);
      return;
    }

    setCurrentStepIndex(nextIndex);
    setTimeLeft(YOGA_SEQUENCE[nextIndex].duration);

    const nextSection = YOGA_SEQUENCE[nextIndex].section;
    const prevSection = YOGA_SEQUENCE[currentStepIndex].section;
    if (nextSection !== prevSection) {
      playExhaleSweep();
    } else {
      playInhaleSweep();
    }
  }, [currentStepIndex, playGentleIdent, playInhaleSweep, playExhaleSweep, setLocation, logActivity]);

  useEffect(() => {
    if (!started || paused || complete) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          advanceStep();
          return 0;
        }
        if (prev <= 4 && prev > 1) {
          playHoldChime();
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [started, paused, complete, currentStepIndex, advanceStep, playHoldChime]);

  useEffect(() => {
    if (activeRef.current && listRef.current) {
      activeRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [currentStepIndex]);

  if (!started) {
    const totalMin = Math.floor(YOGA_SEQUENCE.reduce((a, s) => a + s.duration, 0) / 60);
    const sections = Array.from(new Set(EXERCISES_ONLY.map(e => e.section)));

    return (
      <div className="min-h-screen p-6 flex flex-col items-center justify-center text-center bg-[hsl(var(--gb-lightest))]">
        <img
          src={ashtangaSprite}
          alt="TrimBoy Ashtanga"
          className="w-32 h-32 object-contain mb-4 pixelated"
          data-testid="img-ashtanga-sprite"
        />
        <h1 className="text-xl font-bold mb-2 text-[hsl(var(--gb-darkest))]" data-testid="text-title">
          ASHTANGA FLOW
        </h1>
        <p className="mb-1 text-[9px] uppercase tracking-widest text-[hsl(var(--gb-dark))]">
          Bonus Module / {totalMin} Minutes
        </p>
        <p className="mb-6 text-[8px] uppercase tracking-widest text-[hsl(var(--gb-dark))] opacity-60">
          Ujjayi Breath Focus
        </p>

        <div className="mb-6 w-full max-w-xs text-left p-4 border-2 border-[hsl(var(--gb-dark))] bg-[hsl(var(--gb-light)_/_0.15)]">
          {sections.map((section) => {
            const sectionExercises = EXERCISES_ONLY.filter(e => e.section === section);
            const sectionTime = sectionExercises.reduce((a, e) => a + e.duration, 0);
            return (
              <div key={section} className="mb-3 last:mb-0">
                <div className="flex justify-between items-baseline gap-2 mb-1">
                  <span className="text-[8px] font-bold uppercase tracking-widest text-[hsl(var(--gb-darkest))]">
                    {section}
                  </span>
                  <span className="text-[7px] text-[hsl(var(--gb-dark))]">
                    {formatTime(sectionTime)}
                  </span>
                </div>
                {sectionExercises.map((ex, i) => (
                  <div key={i} className="py-1 flex justify-between gap-2 items-start">
                    <div className="flex flex-col truncate">
                      <span className="text-[8px] font-bold uppercase truncate text-[hsl(var(--gb-darkest))]">
                        {ex.sanskritName}
                      </span>
                      {ex.englishName && (
                        <span className="text-[7px] truncate text-[hsl(var(--gb-dark))] opacity-60">
                          {ex.englishName}
                        </span>
                      )}
                    </div>
                    <span className="flex-shrink-0 text-[7px] pt-0.5 text-[hsl(var(--gb-dark))]">{formatTime(ex.duration)}</span>
                  </div>
                ))}
              </div>
            );
          })}
        </div>

        <RetroButton onClick={startRoutine} className="w-full max-w-xs" data-testid="button-start">
          BEGIN FLOW
        </RetroButton>
        <button
          onClick={() => setLocation('/dashboard')}
          className="mt-6 flex items-center gap-2 text-xs text-[hsl(var(--gb-dark))]"
          data-testid="button-back"
        >
          <ArrowLeft size={14} /> BACK
        </button>
      </div>
    );
  }

  if (complete) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center p-8 relative bg-[hsl(var(--gb-lightest))]">
        <button
          onClick={exitRoutine}
          className="absolute top-4 right-4 z-20 w-10 h-10 flex items-center justify-center border-2 border-[hsl(var(--gb-dark))] text-[hsl(var(--gb-dark))]"
          data-testid="button-exit"
        >
          <X size={18} />
        </button>
        <div>
          <div className="text-5xl mb-4 flex justify-center" data-testid="text-star">
            <svg width="64" height="64" viewBox="0 0 24 24" className="fill-[hsl(var(--gb-darkest))] stroke-[hsl(var(--gb-darkest))]" strokeWidth="1">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-4 text-[hsl(var(--gb-darkest))]" data-testid="text-complete">
            NAMASTE
          </h1>
          <p className="text-[10px] text-[hsl(var(--gb-dark))]">GOLD STAR EARNED...</p>
        </div>
      </div>
    );
  }

  if (isClosing && currentStep.label === 'SAVASANA') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden bg-[hsl(var(--gb-lightest))]">
        <button
          onClick={exitRoutine}
          className="absolute top-4 right-4 z-20 w-10 h-10 flex items-center justify-center border-2 border-[hsl(var(--gb-dark))] text-[hsl(var(--gb-dark))]"
          data-testid="button-exit"
        >
          <X size={18} />
        </button>

        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none" aria-hidden="true">
          <pre
            className="text-[10px] leading-tight text-center animate-pulse text-[hsl(var(--gb-darkest)_/_0.08)]"
            style={{ fontFamily: "'Press Start 2P', monospace", animationDuration: '4s' }}
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
          <p className="text-[9px] uppercase tracking-widest mb-4 text-[hsl(var(--gb-dark))]" data-testid="text-phase">
            HEAVENLY SAVASANA
          </p>
          <h2 className="text-sm font-bold mb-2 text-[hsl(var(--gb-darkest))]" data-testid="text-exercise">
            {currentStep.label}
          </h2>

          <img
            src={spriteSavasana}
            alt="Savasana"
            className="w-24 h-24 object-contain pixelated mb-4"
            data-testid="img-yoga-pose-sprite"
          />

          <div
            className="text-5xl font-bold mb-8 text-[hsl(var(--gb-darkest))]"
            style={{ fontFamily: "'Press Start 2P', monospace" }}
            data-testid="text-timer"
          >
            {formatTime(timeLeft)}
          </div>

          <div className="w-48 h-3 border-2 p-0.5 mb-6 border-[hsl(var(--gb-dark))]">
            <div
              className="h-full transition-all duration-1000 bg-[hsl(var(--gb-darkest))]"
              style={{ width: `${(timeLeft / currentStep.duration) * 100}%` }}
            />
          </div>

          <div className="flex gap-4 items-center">
            <button onClick={togglePause} className="w-10 h-10 flex items-center justify-center border-2 border-[hsl(var(--gb-darkest))] text-[hsl(var(--gb-darkest))]" data-testid="button-pause">
              {paused ? <Play size={18} /> : <Pause size={18} />}
            </button>
            <button onClick={toggleMute} className="w-10 h-10 flex items-center justify-center border-2 border-[hsl(var(--gb-darkest))] text-[hsl(var(--gb-darkest))]" data-testid="button-mute">
              {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentSection = currentStep?.section || '';
  const sectionSubtitle = SECTION_SUBTITLES[currentSection] || '';

  const currentExIdx = EXERCISES_ONLY.findIndex(e => e.label === currentStep?.label && e.section === currentStep?.section);

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-300 bg-[hsl(var(--gb-lightest))]">
      <div className="flex-shrink-0 flex items-center justify-between gap-2 px-4 pt-4">
        <div>
          <p className="text-[9px] uppercase tracking-widest text-[hsl(var(--gb-darkest))]" data-testid="text-phase">
            {isPrep ? 'GET READY' : currentSection}
          </p>
          {!isPrep && sectionSubtitle && (
            <p className="text-[7px] uppercase tracking-wider mt-0.5 text-[hsl(var(--gb-dark))]">
              {sectionSubtitle}
            </p>
          )}
        </div>
        <button
          onClick={exitRoutine}
          className="w-10 h-10 flex items-center justify-center border-2 border-[hsl(var(--gb-dark))] text-[hsl(var(--gb-dark))]"
          data-testid="button-exit"
        >
          <X size={18} />
        </button>
      </div>

      <div className="flex-shrink-0 flex flex-col items-center pb-3 px-4">
        <h2 className="text-xs font-bold mb-1 uppercase text-center text-[hsl(var(--gb-darkest))]" data-testid="text-exercise">
          {currentStep.sanskritName}
        </h2>
        {currentStep.englishName && (
          <p className="text-[7px] mb-1 text-center text-[hsl(var(--gb-dark))] opacity-60">
            {currentStep.englishName}
          </p>
        )}
        {!currentStep.englishName && <div className="mb-1" />}

        {POSE_SPRITES[currentStep.sanskritName] && (
          <img
            src={POSE_SPRITES[currentStep.sanskritName]}
            alt={currentStep.sanskritName}
            className="w-20 h-20 object-contain pixelated mb-2"
            data-testid="img-yoga-pose-sprite"
          />
        )}

        <div
          className="text-5xl font-bold mb-3 text-[hsl(var(--gb-darkest))]"
          style={{ fontFamily: "'Press Start 2P', monospace" }}
          data-testid="text-timer"
        >
          {formatTime(timeLeft)}
        </div>

        <div className="w-full max-w-xs h-3 border-2 p-0.5 mb-3 border-[hsl(var(--gb-dark))]">
          <div
            className="h-full transition-all duration-1000 bg-[hsl(var(--gb-darkest))]"
            style={{ width: `${(timeLeft / currentStep.duration) * 100}%` }}
          />
        </div>

        <div className="flex gap-4 items-center">
          <button
            onClick={togglePause}
            className="w-10 h-10 flex items-center justify-center border-2 border-[hsl(var(--gb-darkest))] text-[hsl(var(--gb-darkest))]"
            data-testid="button-pause"
          >
            {paused ? <Play size={18} /> : <Pause size={18} />}
          </button>
          <button
            onClick={toggleMute}
            className="w-10 h-10 flex items-center justify-center border-2 border-[hsl(var(--gb-darkest))] text-[hsl(var(--gb-darkest))]"
            data-testid="button-mute"
          >
            {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
        </div>
      </div>

      <div ref={listRef} className="flex-1 overflow-y-auto px-4 pb-4">
        <div className="max-w-xs mx-auto border-2 border-[hsl(var(--gb-dark))] bg-[hsl(var(--gb-light)_/_0.2)]">
          {(() => {
            const sections = Array.from(new Set(EXERCISES_ONLY.map(e => e.section)));
            let globalIdx = 0;

            return sections.map((section) => {
              const sectionExs = EXERCISES_ONLY.filter(e => e.section === section);

              return (
                <div key={section}>
                  <div className="px-3 py-1.5 border-b border-[hsl(var(--gb-dark)_/_0.25)]">
                    <span className="text-[7px] font-bold uppercase tracking-widest text-[hsl(var(--gb-dark))]">
                      {section}
                    </span>
                  </div>
                  {sectionExs.map((ex) => {
                    const idx = globalIdx++;
                    const isActive = currentExIdx === idx;
                    const isDone = currentExIdx > idx;

                    return (
                      <div
                        key={idx}
                        ref={isActive ? activeRef : undefined}
                        className={`flex items-center gap-2 py-2 px-3 leading-tight transition-all duration-200 ${isActive ? 'bg-[hsl(var(--gb-light))]' : ''}`}
                        data-testid={`menu-exercise-${idx}`}
                      >
                        <span className={`flex-shrink-0 w-3 font-bold text-[9px] text-[hsl(var(--gb-darkest))] ${isActive ? 'animate-pulse' : ''}`} style={{ visibility: isActive ? 'visible' : 'hidden' }}>
                          {'>'}
                        </span>
                        <div className={`flex-1 flex flex-col truncate ${isDone && !isActive ? 'line-through' : ''}`} style={{ opacity: isDone && !isActive ? 0.35 : 1 }}>
                          <span
                            className={`text-[9px] font-bold uppercase truncate ${isActive ? 'text-[hsl(var(--gb-darkest))]' : 'text-[hsl(var(--gb-darkest))]'}`}
                          >
                            {ex.sanskritName}
                          </span>
                          {ex.englishName && (
                            <span
                              className="text-[7px] truncate text-[hsl(var(--gb-dark))] opacity-60"
                            >
                              {ex.englishName}
                            </span>
                          )}
                        </div>
                        <span className={`flex-shrink-0 text-[8px] ${isActive ? 'text-[hsl(var(--gb-dark))]' : 'text-[hsl(var(--gb-dark)_/_0.6)]'}`}>
                          {formatTime(ex.duration)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              );
            });
          })()}
        </div>
      </div>
    </div>
  );
}
