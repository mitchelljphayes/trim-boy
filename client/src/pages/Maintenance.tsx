import TimerPage, { type Step } from '@/components/TimerPage';

const STEPS: Step[] = [
  { label: 'GET READY', duration: 5, type: 'intro' },
  { label: 'Warm-up: Mobility Flow', duration: 120, type: 'warmup' },
  { label: 'Deep Squat', duration: 60, type: 'work' },
  { label: 'Rest - Up next: Cat-Cow', duration: 15, type: 'rest' },
  { label: 'Cat-Cow', duration: 60, type: 'work' },
  { label: 'Rest - Up next: Downward Dog', duration: 15, type: 'rest' },
  { label: 'Downward Dog', duration: 60, type: 'work' },
  { label: 'Rest - Up next: Couch Stretch L', duration: 15, type: 'rest' },
  { label: 'Couch Stretch L', duration: 60, type: 'work' },
  { label: 'Rest - Up next: Couch Stretch R', duration: 15, type: 'rest' },
  { label: 'Couch Stretch R', duration: 60, type: 'work' },
  { label: 'Cool-down: Savasana', duration: 180, type: 'cooldown' },
];

export default function Maintenance() {
  return (
    <TimerPage
      title="DAILY MAINTENANCE"
      steps={STEPS}
      category="maint"
    />
  );
}
