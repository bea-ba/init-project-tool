import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SleepProvider } from "./contexts/SleepContext";
import { Navigation, DesktopSidebar } from "./components/layout/Navigation";
import { NotificationService } from "./components/NotificationService";
import { PWAInstallPrompt } from "./components/PWAInstallPrompt";
import { registerServiceWorker } from "./utils/serviceWorker";
import Dashboard from "./pages/Dashboard";
import SleepTracker from "./pages/SleepTracker";
import AlarmSetup from "./pages/AlarmSetup";
import SleepHistory from "./pages/SleepHistory";
import SleepNotes from "./pages/SleepNotes";
import Insights from "./pages/Insights";
import Sounds from "./pages/Sounds";
import Settings from "./pages/Settings";
import Premium from "./pages/Premium";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  // Register service worker for PWA offline support
  useEffect(() => {
    registerServiceWorker();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <SleepProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <NotificationService />
          <PWAInstallPrompt />
          <BrowserRouter>
            <div className="flex">
              <DesktopSidebar />
              <div className="flex-1">
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/sleep-tracker" element={<SleepTracker />} />
                  <Route path="/alarm-setup" element={<AlarmSetup />} />
                  <Route path="/sleep-history" element={<SleepHistory />} />
                  <Route path="/sleep-notes" element={<SleepNotes />} />
                  <Route path="/insights" element={<Insights />} />
                  <Route path="/sounds" element={<Sounds />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/premium" element={<Premium />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </div>
            </div>
            <Navigation />
          </BrowserRouter>
        </TooltipProvider>
      </SleepProvider>
    </QueryClientProvider>
  );
};

export default App;
