import TimerPage from '@/components/TimerPage';

export default function RunWarmup() {
  return (
    <TimerPage
      title="RUN WARM-UP"
      exercises={['Ankle Circles & Toe Taps', 'High Knees (Marching pace)', 'Standing Quad Stretches (Dynamic)']}
      workDuration={60}
      restDuration={0}
      rounds={1}
      category="run_warmup"
      skipLog
      redirectTo="/running"
    />
  );
}
