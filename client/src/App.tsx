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
  useEffect(() => {
    const root = document.getElementById("app-root");
    if (!root) return;
    const saved = localStorage.getItem("trim_hardware_theme") || "classic";
    root.classList.add(saved === "color" ? "theme-color" : "theme-classic");
  }, []);

  return (
    <div id="app-root">
      <QueryClientProvider client={queryClient}>
        <Toaster />
        <Router />
      </QueryClientProvider>
    </div>
  );
}

export default App;
