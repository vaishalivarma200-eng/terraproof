import React from 'react';
import { CloudRain, Droplets, Thermometer } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { WeatherContext } from '../types';

interface WeatherCardProps {
  weather?: WeatherContext | null;
}

export const WeatherCard: React.FC<WeatherCardProps> = ({ weather }) => {
  if (!weather) {
    return (
      <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 text-slate-400 text-xs">
        No direct meteorological records matched for this event window.
      </div>
    );
  }

  const chartData = weather.daily_timeline?.dates.map((d, idx) => ({
    date: d.slice(5), // MM-DD
    precipitation: weather.daily_timeline?.precipitation_mm[idx] ?? 0,
    temp_max: weather.daily_timeline?.temperature_max_c[idx] ?? 0,
  })) ?? [];

  return (
    <div className="p-5 rounded-xl border border-slate-800 bg-slate-900 shadow-md space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2">
          <CloudRain className="w-4 h-4 text-sky-400" />
          <h3 className="text-sm font-semibold text-slate-200">Local Meteorological Context</h3>
        </div>
        <span className="text-[11px] text-slate-400">Open-Meteo Historical Archive</span>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800/80">
          <div className="text-[11px] text-slate-400">Total Rainfall</div>
          <div className="text-lg font-bold text-sky-400 mt-0.5">
            {weather.total_precipitation_mm} <span className="text-xs font-normal text-slate-400">mm</span>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800/80">
          <div className="text-[11px] text-slate-400">Peak Daily Rain</div>
          <div className="text-lg font-bold text-sky-400 mt-0.5">
            {weather.max_daily_rainfall_mm} <span className="text-xs font-normal text-slate-400">mm</span>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800/80">
          <div className="text-[11px] text-slate-400">Avg Topsoil Moisture</div>
          <div className="text-lg font-bold text-emerald-400 mt-0.5">
            {weather.average_soil_moisture_m3_m3 ?? 'N/A'}{' '}
            <span className="text-[10px] font-normal text-slate-400">m³/m³</span>
          </div>
        </div>
      </div>

      {chartData.length > 0 && (
        <div className="space-y-1.5 pt-1">
          <div className="text-[11px] text-slate-400 flex items-center justify-between">
            <span>Daily Precipitation Timeline</span>
            <span className="text-[10px] text-slate-500">mm / day</span>
          </div>
          <div className="h-32 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', fontSize: '11px' }}
                />
                <Bar dataKey="precipitation" fill="#38bdf8" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};
