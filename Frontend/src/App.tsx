import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import CreateTrip from "./pages/CreateTrip";
import JoinTrip from "./pages/JoinTrip";
import Preferences from "./pages/Preferences";
import ItineraryOptions from "./pages/ItineraryOptions";
import VotingPage from "./pages/VotingPage";
import ResultsPage from "./pages/ResultsPage";
import NotFound from "./pages/NotFound";
import Layout from "./components/layout";
import WaitingRoom from "./pages/WaitingRoom";
import TripStatus from "./pages/Tripstatus";
import Dashboard from "./pages/Dashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>

         {/* Layout Wrapper */}
          <Route path="/" element={<Home />} />
          <Route element={<Layout />}>
          {/* <Route path="/" element={<Home />} /> */}
            <Route path="/dashboard"           element={<Dashboard />} />
            <Route path="/create-trip" element={<CreateTrip />} />
            <Route path="/join-trip" element={<JoinTrip />} />
            <Route path="/preferences/:tripId" element={<Preferences />} />
            <Route path="/itinerary/:tripId" element={<ItineraryOptions />} />
            <Route path="/vote/:tripId" element={<VotingPage />} />
            <Route path="/results/:tripId" element={<ResultsPage />} />
            <Route path="/waiting/:tripId" element={<WaitingRoom />} />
            <Route path="/trip/:tripId"               element={<TripStatus />} />

          </Route>

          <Route path="*" element={<NotFound />} />

        </Routes>
     </BrowserRouter>
      
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
