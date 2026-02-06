import { cn } from "@/lib/utils";

interface HabitGridProps {
  habits: {
    date: string;
    surf: boolean;
    maint: boolean;
    breath: boolean;
  }[];
}

export function HabitGrid({ habits }: HabitGridProps) {
  const days = ["M", "T", "W", "T", "F", "S", "S"];
  const categories = [
    { key: "surf", label: "SURF" },
    { key: "maint", label: "MAINT" },
    { key: "breath", label: "BRTH" },
  ] as const;

  return (
    <div className="w-full bg-[hsl(var(--gb-light))] p-4 border-4 border-[hsl(var(--gb-dark))] shadow-[4px_4px_0px_0px_hsl(var(--gb-dark))] mb-6">
      <h3 className="text-xs mb-4 text-[hsl(var(--gb-darkest))] uppercase tracking-widest">Habit Matrix</h3>
      
      <div className="grid grid-cols-[auto_repeat(7,1fr)] gap-2 md:gap-4">
        {/* Header Row */}
        <div className="w-12"></div> {/* Spacer for labels */}
        {days.map((day, i) => (
          <div key={i} className="text-center text-[10px] font-bold text-[hsl(var(--gb-dark))]">
            {day}
          </div>
        ))}

        {/* Rows */}
        {categories.map((cat) => (
          <>
            <div className="flex items-center text-[10px] font-bold text-[hsl(var(--gb-darkest))]">
              {cat.label}
            </div>
            {Array.from({ length: 7 }).map((_, dayIndex) => {
              // Get data for this day index (0 = Monday, etc.)
              // The API returns habits array sorted by date, assuming Monday start
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
          </>
        ))}
      </div>
    </div>
  );
}
