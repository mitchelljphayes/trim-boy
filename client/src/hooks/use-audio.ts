import { useCallback, useRef } from 'react';

export function useAudio() {
  const audioCtx = useRef<AudioContext | null>(null);
  const mutedRef = useRef(false);

  const initAudio = useCallback(() => {
    if (!audioCtx.current) {
      audioCtx.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtx.current.state === 'suspended') {
      audioCtx.current.resume();
    }
  }, []);

  const setMuted = useCallback((muted: boolean) => {
    mutedRef.current = muted;
  }, []);

  const playTone = useCallback((freq: number, duration: number, volume = 0.1, type: OscillatorType = 'square') => {
    if (mutedRef.current) return;
    initAudio();
    if (!audioCtx.current) return;

    const osc = audioCtx.current.createOscillator();
    const gain = audioCtx.current.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.current.currentTime);

    gain.gain.setValueAtTime(volume, audioCtx.current.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.current.currentTime + duration);

    osc.connect(gain);
    gain.connect(audioCtx.current.destination);

    osc.start();
    osc.stop(audioCtx.current.currentTime + duration);
  }, [initAudio]);

  const playHighBeep = useCallback(() => playTone(880, 0.12), [playTone]);

  const playLowBlip = useCallback(() => playTone(440, 0.1), [playTone]);

  const playStartupSound = useCallback(() => {
    initAudio();
    playTone(523.25, 0.1);
    setTimeout(() => playTone(1046.5, 0.15), 100);
  }, [initAudio, playTone]);

  const playCelebratoryIdent = useCallback(() => {
    playTone(523.25, 0.12);          // C5
    setTimeout(() => playTone(659.25, 0.12), 120);  // E5
    setTimeout(() => playTone(783.99, 0.12), 240);  // G5
    setTimeout(() => playTone(1046.5, 0.2), 360);   // C6
  }, [playTone]);

  const playGentleIdent = useCallback(() => {
    if (mutedRef.current) return;
    initAudio();
    if (!audioCtx.current) return;

    const ctx = audioCtx.current;
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(329.63, now); // E4
    gain1.gain.setValueAtTime(0.08, now);
    gain1.gain.exponentialRampToValueAtTime(0.0001, now + 2.0);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 2.0);

    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(220, now + 0.5); // A3
    gain2.gain.setValueAtTime(0.0001, now);
    gain2.gain.linearRampToValueAtTime(0.06, now + 0.5);
    gain2.gain.exponentialRampToValueAtTime(0.0001, now + 3.0);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.3);
    osc2.stop(now + 3.0);
  }, [initAudio]);

  const playInhaleSweep = useCallback(() => {
    if (mutedRef.current) return;
    initAudio();
    if (!audioCtx.current) return;
    const ctx = audioCtx.current;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(262, now);
    osc.frequency.linearRampToValueAtTime(523, now + 0.8);
    gain.gain.setValueAtTime(0.05, now);
    gain.gain.linearRampToValueAtTime(0.05, now + 0.4);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 1.2);
  }, [initAudio]);

  const playExhaleSweep = useCallback(() => {
    if (mutedRef.current) return;
    initAudio();
    if (!audioCtx.current) return;
    const ctx = audioCtx.current;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(523, now);
    osc.frequency.linearRampToValueAtTime(262, now + 0.8);
    gain.gain.setValueAtTime(0.05, now);
    gain.gain.linearRampToValueAtTime(0.05, now + 0.4);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 1.2);
  }, [initAudio]);

  const playHoldChime = useCallback(() => {
    if (mutedRef.current) return;
    initAudio();
    if (!audioCtx.current) return;
    const ctx = audioCtx.current;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1046.5, now);
    gain.gain.setValueAtTime(0.05, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.8);
  }, [initAudio]);

  const playGoldenChime = useCallback(() => {
    if (mutedRef.current) return;
    initAudio();
    if (!audioCtx.current) return;
    const ctx = audioCtx.current;
    const now = ctx.currentTime;

    const notes = [
      { freq: 1318.5, time: 0, dur: 0.3 },
      { freq: 1568, time: 0.15, dur: 0.3 },
      { freq: 2093, time: 0.3, dur: 0.5 },
      { freq: 2637, time: 0.5, dur: 0.6 },
      { freq: 3136, time: 0.7, dur: 0.8 },
    ];

    notes.forEach(({ freq, time, dur }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, now + time);
      gain.gain.setValueAtTime(0.06, now + time);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + time + dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + time);
      osc.stop(now + time + dur);
    });

    const shimmer = ctx.createOscillator();
    const shimGain = ctx.createGain();
    shimmer.type = 'sine';
    shimmer.frequency.setValueAtTime(4186, now + 0.8);
    shimGain.gain.setValueAtTime(0.03, now + 0.8);
    shimGain.gain.exponentialRampToValueAtTime(0.0001, now + 2.0);
    shimmer.connect(shimGain);
    shimGain.connect(ctx.destination);
    shimmer.start(now + 0.8);
    shimmer.stop(now + 2.0);
  }, [initAudio]);

  return { playHighBeep, playLowBlip, playStartupSound, playCelebratoryIdent, playGentleIdent, playInhaleSweep, playExhaleSweep, playHoldChime, playGoldenChime, initAudio, setMuted };
}
