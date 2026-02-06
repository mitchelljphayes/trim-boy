import { useState } from "react";
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
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster />
      <Router />
    </QueryClientProvider>
  );
}

export default App;
