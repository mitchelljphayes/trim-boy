import React from "react";
import { cn } from "@/lib/utils";

interface RetroButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
  fullWidth?: boolean;
}

export function RetroButton({ 
  children, 
  className, 
  variant = "primary", 
  fullWidth = false,
  ...props 
}: RetroButtonProps) {
  return (
    <button
      className={cn(
        "relative py-3 px-4 font-bold uppercase transition-all active:translate-y-1 active:shadow-none",
        "border-4 border-[hsl(var(--gb-dark))] bg-[hsl(var(--gb-light))] text-[hsl(var(--gb-darkest))]",
        "shadow-[4px_4px_0px_0px_hsl(var(--gb-dark))]",
        "hover:bg-[hsl(var(--gb-lightest))]",
        fullWidth && "w-full",
        className
      )}
      {...props}
    >
      <div className="flex items-center justify-between">
        {children}
        <div className="ml-2 w-2 h-2 bg-[hsl(var(--gb-darkest))]" />
      </div>
    </button>
  );
}
