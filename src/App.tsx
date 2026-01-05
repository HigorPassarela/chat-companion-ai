import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useDarkMode } from "./hooks/useDarkMode";
import ThemeSelector from "./components/chat/ThemeSelector";
import { SettingsModal } from "./components/settings/SettingsModal";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { useEffect } from "react";
import { ThemeProvider } from "next-themes";

const queryClient = new QueryClient();

const App = () => {
  const { theme } = useDarkMode();
  
  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
    document.body.classList.remove('light', 'dark');
    document.body.classList.add(theme);
    
    document.body.style.display = 'none';
    document.body.offsetHeight;
    document.body.style.display = '';
  }, [theme]);

  return (
    <div
      key={`theme-${theme}`}
      className="min-h-screen bg-background text-foreground transition-all duration-300"
    >
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <ThemeSelector />
          <Toaster />
          <Sonner theme={theme}/>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </div>
  );
};

const AppContent = () => {
  <ThemeProvider>
    <App/>
  </ThemeProvider>
}

export default App;