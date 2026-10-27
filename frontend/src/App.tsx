import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { LandingPage } from './pages/LandingPage';
import { OverviewPage } from './pages/OverviewPage';
import { InsurancePage } from './pages/InsurancePage';
import { FloodPage } from './pages/FloodPage';
import { DroughtPage } from './pages/DroughtPage';
import { DeforestationPage } from './pages/DeforestationPage';
import { AnalysisDetailPage } from './pages/AnalysisDetailPage';
import { AboutPage } from './pages/AboutPage';
import { NotFoundPage } from './pages/NotFoundPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 selection:bg-emerald-500 selection:text-slate-950">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/overview" element={<OverviewPage />} />
            <Route path="/claims" element={<InsurancePage />} />
            <Route path="/flood" element={<FloodPage />} />
            <Route path="/drought" element={<DroughtPage />} />
            <Route path="/deforestation" element={<DeforestationPage />} />
            <Route path="/analyses/:id" element={<AnalysisDetailPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
};

export default App;

