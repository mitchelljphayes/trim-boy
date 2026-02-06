
import { useEffect, useState, useRef } from 'react';
import { useLocation } from 'wouter';
import { useAudio } from '@/hooks/use-audio';
import { getStreak } from '@/lib/streakManager';
import trimBoySprite from "@assets/trimboysprite01_1770372116288.png";
import goldTrimBoy from "@assets/trimboy_gold_1770407871261.png";

const SPARKLE_COUNT = 18;

function GoldenSparkles() {
  const sparkles = Array.from({ length: SPARKLE_COUNT }, (_, i) => {
    const size = 2 + Math.random() * 3;
    const left = 10 + Math.random() * 80;
    const top = 10 + Math.random() * 80;
    const delay = Math.random() * 2;
    const duration = 1.2 + Math.random() * 1.5;

    return (
      <div
        key={i}
        className="absolute gold-sparkle"
        style={{
          width: size,
          height: size,
          left: `${left}%`,
          top: `${top}%`,
          animationDelay: `${delay}s`,
          animationDuration: `${duration}s`,
        }}
      />
    );
  });

  return <>{sparkles}</>;
}

function TypewriterText({ text, startDelay = 2000 }: { text: string; startDelay?: number }) {
  const [displayed, setDisplayed] = useState('');
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setStarted(true), startDelay);
    return () => clearTimeout(t);
  }, [startDelay]);

  useEffect(() => {
    if (!started) return;
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) clearInterval(interval);
    }, 60);
    return () => clearInterval(interval);
  }, [started, text]);

  return (
    <span data-testid="text-gold-status">
      {displayed}
      {started && displayed.length < text.length && (
        <span className="animate-pulse">_</span>
      )}
    </span>
  );
}

export default function BootSequence() {
  const [, setLocation] = useLocation();
  const { playStartupSound, playGoldenChime, initAudio } = useAudio();
  const [started, setStarted] = useState(false);
  const [flashing, setFlashing] = useState(false);
  const isGold = useRef(getStreak() >= 2);
  const transitionTimer = useRef<ReturnType<typeof setTimeout>>();
  const hasAutoStarted = useRef(false);

  const goToDashboard = () => {
    if (flashing) return;
    setFlashing(true);
    if (transitionTimer.current) clearTimeout(transitionTimer.current);
    setTimeout(() => setLocation('/dashboard'), 400);
  };

  useEffect(() => {
    if (isGold.current && !hasAutoStarted.current) {
      hasAutoStarted.current = true;
      initAudio();
      setStarted(true);
      playGoldenChime();
      transitionTimer.current = setTimeout(() => {
        setFlashing(true);
        setTimeout(() => setLocation('/dashboard'), 400);
      }, 4000);
    }
    return () => {
      if (transitionTimer.current) clearTimeout(transitionTimer.current);
    };
  }, [initAudio, playGoldenChime, setLocation]);

  const handleStandardStart = () => {
    initAudio();
    setStarted(true);
    playStartupSound();
    setTimeout(() => setLocation('/dashboard'), 2500);
  };

  if (isGold.current) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center font-mono relative overflow-hidden cursor-pointer"
        style={{ background: '#2d1b33' }}
        onClick={goToDashboard}
        data-testid="golden-boot-screen"
      >
        <GoldenSparkles />

        <div className="gold-sprite-fadein relative z-10 flex flex-col items-center">
          <img
            src={goldTrimBoy}
            alt="Golden TrimBoy with Falcon"
            className="w-40 h-auto pixelated mb-8"
            style={{ imageRendering: 'pixelated' }}
            data-testid="img-gold-trimboy"
          />

          <p
            className="text-[9px] uppercase tracking-widest text-center"
            style={{ color: '#FFD700', fontFamily: "'Press Start 2P', monospace" }}
          >
            <TypewriterText text="GOLD STATUS: PROTOCOL MAINTAINED" startDelay={1800} />
          </p>
        </div>

        {flashing && (
          <div className="gold-flash-overlay" />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[hsl(var(--gb-lightest))] flex flex-col items-center justify-center text-[hsl(var(--gb-darkest))] font-mono">
      {!started ? (
        <button
          onClick={handleStandardStart}
          className="text-xl animate-pulse hover:scale-110 transition-transform text-[hsl(var(--gb-darkest))]"
          data-testid="button-start"
        >
          PRESS START
        </button>
      ) : (
        <div className="flex flex-col items-center space-y-8 animate-in fade-in duration-500">
          <img
            src={trimBoySprite}
            alt="TrimBoy"
            className="w-20 h-auto pixelated"
          />

          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold tracking-widest">TRIMBOY</h1>
            <p className="text-[10px] opacity-80">TRIMCORP &copy; 1989-2026</p>
          </div>
        </div>
      )}
    </div>
  );
}
