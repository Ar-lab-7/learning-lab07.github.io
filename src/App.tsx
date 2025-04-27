
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { Fragment, useEffect } from "react";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import TrafficPage from "./pages/TrafficPage";
import AdminRoute from "./components/AdminRoute";
import { TrafficService } from "./services/TrafficService";
import LoginPage from "./pages/LoginPage";

// Create a new query client
const queryClient = new QueryClient();

const App = () => {
  // Record pageview on each navigation
  useEffect(() => {
    TrafficService.recordPageview();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {/* Wrap TooltipProvider in a Fragment to ensure it has a parent React component */}
        <Fragment>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/traffic" element={
                  <AdminRoute>
                    <TrafficPage />
                  </AdminRoute>
                } />
                <Route path="/login" element={<LoginPage />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </Fragment>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
