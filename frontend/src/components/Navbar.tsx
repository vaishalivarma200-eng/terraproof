import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Satellite, ShieldCheck, ArrowRight, Compass, Languages } from 'lucide-react';
import { api } from '../services/api';
import { ProviderStatus } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface NavbarProps {
  onOpenTour?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenTour }) => {
  const location = useLocation();
  const [providerStatus, setProviderStatus] = useState<ProviderStatus | null>(null);
  const { lang, setLang, t, isHindi } = useLanguage();

  useEffect(() => {
    api.getProviderStatus()
      .then(setProviderStatus)
      .catch((err) => console.error('Failed to fetch provider status:', err));
  }, []);

  const navLinks = [
    { to: '/claims', label: t('nav.claims', 'Claims') },
    { to: '/flood', label: t('nav.flood', 'Flood') },
    { to: '/drought', label: t('nav.drought', 'Drought') },
    { to: '/deforestation', label: t('nav.forest', 'Forest') },
    { to: '/verify', label: t('nav.verify', 'Public Verify') },
    { to: '/about', label: t('nav.about', 'Methodology') },
  ];

  return (
    <div className="sticky top-0 z-40 flex justify-center px-4 sm:px-6 py-2.5 pointer-events-none transition-all">
      <header className="pointer-events-auto max-w-7xl w-full bg-slate-900/90 backdrop-blur-md border border-slate-800/90 rounded-2xl sm:rounded-full px-4 sm:px-5 py-2 shadow-2xl shadow-black/60 flex items-center justify-between transition-all">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center space-x-2.5 group shrink-0">
          <div className="w-8 h-8 rounded-full bg-slate-800/90 border border-slate-700/80 flex items-center justify-center text-emerald-400 group-hover:border-emerald-500/50 group-hover:bg-slate-800 transition-all">
            <Satellite className="w-4 h-4" />
          </div>
          <span className="text-lg font-serif font-bold tracking-tight text-white flex items-center">
            Terra<span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">Proof</span>
          </span>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden lg:flex items-center space-x-6 text-xs font-medium text-slate-300">
          {navLinks.map((link) => {
            const isActive = location.pathname.startsWith(link.to);
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`transition-colors hover:text-emerald-300 ${
                  isActive ? 'text-emerald-400 font-semibold' : 'text-slate-300/90'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Actions: Guided Tour + Language Switcher + CTA */}
        <div className="flex items-center space-x-2 sm:space-x-2.5">
          {/* Guided Tour Trigger (Navbar) */}
          <button
            onClick={() => {
              if (onOpenTour) {
                onOpenTour();
              } else {
                window.dispatchEvent(new CustomEvent('open-terraproof-tour'));
              }
            }}
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-full bg-slate-800/90 hover:bg-slate-800 text-emerald-300 hover:text-emerald-200 border border-emerald-500/40 text-xs font-semibold shadow-sm transition-all cursor-pointer group"
            title={isHindi ? "3-मिनट का मार्गदर्शित दौरा शुरू करें" : "Launch 3-minute executive walkthrough"}
          >
            <Compass className="w-3.5 h-3.5 text-emerald-400 group-hover:rotate-45 transition-transform" />
            <span className="hidden sm:inline">{isHindi ? 'दौरा (3 मिनट)' : 'Tour (3 min)'}</span>
            <span className="sm:hidden">{isHindi ? 'दौरा' : 'Tour'}</span>
          </button>

          {/* Global Language Switcher */}
          <div className="flex items-center p-0.5 rounded-full bg-slate-950/80 border border-slate-800 text-[11px] font-semibold">
            <button
              onClick={() => setLang('en')}
              className={`px-2 py-0.5 rounded-full transition-all cursor-pointer ${
                lang === 'en'
                  ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Switch entire website to English"
            >
              EN
            </button>
            <button
              onClick={() => setLang('hi')}
              className={`px-2 py-0.5 rounded-full transition-all cursor-pointer ${
                lang === 'hi'
                  ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="पूरी वेबसाइट हिंदी में बदलें"
            >
              हिंदी
            </button>
          </div>

          {/* Main CTA */}
          <Link
            to="/claims"
            className="hidden sm:flex px-4 py-1.5 rounded-full bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white text-xs font-semibold shadow-md shadow-emerald-950/40 border border-emerald-500/30 transition-all items-center space-x-1.5 shrink-0"
          >
            <span>{t('nav.verifyClaim', 'Verify a claim')}</span>
          </Link>
        </div>
      </header>
    </div>
  );
};
