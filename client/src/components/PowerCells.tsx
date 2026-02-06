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
      <div className="flex flex-col gap-4">
        
        {/* Strength Section */}
        <div className="flex justify-between items-center">
          <span className="text-[10px] uppercase font-bold">STR</span>
          <div className="flex gap-1.5">
            {renderCells(strengthCount, 4, <Zap size={16} fill="currentColor" />)}
          </div>
        </div>

        <div className="h-0.5 w-full bg-[hsl(var(--gb-dark))]/10 border-t-2 border-dotted border-[hsl(var(--gb-dark))]/20" />

        {/* Run Section */}
        <div className="flex justify-between items-center">
          <span className="text-[10px] uppercase font-bold">RUN</span>
          <div className="flex gap-1.5">
            {renderCells(runCount, 2, <Activity size={16} />)}
          </div>
        </div>

      </div>
    </div>
  );
}
