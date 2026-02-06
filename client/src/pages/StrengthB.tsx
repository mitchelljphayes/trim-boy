import TimerPage from '@/components/TimerPage';

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
    />
  );
}
