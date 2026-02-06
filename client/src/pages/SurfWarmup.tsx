import TimerPage, { type Step } from '@/components/TimerPage';

const STEPS: Step[] = [
  { label: 'GET READY', duration: 5, type: 'intro' },
  { label: 'Dynamic Arm Circles & Over-head Reaches', duration: 60, type: 'work' },
  { label: 'Torso Twists & Neck Rolls', duration: 60, type: 'work' },
  { label: 'Slow Pop-up Transitions', duration: 60, type: 'work' },
];

export default function SurfWarmup() {
  return (
    <TimerPage
      title="SURF WARM-UP"
      steps={STEPS}
      category="surf_warmup"
      skipLog
      redirectTo="/surfing"
    />
  );
}
