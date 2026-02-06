
import TimerPage from '@/components/TimerPage';

const STRENGTH_A = [
  { name: 'Pop-ups', duration: 45 },
  { name: 'Superman Holds', duration: 45 },
  { name: 'Rotational Lunges', duration: 45 },
  { name: 'Plank Shoulder Taps', duration: 45 },
  { name: 'Bird-Dog', duration: 45 },
];

export default function StrengthA() {
  return (
    <TimerPage 
      title="STRENGTH ROUTINE A" 
      exercises={STRENGTH_A} 
      rounds={3} 
      category="strength" 
    />
  );
}
