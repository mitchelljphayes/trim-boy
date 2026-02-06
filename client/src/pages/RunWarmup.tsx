import TimerPage, { type Step } from '@/components/TimerPage';

const STEPS: Step[] = [
  { label: 'GET READY', duration: 5, type: 'intro' },
  { label: 'Ankle Circles & Toe Taps', duration: 60, type: 'work' },
  { label: 'Rest', duration: 5, type: 'rest' },
  { label: 'High Knees (Marching pace)', duration: 60, type: 'work' },
  { label: 'Rest', duration: 5, type: 'rest' },
  { label: 'Standing Quad Stretches (Dynamic)', duration: 60, type: 'work' },
];

export default function RunWarmup() {
  return (
    <TimerPage
      title="RUN WARM-UP"
      steps={STEPS}
      category="run_warmup"
      skipLog
      redirectTo="/running"
    />
  );
}
