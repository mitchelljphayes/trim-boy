import { useState, useEffect, useCallback, useRef } from "react";
import { RetroButton } from "@/components/RetroButton";
import { ArrowLeft, Lock } from "lucide-react";
import { useLocation } from "wouter";

type HardwareTheme = "classic" | "color" | "gold" | "storm";

const THEMES: { key: HardwareTheme; label: string; description: string }[] = [
  { key: "classic", label: "DMG", description: "ORIGINAL GAME BOY" },
  { key: "color", label: "GBC", description: "GAME BOY COLOR" },
  { key: "gold", label: "GOLD", description: "GOLD EDITION" },
  { key: "storm", label: "STORM", description: "LIGHTNING EDITION" },
];

const PALETTE_KEYS = [
  { key: "--gb-lightest", label: "LIGHTEST" },
  { key: "--gb-light", label: "LIGHT" },
  { key: "--gb-dark", label: "DARK" },
  { key: "--gb-darkest", label: "DARKEST" },
];

const SEMANTIC_KEYS = [
  { key: "--background", label: "BG" },
  { key: "--foreground", label: "FG" },
  { key: "--card", label: "CARD" },
  { key: "--card-foreground", label: "CARD-FG" },
  { key: "--border", label: "BORDER" },
  { key: "--primary", label: "PRIMARY" },
  { key: "--primary-foreground", label: "PRIMARY-FG" },
];

function resolveHSL(varName: string): string {
  const root = document.getElementById("app-root");
  if (!root) return "transparent";
  const raw = getComputedStyle(root).getPropertyValue(varName).trim();
  if (!raw) return "transparent";
  return `hsl(${raw})`;
}

function PasswordGate({ onUnlock }: { onUnlock: () => void }) {
  const [pw, setPw] = useState("");
  const [error, setError] = useState(false);

  const submit = () => {
    if (pw === "TrimBoy") {
      onUnlock();
    } else {
      setError(true);
      setTimeout(() => setError(false), 1500);
    }
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--gb-lightest))] flex items-center justify-center p-4">
      <div className="text-center max-w-xs w-full">
        <Lock className="mx-auto mb-4 text-[hsl(var(--gb-darkest))]" size={32} />
        <p className="text-[10px] text-[hsl(var(--gb-darkest))] font-bold uppercase tracking-wider mb-6">
          BACKEND ACCESS
        </p>
        <input
          type="password"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="PASSWORD"
          className="w-full border-4 border-[hsl(var(--gb-dark))] bg-[hsl(var(--gb-light))] text-[hsl(var(--gb-darkest))] text-center text-xs p-3 uppercase tracking-wider mb-4 outline-none placeholder:text-[hsl(var(--gb-dark))]/50"
          autoFocus
          data-testid="input-backend-password"
        />
        {error && (
          <p className="text-[8px] text-[hsl(var(--gb-darkest))] mb-4 animate-pulse" data-testid="text-password-error">
            ACCESS DENIED
          </p>
        )}
        <RetroButton onClick={submit} fullWidth data-testid="button-backend-submit">
          ENTER
        </RetroButton>
      </div>
    </div>
  );
}

export default function Backend() {
  const [, setLocation] = useLocation();
  const [authenticated, setAuthenticated] = useState(false);
  const [activeTheme, setActiveTheme] = useState<HardwareTheme>("classic");
  const [colors, setColors] = useState<Record<string, string>>({});
  const originalThemeRef = useRef<string | null>(null);

  const applyTheme = useCallback((theme: HardwareTheme) => {
    const root = document.getElementById("app-root");
    if (!root) return;
    root.classList.remove("theme-classic", "theme-color", "theme-gold", "theme-storm");
    root.classList.add(`theme-${theme}`);
    setActiveTheme(theme);

    requestAnimationFrame(() => {
      const resolved: Record<string, string> = {};
      [...PALETTE_KEYS, ...SEMANTIC_KEYS].forEach(({ key }) => {
        resolved[key] = resolveHSL(key);
      });
      setColors(resolved);
    });
  }, []);

  useEffect(() => {
    if (authenticated) {
      originalThemeRef.current = localStorage.getItem("trim_hardware_theme") || "classic";
      applyTheme((originalThemeRef.current as HardwareTheme) || "classic");
    }
  }, [authenticated, applyTheme]);

  useEffect(() => {
    return () => {
      if (originalThemeRef.current) {
        const root = document.getElementById("app-root");
        if (root) {
          root.classList.remove("theme-classic", "theme-color", "theme-gold", "theme-storm");
          root.classList.add(`theme-${originalThemeRef.current}`);
        }
      }
    };
  }, []);

  if (!authenticated) {
    return <PasswordGate onUnlock={() => setAuthenticated(true)} />;
  }

  return (
    <div className="min-h-screen bg-[hsl(var(--gb-lightest))] p-4 pb-20">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setLocation("/dashboard")}
            className="flex items-center gap-1 text-[hsl(var(--gb-dark))] text-xs"
            data-testid="button-backend-back"
          >
            <ArrowLeft size={14} /> BACK
          </button>
          <p className="text-[10px] text-[hsl(var(--gb-darkest))] font-bold uppercase tracking-wider" data-testid="text-backend-title">
            BACKEND
          </p>
          <div className="w-12" />
        </div>

        <div className="mb-8">
          <p className="text-[8px] text-[hsl(var(--gb-dark))] uppercase tracking-widest mb-3">
            ACTIVE THEME
          </p>
          <div className="grid grid-cols-4 gap-2" data-testid="theme-switcher">
            {THEMES.map((t) => (
              <button
                key={t.key}
                onClick={() => applyTheme(t.key)}
                className={`border-4 p-2 text-center transition-all ${
                  activeTheme === t.key
                    ? "border-[hsl(var(--gb-darkest))] bg-[hsl(var(--gb-light))]"
                    : "border-[hsl(var(--gb-dark))]/30 bg-transparent"
                }`}
                data-testid={`button-theme-${t.key}`}
              >
                <span className="block text-[8px] text-[hsl(var(--gb-darkest))] font-bold">
                  {t.label}
                </span>
              </button>
            ))}
          </div>
          <p className="text-center text-[8px] text-[hsl(var(--gb-dark))] mt-2" data-testid="text-active-theme">
            {THEMES.find((t) => t.key === activeTheme)?.description}
          </p>
        </div>

        <div className="mb-8">
          <p className="text-[8px] text-[hsl(var(--gb-dark))] uppercase tracking-widest mb-3">
            HARDWARE PALETTE
          </p>
          <div className="border-4 border-[hsl(var(--gb-dark))] bg-[hsl(var(--gb-light))]/30 p-3">
            <div className="grid grid-cols-4 gap-2 mb-2">
              {PALETTE_KEYS.map(({ key, label }) => (
                <div key={key} className="text-center" data-testid={`swatch-${label.toLowerCase()}`}>
                  <div
                    className="w-full aspect-square border-2 border-[hsl(var(--gb-dark))] mb-1"
                    style={{ backgroundColor: colors[key] || "transparent" }}
                  />
                  <span className="text-[6px] text-[hsl(var(--gb-darkest))] tracking-wider">
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mb-8">
          <p className="text-[8px] text-[hsl(var(--gb-dark))] uppercase tracking-widest mb-3">
            SEMANTIC TOKENS
          </p>
          <div className="border-4 border-[hsl(var(--gb-dark))] bg-[hsl(var(--gb-light))]/30 p-3 space-y-2">
            {SEMANTIC_KEYS.map(({ key, label }) => (
              <div key={key} className="flex items-center gap-2" data-testid={`token-${label.toLowerCase()}`}>
                <div
                  className="w-6 h-6 border-2 border-[hsl(var(--gb-dark))] flex-shrink-0"
                  style={{ backgroundColor: colors[key] || "transparent" }}
                />
                <span className="text-[7px] text-[hsl(var(--gb-darkest))] tracking-wider flex-1">
                  {label}
                </span>
                <span className="text-[6px] text-[hsl(var(--gb-dark))] font-mono">
                  {colors[key] || "—"}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <p className="text-[8px] text-[hsl(var(--gb-dark))] uppercase tracking-widest mb-3">
            UI ELEMENTS PREVIEW
          </p>
          <div className="border-4 border-[hsl(var(--gb-dark))] bg-[hsl(var(--gb-light))]/30 p-3 space-y-4">
            <div>
              <p className="text-[7px] text-[hsl(var(--gb-dark))] uppercase mb-2">BUTTONS</p>
              <div className="flex gap-2">
                <RetroButton data-testid="preview-button-primary">PRIMARY</RetroButton>
                <RetroButton variant="secondary" data-testid="preview-button-secondary">SECONDARY</RetroButton>
              </div>
            </div>

            <div>
              <p className="text-[7px] text-[hsl(var(--gb-dark))] uppercase mb-2">TEXT HIERARCHY</p>
              <p className="text-[11px] text-[hsl(var(--gb-darkest))] font-bold" data-testid="preview-text-title">
                TITLE TEXT
              </p>
              <p className="text-[9px] text-[hsl(var(--gb-darkest))]" data-testid="preview-text-body">
                BODY TEXT — THE QUICK BROWN FOX
              </p>
              <p className="text-[8px] text-[hsl(var(--gb-dark))]" data-testid="preview-text-secondary">
                SECONDARY TEXT — SUPPORTING INFO
              </p>
              <p className="text-[7px] text-[hsl(var(--gb-dark))]/60" data-testid="preview-text-tertiary">
                TERTIARY — MUTED DETAILS
              </p>
            </div>

            <div>
              <p className="text-[7px] text-[hsl(var(--gb-dark))] uppercase mb-2">CARD</p>
              <div
                className="border-4 border-[hsl(var(--gb-dark))] bg-[hsl(var(--gb-light))] p-3"
                data-testid="preview-card"
              >
                <p className="text-[9px] text-[hsl(var(--gb-darkest))] font-bold">CARD HEADING</p>
                <p className="text-[8px] text-[hsl(var(--gb-dark))]">Card content text</p>
              </div>
            </div>

            <div>
              <p className="text-[7px] text-[hsl(var(--gb-dark))] uppercase mb-2">INPUT</p>
              <input
                className="w-full border-4 border-[hsl(var(--gb-dark))] bg-[hsl(var(--gb-light))] text-[hsl(var(--gb-darkest))] text-xs p-2 uppercase tracking-wider outline-none"
                placeholder="SAMPLE INPUT"
                readOnly
                data-testid="preview-input"
              />
            </div>

            <div>
              <p className="text-[7px] text-[hsl(var(--gb-dark))] uppercase mb-2">POWER CELLS</p>
              <div className="flex gap-1" data-testid="preview-power-cells">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className={`w-8 h-5 border-2 border-[hsl(var(--gb-darkest))] ${
                      i <= 2 ? "bg-[hsl(var(--gb-darkest))]" : "bg-transparent"
                    }`}
                  />
                ))}
              </div>
            </div>

            <div>
              <p className="text-[7px] text-[hsl(var(--gb-dark))] uppercase mb-2">HABIT GRID</p>
              <div className="flex gap-1" data-testid="preview-habit-grid">
                {["M", "T", "W", "T", "F", "S", "S"].map((day, i) => (
                  <div key={i} className="text-center">
                    <span className="text-[6px] text-[hsl(var(--gb-dark))] block mb-1">{day}</span>
                    <div
                      className={`w-5 h-5 border-2 border-[hsl(var(--gb-dark))] ${
                        i < 3 ? "bg-[hsl(var(--gb-darkest))]" : "bg-transparent"
                      }`}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[7px] text-[hsl(var(--gb-dark))] uppercase mb-2">STATUS BAR</p>
              <div
                className="bg-[hsl(var(--gb-darkest))] text-[hsl(var(--gb-lightest))] text-[8px] p-2 flex justify-between"
                data-testid="preview-status-bar"
              >
                <span>STATUS: ONLINE</span>
                <span>BATTERY: 100%</span>
              </div>
            </div>

            <div>
              <p className="text-[7px] text-[hsl(var(--gb-dark))] uppercase mb-2">NOTIFICATION COLORS</p>
              <div className="space-y-1" data-testid="preview-notifications">
                <div className="bg-[hsl(var(--gb-darkest))] text-[hsl(var(--gb-lightest))] text-[8px] p-2 text-center">
                  STANDARD NOTIFICATION
                </div>
                <div className="bg-[hsl(var(--gb-dark))] text-[hsl(var(--gb-lightest))] text-[8px] p-2 text-center">
                  SECONDARY NOTIFICATION
                </div>
              </div>
            </div>

            <div>
              <p className="text-[7px] text-[hsl(var(--gb-dark))] uppercase mb-2">TIMER DISPLAY</p>
              <div
                className="border-4 border-[hsl(var(--gb-dark))] bg-[hsl(var(--gb-lightest))] p-4 text-center"
                data-testid="preview-timer"
              >
                <p className="text-[8px] text-[hsl(var(--gb-dark))] uppercase mb-1">EXERCISE NAME</p>
                <p className="text-[28px] text-[hsl(var(--gb-darkest))] font-bold leading-none">45</p>
                <p className="text-[7px] text-[hsl(var(--gb-dark))] mt-1">ROUND 1/3</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <p className="text-[8px] text-[hsl(var(--gb-dark))] uppercase tracking-widest mb-3">
            ALL THEMES SIDE BY SIDE
          </p>
          <div className="space-y-3">
            {THEMES.map((t) => {
              const themeColors = getStaticThemeColors(t.key);
              return (
                <div key={t.key} className="border-4 border-[hsl(var(--gb-dark))]/30 p-2">
                  <p className="text-[8px] text-[hsl(var(--gb-darkest))] font-bold mb-2">
                    {t.label} — {t.description}
                  </p>
                  <div className="flex gap-1">
                    {themeColors.map((c, i) => (
                      <div key={i} className="flex-1 text-center">
                        <div
                          className="w-full aspect-square border border-[hsl(var(--gb-dark))]/30 mb-1"
                          style={{ backgroundColor: c.color }}
                        />
                        <span className="text-[5px] text-[hsl(var(--gb-dark))]">{c.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function getStaticThemeColors(theme: HardwareTheme): { label: string; color: string }[] {
  const palettes: Record<HardwareTheme, { label: string; color: string }[]> = {
    classic: [
      { label: "LIGHTEST", color: "#9bbc0f" },
      { label: "LIGHT", color: "#8bac0f" },
      { label: "DARK", color: "#306230" },
      { label: "DARKEST", color: "#0f380f" },
    ],
    color: [
      { label: "LIGHTEST", color: "#b0e0c8" },
      { label: "LIGHT", color: "#68b898" },
      { label: "DARK", color: "#267050" },
      { label: "DARKEST", color: "#0d2818" },
    ],
    gold: [
      { label: "LIGHTEST", color: "#2A2510" },
      { label: "LIGHT", color: "#665520" },
      { label: "DARK", color: "#B8860B" },
      { label: "DARKEST", color: "#FFD700" },
    ],
    storm: [
      { label: "LIGHTEST", color: "#1a0633" },
      { label: "LIGHT", color: "#2d1659" },
      { label: "DARK", color: "#00f2ff" },
      { label: "DARKEST", color: "#f2f2f2" },
    ],
  };
  return palettes[theme];
}
