import { cn } from "@/lib/utils";
import { Zap, Activity } from "lucide-react";

interface PowerCellsProps {
  strengthCount: number; // Max 4
  runCount: number;      // Max 2
}

export function PowerCells({ strengthCount, runCount }: PowerCellsProps) {
  // Helper to render cells
  const renderCells = (count: number, max: number, icon: React.ReactNode) => {
    return Array.from({ length: max }).map((_, i) => {
      const isFilled = i < count;
      return (
        <div
          key={i}
          className={cn(
            "w-8 h-8 md:w-10 md:h-10 border-4 border-[hsl(var(--gb-dark))] flex items-center justify-center transition-all duration-300",
            isFilled ? "bg-[hsl(var(--gb-darkest))]" : "bg-[hsl(var(--gb-lightest))]"
          )}
        >
          <div className={cn(
            "transform transition-transform",
            isFilled ? "text-[hsl(var(--gb-lightest))]" : "text-[hsl(var(--gb-dark))]"
          )}>
            {icon}
          </div>
        </div>
      );
    });
  };

  return (
    <div className="w-full bg-[hsl(var(--gb-light))] p-4 border-4 border-[hsl(var(--gb-dark))] shadow-[4px_4px_0px_0px_hsl(var(--gb-dark))] mb-6">
      <h3 className="text-xs mb-3 text-[hsl(var(--gb-darkest))] uppercase tracking-widest">Weekly Mission</h3>
      
      <div className="flex flex-col gap-2">
        {/* All Cells in one line */}
        <div className="flex justify-between items-center gap-1">
          <div className="flex gap-1">
            {renderCells(strengthCount, 4, <Zap size={14} fill="currentColor" />)}
          </div>
          <div className="flex gap-1">
            {renderCells(runCount, 2, <Activity size={14} />)}
          </div>
        </div>

        {/* Labels below */}
        <div className="flex justify-between items-center px-0.5 text-[9px] font-bold uppercase text-[hsl(var(--gb-dark))] tracking-tighter">
          <div className="flex gap-1 w-[124px] justify-center">
            <span>STR</span>
          </div>
          <div className="flex gap-1 w-[60px] justify-center">
            <span>RUN</span>
          </div>
        </div>
      </div>
    </div>
  );
}
