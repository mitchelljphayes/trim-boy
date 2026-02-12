import TimerPage from '@/components/TimerPage';
import maintSprite from '@assets/trimboy_sprite_-_maintenance_1770379541305.png';
import spriteDeepSquat1 from '@/assets/sprites/exercise-deep-squat.png';
import spriteDeepSquat2 from '@/assets/sprites/exercise-deep-squat-2.png';
import spriteCatCow1 from '@/assets/sprites/exercise-cat-cow.png';
import spriteCatCow2 from '@/assets/sprites/exercise-cat-cow-2.png';
import spriteDownwardDog from '@/assets/sprites/exercise-downward-dog.png';
import spriteCouchStretchL from '@/assets/sprites/exercise-couch-stretch-l.png';
import spriteCouchStretchR from '@/assets/sprites/exercise-couch-stretch-r.png';

const exerciseSprites: Record<string, string[]> = {
  'Deep Squat': [spriteDeepSquat1, spriteDeepSquat2],
  'Cat-Cow': [spriteCatCow1, spriteCatCow2],
  'Downward Dog': [spriteDownwardDog],
  'Couch Stretch L': [spriteCouchStretchL],
  'Couch Stretch R': [spriteCouchStretchR],
};

export default function Maintenance() {
  return (
    <TimerPage
      title="DAILY MAINTENANCE"
      exercises={['Deep Squat', 'Cat-Cow', 'Downward Dog', 'Couch Stretch L', 'Couch Stretch R']}
      workDuration={60}
      restDuration={15}
      rounds={1}
      cooldown={{ label: 'Savasana', duration: 30 }}
      category="maint"
      spriteUrl={maintSprite}
      exerciseSprites={exerciseSprites}
    />
  );
}
