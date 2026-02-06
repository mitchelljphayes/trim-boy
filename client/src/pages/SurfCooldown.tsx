import TimerPage from '@/components/TimerPage';

export default function SurfCooldown() {
  return (
    <TimerPage
      title="SURF COOL-DOWN"
      exercises={["Child's Pose (Shoulder focus)", 'Thread the Needle (Both sides)', 'Deep Forward Fold']}
      workDuration={100}
      restDuration={0}
      rounds={1}
      category="surf_cooldown"
      skipLog
      redirectTo="/surfing"
    />
  );
}
