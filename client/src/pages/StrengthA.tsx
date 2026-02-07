import TimerPage from '@/components/TimerPage';
import strengthASprite from '@assets/trimboy_strength_a_1770440916786.png';
import spritePopups from '@/assets/sprites/exercise-popups.png';
import spriteSupermanHolds from '@/assets/sprites/exercise-superman-holds.png';
import spriteRotationalLunges from '@/assets/sprites/exercise-rotational-lunges.png';
import spritePlankShoulderTaps from '@/assets/sprites/exercise-plank-shoulder-taps.png';
import spriteBirdDog from '@/assets/sprites/exercise-bird-dog.png';

const exerciseSprites: Record<string, string> = {
  'Pop-ups': spritePopups,
  'Superman Holds': spriteSupermanHolds,
  'Rotational Lunges': spriteRotationalLunges,
  'Plank Shoulder Taps': spritePlankShoulderTaps,
  'Bird-Dog': spriteBirdDog,
};

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
      exerciseSprites={exerciseSprites}
    />
  );
}
