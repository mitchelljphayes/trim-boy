
import TimerPage from '@/components/TimerPage';

const MAINTENANCE = [
  { name: 'Deep Squat', duration: 60 },
  { name: 'Cat-Cow', duration: 60 },
  { name: 'Downward Dog', duration: 60 },
  { name: 'Couch Stretch L', duration: 60 },
  { name: 'Couch Stretch R', duration: 60 },
];

export default function Maintenance() {
  return (
    <TimerPage 
      title="DAILY MAINTENANCE" 
      exercises={MAINTENANCE} 
      rounds={1} 
      category="maint" 
    />
  );
}
