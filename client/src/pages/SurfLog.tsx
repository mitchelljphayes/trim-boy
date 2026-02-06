import { useState } from 'react';
import { useLocation } from 'wouter';
import { useCreateLog } from '@/hooks/use-trim';
import { useAudio } from '@/hooks/use-audio';
import { RetroButton } from '@/components/RetroButton';
import { ArrowLeft, Star } from 'lucide-react';

export default function SurfLog() {
  const [, setLocation] = useLocation();
  const { playCelebratoryIdent, initAudio } = useAudio();
  const { mutate: logActivity, isPending } = useCreateLog();

  const [timeSurf, setTimeSurf] = useState('');
  const [location, setLocationText] = useState('');
  const [enjoyment, setEnjoyment] = useState(0);

  const handleSave = () => {
    initAudio();
    const userId = localStorage.getItem('trim_user_id');
    if (!userId) return;

    logActivity(
      {
        category: 'surf',
        date: new Date(),
        metadata: {
          timeSurf: parseInt(timeSurf) || 0,
          location: location,
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

  const canSave = timeSurf && enjoyment > 0;

  return (
    <div className="min-h-screen bg-[hsl(var(--gb-lightest))] p-6 flex flex-col items-center justify-center">
      <h1 className="text-lg font-bold text-[hsl(var(--gb-darkest))] mb-2" data-testid="text-title">
        LOG SURF
      </h1>
      <p className="text-[9px] text-[hsl(var(--gb-dark))] mb-8 uppercase tracking-widest">
        Record Session
      </p>

      <div className="w-full max-w-xs space-y-5">
        {/* Time */}
        <div>
          <label className="block text-[9px] text-[hsl(var(--gb-darkest))] uppercase tracking-widest mb-2">
            Time Surf (Minutes)
          </label>
          <input
            type="number"
            inputMode="numeric"
            value={timeSurf}
            onChange={(e) => setTimeSurf(e.target.value)}
            placeholder="60"
            className="w-full py-3 px-4 bg-[hsl(var(--gb-light))] border-4 border-[hsl(var(--gb-dark))] text-[hsl(var(--gb-darkest))] text-sm font-bold placeholder:text-[hsl(var(--gb-dark))]/40 focus:outline-none focus:border-[hsl(var(--gb-darkest))]"
            data-testid="input-time"
          />
        </div>

        {/* Location */}
        <div>
          <label className="block text-[9px] text-[hsl(var(--gb-darkest))] uppercase tracking-widest mb-2">
            Location
          </label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocationText(e.target.value)}
            placeholder="Bondi Beach"
            className="w-full py-3 px-4 bg-[hsl(var(--gb-light))] border-4 border-[hsl(var(--gb-dark))] text-[hsl(var(--gb-darkest))] text-sm font-bold placeholder:text-[hsl(var(--gb-dark))]/40 focus:outline-none focus:border-[hsl(var(--gb-darkest))]"
            data-testid="input-location"
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
        onClick={() => setLocation('/surfing')}
        className="mt-8 flex items-center gap-2 text-[hsl(var(--gb-dark))] text-xs"
        data-testid="button-back"
      >
        <ArrowLeft size={14} /> BACK
      </button>
    </div>
  );
}
