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
    { to: '/about', label: 'Methodology' },
  ];

  return (
    <div className="fixed top-4 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
      <header className="pointer-events-auto max-w-5xl w-full bg-[#122822]/85 backdrop-blur-md border border-teal-500/20 rounded-2xl sm:rounded-full px-4 sm:px-6 py-2.5 shadow-2xl shadow-teal-950/40 flex items-center justify-between transition-all">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center space-x-2.5 group">
          <div className="w-8 h-8 rounded-full bg-teal-500/20 border border-teal-400/40 flex items-center justify-center text-teal-300 group-hover:bg-teal-500/30 transition-all">
            <Satellite className="w-4 h-4" />
          </div>
          <span className="text-lg font-serif font-bold tracking-tight text-white flex items-center">
            Terra<span className="text-teal-400">Proof</span>
          </span>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center space-x-6 text-xs font-medium text-slate-300">
          {navLinks.map((link) => {
            const isActive = location.pathname.startsWith(link.to);
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`transition-colors hover:text-teal-300 ${
                  isActive ? 'text-teal-300 font-semibold' : 'text-slate-300'
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
            className="px-4 py-2 rounded-full bg-[#0d9488] hover:bg-[#14b8a6] text-white text-xs font-semibold shadow-md shadow-teal-900/40 transition-all flex items-center space-x-1.5"
          >
            <span>Verify a claim</span>
          </Link>
        </div>
      </header>
    </div>
  );
};
