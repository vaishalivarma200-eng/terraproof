import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
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

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const isLanding = location.pathname === '/';

  return (
    <div className="flex flex-col min-h-screen bg-[#071613] text-slate-100 selection:bg-teal-400 selection:text-slate-950">
      <Navbar />
      <main className={`flex-1 ${isLanding ? 'pt-0' : 'pt-24'}`}>
        {children}
      </main>
      <Footer />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Layout>
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
      </Layout>
    </BrowserRouter>
  );
};

export default App;
