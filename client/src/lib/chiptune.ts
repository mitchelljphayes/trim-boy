type StopFn = () => void;

const BPM = 92;
const BEAT = 60 / BPM;
const EIGHTH = BEAT / 2;

const NOTE: Record<string, number> = {
  C3: 130.81, Db3: 138.59, D3: 146.83, Eb3: 155.56, E3: 164.81,
  F3: 174.61, Gb3: 185.00, G3: 196.00, Ab3: 207.65, A3: 220.00,
  Bb3: 233.08, B3: 246.94,
  C4: 261.63, Db4: 277.18, D4: 293.66, Eb4: 311.13, E4: 329.63,
  F4: 349.23, Gb4: 369.99, G4: 392.00, Ab4: 415.30, A4: 440.00,
  Bb4: 466.16, B4: 493.88,
  C5: 523.25, Db5: 554.37, D5: 587.33, Eb5: 622.25, E5: 659.25,
  F5: 698.46, Gb5: 739.99, G5: 783.99, Ab5: 830.61,
  Eb2: 77.78, Gb2: 92.50, Ab2: 103.83, Bb2: 116.54, Db2: 69.30,
};

let sharedCtx: AudioContext | null = null;

function getAudioCtx(): AudioContext {
  if (!sharedCtx) {
    sharedCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (sharedCtx.state === 'suspended') sharedCtx.resume();
  return sharedCtx;
}

function createSquareOsc(ctx: AudioContext, dest: AudioNode, freq: number, start: number, dur: number, vol: number): void {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'square';
  osc.frequency.setValueAtTime(freq, start);
  gain.gain.setValueAtTime(0, start);
  gain.gain.linearRampToValueAtTime(vol, start + 0.005);
  gain.gain.setValueAtTime(vol, start + dur - 0.02);
  gain.gain.linearRampToValueAtTime(0, start + dur);
  osc.connect(gain);
  gain.connect(dest);
  osc.start(start);
  osc.stop(start + dur + 0.01);
}

function createWaveOsc(ctx: AudioContext, dest: AudioNode, freq: number, start: number, dur: number, vol: number): void {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(freq, start);
  gain.gain.setValueAtTime(0, start);
  gain.gain.linearRampToValueAtTime(vol, start + 0.01);
  gain.gain.setValueAtTime(vol, start + dur - 0.03);
  gain.gain.linearRampToValueAtTime(0, start + dur);
  osc.connect(gain);
  gain.connect(dest);
  osc.start(start);
  osc.stop(start + dur + 0.01);
}

function createNoise(ctx: AudioContext, dest: AudioNode, start: number, dur: number, vol: number, highpass: number): void {
  const bufferSize = Math.max(1, Math.floor(ctx.sampleRate * dur));
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  let lfsr = 0x7FFF;
  for (let i = 0; i < bufferSize; i++) {
    const bit = ((lfsr >> 0) ^ (lfsr >> 1)) & 1;
    lfsr = (lfsr >> 1) | (bit << 14);
    data[i] = (lfsr & 1) ? 1.0 : -1.0;
  }
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  const filter = ctx.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.setValueAtTime(highpass, start);
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0, start);
  gain.gain.linearRampToValueAtTime(vol, start + 0.003);
  gain.gain.setValueAtTime(vol * 0.8, start + dur * 0.3);
  gain.gain.linearRampToValueAtTime(0, start + dur);
  source.connect(filter);
  filter.connect(gain);
  gain.connect(dest);
  source.start(start);
  source.stop(start + dur + 0.01);
}

interface NoteEvent {
  note: string;
  time: number;
  dur: number;
}

const LOOP_BARS = 4;
const LOOP_DURATION = LOOP_BARS * 4 * BEAT;

const melody: NoteEvent[] = [
  { note: 'Ab4', time: 0, dur: EIGHTH * 1.5 },
  { note: 'Gb4', time: EIGHTH * 1.5, dur: EIGHTH },
  { note: 'Eb4', time: BEAT, dur: EIGHTH * 1.5 },
  { note: 'Db4', time: BEAT + EIGHTH * 1.5, dur: EIGHTH },
  { note: 'Eb4', time: BEAT * 2, dur: BEAT },
  { note: 'Gb4', time: BEAT * 3, dur: BEAT },

  { note: 'Ab4', time: BEAT * 4, dur: EIGHTH * 1.5 },
  { note: 'Bb4', time: BEAT * 4 + EIGHTH * 1.5, dur: EIGHTH },
  { note: 'Ab4', time: BEAT * 5, dur: EIGHTH },
  { note: 'Gb4', time: BEAT * 5 + EIGHTH, dur: EIGHTH },
  { note: 'Eb4', time: BEAT * 6, dur: BEAT },
  { note: 'Db4', time: BEAT * 7, dur: BEAT * 0.8 },

  { note: 'Eb4', time: BEAT * 8, dur: EIGHTH * 1.5 },
  { note: 'Gb4', time: BEAT * 8 + EIGHTH * 1.5, dur: EIGHTH },
  { note: 'Ab4', time: BEAT * 9, dur: BEAT },
  { note: 'Gb4', time: BEAT * 10, dur: EIGHTH },
  { note: 'Eb4', time: BEAT * 10 + EIGHTH, dur: EIGHTH },
  { note: 'Db4', time: BEAT * 11, dur: BEAT * 0.8 },

  { note: 'Eb4', time: BEAT * 12, dur: BEAT },
  { note: 'Db4', time: BEAT * 13, dur: EIGHTH },
  { note: 'Eb4', time: BEAT * 13 + EIGHTH, dur: EIGHTH },
  { note: 'Gb4', time: BEAT * 14, dur: BEAT * 1.5 },
  { note: 'Ab4', time: BEAT * 15.5, dur: EIGHTH },
];

const harmony: NoteEvent[] = [
  { note: 'Eb4', time: 0, dur: BEAT },
  { note: 'Db4', time: BEAT, dur: BEAT },
  { note: 'B3', time: BEAT * 2, dur: BEAT },
  { note: 'Db4', time: BEAT * 3, dur: BEAT },

  { note: 'Eb4', time: BEAT * 4, dur: BEAT },
  { note: 'Gb4', time: BEAT * 5, dur: BEAT },
  { note: 'Eb4', time: BEAT * 6, dur: BEAT },
  { note: 'Bb3', time: BEAT * 7, dur: BEAT * 0.8 },

  { note: 'B3', time: BEAT * 8, dur: BEAT },
  { note: 'Db4', time: BEAT * 9, dur: BEAT },
  { note: 'Eb4', time: BEAT * 10, dur: BEAT },
  { note: 'Bb3', time: BEAT * 11, dur: BEAT * 0.8 },

  { note: 'B3', time: BEAT * 12, dur: BEAT },
  { note: 'Bb3', time: BEAT * 13, dur: BEAT },
  { note: 'Db4', time: BEAT * 14, dur: BEAT * 1.5 },
  { note: 'Eb4', time: BEAT * 15.5, dur: EIGHTH },
];

const bassline: NoteEvent[] = [
  { note: 'Ab2', time: 0, dur: BEAT * 1.8 },
  { note: 'Gb2', time: BEAT * 2, dur: BEAT * 1.8 },

  { note: 'Ab2', time: BEAT * 4, dur: BEAT * 1.8 },
  { note: 'Eb2', time: BEAT * 6, dur: BEAT * 1.8 },

  { note: 'Gb2', time: BEAT * 8, dur: BEAT * 1.8 },
  { note: 'Ab2', time: BEAT * 10, dur: BEAT * 1.8 },

  { note: 'Gb2', time: BEAT * 12, dur: BEAT * 1.8 },
  { note: 'Eb2', time: BEAT * 14, dur: BEAT * 1.8 },
];

interface DrumHit {
  time: number;
  type: 'kick' | 'snare' | 'hat' | 'ohat';
}

function buildDrums(): DrumHit[] {
  const hits: DrumHit[] = [];
  for (let bar = 0; bar < LOOP_BARS; bar++) {
    const barStart = bar * 4 * BEAT;
    hits.push({ time: barStart, type: 'kick' });
    hits.push({ time: barStart + BEAT * 2, type: 'kick' });
    hits.push({ time: barStart + BEAT, type: 'snare' });
    hits.push({ time: barStart + BEAT * 3, type: 'snare' });
    for (let i = 0; i < 8; i++) {
      hits.push({ time: barStart + i * EIGHTH, type: 'hat' });
    }
    hits.push({ time: barStart + EIGHTH * 3, type: 'ohat' });
    hits.push({ time: barStart + EIGHTH * 7, type: 'ohat' });
  }
  return hits;
}

function playKick(ctx: AudioContext, dest: AudioNode, time: number): void {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'square';
  osc.frequency.setValueAtTime(150, time);
  osc.frequency.exponentialRampToValueAtTime(30, time + 0.12);
  gain.gain.setValueAtTime(0.12, time);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.15);
  osc.connect(gain);
  gain.connect(dest);
  osc.start(time);
  osc.stop(time + 0.16);
}

function playSnare(ctx: AudioContext, dest: AudioNode, time: number): void {
  createNoise(ctx, dest, time, 0.1, 0.06, 2000);
  const body = ctx.createOscillator();
  const bodyGain = ctx.createGain();
  body.type = 'square';
  body.frequency.setValueAtTime(200, time);
  body.frequency.exponentialRampToValueAtTime(80, time + 0.05);
  bodyGain.gain.setValueAtTime(0.08, time);
  bodyGain.gain.exponentialRampToValueAtTime(0.0001, time + 0.08);
  body.connect(bodyGain);
  bodyGain.connect(dest);
  body.start(time);
  body.stop(time + 0.09);
}

export function playSecretCream(): StopFn {
  const ctx = getAudioCtx();

  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(1, ctx.currentTime);
  masterGain.connect(ctx.destination);

  let stopped = false;
  let loopTimer: ReturnType<typeof setTimeout> | null = null;

  function scheduleLoop(startTime: number): void {
    if (stopped) return;

    melody.forEach(({ note, time, dur }) => {
      createSquareOsc(ctx, masterGain, NOTE[note], startTime + time, dur, 0.06);
    });

    harmony.forEach(({ note, time, dur }) => {
      createSquareOsc(ctx, masterGain, NOTE[note], startTime + time, dur, 0.04);
    });

    bassline.forEach(({ note, time, dur }) => {
      createWaveOsc(ctx, masterGain, NOTE[note], startTime + time, dur, 0.07);
    });

    const drums = buildDrums();
    drums.forEach(({ time, type }) => {
      const t = startTime + time;
      switch (type) {
        case 'kick': playKick(ctx, masterGain, t); break;
        case 'snare': playSnare(ctx, masterGain, t); break;
        case 'hat': createNoise(ctx, masterGain, t, 0.04, 0.02, 8000); break;
        case 'ohat': createNoise(ctx, masterGain, t, 0.08, 0.025, 6000); break;
      }
    });

    const nextStart = startTime + LOOP_DURATION;
    const delayMs = (nextStart - ctx.currentTime) * 1000 - 100;
    loopTimer = setTimeout(() => {
      if (!stopped) scheduleLoop(nextStart);
    }, Math.max(delayMs, 0));
  }

  const now = ctx.currentTime + 0.05;
  scheduleLoop(now);

  return () => {
    stopped = true;
    if (loopTimer) clearTimeout(loopTimer);
    masterGain.gain.cancelScheduledValues(ctx.currentTime);
    masterGain.gain.setValueAtTime(0, ctx.currentTime);
    masterGain.disconnect();
  };
}
