import { useState } from "react";
import { cn } from "@/lib/utils";
import { Zap, Activity, Minus, Plus } from "lucide-react";

interface PowerCellsProps {
  strengthCount: number; // Max 4
  runCount: number;      // Max 2
}

export function PowerCells({ strengthCount, runCount }: PowerCellsProps) {
  const [collapsed, setCollapsed] = useState(() =>
    localStorage.getItem("trim_mission_collapsed") === "true"
  );

  const toggle = () => {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem("trim_mission_collapsed", String(next));
  };

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
    <div className="w-full bg-[hsl(var(--gb-light))] border-4 border-[hsl(var(--gb-dark))] shadow-[4px_4px_0px_0px_hsl(var(--gb-dark))] mb-6">
      <button
        onClick={toggle}
        className="w-full flex items-center justify-between p-4 pb-2 text-left"
        data-testid="button-toggle-mission"
      >
        <h3 className="text-xs text-[hsl(var(--gb-darkest))] uppercase tracking-widest">Weekly Mission</h3>
        <div className="w-5 h-5 border-2 border-[hsl(var(--gb-dark))] bg-[hsl(var(--gb-lightest))] flex items-center justify-center">
          {collapsed ? (
            <Plus size={12} className="text-[hsl(var(--gb-darkest))]" />
          ) : (
            <Minus size={12} className="text-[hsl(var(--gb-darkest))]" />
          )}
        </div>
      </button>

      {!collapsed && (
        <div className="flex flex-col gap-2 px-4 pb-4">
          <div className="flex justify-between items-center gap-1">
            <div className="flex gap-1">
              {renderCells(strengthCount, 4, <Zap size={14} fill="currentColor" />)}
            </div>
            <div className="flex gap-1">
              {renderCells(runCount, 2, <Activity size={14} />)}
            </div>
          </div>

          <div className="flex justify-between items-center px-0.5 text-[9px] font-bold uppercase text-[hsl(var(--gb-dark))] tracking-tighter">
            <div className="flex gap-1 w-[124px] justify-center">
              <span>STR</span>
            </div>
            <div className="flex gap-1 w-[60px] justify-center">
              <span>RUN</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
