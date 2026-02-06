import { cn } from "@/lib/utils";
import { Zap, Activity } from "lucide-react";

interface PowerCellsProps {
  strengthCount: number; // Max 2
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
            "w-10 h-10 md:w-12 md:h-12 border-4 border-[hsl(var(--gb-dark))] flex items-center justify-center transition-all duration-300",
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
      <div className="flex justify-between items-center gap-4">
        
        {/* Strength Section */}
        <div className="flex flex-col items-center gap-2">
          <span className="text-[10px] uppercase">STR</span>
          <div className="flex gap-2">
            {renderCells(strengthCount, 2, <Zap size={20} fill="currentColor" />)}
          </div>
        </div>

        <div className="h-10 w-1 bg-[hsl(var(--gb-dark))]/20" />

        {/* Run Section */}
        <div className="flex flex-col items-center gap-2">
          <span className="text-[10px] uppercase">RUN</span>
          <div className="flex gap-2">
            {renderCells(runCount, 2, <Activity size={20} />)}
          </div>
        </div>

      </div>
    </div>
  );
}
