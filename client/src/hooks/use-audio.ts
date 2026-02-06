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

  return { playHighBeep, playLowBlip, playStartupSound, playCelebratoryIdent, playGentleIdent, initAudio, setMuted };
}
