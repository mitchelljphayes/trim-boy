import { useState, useEffect } from "react";
import { getStreak, isGbcUnlocked } from "@/lib/streakManager";

type HardwareTheme = "classic" | "color" | "gold" | "storm";

function DMGIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <rect x="3" y="1" width="14" height="18" rx="1" fill="currentColor" opacity="0.15" stroke="currentColor" strokeWidth="1.5" />
      <rect x="5" y="3" width="10" height="7" fill="currentColor" opacity="0.3" stroke="currentColor" strokeWidth="1" />
      <line x1="5" y1="6.5" x2="15" y2="6.5" stroke="currentColor" strokeWidth="0.5" opacity="0.2" />
      <circle cx="12" cy="14" r="1.5" fill="currentColor" />
      <rect x="7" y="13" width="3" height="1" fill="currentColor" rx="0.5" />
      <rect x="8" y="12" width="1" height="3" fill="currentColor" rx="0.5" />
    </svg>
  );
}

function GBCIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <rect x="2" y="1" width="16" height="18" rx="1" fill="currentColor" opacity="0.15" stroke="currentColor" strokeWidth="1.5" />
      <rect x="4" y="3" width="12" height="7" rx="0.5" stroke="currentColor" strokeWidth="1" fill="none" />
      <rect x="5" y="4" width="10" height="5" fill="currentColor" opacity="0.3" />
      <rect x="5.5" y="4.5" width="3" height="1.5" fill="hsl(207, 53%, 52%)" rx="0.3" />
      <rect x="9" y="4.5" width="3" height="1.5" fill="hsl(355, 82%, 47%)" rx="0.3" />
      <rect x="5.5" y="6.5" width="3" height="1.5" fill="hsl(120, 50%, 40%)" rx="0.3" />
      <rect x="9" y="6.5" width="3" height="1.5" fill="hsl(45, 90%, 50%)" rx="0.3" />
      <circle cx="13" cy="14" r="1.5" fill="currentColor" />
      <rect x="6" y="13" width="3" height="1" fill="currentColor" rx="0.5" />
      <rect x="7" y="12" width="1" height="3" fill="currentColor" rx="0.5" />
    </svg>
  );
}

function GoldIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <rect x="3" y="1" width="14" height="18" rx="1" fill="#B8860B" opacity="0.3" stroke="#FFD700" strokeWidth="1.5" />
      <rect x="5" y="3" width="10" height="7" fill="#FFD700" opacity="0.25" stroke="#FFD700" strokeWidth="1" />
      <line x1="5" y1="6.5" x2="15" y2="6.5" stroke="#FFD700" strokeWidth="0.5" opacity="0.4" />
      <circle cx="12" cy="14" r="1.5" fill="#FFD700" />
      <rect x="7" y="13" width="3" height="1" fill="#FFD700" rx="0.5" />
      <rect x="8" y="12" width="1" height="3" fill="#FFD700" rx="0.5" />
    </svg>
  );
}

function StormIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <rect x="3" y="1" width="14" height="18" rx="1" fill="#1a0633" opacity="0.5" stroke="#00f2ff" strokeWidth="1.5" />
      <rect x="5" y="3" width="10" height="7" fill="#1a0633" opacity="0.4" stroke="#00f2ff" strokeWidth="1" />
      <path d="M10 4L8.5 7.5H11L9 10" stroke="#00f2ff" strokeWidth="1.5" fill="none" />
      <circle cx="12" cy="14" r="1.5" fill="#00f2ff" />
      <rect x="7" y="13" width="3" height="1" fill="#9d00ff" rx="0.5" />
      <rect x="8" y="12" width="1" height="3" fill="#9d00ff" rx="0.5" />
    </svg>
  );
}

const ALL_THEMES: HardwareTheme[] = ["classic", "color", "gold", "storm"];

export function HardwareToggle() {
  const [theme, setTheme] = useState<HardwareTheme>(() => {
    return (localStorage.getItem("trim_hardware_theme") as HardwareTheme) || "classic";
  });
  const [gbcAvailable, setGbcAvailable] = useState(() => isGbcUnlocked());
  const [goldUnlocked, setGoldUnlocked] = useState(() => getStreak() >= 2);
  const [stormUnlocked, setStormUnlocked] = useState(() => getStreak() >= 5);

  useEffect(() => {
    const handler = () => {
      const streak = getStreak();
      const goldOk = streak >= 2;
      const stormOk = streak >= 5;
      const gbcOk = isGbcUnlocked();
      setGoldUnlocked(goldOk);
      setStormUnlocked(stormOk);
      setGbcAvailable(gbcOk);
      if (!stormOk) {
        setTheme(prev => prev === "storm" ? (goldOk ? "gold" : gbcOk ? "color" : "classic") : prev);
      }
      if (!goldOk) {
        setTheme(prev => prev === "gold" ? (gbcOk ? "color" : "classic") : prev);
      }
    };
    window.addEventListener('streak-update', handler);
    return () => window.removeEventListener('streak-update', handler);
  }, []);

  useEffect(() => {
    const root = document.getElementById("app-root");
    if (!root) return;
    root.classList.remove("theme-classic", "theme-color", "theme-gold", "theme-storm");
    root.classList.add(`theme-${theme}`);
    localStorage.setItem("trim_hardware_theme", theme);
  }, [theme]);

  const toggle = () => {
    setTheme((prev) => {
      let available = ALL_THEMES.filter(t => {
        if (t === "storm" && !stormUnlocked) return false;
        if (t === "gold" && !goldUnlocked) return false;
        if (t === "color" && !gbcAvailable) return false;
        return true;
      });
      if (available.length === 0) available = ["classic"];
      const idx = available.indexOf(prev);
      return available[(idx + 1) % available.length];
    });
  };

  const labels: Record<HardwareTheme, string> = {
    classic: "DMG",
    color: "GBC",
    gold: "GOLD",
    storm: "STORM",
  };

  const titles: Record<HardwareTheme, string> = {
    classic: "Switch to GBC Mode",
    color: goldUnlocked ? "Switch to Gold Edition" : "Switch to DMG Mode",
    gold: stormUnlocked ? "Switch to Lightning Edition" : "Switch to DMG Mode",
    storm: "Switch to DMG Mode",
  };

  return (
    <button
      onClick={toggle}
      className="p-2 hover:bg-[hsl(var(--gb-light))] border-2 border-transparent hover:border-[hsl(var(--gb-dark))] transition-colors flex items-center gap-1"
      title={titles[theme]}
      data-testid="button-theme-toggle"
    >
      {theme === "classic" && <DMGIcon size={22} />}
      {theme === "color" && <GBCIcon size={22} />}
      {theme === "gold" && <GoldIcon size={22} />}
      {theme === "storm" && <StormIcon size={22} />}
      <span className={`text-[6px] uppercase tracking-wider ${
        theme === "gold" ? "text-[#FFD700]" :
        theme === "storm" ? "text-[#00f2ff]" :
        "text-[hsl(var(--gb-darkest))]"
      }`}>
        {labels[theme]}
      </span>
    </button>
  );
}
