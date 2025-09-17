import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import InventoryDemo from "./components/InventoryDemo";
import MedievalDesignDemo from "./components/MedievalDesignDemo";
import TestMedievalDesign from "./components/TestMedievalDesign";
import SimpleTest from "./components/SimpleTest";
import CharacterScreen from "./components/CharacterScreen";
import AtmosphereFX from "./components/AtmosphereFX";
import AmbientLight from "./components/AmbientLight";
import CharacterView from "./pages/CharacterView";
import TestChanges from "./pages/TestChanges";
import ResetPassword from "./components/ResetPassword";

const queryClient = new QueryClient();

const App = () => (
  <div className="dark">
    <AmbientLight />
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/inventory-demo" element={<InventoryDemo />} />
          <Route path="/medieval-demo" element={<MedievalDesignDemo />} />
          <Route path="/test-medieval" element={<TestMedievalDesign />} />
          <Route path="/simple-test" element={<SimpleTest />} />
          <Route path="/character-screen" element={<CharacterScreen />} />
          <Route path="/atmosphere-fx" element={<AtmosphereFX />} />
          <Route path="/character-view" element={<CharacterView />} />
          <Route path="/test-changes" element={<TestChanges />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </div>
);

export default App;
