import TimerPage, { type Step } from '@/components/TimerPage';

const STEPS: Step[] = [
  { label: 'GET READY', duration: 5, type: 'intro' },
  { label: 'Standing Calf Stretch (L/R)', duration: 90, type: 'work' },
  { label: 'Rest', duration: 5, type: 'rest' },
  { label: 'Pigeon Pose or Standing Figure-4', duration: 90, type: 'work' },
  { label: 'Rest', duration: 5, type: 'rest' },
  { label: 'Long Hamstring Reach', duration: 120, type: 'work' },
];

export default function RunCooldown() {
  return (
    <TimerPage
      title="RUN COOL-DOWN"
      steps={STEPS}
      category="run_cooldown"
      skipLog
      redirectTo="/running"
    />
  );
}
