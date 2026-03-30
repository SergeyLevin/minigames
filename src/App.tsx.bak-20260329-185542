import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { useAppStore } from './shared/store';
import { Catalog } from './pages/Catalog';
import { GameDetails } from './pages/GameDetails';
import { GameSession } from './pages/GameSession';
import { Results } from './pages/Results';
import { Loader2 } from 'lucide-react';

const AppContent = () => {
  const { fetchUser, isLoading, user } = useAppStore();

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#F9FAFB]">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#1F2937] font-sans max-w-md mx-auto relative overflow-x-hidden">
      <Routes>
        <Route path="/" element={<Catalog />} />
        <Route path="/game/:id" element={<GameDetails />} />
        <Route path="/play/:id" element={<GameSession />} />
        <Route path="/results" element={<Results />} />
      </Routes>
    </div>
  );
};

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
