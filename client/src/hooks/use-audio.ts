
import { useState, useEffect, useCallback, useRef } from 'react';

export function useAudio() {
  const audioCtx = useRef<AudioContext | null>(null);

  const initAudio = useCallback(() => {
    if (!audioCtx.current) {
      audioCtx.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtx.current.state === 'suspended') {
      audioCtx.current.resume();
    }
  }, []);

  const playTone = useCallback((freq: number, duration: number, type: OscillatorType = 'square') => {
    initAudio();
    if (!audioCtx.current) return;

    const osc = audioCtx.current.createOscillator();
    const gain = audioCtx.current.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.current.currentTime);
    
    gain.gain.setValueAtTime(0.1, audioCtx.current.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.current.currentTime + duration);

    osc.connect(gain);
    gain.connect(audioCtx.current.destination);

    osc.start();
    osc.stop(audioCtx.current.currentTime + duration);
  }, [initAudio]);

  const playHighBeep = useCallback(() => playTone(880, 0.1), [playTone]);
  const playLowBlip = useCallback(() => playTone(440, 0.1), [playTone]);

  const playStartupSound = useCallback(() => {
    initAudio();
    if (!audioCtx.current) return;
    const now = audioCtx.current.currentTime;
    playTone(523.25, 0.1); // C5
    setTimeout(() => playTone(1046.5, 0.15), 100); // C6
  }, [initAudio, playTone]);

  return { playHighBeep, playLowBlip, playStartupSound, initAudio };
}
