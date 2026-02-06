import TimerPage, { type Step } from '@/components/TimerPage';

const EXERCISES = ['Glute Bridges', 'Calf Raises', 'Reverse Lunges', 'Dead Bug', 'Mountain Climbers'];

function buildStrengthSteps(exercises: string[], rounds: number): Step[] {
  const steps: Step[] = [];

  steps.push({ label: 'GET READY', duration: 5, type: 'intro' });

  steps.push({ label: 'Warm-up: Mobility Flow', duration: 120, type: 'warmup' });

  for (let r = 1; r <= rounds; r++) {
    exercises.forEach((ex, i) => {
      steps.push({ label: `R${r}: ${ex}`, duration: 45, type: 'work' });
      const isLast = r === rounds && i === exercises.length - 1;
      if (!isLast) {
        const nextEx = i < exercises.length - 1 ? exercises[i + 1] : exercises[0];
        steps.push({ label: `Rest - Up next: ${nextEx}`, duration: 15, type: 'rest' });
      }
    });
  }

  steps.push({ label: 'Cool-down: Savasana', duration: 180, type: 'cooldown' });

  return steps;
}

const STEPS = buildStrengthSteps(EXERCISES, 3);

export default function StrengthB() {
  return (
    <TimerPage
      title="STRENGTH ROUTINE B"
      steps={STEPS}
      category="strength"
    />
  );
}
