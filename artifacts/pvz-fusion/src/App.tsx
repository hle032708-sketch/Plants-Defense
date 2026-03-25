import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { queryClient } from "@/lib/queryClient";

import { MouseGlow } from "./components/MouseGlow";
import { Navigation } from "./components/Navigation";
import { Sidebar } from "./components/Sidebar";
import { Footer } from "./components/Footer";

import Home from "./pages/Home";
import Mods from "./pages/Mods";
import FusionDex from "./pages/FusionDex";
import Videos from "./pages/Videos";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Admin from "./pages/Admin";
import CategoryPage from "./pages/CategoryPage";
import Maintenance from "./pages/Maintenance";
import NotFound from "./pages/not-found";

function Router() {
  const { data: maintenanceSetting } = useQuery({
    queryKey: ["/api/settings/maintenance"],
    queryFn: () =>
      fetch("/api/settings/maintenance", { credentials: "include" })
        .then(r => r.ok ? r.json() : { value: "false" }),
    refetchInterval: 30_000,
    staleTime: 15_000,
  });

  const { data: me } = useQuery({
    queryKey: ["/api/user"],
    queryFn: () =>
      fetch("/api/user", { credentials: "include" })
        .then(r => r.ok ? r.json() : null),
    staleTime: 60_000,
  });

  const isMaintenanceOn = maintenanceSetting?.value === "true";
  const isAdmin = (me as any)?.role === "ADMIN";

  if (isMaintenanceOn && !isAdmin) {
    return <Maintenance />;
  }

  return (
    <div className="relative min-h-screen bg-background text-foreground flex">
      <MouseGlow />
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen lg:pl-64 transition-all duration-300">
        <Navigation />
        <main className="flex-1 w-full relative z-10">
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/mods" component={Mods} />
            <Route path="/dex" component={FusionDex} />
            <Route path="/videos" component={Videos} />
            <Route path="/login" component={Login} />
            <Route path="/register" component={Register} />
            <Route path="/admin" component={Admin} />
            <Route path="/category/:slug" component={CategoryPage} />
            <Route component={NotFound} />
          </Switch>
        </main>
        <Footer />
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
