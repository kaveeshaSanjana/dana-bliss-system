import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { Login } from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import { ProtectedRoute } from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          <Route path="/user-management" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          <Route path="/institutes" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          <Route path="/subjects" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          <Route path="/subject-lectures" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          <Route path="/transport" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          <Route path="/assign-rfid" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          <Route path="/image-verification" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          <Route path="/advertisements" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          <Route path="/organizations" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          <Route path="/organization-login" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          <Route path="/classes" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          <Route path="/payments" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          <Route path="/sms-payments" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          <Route path="/sms-campaign" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
