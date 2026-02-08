import { useState, useEffect } from "react";
import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import BootSequence from "@/pages/BootSequence";
import StrengthA from "@/pages/StrengthA";
import StrengthB from "@/pages/StrengthB";
import Maintenance from "@/pages/Maintenance";
import SurfingMenu from "@/pages/SurfingMenu";
import RunningMenu from "@/pages/RunningMenu";
import SurfWarmup from "@/pages/SurfWarmup";
import SurfCooldown from "@/pages/SurfCooldown";
import SurfLog from "@/pages/SurfLog";
import RunWarmup from "@/pages/RunWarmup";
import RunCooldown from "@/pages/RunCooldown";
import RunLog from "@/pages/RunLog";
import Breathwork from "@/pages/Breathwork";
import Recharge from "@/pages/Recharge";
import Yoga from "@/pages/Yoga";
import Archive from "@/pages/Archive";
import Backend from "@/pages/Backend";
import { LCDOverlay } from "@/components/LCDOverlay";
import { StormBackground } from "@/components/StormBackground";
import { getStreak, isGbcUnlocked } from "@/lib/streakManager";

// Root redirect - sends to login or dashboard based on auth state
function RootRedirect() {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--gb-lightest))]">
        <div className="text-2xl font-bold text-[hsl(var(--gb-darkest))]">
          LOADING...
        </div>
      </div>
    );
  }
  
  return <Redirect to={user ? "/dashboard" : "/login"} />;
}

function Router() {
  return (
    <Switch>
      {/* Public routes */}
      <Route path="/" component={RootRedirect} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      
      {/* Protected routes */}
      <Route path="/boot">
        <ProtectedRoute>
          <BootSequence />
        </ProtectedRoute>
      </Route>
      <Route path="/dashboard">
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      </Route>
      <Route path="/strength-a">
        <ProtectedRoute>
          <StrengthA />
        </ProtectedRoute>
      </Route>
      <Route path="/strength-b">
        <ProtectedRoute>
          <StrengthB />
        </ProtectedRoute>
      </Route>
      <Route path="/maintenance">
        <ProtectedRoute>
          <Maintenance />
        </ProtectedRoute>
      </Route>
      <Route path="/surfing">
        <ProtectedRoute>
          <SurfingMenu />
        </ProtectedRoute>
      </Route>
      <Route path="/surf/warmup">
        <ProtectedRoute>
          <SurfWarmup />
        </ProtectedRoute>
      </Route>
      <Route path="/surf/cooldown">
        <ProtectedRoute>
          <SurfCooldown />
        </ProtectedRoute>
      </Route>
      <Route path="/surf/log">
        <ProtectedRoute>
          <SurfLog />
        </ProtectedRoute>
      </Route>
      <Route path="/running">
        <ProtectedRoute>
          <RunningMenu />
        </ProtectedRoute>
      </Route>
      <Route path="/run/warmup">
        <ProtectedRoute>
          <RunWarmup />
        </ProtectedRoute>
      </Route>
      <Route path="/run/cooldown">
        <ProtectedRoute>
          <RunCooldown />
        </ProtectedRoute>
      </Route>
      <Route path="/run/log">
        <ProtectedRoute>
          <RunLog />
        </ProtectedRoute>
      </Route>
      <Route path="/breathwork">
        <ProtectedRoute>
          <Breathwork />
        </ProtectedRoute>
      </Route>
      <Route path="/recharge">
        <ProtectedRoute>
          <Recharge />
        </ProtectedRoute>
      </Route>
      <Route path="/yoga">
        <ProtectedRoute>
          <Yoga />
        </ProtectedRoute>
      </Route>
      <Route path="/archive">
        <ProtectedRoute>
          <Archive />
        </ProtectedRoute>
      </Route>
      <Route path="/backend">
        <ProtectedRoute>
          <Backend />
        </ProtectedRoute>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [activeTheme, setActiveTheme] = useState("classic");

  useEffect(() => {
    const root = document.getElementById("app-root");
    if (!root) return;
    let saved = localStorage.getItem("trim_hardware_theme") || "classic";
    const streak = getStreak();
    if (saved === "storm" && streak < 5) {
      saved = streak >= 2 ? "gold" : isGbcUnlocked() ? "color" : "classic";
      localStorage.setItem("trim_hardware_theme", saved);
    }
    if (saved === "gold" && streak < 2) {
      saved = isGbcUnlocked() ? "color" : "classic";
      localStorage.setItem("trim_hardware_theme", saved);
    }
    if (saved === "color" && !isGbcUnlocked()) {
      saved = "classic";
      localStorage.setItem("trim_hardware_theme", saved);
    }
    root.classList.add(`theme-${saved}`);
    setActiveTheme(saved);
  }, []);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      const root = document.getElementById("app-root");
      if (root) {
        if (root.classList.contains("theme-storm")) setActiveTheme("storm");
        else if (root.classList.contains("theme-gold")) setActiveTheme("gold");
        else if (root.classList.contains("theme-color")) setActiveTheme("color");
        else setActiveTheme("classic");
      }
    });
    const root = document.getElementById("app-root");
    if (root) observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  return (
    <div id="app-root">
      <svg className="absolute w-0 h-0" aria-hidden="true">
        <defs>
          <filter id="dmg-palette" colorInterpolationFilters="sRGB">
            <feColorMatrix type="saturate" values="0" />
            <feComponentTransfer>
              <feFuncR type="discrete" tableValues="0.059 0.188 0.545 0.608" />
              <feFuncG type="discrete" tableValues="0.220 0.384 0.675 0.737" />
              <feFuncB type="discrete" tableValues="0.059 0.188 0.059 0.059" />
            </feComponentTransfer>
          </filter>
          <filter id="gold-palette" colorInterpolationFilters="sRGB">
            <feColorMatrix type="matrix" values="
              0.6 0.3 0.1 0 0.1
              0.5 0.3 0.1 0 0.05
              0.1 0.1 0.05 0 0
              0   0   0    1 0
            " />
          </filter>
        </defs>
      </svg>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <div className="lcd-ghosting">
            <Toaster />
            <Router />
          </div>
          <LCDOverlay />
          {activeTheme === "storm" && <StormBackground />}
          {activeTheme === "gold" && (
            <span className="gold-edition-badge" data-testid="text-gold-edition">
              GOLD EDITION
            </span>
          )}
          {activeTheme === "storm" && (
            <span className="storm-edition-badge" data-testid="text-storm-edition">
              LIGHTNING EDITION
            </span>
          )}
        </QueryClientProvider>
      </AuthProvider>
    </div>
  );
}

export default App;
