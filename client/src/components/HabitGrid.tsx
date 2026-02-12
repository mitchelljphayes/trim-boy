import { useState } from "react";
import { cn } from "@/lib/utils";
import { Minus, Plus } from "lucide-react";

interface HabitGridProps {
  habits: {
    date: string;
    strength: boolean;
    run: boolean;
    yoga: boolean;
    surf: boolean;
    maint: boolean;
    breath: boolean;
  }[];
}

export function HabitGrid({ habits }: HabitGridProps) {
  const [collapsed, setCollapsed] = useState(() =>
    localStorage.getItem("trim_habits_collapsed") === "true"
  );

  const toggle = () => {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem("trim_habits_collapsed", String(next));
  };

  const days = ["M", "T", "W", "T", "F", "S", "S"];
  const categories = [
    { key: "strength", label: "STRN" },
    { key: "run", label: "RUN" },
    { key: "yoga", label: "YOGA" },
    { key: "surf", label: "SURF" },
    { key: "maint", label: "MANT" },
    { key: "breath", label: "BRTH" },
  ] as const;

  return (
    <div className="w-full bg-[hsl(var(--gb-light))] border-4 border-[hsl(var(--gb-dark))] shadow-[4px_4px_0px_0px_hsl(var(--gb-dark))] mb-6">
      <button
        onClick={toggle}
        className="w-full flex items-center justify-between p-4 pb-2 text-left"
        data-testid="button-toggle-habits"
      >
        <h3 className="text-xs text-[hsl(var(--gb-darkest))] uppercase tracking-widest">Habit Matrix</h3>
        <div className="w-5 h-5 border-2 border-[hsl(var(--gb-dark))] bg-[hsl(var(--gb-lightest))] flex items-center justify-center">
          {collapsed ? (
            <Plus size={12} className="text-[hsl(var(--gb-darkest))]" />
          ) : (
            <Minus size={12} className="text-[hsl(var(--gb-darkest))]" />
          )}
        </div>
      </button>

      {!collapsed && (
        <div className="grid grid-cols-[auto_repeat(7,1fr)] gap-2 md:gap-4 px-4 pb-4">
          <div className="w-12"></div>
          {days.map((day, i) => (
            <div key={`day-${i}`} className="text-center text-[10px] font-bold text-[hsl(var(--gb-dark))]">
              {day}
            </div>
          ))}

          {categories.map((cat) => (
            <div key={cat.key} className="contents">
              <div className="flex items-center text-[10px] font-bold text-[hsl(var(--gb-darkest))]">
                {cat.label}
              </div>
              {Array.from({ length: 7 }).map((_, dayIndex) => {
                const dayData = habits[dayIndex]; 
                const isDone = dayData ? dayData[cat.key as keyof typeof dayData] : false;

                return (
                  <div
                    key={`${cat.key}-${dayIndex}`}
                    className={cn(
                      "aspect-square border-2 border-[hsl(var(--gb-dark))] transition-all duration-300",
                      isDone 
                        ? "bg-[hsl(var(--gb-darkest))]" 
                        : "bg-transparent"
                    )}
                  />
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
