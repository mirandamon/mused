
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AudioProvider } from "@/context/AudioContext";
import { AnimatePresence } from "framer-motion";
import Index from "./pages/Index";
import Feed from "./pages/Feed";
import Create from "./pages/Create";
import Remix from "./pages/Remix";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// AnimatePresence wrapper component to handle route transitions
const AnimatedRoutes = () => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Index />} />
        <Route path="/feed" element={<Feed />} />
        <Route path="/create" element={<Create />} />
        <Route path="/remix/:postId" element={<Remix />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AudioProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner position="top-center" closeButton />
        <BrowserRouter>
          <AnimatedRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </AudioProvider>
  </QueryClientProvider>
);

export default App;
