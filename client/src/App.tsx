import { useState, useEffect } from "react";
import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import Onboarding from "@/pages/Onboarding";
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
import { LCDOverlay } from "@/components/LCDOverlay";
import { getStreak } from "@/lib/streakManager";

function Router() {
  const [userName] = useState(() => localStorage.getItem("trim_user_name"));

  return (
    <Switch>
      <Route path="/">
        {() => (userName ? <Redirect to="/boot" /> : <Onboarding />)}
      </Route>
      <Route path="/boot" component={BootSequence} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/strength-a" component={StrengthA} />
      <Route path="/strength-b" component={StrengthB} />
      <Route path="/maintenance" component={Maintenance} />
      <Route path="/surfing" component={SurfingMenu} />
      <Route path="/surf/warmup" component={SurfWarmup} />
      <Route path="/surf/cooldown" component={SurfCooldown} />
      <Route path="/surf/log" component={SurfLog} />
      <Route path="/running" component={RunningMenu} />
      <Route path="/run/warmup" component={RunWarmup} />
      <Route path="/run/cooldown" component={RunCooldown} />
      <Route path="/run/log" component={RunLog} />
      <Route path="/breathwork" component={Breathwork} />
      <Route path="/recharge" component={Recharge} />
      <Route path="/yoga" component={Yoga} />
      <Route path="/archive" component={Archive} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [isGold, setIsGold] = useState(false);

  useEffect(() => {
    const root = document.getElementById("app-root");
    if (!root) return;
    let saved = localStorage.getItem("trim_hardware_theme") || "classic";
    if (saved === "gold" && getStreak() < 2) {
      saved = "classic";
      localStorage.setItem("trim_hardware_theme", saved);
    }
    root.classList.add(`theme-${saved}`);
    setIsGold(saved === "gold");
  }, []);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      const root = document.getElementById("app-root");
      if (root) setIsGold(root.classList.contains("theme-gold"));
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
      <QueryClientProvider client={queryClient}>
        <div className="lcd-ghosting">
          <Toaster />
          <Router />
        </div>
        <LCDOverlay />
        {isGold && (
          <span className="gold-edition-badge" data-testid="text-gold-edition">
            GOLD EDITION
          </span>
        )}
      </QueryClientProvider>
    </div>
  );
}

export default App;
