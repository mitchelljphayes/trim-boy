import { useState } from 'react';
import { useLocation } from 'wouter';
import { useCreateLog } from '@/hooks/use-trim';
import { useAudio } from '@/hooks/use-audio';
import { RetroButton } from '@/components/RetroButton';
import { ArrowLeft, Star } from 'lucide-react';

export default function RunLog() {
  const [, setLocation] = useLocation();
  const { playCelebratoryIdent, initAudio } = useAudio();
  const { mutate: logActivity, isPending } = useCreateLog();

  const [distance, setDistance] = useState('');
  const [pace, setPace] = useState('');
  const [enjoyment, setEnjoyment] = useState(0);

  const handleSave = () => {
    initAudio();
    const userId = localStorage.getItem('trim_user_id');
    if (!userId) return;

    logActivity(
      {
        category: 'run',
        date: new Date(),
        metadata: {
          distance: parseFloat(distance) || 0,
          pace: pace,
          enjoyment: enjoyment,
        },
      },
      {
        onSuccess: () => {
          playCelebratoryIdent();
          setTimeout(() => setLocation('/dashboard'), 1500);
        },
      }
    );
  };

  const canSave = distance && enjoyment > 0;

  return (
    <div className="min-h-screen bg-[hsl(var(--gb-lightest))] p-6 flex flex-col items-center justify-center">
      <h1 className="text-lg font-bold text-[hsl(var(--gb-darkest))] mb-2" data-testid="text-title">
        LOG RUN
      </h1>
      <p className="text-[9px] text-[hsl(var(--gb-dark))] mb-8 uppercase tracking-widest">
        Record Session
      </p>

      <div className="w-full max-w-xs space-y-5">
        {/* Distance */}
        <div>
          <label className="block text-[9px] text-[hsl(var(--gb-darkest))] uppercase tracking-widest mb-2">
            Distance (km)
          </label>
          <input
            type="number"
            inputMode="decimal"
            step="0.1"
            value={distance}
            onChange={(e) => setDistance(e.target.value)}
            placeholder="5.0"
            className="w-full py-3 px-4 bg-[hsl(var(--gb-light))] border-4 border-[hsl(var(--gb-dark))] text-[hsl(var(--gb-darkest))] text-sm font-bold placeholder:text-[hsl(var(--gb-dark))]/40 focus:outline-none focus:border-[hsl(var(--gb-darkest))]"
            data-testid="input-distance"
          />
        </div>

        {/* Pace */}
        <div>
          <label className="block text-[9px] text-[hsl(var(--gb-darkest))] uppercase tracking-widest mb-2">
            Pace (min/km)
          </label>
          <input
            type="text"
            value={pace}
            onChange={(e) => setPace(e.target.value)}
            placeholder="5:30"
            className="w-full py-3 px-4 bg-[hsl(var(--gb-light))] border-4 border-[hsl(var(--gb-dark))] text-[hsl(var(--gb-darkest))] text-sm font-bold placeholder:text-[hsl(var(--gb-dark))]/40 focus:outline-none focus:border-[hsl(var(--gb-darkest))]"
            data-testid="input-pace"
          />
        </div>

        {/* Enjoyment Stars */}
        <div>
          <label className="block text-[9px] text-[hsl(var(--gb-darkest))] uppercase tracking-widest mb-2">
            Enjoyment
          </label>
          <div className="flex gap-2 justify-center" data-testid="rating-enjoyment">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setEnjoyment(star)}
                className="p-1 transition-transform active:scale-90"
                data-testid={`star-${star}`}
              >
                <Star
                  size={28}
                  className={
                    star <= enjoyment
                      ? 'fill-[hsl(var(--gb-darkest))] text-[hsl(var(--gb-darkest))]'
                      : 'text-[hsl(var(--gb-dark))]/40'
                  }
                />
              </button>
            ))}
          </div>
        </div>

        {/* Save */}
        <RetroButton
          onClick={handleSave}
          fullWidth
          disabled={!canSave || isPending}
          data-testid="button-save"
        >
          {isPending ? 'SAVING...' : 'SAVE LOG'}
        </RetroButton>
      </div>

      <button
        onClick={() => setLocation('/running')}
        className="mt-8 flex items-center gap-2 text-[hsl(var(--gb-dark))] text-xs"
        data-testid="button-back"
      >
        <ArrowLeft size={14} /> BACK
      </button>
    </div>
  );
}
