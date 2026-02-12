import { useState } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, Star } from "lucide-react";
import { useAllLogs } from "@/hooks/use-trim";
import { useAuth } from "@/contexts/AuthContext";
import { format, parseISO, startOfWeek } from "date-fns";
import { getMilestones, getTotalMastery, hasEverReachedGold, getGoldWeekIds } from "@/lib/streakManager";
import type { Milestone } from "@/lib/streakManager";
import type { Log } from "@/types/supabase";
import goldTrimBoy from "@assets/trimboy_gold_1770407871261.png";

const CATEGORIES = ['all', 'strength', 'run', 'surf', 'maint', 'breath'] as const;
type CategoryFilter = typeof CATEGORIES[number];

const CATEGORY_LABELS: Record<string, string> = {
  all: "ALL",
  strength: "STR",
  run: "RUN",
  surf: "SURF",
  maint: "MAINT",
  breath: "BREATH",
};

const CATEGORY_ICONS: Record<string, string> = {
  strength: "[STR]",
  run: "[RUN]",
  surf: "[SRF]",
  maint: "[MNT]",
  breath: "[BRE]",
};

const CATEGORY_FULL: Record<string, string> = {
  strength: "STRENGTH",
  run: "RUN",
  surf: "SURF",
  maint: "MAINT",
  breath: "BREATH",
};

// Use Log type from supabase, but keep local alias for clarity
type LogEntry = Log;

interface WeekGroup {
  weekLabel: string;
  weekStart: string;
  logs: LogEntry[];
  isGoldWeek: boolean;
}

function groupLogsByWeek(logs: LogEntry[], goldWeeks: Set<string>): WeekGroup[] {
  const weeks = new Map<string, LogEntry[]>();

  logs.forEach((log) => {
    const dateObj = parseISO(log.date);
    const weekStart = startOfWeek(dateObj, { weekStartsOn: 1 });
    const key = format(weekStart, "yyyy-MM-dd");
    if (!weeks.has(key)) {
      weeks.set(key, []);
    }
    weeks.get(key)!.push(log);
  });

  const groups: WeekGroup[] = [];
  weeks.forEach((weekLogs, weekStart) => {
    const startDate = parseISO(weekStart);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6);
    groups.push({
      weekLabel: `${format(startDate, "MMM d").toUpperCase()} - ${format(endDate, "MMM d").toUpperCase()}`,
      weekStart,
      logs: weekLogs.sort((a, b) => a.date.localeCompare(b.date)),
      isGoldWeek: goldWeeks.has(weekStart),
    });
  });

  return groups.sort((a, b) => b.weekStart.localeCompare(a.weekStart));
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-[2px]">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={10}
          className={s <= rating ? 'fill-[hsl(var(--gb-darkest))] text-[hsl(var(--gb-darkest))]' : 'text-[hsl(var(--gb-dark))]/30'}
        />
      ))}
    </div>
  );
}

function FalconIcon({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className="inline-block flex-shrink-0">
      <path d="M8 1L10 3L12 2L11 5L13 7L10 7L9 10L8 8L7 10L6 7L3 7L5 5L4 2L6 3L8 1Z" fill="#FFD700" stroke="#B8860B" strokeWidth="0.5" />
      <path d="M7 10L8 13L9 10" fill="#B8860B" />
    </svg>
  );
}

function WaveIcon({ size = 10, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="none" className={`inline-block flex-shrink-0 ${className}`}>
      <path d="M1 8C2 6 3 5 4 6C5 7 6 5 7 4C8 3 9 4 11 6" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path d="M1 10C2 8 3 7 4 8C5 9 6 7 7 6" stroke="currentColor" strokeWidth="1" fill="none" strokeLinecap="round" opacity="0.5" />
    </svg>
  );
}

function WindIcon({ size = 10, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="none" className={`inline-block flex-shrink-0 ${className}`}>
      <path d="M1 4H8C9 4 10 3 9 2C8 1 7 2 7 3" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      <path d="M1 7H6C7 7 8 8 7 9C6 10 5 9 5 8" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      <line x1="1" y1="10" x2="4" y2="10" stroke="currentColor" strokeWidth="1" opacity="0.4" strokeLinecap="round" />
    </svg>
  );
}

function TideIcon({ size = 10, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="none" className={`inline-block flex-shrink-0 ${className}`}>
      <rect x="1" y="1" width="10" height="10" stroke="currentColor" strokeWidth="0.8" fill="none" opacity="0.3" />
      <path d="M1 9L3 7L5 8L7 4L9 5L11 3" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="7" cy="4" r="1" fill="currentColor" opacity="0.6" />
    </svg>
  );
}

function isStormTheme(): boolean {
  const root = document.getElementById('app-root');
  return root?.classList.contains('theme-storm') ?? false;
}

function SurfDetail({ meta, expanded, onToggle }: { meta: Record<string, unknown>; expanded: boolean; onToggle: () => void }) {
  const loc = meta.location ? String(meta.location).toUpperCase() : null;
  const time = meta.timeSurf ? String(meta.timeSurf) : null;
  const rating = typeof meta.enjoyment === 'number' ? meta.enjoyment : 0;
  const marine = meta.marine as Record<string, unknown> | undefined;
  const storm = isStormTheme();
  const marineStyle = storm ? { color: '#00f2ff', textShadow: '0 0 4px rgba(0,242,255,0.5)' } : {};

  const swellVal = marine?.swell ? String(marine.swell) : '';
  const windVal = marine?.wind ? String(marine.wind) : '';
  const tideVal = marine?.tide ? String(marine.tide) : '';
  const swellHeight = marine?.swellHeight != null ? String(marine.swellHeight) : '';
  const windSpeed = marine?.windSpeed != null ? String(marine.windSpeed) : '';
  const windDirection = marine?.windDirection != null ? String(marine.windDirection) : '';
  const tideStage = marine?.tideStage ? String(marine.tideStage) : '';
  const hasMarineData = marine && ((swellVal && swellVal !== 'N/A') || (windVal && windVal !== 'N/A') || (tideVal && tideVal !== 'N/A'));

  return (
    <div className="text-[8px] text-[hsl(var(--gb-dark))] mt-[2px] space-y-[2px]">
      <div className="flex flex-wrap gap-x-3 gap-y-[2px]">
        {loc && <span>LOC: {loc}</span>}
        {time && <span>TIME: {time}MIN</span>}
        {rating > 0 && (
          <span className="flex items-center gap-1">RATING: <StarRating rating={rating} /></span>
        )}
        {hasMarineData && (
          <button
            onClick={(e) => { e.stopPropagation(); onToggle(); }}
            className="flex items-center gap-[3px] underline uppercase tracking-wider"
            style={storm ? { color: '#00f2ff' } : {}}
            data-testid="button-toggle-marine"
          >
            <WaveIcon size={8} />
            {expanded ? 'HIDE DATA' : 'CONDITIONS'}
            <span className="text-[7px]">{expanded ? '▲' : '▼'}</span>
          </button>
        )}
      </div>
      {expanded && hasMarineData && (
        <div
          className="mt-1 border-2 border-[hsl(var(--gb-dark))]/30 p-2 space-y-[3px]"
          style={storm ? { borderColor: 'rgba(0,242,255,0.3)', background: 'rgba(0,242,255,0.05)' } : { background: 'hsla(var(--gb-dark), 0.05)' }}
          data-testid="surf-marine-data"
        >
          <div className="text-[7px] font-bold uppercase tracking-widest mb-1" style={marineStyle}>
            MARINE CONDITIONS
          </div>
          {swellVal && swellVal !== 'N/A' && (
            <div className="flex items-center gap-[4px]" style={marineStyle}>
              <WaveIcon size={10} />
              <span className="font-bold">SWELL:</span>
              <span>{swellVal}</span>
              {swellHeight && <span className="text-[7px] opacity-70">({swellHeight}m)</span>}
            </div>
          )}
          {windVal && windVal !== 'N/A' && (
            <div className="flex items-center gap-[4px]" style={marineStyle}>
              <WindIcon size={10} />
              <span className="font-bold">WIND:</span>
              <span>{windVal}</span>
              {(windSpeed || windDirection) && (
                <span className="text-[7px] opacity-70">
                  ({[windSpeed && `${windSpeed}km/h`, windDirection && `${windDirection}°`].filter(Boolean).join(', ')})
                </span>
              )}
            </div>
          )}
          {tideVal && tideVal !== 'N/A' && (
            <div className="flex items-center gap-[4px]" style={marineStyle}>
              <TideIcon size={10} />
              <span className="font-bold">TIDE:</span>
              <span>{tideVal}</span>
              {tideStage && <span className="text-[7px] opacity-70">({tideStage})</span>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function RunDetail({ meta }: { meta: Record<string, unknown> }) {
  const dist = meta.distance ? String(meta.distance) : null;
  const pace = meta.pace ? String(meta.pace) : null;
  const rating = typeof meta.enjoyment === 'number' ? meta.enjoyment : 0;
  return (
    <div className="text-[8px] text-[hsl(var(--gb-dark))] flex flex-wrap gap-x-3 gap-y-[2px] mt-[2px]">
      {dist && <span>DIST: {dist}KM</span>}
      {pace && <span>PACE: {pace}/KM</span>}
      {rating > 0 && (
        <span className="flex items-center gap-1">RATING: <StarRating rating={rating} /></span>
      )}
    </div>
  );
}

const EVOLUTION_LABELS: Record<string, { title: string; icon: string; color: string; bgColor: string }> = {
  GBC_UNLOCK: {
    title: 'GBC COLOR UNLOCKED',
    icon: '[EVO]',
    color: '#33CC33',
    bgColor: '#0a1a0a',
  },
  GOLD_UNLOCK: {
    title: 'GOLD MODE ACTIVATED',
    icon: '[EVO]',
    color: '#FFD700',
    bgColor: '#2d1b33',
  },
  LIGHTNING_UNLOCK: {
    title: 'LIGHTNING EDITION',
    icon: '[ZAP]',
    color: '#00f2ff',
    bgColor: '#1a0633',
  },
};

function EvolutionTimeline({ events }: { events: Milestone[] }) {
  return (
    <div className="mb-6 border-4 border-[hsl(var(--gb-dark))] p-3" data-testid="evolution-timeline">
      <h3 className="text-[9px] font-bold text-[hsl(var(--gb-darkest))] tracking-widest mb-3 text-center">
        EVOLUTION EVENTS
      </h3>
      <div className="space-y-2">
        {events.map((ev, i) => {
          const info = EVOLUTION_LABELS[ev.achievement] || {
            title: ev.achievement,
            icon: '[EVT]',
            color: '#9bbc0f',
            bgColor: '#0f380f',
          };
          const date = new Date(ev.date);
          return (
            <div
              key={i}
              className="flex items-center gap-3 p-2 border-2"
              style={{ borderColor: info.color, backgroundColor: info.bgColor }}
              data-testid={`evolution-event-${i}`}
            >
              <div className="flex-shrink-0">
                <span className="text-[10px] font-bold" style={{ color: info.color }}>
                  {info.icon}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[8px] font-bold uppercase tracking-wider" style={{ color: info.color }}>
                  {info.title}
                </p>
                <p className="text-[7px] uppercase tracking-widest mt-[2px]" style={{ color: info.color, opacity: 0.6 }}>
                  {ev.status}
                </p>
              </div>
              <div className="flex-shrink-0 text-right">
                <p className="text-[7px]" style={{ color: info.color, opacity: 0.7 }}>
                  {format(date, "MM/dd/yy")}
                </p>
                <p className="text-[6px]" style={{ color: info.color, opacity: 0.5 }}>
                  {format(date, "HH:mm")}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function HallOfFame({ milestones, totalMastery }: { milestones: Milestone[]; totalMastery: number }) {
  const goldMilestones = milestones.filter(m => m.achievement === 'GOLD_STATUS');

  return (
    <div className="mb-6 border-4 border-[#B8860B] p-4" style={{ background: '#2d1b33' }} data-testid="hall-of-fame">
      <div className="flex flex-col items-center mb-4">
        <h2 className="text-sm font-bold mb-3 tracking-widest" style={{ color: '#FFD700' }} data-testid="text-hall-title">
          HALL OF FAME
        </h2>
        <img
          src={goldTrimBoy}
          alt="Golden TrimBoy - Lifetime Achievement"
          className="w-24 h-auto pixelated mb-2"
          data-testid="img-hall-of-fame-sprite"
        />
        <p className="text-[7px] uppercase tracking-widest" style={{ color: '#B8860B' }}>
          Lifetime Achievement
        </p>
      </div>

      <div className="flex justify-between items-center mb-3 px-1 border-b pb-2" style={{ borderColor: '#B8860B40' }}>
        <span className="text-[8px] font-bold uppercase tracking-wider" style={{ color: '#FFD700' }}>
          Total Mastery
        </span>
        <span className="text-[10px] font-bold" style={{ color: '#FFD700' }} data-testid="text-total-mastery">
          {totalMastery} WEEK{totalMastery !== 1 ? 'S' : ''}
        </span>
      </div>

      <div className="mb-1 px-1">
        <span className="text-[7px] font-bold uppercase tracking-widest" style={{ color: '#B8860B' }}>
          Gold Weeks
        </span>
      </div>

      <div className="max-h-32 overflow-y-auto" data-testid="gold-weeks-list">
        {goldMilestones.length === 0 ? (
          <p className="text-[8px] px-1 py-2" style={{ color: '#B8860B80' }}>
            NO GOLD WEEKS RECORDED YET
          </p>
        ) : (
          goldMilestones.map((m, i) => {
            const date = new Date(m.date);
            const weekStart = parseISO(m.weekId);
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekEnd.getDate() + 6);
            return (
              <div
                key={i}
                className="flex items-center justify-between py-1.5 px-1"
                style={{ borderBottom: i < goldMilestones.length - 1 ? '1px solid #B8860B30' : 'none' }}
                data-testid={`gold-week-${i}`}
              >
                <div className="flex items-center gap-2">
                  <FalconIcon size={10} />
                  <span className="text-[8px] font-bold" style={{ color: '#FFD700' }}>
                    {format(weekStart, "MMM d").toUpperCase()} - {format(weekEnd, "MMM d").toUpperCase()}
                  </span>
                </div>
                <span className="text-[7px]" style={{ color: '#B8860B' }}>
                  {format(date, "MM/dd/yy")}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default function Archive() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [filter, setFilter] = useState<CategoryFilter>('all');
  const [expandedSurfIds, setExpandedSurfIds] = useState<Set<number>>(new Set());

  const userId = user?.id ?? null;
  const { data: logs, isLoading, fetchStatus } = useAllLogs(userId);
  
  // Only show loading when actually fetching (not when query is disabled)
  const isActuallyLoading = fetchStatus === 'fetching';

  const milestones = getMilestones();
  const totalMastery = getTotalMastery();
  const showHallOfFame = hasEverReachedGold();
  const goldWeeks = getGoldWeekIds();
  const evolutionEvents = milestones.filter(m => m.achievement === 'GBC_UNLOCK' || m.achievement === 'GOLD_UNLOCK' || m.achievement === 'LIGHTNING_UNLOCK')
    .sort((a, b) => a.date.localeCompare(b.date));

  const filteredLogs = logs
    ? (filter === 'all' ? logs : logs.filter((l) => l.category === filter)) as LogEntry[]
    : [];

  const weekGroups = groupLogsByWeek(filteredLogs, goldWeeks);

  const totalCount = logs ? logs.length : 0;

  return (
    <div className="min-h-screen bg-[hsl(var(--gb-lightest))] p-4 pb-20 max-w-xl mx-auto">
      <header className="flex items-center gap-3 mb-4 pt-2 border-b-4 border-[hsl(var(--gb-dark))] pb-2">
        <button
          onClick={() => setLocation("/dashboard")}
          className="p-2 hover:bg-[hsl(var(--gb-light))] border-2 border-transparent hover:border-[hsl(var(--gb-dark))] transition-colors"
          data-testid="button-back"
        >
          <ArrowLeft className="w-5 h-5 text-[hsl(var(--gb-darkest))]" />
        </button>
        <div>
          <h1 className="text-lg font-bold text-[hsl(var(--gb-darkest))]" data-testid="text-title">
            LOG ARCHIVE
          </h1>
          <span className="text-[8px] text-[hsl(var(--gb-dark))] uppercase tracking-widest">
            Activity History
          </span>
        </div>
      </header>

      {showHallOfFame && (
        <HallOfFame milestones={milestones} totalMastery={totalMastery} />
      )}

      {evolutionEvents.length > 0 && (
        <EvolutionTimeline events={evolutionEvents} />
      )}

      <div className="flex flex-wrap gap-1 mb-4" data-testid="filter-bar">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-2 py-1 text-[8px] font-bold uppercase tracking-wider border-2 transition-colors ${
              filter === cat
                ? 'bg-[hsl(var(--gb-darkest))] text-[hsl(var(--gb-lightest))] border-[hsl(var(--gb-darkest))]'
                : 'bg-[hsl(var(--gb-light))] text-[hsl(var(--gb-darkest))] border-[hsl(var(--gb-dark))] hover:bg-[hsl(var(--gb-dark))]/20'
            }`}
            data-testid={`filter-${cat}`}
          >
            {CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      <main>
        {isActuallyLoading && (
          <div className="text-center py-12">
            <p className="text-xs text-[hsl(var(--gb-dark))] animate-pulse" data-testid="text-loading">
              LOADING DATA...
            </p>
          </div>
        )}

        {!isActuallyLoading && weekGroups.length === 0 && (
          <div className="text-center py-12 border-4 border-dashed border-[hsl(var(--gb-dark))]/30 p-6">
            <p className="text-xs text-[hsl(var(--gb-dark))]" data-testid="text-empty">
              {filter === 'all' ? 'NO LOGS RECORDED YET' : `NO ${CATEGORY_LABELS[filter]} LOGS FOUND`}
            </p>
            <p className="text-[8px] text-[hsl(var(--gb-dark))]/60 mt-2">
              {filter === 'all' ? 'COMPLETE ACTIVITIES TO BUILD YOUR ARCHIVE' : 'TRY A DIFFERENT FILTER'}
            </p>
          </div>
        )}

        {weekGroups.map((week, wi) => (
          <div key={week.weekStart} className="mb-6" data-testid={`week-group-${wi}`}>
            <div className="flex items-center gap-2 mb-2">
              <div className="h-[2px] flex-1 bg-[hsl(var(--gb-dark))]/30" />
              <span className="text-[9px] font-bold text-[hsl(var(--gb-darkest))] tracking-wider whitespace-nowrap flex items-center gap-1.5" data-testid={`text-week-${wi}`}>
                {week.isGoldWeek && <FalconIcon size={11} />}
                {week.weekLabel}
                {week.isGoldWeek && <FalconIcon size={11} />}
              </span>
              <div className="h-[2px] flex-1 bg-[hsl(var(--gb-dark))]/30" />
            </div>

            <div className={`border-4 bg-[hsl(var(--gb-light))] ${week.isGoldWeek ? 'border-[#B8860B]' : 'border-[hsl(var(--gb-dark))]'}`}>
              <div className={`grid grid-cols-[56px_1fr] text-[8px] font-bold text-[hsl(var(--gb-darkest))] border-b-2 px-2 py-1 ${week.isGoldWeek ? 'border-[#B8860B]/40 bg-[#B8860B]/10' : 'border-[hsl(var(--gb-dark))] bg-[hsl(var(--gb-dark))]/20'}`}>
                <span>DATE</span>
                <span className="flex items-center gap-1">
                  ACTIVITY
                  {week.isGoldWeek && <span className="text-[7px]" style={{ color: '#FFD700' }}>GOLD WEEK</span>}
                </span>
              </div>

              {week.logs.map((log, li) => {
                const dateObj = parseISO(log.date);
                const dayStr = format(dateObj, "EEE").toUpperCase();
                const dateStr = format(dateObj, "MM/dd");
                const meta = log.metadata as Record<string, unknown> | null;

                return (
                  <div
                    key={log.id}
                    className={`grid grid-cols-[56px_1fr] text-[9px] px-2 py-[6px] items-start gap-1 ${li % 2 === 0 ? 'bg-[hsl(var(--gb-light))]' : 'bg-[hsl(var(--gb-lightest))]'}`}
                    data-testid={`log-entry-${log.id}`}
                  >
                    <div className="text-[hsl(var(--gb-dark))] pt-[1px]">
                      <div className="font-bold text-[hsl(var(--gb-darkest))]">{dayStr}</div>
                      <div className="text-[7px]">{dateStr}</div>
                    </div>
                    <div>
                      <div className="flex items-center gap-1">
                        <span className="text-[8px] text-[hsl(var(--gb-dark))]">
                          {CATEGORY_ICONS[log.category] || `[${log.category.substring(0, 3).toUpperCase()}]`}
                        </span>
                        <span className="font-bold text-[hsl(var(--gb-darkest))]">
                          {CATEGORY_FULL[log.category] || log.category.toUpperCase()}
                        </span>
                        {week.isGoldWeek && <FalconIcon size={10} />}
                      </div>
                      {log.category === 'surf' && meta && (
                        <SurfDetail
                          meta={meta}
                          expanded={expandedSurfIds.has(log.id)}
                          onToggle={() => setExpandedSurfIds(prev => {
                            const next = new Set(prev);
                            if (next.has(log.id)) next.delete(log.id);
                            else next.add(log.id);
                            return next;
                          })}
                        />
                      )}
                      {log.category === 'run' && meta && <RunDetail meta={meta} />}
                    </div>
                  </div>
                );
              })}

              <div className={`border-t-2 px-2 py-1 text-[8px] text-[hsl(var(--gb-darkest))] flex justify-between flex-wrap gap-1 ${week.isGoldWeek ? 'border-[#B8860B]/40 bg-[#B8860B]/10' : 'border-[hsl(var(--gb-dark))] bg-[hsl(var(--gb-dark))]/20'}`}>
                <span>{week.logs.length} ENTRIES</span>
                <span>
                  {(['strength', 'run', 'surf', 'maint', 'breath'] as const).map(cat => {
                    const count = week.logs.filter(l => l.category === cat).length;
                    if (count === 0) return null;
                    return `${CATEGORY_ICONS[cat].replace(/[\[\]]/g, '')}:${count}`;
                  }).filter(Boolean).join(' ')}
                </span>
              </div>
            </div>
          </div>
        ))}
      </main>

      <div className="fixed bottom-0 left-0 right-0 bg-[hsl(var(--gb-darkest))] text-[hsl(var(--gb-lightest))] text-[10px] p-2 flex justify-between px-4 z-50">
        <span>ARCHIVE MODE{filter !== 'all' ? ` / ${CATEGORY_LABELS[filter]}` : ''}</span>
        <span>{totalCount} TOTAL LOG{totalCount !== 1 ? 'S' : ''}</span>
      </div>
    </div>
  );
}
