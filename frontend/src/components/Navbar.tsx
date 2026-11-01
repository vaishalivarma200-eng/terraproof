import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Satellite, ShieldCheck, ArrowRight } from 'lucide-react';
import { api } from '../services/api';
import { ProviderStatus } from '../types';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const [providerStatus, setProviderStatus] = useState<ProviderStatus | null>(null);

  useEffect(() => {
    api.getProviderStatus()
      .then(setProviderStatus)
      .catch((err) => console.error('Failed to fetch provider status:', err));
  }, []);

  const navLinks = [
    { to: '/claims', label: 'Claims' },
    { to: '/flood', label: 'Flood' },
    { to: '/drought', label: 'Drought' },
    { to: '/deforestation', label: 'Forest' },
    { to: '/verify', label: 'Public Verify' },
    { to: '/about', label: 'Methodology' },
  ];

  return (
    <div className="fixed top-4 left-0 right-0 z-50 flex justify-center px-4 sm:px-6 pointer-events-none">
      <header className="pointer-events-auto max-w-7xl w-full bg-slate-900/90 backdrop-blur-md border border-slate-800/90 rounded-2xl sm:rounded-full px-5 py-2.5 shadow-2xl shadow-black/60 flex items-center justify-between transition-all">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center space-x-2.5 group">
          <div className="w-8 h-8 rounded-full bg-slate-800/90 border border-slate-700/80 flex items-center justify-center text-emerald-400 group-hover:border-emerald-500/50 group-hover:bg-slate-800 transition-all">
            <Satellite className="w-4 h-4" />
          </div>
          <span className="text-lg font-serif font-bold tracking-tight text-white flex items-center">
            Terra<span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">Proof</span>
          </span>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center space-x-7 text-xs font-medium text-slate-300">
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

        {/* Right CTA */}
        <div className="flex items-center space-x-3">
          <Link
            to="/claims"
            className="px-5 py-2 rounded-full bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white text-xs font-semibold shadow-md shadow-emerald-950/40 border border-emerald-500/30 transition-all flex items-center space-x-1.5"
          >
            <span>Verify a claim</span>
          </Link>
        </div>
      </header>
    </div>
  );
};
