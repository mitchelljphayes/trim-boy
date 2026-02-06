import TimerPage from '@/components/TimerPage';

export default function Maintenance() {
  return (
    <TimerPage
      title="DAILY MAINTENANCE"
      exercises={['Deep Squat', 'Cat-Cow', 'Downward Dog', 'Couch Stretch L', 'Couch Stretch R']}
      workDuration={60}
      restDuration={15}
      rounds={1}
      cooldown={{ label: 'Savasana', duration: 180 }}
      category="maint"
    />
  );
}
