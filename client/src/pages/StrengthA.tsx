import TimerPage from '@/components/TimerPage';
import strengthASprite from '@assets/trimboy_strength_a_1770440916786.png';

export default function StrengthA() {
  return (
    <TimerPage
      title="STRENGTH ROUTINE A"
      exercises={['Pop-ups', 'Superman Holds', 'Rotational Lunges', 'Plank Shoulder Taps', 'Bird-Dog']}
      workDuration={45}
      restDuration={15}
      rounds={3}
      cooldown={{ label: 'Savasana', duration: 180 }}
      category="strength"
      spriteUrl={strengthASprite}
    />
  );
}
