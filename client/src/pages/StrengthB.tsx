import TimerPage from '@/components/TimerPage';
import strengthBSprite from '@assets/trimboy_strength_b_1770440986724.png';
import spriteGluteBridges1 from '@/assets/sprites/exercise-glute-bridges.png';
import spriteGluteBridges2 from '@/assets/sprites/exercise-glute-bridges-2.png';
import spriteCalfRaises1 from '@/assets/sprites/exercise-calf-raises.png';
import spriteCalfRaises2 from '@/assets/sprites/exercise-calf-raises-2.png';
import spriteReverseLunges1 from '@/assets/sprites/exercise-reverse-lunges.png';
import spriteReverseLunges2 from '@/assets/sprites/exercise-reverse-lunges-2.png';
import spriteDeadBug1 from '@/assets/sprites/exercise-dead-bug.png';
import spriteDeadBug2 from '@/assets/sprites/exercise-dead-bug-2.png';
import spriteMountainClimbers1 from '@/assets/sprites/exercise-mountain-climbers.png';
import spriteMountainClimbers2 from '@/assets/sprites/exercise-mountain-climbers-2.png';

const exerciseSprites: Record<string, string[]> = {
  'Glute Bridges': [spriteGluteBridges1, spriteGluteBridges2],
  'Calf Raises': [spriteCalfRaises1, spriteCalfRaises2],
  'Reverse Lunges': [spriteReverseLunges1, spriteReverseLunges2],
  'Dead Bug': [spriteDeadBug1, spriteDeadBug2],
  'Mountain Climbers': [spriteMountainClimbers1, spriteMountainClimbers2],
};

export default function StrengthB() {
  return (
    <TimerPage
      title="STRENGTH ROUTINE B"
      exercises={['Glute Bridges', 'Calf Raises', 'Reverse Lunges', 'Dead Bug', 'Mountain Climbers']}
      workDuration={45}
      restDuration={15}
      rounds={3}
      cooldown={{ label: 'Savasana', duration: 180 }}
      category="strength"
      spriteUrl={strengthBSprite}
      exerciseSprites={exerciseSprites}
    />
  );
}
