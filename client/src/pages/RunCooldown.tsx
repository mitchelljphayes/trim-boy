import TimerPage from '@/components/TimerPage';

export default function RunCooldown() {
  return (
    <TimerPage
      title="RUN COOL-DOWN"
      exercises={['Standing Calf Stretch (L/R)', 'Pigeon Pose or Standing Figure-4', 'Long Hamstring Reach']}
      workDuration={100}
      restDuration={0}
      rounds={1}
      category="run_cooldown"
      skipLog
      redirectTo="/running"
    />
  );
}
