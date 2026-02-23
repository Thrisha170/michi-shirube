import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Study from "./pages/Study";
import Analytics from "./pages/Analytics";
import Targets from "./pages/Targets";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Kanji from "./pages/Kanji";
import Vocabulary from "./pages/Vocabulary";
import Grammar from "./pages/Grammar";
import Listening from "./pages/Listening";
import Reading from "./pages/Reading";
import Auth from "./pages/Auth";
import Badges from "./pages/Badges";
import NotFound from "./pages/NotFound";
import InstallButton from "./components/InstallButton";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
          <Route path="/study" element={<ProtectedRoute><Study /></ProtectedRoute>} />
          <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
          <Route path="/targets" element={<ProtectedRoute><Targets /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/kanji" element={<ProtectedRoute><Kanji /></ProtectedRoute>} />
          <Route path="/vocabulary" element={<ProtectedRoute><Vocabulary /></ProtectedRoute>} />
          <Route path="/grammar" element={<ProtectedRoute><Grammar /></ProtectedRoute>} />
          <Route path="/listening" element={<ProtectedRoute><Listening /></ProtectedRoute>} />
          <Route path="/reading" element={<ProtectedRoute><Reading /></ProtectedRoute>} />
          <Route path="/badges" element={<ProtectedRoute><Badges /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  
  <InstallButton />
  </>
);

export default App;
