import TimerPage from '@/components/TimerPage';

export default function SurfWarmup() {
  return (
    <TimerPage
      title="SURF WARM-UP"
      exercises={['Dynamic Arm Circles & Over-head Reaches', 'Torso Twists & Neck Rolls', 'Slow Pop-up Transitions']}
      workDuration={60}
      restDuration={0}
      rounds={1}
      category="surf_warmup"
      skipLog
      redirectTo="/surfing"
    />
  );
}
