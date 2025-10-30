import { useEffect, lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SleepProvider } from "./contexts/SleepContext";
import { Navigation, DesktopSidebar } from "./components/layout/Navigation";
import { NotificationService } from "./components/NotificationService";
import { PWAInstallPrompt } from "./components/PWAInstallPrompt";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { DashboardSkeleton } from "./components/ui/loading-skeletons";
import { registerServiceWorker } from "./utils/serviceWorker";

// Eager load critical pages
import Dashboard from "./pages/Dashboard";
import SleepTracker from "./pages/SleepTracker";

// Lazy load non-critical pages
const AlarmSetup = lazy(() => import("./pages/AlarmSetup"));
const SleepHistory = lazy(() => import("./pages/SleepHistory"));
const SleepNotes = lazy(() => import("./pages/SleepNotes"));
const Insights = lazy(() => import("./pages/Insights")); // Heavy with charts
const Sounds = lazy(() => import("./pages/Sounds"));
const Settings = lazy(() => import("./pages/Settings"));
const Premium = lazy(() => import("./pages/Premium"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen bg-background pb-20 md:pb-6">
    <div className="max-w-6xl mx-auto p-6">
      <DashboardSkeleton />
    </div>
  </div>
);

const App = () => {
  // Register service worker for PWA offline support
  useEffect(() => {
    registerServiceWorker();
  }, []);

  return (
    <ErrorBoundary>
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
                  <Suspense fallback={<PageLoader />}>
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
                  </Suspense>
                </div>
              </div>
              <Navigation />
            </BrowserRouter>
          </TooltipProvider>
        </SleepProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
