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

  const playFireworksBurst = useCallback(() => {
    if (mutedRef.current) return;
    initAudio();
    if (!audioCtx.current) return;
    const ctx = audioCtx.current;
    const now = ctx.currentTime;

    const bursts = [
      { freq: 200, time: 0, dur: 0.15 },
      { freq: 600, time: 0.1, dur: 0.2 },
      { freq: 1200, time: 0.2, dur: 0.15 },
      { freq: 800, time: 0.35, dur: 0.2 },
      { freq: 1600, time: 0.45, dur: 0.15 },
      { freq: 400, time: 0.55, dur: 0.25 },
      { freq: 2000, time: 0.7, dur: 0.3 },
      { freq: 1000, time: 0.9, dur: 0.2 },
    ];

    bursts.forEach(({ freq, time, dur }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, now + time);
      osc.frequency.linearRampToValueAtTime(freq * 0.5, now + time + dur);
      gain.gain.setValueAtTime(0.08, now + time);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + time + dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + time);
      osc.stop(now + time + dur);
    });

    const noise = ctx.createOscillator();
    const noiseGain = ctx.createGain();
    noise.type = 'sawtooth';
    noise.frequency.setValueAtTime(100, now + 0.8);
    noise.frequency.linearRampToValueAtTime(3000, now + 1.2);
    noiseGain.gain.setValueAtTime(0.04, now + 0.8);
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.5);
    noise.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    noise.start(now + 0.8);
    noise.stop(now + 1.5);
  }, [initAudio]);

  const playFlameRoar = useCallback(() => {
    if (mutedRef.current) return;
    initAudio();
    if (!audioCtx.current) return;
    const ctx = audioCtx.current;
    const now = ctx.currentTime;

    const rumble = ctx.createOscillator();
    const rumbleGain = ctx.createGain();
    rumble.type = 'sawtooth';
    rumble.frequency.setValueAtTime(60, now);
    rumble.frequency.linearRampToValueAtTime(120, now + 0.5);
    rumble.frequency.linearRampToValueAtTime(40, now + 1.5);
    rumbleGain.gain.setValueAtTime(0.06, now);
    rumbleGain.gain.linearRampToValueAtTime(0.1, now + 0.3);
    rumbleGain.gain.linearRampToValueAtTime(0.08, now + 0.8);
    rumbleGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.5);
    rumble.connect(rumbleGain);
    rumbleGain.connect(ctx.destination);
    rumble.start(now);
    rumble.stop(now + 1.5);

    const crackle = ctx.createOscillator();
    const crackleGain = ctx.createGain();
    crackle.type = 'square';
    crackle.frequency.setValueAtTime(800, now + 0.2);
    crackle.frequency.exponentialRampToValueAtTime(200, now + 1.0);
    crackleGain.gain.setValueAtTime(0.04, now + 0.2);
    crackleGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);
    crackle.connect(crackleGain);
    crackleGain.connect(ctx.destination);
    crackle.start(now + 0.2);
    crackle.stop(now + 1.2);
  }, [initAudio]);

  const playThunderclap = useCallback(() => {
    if (mutedRef.current) return;
    initAudio();
    if (!audioCtx.current) return;
    const ctx = audioCtx.current;
    const now = ctx.currentTime;

    const crack = ctx.createOscillator();
    const crackGain = ctx.createGain();
    crack.type = 'sawtooth';
    crack.frequency.setValueAtTime(3000, now);
    crack.frequency.exponentialRampToValueAtTime(100, now + 0.15);
    crackGain.gain.setValueAtTime(0.15, now);
    crackGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);
    crack.connect(crackGain);
    crackGain.connect(ctx.destination);
    crack.start(now);
    crack.stop(now + 0.2);

    const rumble = ctx.createOscillator();
    const rumbleGain = ctx.createGain();
    rumble.type = 'sawtooth';
    rumble.frequency.setValueAtTime(80, now + 0.1);
    rumble.frequency.linearRampToValueAtTime(30, now + 1.5);
    rumbleGain.gain.setValueAtTime(0.08, now + 0.1);
    rumbleGain.gain.linearRampToValueAtTime(0.12, now + 0.3);
    rumbleGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.5);
    rumble.connect(rumbleGain);
    rumbleGain.connect(ctx.destination);
    rumble.start(now + 0.1);
    rumble.stop(now + 1.5);

    const echo1 = ctx.createOscillator();
    const echo1Gain = ctx.createGain();
    echo1.type = 'square';
    echo1.frequency.setValueAtTime(200, now + 0.3);
    echo1.frequency.exponentialRampToValueAtTime(60, now + 0.8);
    echo1Gain.gain.setValueAtTime(0.05, now + 0.3);
    echo1Gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.0);
    echo1.connect(echo1Gain);
    echo1Gain.connect(ctx.destination);
    echo1.start(now + 0.3);
    echo1.stop(now + 1.0);

    const echo2 = ctx.createOscillator();
    const echo2Gain = ctx.createGain();
    echo2.type = 'square';
    echo2.frequency.setValueAtTime(150, now + 0.6);
    echo2.frequency.exponentialRampToValueAtTime(40, now + 1.2);
    echo2Gain.gain.setValueAtTime(0.03, now + 0.6);
    echo2Gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.3);
    echo2.connect(echo2Gain);
    echo2Gain.connect(ctx.destination);
    echo2.start(now + 0.6);
    echo2.stop(now + 1.3);
  }, [initAudio]);

  const playStormChime = useCallback(() => {
    if (mutedRef.current) return;
    initAudio();
    if (!audioCtx.current) return;
    const ctx = audioCtx.current;
    const now = ctx.currentTime;

    const notes = [
      { freq: 1046.5, time: 0, dur: 0.25 },
      { freq: 1396.9, time: 0.12, dur: 0.25 },
      { freq: 1760, time: 0.24, dur: 0.35 },
      { freq: 2093, time: 0.4, dur: 0.5 },
      { freq: 2637, time: 0.6, dur: 0.7 },
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
    shimmer.frequency.setValueAtTime(3520, now + 0.7);
    shimmer.frequency.linearRampToValueAtTime(4186, now + 1.5);
    shimGain.gain.setValueAtTime(0.04, now + 0.7);
    shimGain.gain.exponentialRampToValueAtTime(0.0001, now + 2.0);
    shimmer.connect(shimGain);
    shimGain.connect(ctx.destination);
    shimmer.start(now + 0.7);
    shimmer.stop(now + 2.0);
  }, [initAudio]);

  return { playHighBeep, playLowBlip, playStartupSound, playCelebratoryIdent, playGentleIdent, playInhaleSweep, playExhaleSweep, playHoldChime, playGoldenChime, playFireworksBurst, playFlameRoar, playThunderclap, playStormChime, initAudio, setMuted };
}
