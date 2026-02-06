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
  const [paceMin, setPaceMin] = useState('');
  const [paceSec, setPaceSec] = useState('');
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
          pace: `${paceMin || '0'}:${(paceSec || '0').padStart(2, '0')}`,
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
          <div className="flex items-center gap-2">
            <input
              type="number"
              inputMode="numeric"
              min="0"
              max="59"
              value={paceMin}
              onChange={(e) => setPaceMin(e.target.value.slice(0, 2))}
              placeholder="5"
              className="w-full py-3 px-4 bg-[hsl(var(--gb-light))] border-4 border-[hsl(var(--gb-dark))] text-[hsl(var(--gb-darkest))] text-sm font-bold text-center placeholder:text-[hsl(var(--gb-dark))]/40 focus:outline-none focus:border-[hsl(var(--gb-darkest))]"
              data-testid="input-pace-min"
            />
            <span className="text-lg font-bold text-[hsl(var(--gb-darkest))]">:</span>
            <input
              type="number"
              inputMode="numeric"
              min="0"
              max="59"
              value={paceSec}
              onChange={(e) => {
                const val = e.target.value.slice(0, 2);
                if (parseInt(val) > 59) return;
                setPaceSec(val);
              }}
              placeholder="30"
              className="w-full py-3 px-4 bg-[hsl(var(--gb-light))] border-4 border-[hsl(var(--gb-dark))] text-[hsl(var(--gb-darkest))] text-sm font-bold text-center placeholder:text-[hsl(var(--gb-dark))]/40 focus:outline-none focus:border-[hsl(var(--gb-darkest))]"
              data-testid="input-pace-sec"
            />
          </div>
          <div className="flex justify-between text-[7px] text-[hsl(var(--gb-dark))]/60 mt-1 px-1">
            <span>MIN</span>
            <span>SEC</span>
          </div>
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
