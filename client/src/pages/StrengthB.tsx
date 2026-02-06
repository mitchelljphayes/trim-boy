
import TimerPage from '@/components/TimerPage';

const STRENGTH_B = [
  { name: 'Glute Bridges', duration: 45 },
  { name: 'Calf Raises', duration: 45 },
  { name: 'Reverse Lunges', duration: 45 },
  { name: 'Dead Bug', duration: 45 },
  { name: 'Mountain Climbers', duration: 45 },
];

export default function StrengthB() {
  return (
    <TimerPage 
      title="STRENGTH ROUTINE B" 
      exercises={STRENGTH_B} 
      rounds={3} 
      category="strength" 
    />
  );
}
