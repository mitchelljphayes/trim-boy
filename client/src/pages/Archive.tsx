import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { ArrowLeft } from "lucide-react";
import { useAllLogs } from "@/hooks/use-trim";
import { format, parseISO, startOfWeek } from "date-fns";

const CATEGORY_LABELS: Record<string, string> = {
  strength: "STRENGTH",
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

interface LogEntry {
  id: number;
  category: string;
  date: string;
  metadata?: unknown;
  createdAt: string | null;
}

interface WeekGroup {
  weekLabel: string;
  weekStart: string;
  logs: LogEntry[];
}

function groupLogsByWeek(logs: LogEntry[]): WeekGroup[] {
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
    });
  });

  return groups.sort((a, b) => b.weekStart.localeCompare(a.weekStart));
}

export default function Archive() {
  const [, setLocation] = useLocation();
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    const storedId = localStorage.getItem("trim_user_id");
    if (!storedId) {
      setLocation("/");
      return;
    }
    setUserId(parseInt(storedId));
  }, [setLocation]);

  const { data: logs, isLoading } = useAllLogs(userId);

  const weekGroups = logs ? groupLogsByWeek(logs as LogEntry[]) : [];

  return (
    <div className="min-h-screen bg-[hsl(var(--gb-lightest))] p-4 pb-20 max-w-xl mx-auto">
      <header className="flex items-center gap-3 mb-6 pt-2 border-b-4 border-[hsl(var(--gb-dark))] pb-2">
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

      <main>
        {isLoading && (
          <div className="text-center py-12">
            <p className="text-xs text-[hsl(var(--gb-dark))] animate-pulse" data-testid="text-loading">
              LOADING DATA...
            </p>
          </div>
        )}

        {!isLoading && weekGroups.length === 0 && (
          <div className="text-center py-12 border-4 border-dashed border-[hsl(var(--gb-dark))]/30 p-6">
            <p className="text-xs text-[hsl(var(--gb-dark))]" data-testid="text-empty">
              NO LOGS RECORDED YET
            </p>
            <p className="text-[8px] text-[hsl(var(--gb-dark))]/60 mt-2">
              COMPLETE ACTIVITIES TO BUILD YOUR ARCHIVE
            </p>
          </div>
        )}

        {weekGroups.map((week, wi) => (
          <div key={week.weekStart} className="mb-6" data-testid={`week-group-${wi}`}>
            <div className="flex items-center gap-2 mb-2">
              <div className="h-[2px] flex-1 bg-[hsl(var(--gb-dark))]/30" />
              <span className="text-[9px] font-bold text-[hsl(var(--gb-darkest))] tracking-wider whitespace-nowrap" data-testid={`text-week-${wi}`}>
                {week.weekLabel}
              </span>
              <div className="h-[2px] flex-1 bg-[hsl(var(--gb-dark))]/30" />
            </div>

            <div className="border-4 border-[hsl(var(--gb-dark))] bg-[hsl(var(--gb-light))]">
              <div className="grid grid-cols-[60px_1fr_auto] text-[8px] font-bold text-[hsl(var(--gb-darkest))] border-b-2 border-[hsl(var(--gb-dark))] px-2 py-1 bg-[hsl(var(--gb-medium))]">
                <span>DATE</span>
                <span>ACTIVITY</span>
                <span>INFO</span>
              </div>

              {week.logs.map((log, li) => {
                const dateObj = parseISO(log.date);
                const dayStr = format(dateObj, "EEE").toUpperCase();
                const dateStr = format(dateObj, "MM/dd");
                const meta = log.metadata as Record<string, unknown> | null;
                let infoStr = "";
                if (meta) {
                  if (meta.spot) infoStr = String(meta.spot);
                  if (meta.distance) infoStr = `${meta.distance}km`;
                  if (meta.duration) infoStr = `${meta.duration}min`;
                }

                return (
                  <div
                    key={log.id}
                    className={`grid grid-cols-[60px_1fr_auto] text-[9px] px-2 py-[6px] items-center gap-1 ${li % 2 === 0 ? 'bg-[hsl(var(--gb-light))]' : 'bg-[hsl(var(--gb-lightest))]'}`}
                    data-testid={`log-entry-${log.id}`}
                  >
                    <div className="text-[hsl(var(--gb-dark))]">
                      <span className="font-bold text-[hsl(var(--gb-darkest))]">{dayStr}</span>
                      <span className="ml-1 text-[7px]">{dateStr}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-[8px] text-[hsl(var(--gb-dark))]">
                        {CATEGORY_ICONS[log.category] || `[${log.category.substring(0, 3).toUpperCase()}]`}
                      </span>
                      <span className="font-bold text-[hsl(var(--gb-darkest))]">
                        {CATEGORY_LABELS[log.category] || log.category.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-[8px] text-[hsl(var(--gb-dark))] text-right truncate max-w-[80px]">
                      {infoStr || "-"}
                    </div>
                  </div>
                );
              })}

              <div className="border-t-2 border-[hsl(var(--gb-dark))] px-2 py-1 bg-[hsl(var(--gb-medium))] text-[8px] text-[hsl(var(--gb-darkest))] flex justify-between flex-wrap gap-1">
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
        <span>ARCHIVE MODE</span>
        <span>{weekGroups.length} WEEK{weekGroups.length !== 1 ? 'S' : ''} LOGGED</span>
      </div>
    </div>
  );
}
