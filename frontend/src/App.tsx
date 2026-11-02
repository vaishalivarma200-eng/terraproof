import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { LandingPage } from './pages/LandingPage';
import { OverviewPage } from './pages/OverviewPage';
import { InsurancePage } from './pages/InsurancePage';
import { FloodPage } from './pages/FloodPage';
import { DroughtPage } from './pages/DroughtPage';
import { DeforestationPage } from './pages/DeforestationPage';
import { AnalysisDetailPage } from './pages/AnalysisDetailPage';
import { PublicVerificationPage } from './pages/PublicVerificationPage';
import { AboutPage } from './pages/AboutPage';
import { NotFoundPage } from './pages/NotFoundPage';

// Demo & AI Decision Support Components
import { DemoModeBanner } from './components/DemoModeBanner';
import { JudgeGuidedTourModal } from './components/JudgeGuidedTourModal';
import { RegionEventComparisonModal } from './components/RegionEventComparisonModal';
import { WhatIfScenarioSimulatorModal } from './components/WhatIfScenarioSimulatorModal';
import { TerraGuideChatPanel } from './components/TerraGuideChatPanel';
import { Bot, Sparkles } from 'lucide-react';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isLanding = location.pathname === '/';

  // Modal States
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [isAssamDemoOpen, setIsAssamDemoOpen] = useState(false);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatQuestion, setChatQuestion] = useState<string | undefined>(undefined);
  const [presentationMode, setPresentationMode] = useState(false);

  // Keyboard shortcut: Shift + P toggles Presentation Mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.shiftKey && (e.key === 'P' || e.key === 'p')) {
        setPresentationMode((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSelectScenario = (claimRef: string) => {
    navigate(`/claims?claimRef=${claimRef}`);
  };

  const handleAskTerraGuide = (question: string) => {
    setChatQuestion(question);
    setIsChatOpen(true);
  };

  return (
    <div
      className={`flex flex-col min-h-screen bg-slate-950 text-slate-100 selection:bg-emerald-500/30 selection:text-white ${
        presentationMode ? 'text-[1.08rem] font-medium' : ''
      }`}
    >
      <Navbar />

      {/* Demo Mode & Executive Controls Banner */}
      <DemoModeBanner
        onStartTour={() => setIsTourOpen(true)}
        onSelectScenario={handleSelectScenario}
        onOpenAssamDemo={() => setIsAssamDemoOpen(true)}
        onOpenSimulator={() => setIsSimulatorOpen(true)}
        onTogglePresentationMode={() => setPresentationMode(!presentationMode)}
        isPresentationMode={presentationMode}
      />

      <main className={`flex-1 ${isLanding ? 'pt-0' : 'pt-4'}`}>
        {children}
      </main>

      <Footer />

      {/* Floating TerraGuide AI Chatbot Button */}
      <div className="fixed bottom-5 right-5 z-40">
        <button
          onClick={() => {
            setChatQuestion(undefined);
            setIsChatOpen(!isChatOpen);
          }}
          className="flex items-center space-x-2 px-3.5 py-2.5 rounded-full bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white shadow-2xl hover:scale-105 active:scale-95 border border-emerald-400/40 transition-all cursor-pointer group"
          title="Open TerraGuide AI Decision Assistant"
        >
          <div className="relative">
            <Bot className="w-5 h-5 text-white" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          </div>
          <span className="text-xs font-bold tracking-wide hidden sm:inline">
            TerraGuide AI
          </span>
          <Sparkles className="w-3.5 h-3.5 text-cyan-200 group-hover:rotate-12 transition-transform" />
        </button>
      </div>

      {/* Modals */}
      <JudgeGuidedTourModal
        isOpen={isTourOpen}
        onClose={() => setIsTourOpen(false)}
        onSelectClaim={(ref) => {
          navigate(`/claims?claimRef=${ref}`);
        }}
        onOpenTerraGuide={() => {
          setIsTourOpen(false);
          setIsChatOpen(true);
        }}
      />

      <RegionEventComparisonModal
        isOpen={isAssamDemoOpen}
        onClose={() => setIsAssamDemoOpen(false)}
        onOpenSimulator={() => {
          setIsAssamDemoOpen(false);
          setIsSimulatorOpen(true);
        }}
      />

      <WhatIfScenarioSimulatorModal
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
        onAskTerraGuide={handleAskTerraGuide}
      />

      <TerraGuideChatPanel
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        initialQuestion={chatQuestion}
      />
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
          <Route path="/insurance" element={<InsurancePage />} />
          <Route path="/verify" element={<PublicVerificationPage />} />
          <Route path="/verify/:identifier" element={<PublicVerificationPage />} />
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
