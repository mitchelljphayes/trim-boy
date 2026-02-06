import { useEffect, useState, useRef, useCallback } from 'react';

const BOLT_SEGMENTS = [
  'M50,0 L48,15 L55,18 L47,35 L54,38 L42,60 L50,55 L38,80 L46,75 L35,100',
  'M50,0 L52,12 L45,16 L53,30 L46,34 L55,55 L47,50 L56,75 L45,70 L50,100',
  'M50,0 L46,18 L53,22 L44,40 L52,44 L43,65 L51,60 L40,85 L48,80 L42,100',
];

function LightningBolt({ x, delay }: { x: number; delay: number }) {
  const [visible, setVisible] = useState(false);
  const pathIdx = useRef(Math.floor(Math.random() * BOLT_SEGMENTS.length));

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    const t2 = setTimeout(() => setVisible(false), delay + 400);
    return () => { clearTimeout(t); clearTimeout(t2); };
  }, [delay]);

  if (!visible) return null;

  return (
    <svg
      className="lightning-bolt"
      style={{
        left: `${x}%`,
        top: 0,
        width: '60px',
        height: '100%',
      }}
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      data-testid="lightning-bolt"
    >
      <path
        d={BOLT_SEGMENTS[pathIdx.current]}
        stroke="#00f2ff"
        strokeWidth="3"
        fill="none"
        filter="drop-shadow(0 0 6px rgba(0, 242, 255, 0.9)) drop-shadow(0 0 12px rgba(157, 0, 255, 0.5))"
      />
      <path
        d={BOLT_SEGMENTS[pathIdx.current]}
        stroke="white"
        strokeWidth="1"
        fill="none"
        opacity="0.8"
      />
    </svg>
  );
}

export function StormBackground() {
  const [flashes, setFlashes] = useState<number[]>([]);
  const [bolts, setBolts] = useState<{ id: number; x: number; delay: number }[]>([]);
  const flashCounter = useRef(0);
  const boltCounter = useRef(0);

  const triggerLightning = useCallback(() => {
    const id = ++flashCounter.current;
    setFlashes(prev => [...prev, id]);
    setTimeout(() => setFlashes(prev => prev.filter(f => f !== id)), 200);

    const boltId = ++boltCounter.current;
    const x = 10 + Math.random() * 80;
    setBolts(prev => [...prev, { id: boltId, x, delay: 50 + Math.random() * 100 }]);
    setTimeout(() => setBolts(prev => prev.filter(b => b.id !== boltId)), 600);
  }, []);

  useEffect(() => {
    function scheduleNext() {
      const delay = 5000 + Math.random() * 5000;
      return setTimeout(() => {
        triggerLightning();
        timerRef.current = scheduleNext();
      }, delay);
    }
    const timerRef = { current: scheduleNext() };
    return () => clearTimeout(timerRef.current);
  }, [triggerLightning]);

  return (
    <div className="fixed inset-0 pointer-events-none z-[9993]" data-testid="storm-background">
      {flashes.map(id => (
        <div key={id} className="lightning-flash" />
      ))}
      {bolts.map(b => (
        <LightningBolt key={b.id} x={b.x} delay={b.delay} />
      ))}
    </div>
  );
}
