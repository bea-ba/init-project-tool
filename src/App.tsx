import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SleepProvider } from "./contexts/SleepContext";
import Dashboard from "./pages/Dashboard";
import SleepTracker from "./pages/SleepTracker";
import AlarmSetup from "./pages/AlarmSetup";
import SleepHistory from "./pages/SleepHistory";
import SleepNotes from "./pages/SleepNotes";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <SleepProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/sleep-tracker" element={<SleepTracker />} />
            <Route path="/alarm-setup" element={<AlarmSetup />} />
            <Route path="/sleep-history" element={<SleepHistory />} />
            <Route path="/sleep-notes" element={<SleepNotes />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </SleepProvider>
  </QueryClientProvider>
);

export default App;
