
import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useCreateLog } from '@/hooks/use-trim';
import { useAudio } from '@/hooks/use-audio';
import { RetroButton } from '@/components/RetroButton';
import { ArrowLeft } from 'lucide-react';

type Phase = 'IDLE' | 'ACTION' | 'REST' | 'COMPLETE';

interface Exercise {
  name: string;
  duration: number;
}

interface RoutineProps {
  title: string;
  exercises: Exercise[];
  rounds?: number;
  category: string;
}

export default function TimerPage({ title, exercises, rounds = 1, category }: RoutineProps) {
  const [, setLocation] = useLocation();
  const { playHighBeep, playLowBlip, initAudio } = useAudio();
  const { mutate: logActivity } = useCreateLog();

  const [phase, setPhase] = useState<Phase>('IDLE');
  const [currentRound, setCurrentRound] = useState(1);
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);

  const currentExercise = exercises[exerciseIndex];
  const nextExercise = exercises[exerciseIndex + 1] || (currentRound < rounds ? exercises[0] : null);

  const startRoutine = () => {
    initAudio();
    setPhase('ACTION');
    setTimeLeft(exercises[0].duration);
    playHighBeep();
  };

  useEffect(() => {
    if (phase === 'IDLE' || phase === 'COMPLETE') return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handlePhaseEnd();
          return 0;
        }
        
        // Final 3 seconds blips
        if (prev <= 4) {
          playLowBlip();
        }
        
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [phase, timeLeft, playLowBlip]);

  const handlePhaseEnd = () => {
    if (phase === 'ACTION') {
      if (exerciseIndex === exercises.length - 1 && currentRound === rounds) {
        completeRoutine();
      } else {
        setPhase('REST');
        setTimeLeft(15);
        playHighBeep();
      }
    } else if (phase === 'REST') {
      setPhase('ACTION');
      if (exerciseIndex === exercises.length - 1) {
        setExerciseIndex(0);
        setCurrentRound((r) => r + 1);
        setTimeLeft(exercises[0].duration);
      } else {
        setExerciseIndex((i) => i + 1);
        setTimeLeft(exercises[exerciseIndex + 1].duration);
      }
      playHighBeep();
    }
  };

  const completeRoutine = () => {
    setPhase('COMPLETE');
    logActivity({ category, date: new Date() });
    setTimeout(() => setLocation('/dashboard'), 2000);
  };

  if (phase === 'IDLE') {
    return (
      <div className="min-h-screen bg-[hsl(var(--gb-lightest))] p-8 flex flex-col items-center justify-center text-center">
        <h1 className="text-2xl font-bold mb-4 text-[hsl(var(--gb-darkest))]">{title}</h1>
        <p className="mb-8 text-[hsl(var(--gb-dark))]">
          {exercises.length} Exercises • {rounds} Rounds<br/>
          Hands-free after start.
        </p>
        <RetroButton onClick={startRoutine} className="w-full max-w-xs">START ROUTINE</RetroButton>
        <button onClick={() => setLocation('/dashboard')} className="mt-8 flex items-center gap-2 text-[hsl(var(--gb-dark))]">
          <ArrowLeft size={16} /> BACK
        </button>
      </div>
    );
  }

  if (phase === 'COMPLETE') {
    return (
      <div className="min-h-screen bg-[hsl(var(--gb-light))] flex items-center justify-center text-center p-8">
        <div>
          <h1 className="text-3xl font-bold text-[hsl(var(--gb-darkest))] mb-4">MISSION COMPLETE</h1>
          <p className="text-[hsl(var(--gb-dark))]">SYNCING DATA...</p>
        </div>
      </div>
    );
  }

  const isRest = phase === 'REST';

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-8 transition-colors duration-500 ${isRest ? 'bg-[hsl(var(--gb-darkest))]' : 'bg-[hsl(var(--gb-lightest))]'}`}>
      <div className="text-center">
        <p className={`text-xs mb-4 uppercase tracking-widest ${isRest ? 'text-[hsl(var(--gb-light))]' : 'text-[hsl(var(--gb-dark))]'}`}>
          {isRest ? 'REST' : `ROUND ${currentRound}/${rounds}`}
        </p>
        
        <h2 className={`text-2xl font-bold mb-8 ${isRest ? 'text-[hsl(var(--gb-lightest))]' : 'text-[hsl(var(--gb-darkest))]'}`}>
          {isRest ? (nextExercise ? `UPCOMING: ${nextExercise.name}` : 'FINISHING') : currentExercise.name}
        </h2>

        <div className={`text-7xl font-bold mb-8 font-mono ${isRest ? 'text-[hsl(var(--gb-lightest))]' : 'text-[hsl(var(--gb-darkest))]'}`}>
          {timeLeft}s
        </div>

        <div className="w-full max-w-md h-4 bg-[hsl(var(--gb-dark))]/20 border-2 border-[hsl(var(--gb-dark))] p-0.5">
          <div 
            className="h-full bg-[hsl(var(--gb-dark))] transition-all duration-1000" 
            style={{ width: `${(timeLeft / (isRest ? 15 : currentExercise.duration)) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
