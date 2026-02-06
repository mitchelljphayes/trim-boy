import { useState } from "react";
import { useLocation } from "wouter";
import { useCreateUser } from "@/hooks/use-trim";
import { RetroButton } from "@/components/RetroButton";

export default function Onboarding() {
  const [name, setName] = useState("");
  const [, setLocation] = useLocation();
  const { mutate, isPending } = useCreateUser();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    mutate(name, {
      onSuccess: (user) => {
        // Save to localStorage
        localStorage.setItem("trim_user_id", user.id.toString());
        localStorage.setItem("trim_user_name", user.name);
        setLocation("/boot");
      },
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[hsl(var(--gb-lightest))]">
      <div className="w-full max-w-md">
        
        {/* Retro Header Art */}
        <div className="mb-12 text-center space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold text-[hsl(var(--gb-darkest))] text-shadow-sm mb-2">
            TRIM
          </h1>
          <div className="h-1 w-24 bg-[hsl(var(--gb-darkest))] mx-auto" />
          <p className="text-xs md:text-sm text-[hsl(var(--gb-dark))] uppercase">
            Protocol Initialization
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-[hsl(var(--gb-light))] p-8 border-4 border-[hsl(var(--gb-dark))] shadow-[8px_8px_0px_0px_hsl(var(--gb-dark))]">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label 
                htmlFor="name" 
                className="block text-xs uppercase text-[hsl(var(--gb-darkest))]"
              >
                Enter Agent Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value.toUpperCase().slice(0, 8))}
                placeholder="PLAYER 1"
                className="w-full p-4 bg-[hsl(var(--gb-lightest))] border-4 border-[hsl(var(--gb-dark))] text-[hsl(var(--gb-darkest))] font-bold outline-none focus:bg-white placeholder-[hsl(var(--gb-dark))]/50"
                autoFocus
              />
              <p className="text-[10px] text-right text-[hsl(var(--gb-dark))]">
                {name.length}/8 CHARS
              </p>
            </div>

            <RetroButton 
              type="submit" 
              disabled={isPending || name.length === 0}
              fullWidth
            >
              {isPending ? "INITIALIZING..." : "START MISSION"}
            </RetroButton>
          </form>
        </div>

        {/* Footer decoration */}
        <div className="mt-12 text-center text-[10px] text-[hsl(var(--gb-dark))]/60">
          © 1989-2025 TRIM CORP
        </div>
      </div>
    </div>
  );
}
