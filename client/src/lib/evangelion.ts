type StopFn = () => void;

const BPM = 128;
const BEAT = 60 / BPM;
const EIGHTH = BEAT / 2;
const SIXTEENTH = BEAT / 4;

const N: Record<string, number> = {
  C2: 65.41, D2: 73.42, E2: 82.41, F2: 87.31, G2: 98.00, A2: 110.00, B2: 123.47,
  C3: 130.81, Cs3: 138.59, D3: 146.83, Ds3: 155.56, E3: 164.81,
  F3: 174.61, Fs3: 185.00, G3: 196.00, Gs3: 207.65, A3: 220.00,
  As3: 233.08, Bb3: 233.08, B3: 246.94,
  C4: 261.63, Cs4: 277.18, D4: 293.66, Ds4: 311.13, E4: 329.63,
  F4: 349.23, Fs4: 369.99, G4: 392.00, Gs4: 415.30, A4: 440.00,
  As4: 466.16, Bb4: 466.16, B4: 493.88,
  C5: 523.25, Cs5: 554.37, D5: 587.33, Ds5: 622.25, E5: 659.25,
  F5: 698.46, Fs5: 739.99, G5: 783.99, Gs5: 830.61, A5: 880.00,
  Bb5: 932.33, B5: 987.77,
  C6: 1046.50,
};

let sharedCtx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!sharedCtx) {
    sharedCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (sharedCtx.state === 'suspended') sharedCtx.resume();
  return sharedCtx;
}

function sq(ctx: AudioContext, dest: AudioNode, freq: number, start: number, dur: number, vol: number): void {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'square';
  osc.frequency.setValueAtTime(freq, start);
  gain.gain.setValueAtTime(0, start);
  gain.gain.linearRampToValueAtTime(vol, start + 0.005);
  gain.gain.setValueAtTime(vol, start + dur - 0.015);
  gain.gain.linearRampToValueAtTime(0, start + dur);
  osc.connect(gain);
  gain.connect(dest);
  osc.start(start);
  osc.stop(start + dur + 0.01);
}

function tri(ctx: AudioContext, dest: AudioNode, freq: number, start: number, dur: number, vol: number): void {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(freq, start);
  gain.gain.setValueAtTime(0, start);
  gain.gain.linearRampToValueAtTime(vol, start + 0.01);
  gain.gain.setValueAtTime(vol, start + dur - 0.02);
  gain.gain.linearRampToValueAtTime(0, start + dur);
  osc.connect(gain);
  gain.connect(dest);
  osc.start(start);
  osc.stop(start + dur + 0.01);
}

function noise(ctx: AudioContext, dest: AudioNode, start: number, dur: number, vol: number, hp: number): void {
  const len = Math.max(1, Math.floor(ctx.sampleRate * dur));
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = buf.getChannelData(0);
  let lfsr = 0x7FFF;
  for (let i = 0; i < len; i++) {
    const bit = ((lfsr >> 0) ^ (lfsr >> 1)) & 1;
    lfsr = (lfsr >> 1) | (bit << 14);
    data[i] = (lfsr & 1) ? 1.0 : -1.0;
  }
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const filt = ctx.createBiquadFilter();
  filt.type = 'highpass';
  filt.frequency.setValueAtTime(hp, start);
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0, start);
  gain.gain.linearRampToValueAtTime(vol, start + 0.003);
  gain.gain.setValueAtTime(vol * 0.7, start + dur * 0.3);
  gain.gain.linearRampToValueAtTime(0, start + dur);
  src.connect(filt);
  filt.connect(gain);
  gain.connect(dest);
  src.start(start);
  src.stop(start + dur + 0.01);
}

interface NE { note: string; time: number; dur: number; }
interface DH { time: number; type: 'kick' | 'snare' | 'hat' | 'ohat'; }

function kick(ctx: AudioContext, dest: AudioNode, t: number): void {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'square';
  osc.frequency.setValueAtTime(160, t);
  osc.frequency.exponentialRampToValueAtTime(35, t + 0.12);
  gain.gain.setValueAtTime(0.12, t);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.14);
  osc.connect(gain);
  gain.connect(dest);
  osc.start(t);
  osc.stop(t + 0.15);
}

function snare(ctx: AudioContext, dest: AudioNode, t: number): void {
  noise(ctx, dest, t, 0.09, 0.05, 2500);
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'square';
  osc.frequency.setValueAtTime(220, t);
  osc.frequency.exponentialRampToValueAtTime(90, t + 0.04);
  gain.gain.setValueAtTime(0.07, t);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.07);
  osc.connect(gain);
  gain.connect(dest);
  osc.start(t);
  osc.stop(t + 0.08);
}

// "A Cruel Angel's Thesis" - 8-bit arrangement
// Intro (8 bars) + Verse A (8 bars) + Pre-Chorus (4 bars) + Chorus (8 bars) = 28 bars

const LOOP_BARS = 28;
const LOOP_DURATION = LOOP_BARS * 4 * BEAT;

const B = BEAT;
const E = EIGHTH;
const S = SIXTEENTH;

// ── MELODY (Square Wave 1) ──
const melody: NE[] = [
  // Intro - bars 1-4: iconic opening riff
  { note: 'E4', time: 0, dur: E },
  { note: 'F4', time: E, dur: E },
  { note: 'G4', time: B, dur: E },
  { note: 'A4', time: B + E, dur: E },
  { note: 'G4', time: B * 2, dur: E },
  { note: 'F4', time: B * 2 + E, dur: E },
  { note: 'E4', time: B * 3, dur: B },

  { note: 'E4', time: B * 4, dur: E },
  { note: 'F4', time: B * 4 + E, dur: E },
  { note: 'G4', time: B * 5, dur: E },
  { note: 'A4', time: B * 5 + E, dur: E },
  { note: 'B4', time: B * 6, dur: E },
  { note: 'A4', time: B * 6 + E, dur: E },
  { note: 'G4', time: B * 7, dur: B },

  // bars 5-8: repeat with variation
  { note: 'A4', time: B * 8, dur: E },
  { note: 'B4', time: B * 8 + E, dur: E },
  { note: 'C5', time: B * 9, dur: E },
  { note: 'D5', time: B * 9 + E, dur: E },
  { note: 'C5', time: B * 10, dur: E },
  { note: 'B4', time: B * 10 + E, dur: E },
  { note: 'A4', time: B * 11, dur: B },

  { note: 'A4', time: B * 12, dur: E },
  { note: 'B4', time: B * 12 + E, dur: E },
  { note: 'C5', time: B * 13, dur: E },
  { note: 'B4', time: B * 13 + E, dur: E },
  { note: 'A4', time: B * 14, dur: E },
  { note: 'G4', time: B * 14 + E, dur: E },
  { note: 'A4', time: B * 15, dur: B * 1.5 },

  // Verse A - bars 9-16: "Zankoku na tenshi no you ni..."
  { note: 'E4', time: B * 16, dur: E },
  { note: 'E4', time: B * 16 + E, dur: S },
  { note: 'F4', time: B * 16 + E + S, dur: S },
  { note: 'G4', time: B * 17, dur: B },
  { note: 'G4', time: B * 18, dur: E },
  { note: 'A4', time: B * 18 + E, dur: E },
  { note: 'G4', time: B * 19, dur: E },
  { note: 'F4', time: B * 19 + E, dur: B * 1.5 },

  { note: 'E4', time: B * 21, dur: E },
  { note: 'E4', time: B * 21 + E, dur: S },
  { note: 'F4', time: B * 21 + E + S, dur: S },
  { note: 'G4', time: B * 22, dur: B },
  { note: 'A4', time: B * 23, dur: E },
  { note: 'G4', time: B * 23 + E, dur: E },
  { note: 'F4', time: B * 24, dur: E },
  { note: 'E4', time: B * 24 + E, dur: B * 1.5 },

  { note: 'D4', time: B * 26, dur: E },
  { note: 'E4', time: B * 26 + E, dur: E },
  { note: 'F4', time: B * 27, dur: E },
  { note: 'G4', time: B * 27 + E, dur: E },
  { note: 'A4', time: B * 28, dur: B },
  { note: 'G4', time: B * 29, dur: E },
  { note: 'F4', time: B * 29 + E, dur: E },
  { note: 'E4', time: B * 30, dur: B * 2 },

  // Pre-Chorus - bars 17-20
  { note: 'C5', time: B * 32, dur: E },
  { note: 'B4', time: B * 32 + E, dur: E },
  { note: 'A4', time: B * 33, dur: B },
  { note: 'G4', time: B * 34, dur: E },
  { note: 'A4', time: B * 34 + E, dur: E },
  { note: 'B4', time: B * 35, dur: B * 1.5 },

  { note: 'C5', time: B * 36 + E, dur: E },
  { note: 'B4', time: B * 37, dur: E },
  { note: 'A4', time: B * 37 + E, dur: E },
  { note: 'B4', time: B * 38, dur: E },
  { note: 'C5', time: B * 38 + E, dur: E },
  { note: 'D5', time: B * 39, dur: B },

  // Chorus - bars 21-28: "Zankoku na tenshi no teeze"
  { note: 'E5', time: B * 40, dur: E },
  { note: 'D5', time: B * 40 + E, dur: E },
  { note: 'C5', time: B * 41, dur: B },
  { note: 'B4', time: B * 42, dur: E },
  { note: 'C5', time: B * 42 + E, dur: E },
  { note: 'D5', time: B * 43, dur: B },

  { note: 'E5', time: B * 44, dur: E },
  { note: 'D5', time: B * 44 + E, dur: E },
  { note: 'C5', time: B * 45, dur: E },
  { note: 'B4', time: B * 45 + E, dur: E },
  { note: 'A4', time: B * 46, dur: B * 2 },

  { note: 'E5', time: B * 48, dur: E },
  { note: 'D5', time: B * 48 + E, dur: E },
  { note: 'C5', time: B * 49, dur: B },
  { note: 'B4', time: B * 50, dur: E },
  { note: 'C5', time: B * 50 + E, dur: E },
  { note: 'D5', time: B * 51, dur: B },

  { note: 'C5', time: B * 52, dur: E },
  { note: 'B4', time: B * 52 + E, dur: E },
  { note: 'A4', time: B * 53, dur: E },
  { note: 'G4', time: B * 53 + E, dur: E },
  { note: 'A4', time: B * 54, dur: B * 2 },
];

// ── HARMONY (Square Wave 2) ──
const harmony: NE[] = [
  // Intro chords (sustained)
  { note: 'C4', time: 0, dur: B * 2 },
  { note: 'E4', time: B * 2, dur: B * 2 },
  { note: 'C4', time: B * 4, dur: B * 2 },
  { note: 'D4', time: B * 6, dur: B * 2 },

  { note: 'F4', time: B * 8, dur: B * 2 },
  { note: 'E4', time: B * 10, dur: B * 2 },
  { note: 'F4', time: B * 12, dur: B * 2 },
  { note: 'E4', time: B * 14, dur: B * 2 },

  // Verse
  { note: 'C4', time: B * 16, dur: B * 2 },
  { note: 'E4', time: B * 18, dur: B * 2 },
  { note: 'C4', time: B * 20, dur: B * 2 },
  { note: 'D4', time: B * 22, dur: B * 2 },
  { note: 'C4', time: B * 24, dur: B * 2 },
  { note: 'B3', time: B * 26, dur: B * 2 },
  { note: 'C4', time: B * 28, dur: B * 2 },
  { note: 'E4', time: B * 30, dur: B * 2 },

  // Pre-Chorus
  { note: 'E4', time: B * 32, dur: B * 2 },
  { note: 'D4', time: B * 34, dur: B * 2 },
  { note: 'E4', time: B * 36, dur: B * 2 },
  { note: 'G4', time: B * 38, dur: B * 2 },

  // Chorus
  { note: 'G4', time: B * 40, dur: B * 2 },
  { note: 'G4', time: B * 42, dur: B * 2 },
  { note: 'G4', time: B * 44, dur: B * 2 },
  { note: 'E4', time: B * 46, dur: B * 2 },
  { note: 'G4', time: B * 48, dur: B * 2 },
  { note: 'G4', time: B * 50, dur: B * 2 },
  { note: 'E4', time: B * 52, dur: B * 2 },
  { note: 'E4', time: B * 54, dur: B * 2 },
];

// ── BASS (Triangle Wave) ──
const bass: NE[] = [
  // Intro
  { note: 'A2', time: 0, dur: B * 2 },
  { note: 'A2', time: B * 2, dur: B * 2 },
  { note: 'F2', time: B * 4, dur: B * 2 },
  { note: 'G2', time: B * 6, dur: B * 2 },
  { note: 'F2', time: B * 8, dur: B * 2 },
  { note: 'E2', time: B * 10, dur: B * 2 },
  { note: 'F2', time: B * 12, dur: B * 2 },
  { note: 'E2', time: B * 14, dur: B * 2 },

  // Verse
  { note: 'A2', time: B * 16, dur: B * 2 },
  { note: 'A2', time: B * 18, dur: B * 2 },
  { note: 'F2', time: B * 20, dur: B * 2 },
  { note: 'G2', time: B * 22, dur: B * 2 },
  { note: 'A2', time: B * 24, dur: B * 2 },
  { note: 'G2', time: B * 26, dur: B * 2 },
  { note: 'F2', time: B * 28, dur: B * 2 },
  { note: 'E2', time: B * 30, dur: B * 2 },

  // Pre-Chorus
  { note: 'A2', time: B * 32, dur: B * 2 },
  { note: 'G2', time: B * 34, dur: B * 2 },
  { note: 'A2', time: B * 36, dur: B * 2 },
  { note: 'B2', time: B * 38, dur: B * 2 },

  // Chorus
  { note: 'C3', time: B * 40, dur: B * 2 },
  { note: 'G2', time: B * 42, dur: B * 2 },
  { note: 'A2', time: B * 44, dur: B * 2 },
  { note: 'A2', time: B * 46, dur: B * 2 },
  { note: 'C3', time: B * 48, dur: B * 2 },
  { note: 'G2', time: B * 50, dur: B * 2 },
  { note: 'A2', time: B * 52, dur: B * 2 },
  { note: 'E2', time: B * 54, dur: B * 2 },
];

function buildDrums(): DH[] {
  const hits: DH[] = [];
  for (let bar = 0; bar < LOOP_BARS; bar++) {
    const s = bar * 4 * B;
    hits.push({ time: s, type: 'kick' });
    hits.push({ time: s + B * 2, type: 'kick' });
    hits.push({ time: s + B, type: 'snare' });
    hits.push({ time: s + B * 3, type: 'snare' });
    for (let i = 0; i < 8; i++) {
      hits.push({ time: s + i * E, type: 'hat' });
    }
    hits.push({ time: s + E * 3, type: 'ohat' });
    hits.push({ time: s + E * 7, type: 'ohat' });
  }
  return hits;
}

export function playEvangelion(): StopFn {
  const ctx = getCtx();

  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(1, ctx.currentTime);
  masterGain.connect(ctx.destination);

  let stopped = false;
  let loopTimer: ReturnType<typeof setTimeout> | null = null;

  function scheduleLoop(startTime: number): void {
    if (stopped) return;

    melody.forEach(({ note, time, dur }) => {
      sq(ctx, masterGain, N[note], startTime + time, dur, 0.055);
    });

    harmony.forEach(({ note, time, dur }) => {
      sq(ctx, masterGain, N[note], startTime + time, dur, 0.03);
    });

    bass.forEach(({ note, time, dur }) => {
      tri(ctx, masterGain, N[note], startTime + time, dur, 0.065);
    });

    const drums = buildDrums();
    drums.forEach(({ time, type }) => {
      const t = startTime + time;
      switch (type) {
        case 'kick': kick(ctx, masterGain, t); break;
        case 'snare': snare(ctx, masterGain, t); break;
        case 'hat': noise(ctx, masterGain, t, 0.035, 0.018, 8000); break;
        case 'ohat': noise(ctx, masterGain, t, 0.07, 0.022, 6000); break;
      }
    });

    const nextStart = startTime + LOOP_DURATION;
    const delayMs = (nextStart - ctx.currentTime) * 1000 - 100;
    loopTimer = setTimeout(() => {
      if (!stopped) scheduleLoop(nextStart);
    }, Math.max(delayMs, 0));
  }

  scheduleLoop(ctx.currentTime + 0.05);

  return () => {
    stopped = true;
    if (loopTimer) clearTimeout(loopTimer);
    masterGain.gain.cancelScheduledValues(ctx.currentTime);
    masterGain.gain.setValueAtTime(0, ctx.currentTime);
    masterGain.disconnect();
  };
}
