import TimerPage, { type Step } from '@/components/TimerPage';

const STEPS: Step[] = [
  { label: 'GET READY', duration: 5, type: 'intro' },
  { label: "Child's Pose (Shoulder focus)", duration: 120, type: 'work' },
  { label: 'Thread the Needle (Both sides)', duration: 90, type: 'work' },
  { label: 'Deep Forward Fold', duration: 90, type: 'work' },
];

export default function SurfCooldown() {
  return (
    <TimerPage
      title="SURF COOL-DOWN"
      steps={STEPS}
      category="surf_cooldown"
      skipLog
      redirectTo="/surfing"
    />
  );
}
