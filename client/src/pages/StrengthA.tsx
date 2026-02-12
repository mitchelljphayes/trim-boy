import TimerPage from '@/components/TimerPage';
import strengthASprite from '@assets/trimboy_strength_a_1770440916786.png';
import spritePopups1 from '@/assets/sprites/exercise-popups.png';
import spritePopups2 from '@/assets/sprites/exercise-popups-2.png';
import spriteSupermanHolds from '@/assets/sprites/exercise-superman-holds.png';
import spriteRotationalLunges1 from '@/assets/sprites/exercise-rotational-lunges.png';
import spriteRotationalLunges2 from '@/assets/sprites/exercise-rotational-lunges-2.png';
import spritePlankShoulderTaps1 from '@/assets/sprites/exercise-plank-shoulder-taps.png';
import spritePlankShoulderTaps2 from '@/assets/sprites/exercise-plank-shoulder-taps-2.png';
import spriteBirdDog1 from '@/assets/sprites/exercise-bird-dog.png';
import spriteBirdDog2 from '@/assets/sprites/exercise-bird-dog-2.png';

const exerciseSprites: Record<string, string[]> = {
  'Pop-ups': [spritePopups1, spritePopups2],
  'Superman Holds': [spriteSupermanHolds],
  'Rotational Lunges': [spriteRotationalLunges1, spriteRotationalLunges2],
  'Plank Shoulder Taps': [spritePlankShoulderTaps1, spritePlankShoulderTaps2],
  'Bird-Dog': [spriteBirdDog1, spriteBirdDog2],
};

export default function StrengthA() {
  return (
    <TimerPage
      title="STRENGTH ROUTINE A"
      exercises={['Pop-ups', 'Superman Holds', 'Rotational Lunges', 'Plank Shoulder Taps', 'Bird-Dog']}
      workDuration={45}
      restDuration={15}
      rounds={3}
      cooldown={{ label: 'Savasana', duration: 30 }}
      category="strength"
      spriteUrl={strengthASprite}
      exerciseSprites={exerciseSprites}
    />
  );
}
