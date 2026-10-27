import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="max-w-md mx-auto px-4 py-24 text-center space-y-4">
      <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-emerald-400">
        <Compass className="w-8 h-8" />
      </div>
      <h1 className="text-3xl font-extrabold text-white">404 - Coordinate Not Found</h1>
      <p className="text-xs text-slate-400">
        The requested path or satellite record does not exist in this catalog orbit.
      </p>
      <Link
        to="/"
        className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs transition-all"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Return to TerraProof Home</span>
      </Link>
    </div>
  );
};
