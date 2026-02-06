import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import Onboarding from "@/pages/Onboarding";
import StrengthA from "@/pages/StrengthA";
import StrengthB from "@/pages/StrengthB";
import Maintenance from "@/pages/Maintenance";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Onboarding} />
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
