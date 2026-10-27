import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Satellite,
  ShieldCheck,
  Droplets,
  SunMedium,
  Trees,
  LayoutDashboard,
  Info,
  Activity,
} from 'lucide-react';
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
    { to: '/overview', label: 'Overview', icon: LayoutDashboard },
    { to: '/claims', label: 'Insurance Claims', icon: ShieldCheck, primary: true },
    { to: '/flood', label: 'Flood Detection', icon: Droplets },
    { to: '/drought', label: 'Drought & Stress', icon: SunMedium },
    { to: '/deforestation', label: 'Land-Cover Change', icon: Trees },
    { to: '/about', label: 'Methodology', icon: Info },
  ];

  return (
    <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <Satellite className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                Terra<span className="text-emerald-400">Proof</span>
              </span>
              <span className="text-[10px] text-slate-400 tracking-wider uppercase block font-medium">
                Earth Observation Intelligence
              </span>
            </div>
          </Link>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname.startsWith(link.to);
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Status Badge */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700/80 text-[11px]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-slate-300 font-mono">
                {providerStatus?.active_mode === 'real' ? 'LIVE STAC' : 'DEMO MODE'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
