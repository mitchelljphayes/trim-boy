import TimerPage from '@/components/TimerPage';
import strengthBSprite from '@assets/trimboy_strength_b_1770440986724.png';
import spriteGluteBridges from '@/assets/sprites/exercise-glute-bridges.png';
import spriteCalfRaises from '@/assets/sprites/exercise-calf-raises.png';
import spriteReverseLunges from '@/assets/sprites/exercise-reverse-lunges.png';
import spriteDeadBug from '@/assets/sprites/exercise-dead-bug.png';
import spriteMountainClimbers from '@/assets/sprites/exercise-mountain-climbers.png';

const exerciseSprites: Record<string, string> = {
  'Glute Bridges': spriteGluteBridges,
  'Calf Raises': spriteCalfRaises,
  'Reverse Lunges': spriteReverseLunges,
  'Dead Bug': spriteDeadBug,
  'Mountain Climbers': spriteMountainClimbers,
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
