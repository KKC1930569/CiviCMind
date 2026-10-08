import React, { useEffect, useState } from 'react';
import { reportsApi } from '../api/reports';
import type { ImpactForecast } from '../types';
import { 
  TrendingUp, 
  Users, 
  AlertTriangle, 
  Loader2, 
  Clock 
} from 'lucide-react';

interface Props {
  reportId: number;
}

export const ImpactForecastView: React.FC<Props> = ({ reportId }) => {
  const [forecast, setForecast] = useState<ImpactForecast | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchForecast = async () => {
      try {
        const data = await reportsApi.getImpactForecast(reportId);
        setForecast(data);
      } catch (err) {
        console.error('Failed to load forecast:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchForecast();
  }, [reportId]);

  if (loading) {
    return (
      <div className="p-8 text-center flex flex-col items-center justify-center gap-2">
        <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
        <span className="text-xs text-slate-400">Modeling civic impact forecast...</span>
      </div>
    );
  }

  if (!forecast) return null;

  return (
    <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">{forecast.title}</h3>
            <span className="text-[11px] text-slate-400">Temporal degradation and exposure projection</span>
          </div>
        </div>

        <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/40 px-2.5 py-1 rounded-md border border-cyan-500/20">
          Simulation Model
        </span>
      </div>

      {/* Affected Exposure Estimate */}
      <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-3">
        <Users className="w-5 h-5 text-cyan-400 shrink-0" />
        <div>
          <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            Estimated Daily Public Exposure
          </div>
          <div className="text-xs font-semibold text-white mt-0.5">
            {forecast.current_affected_estimate}
          </div>
        </div>
      </div>

      {/* Timeline Projection */}
      <div className="space-y-3">
        <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-cyan-400" /> Progression Timeline If Unrepaired
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {forecast.timeline.map((step, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-2 flex flex-col justify-between"
            >
              <div>
                <div className="text-[11px] font-bold text-cyan-400 uppercase tracking-wide">
                  {step.timeframe}
                </div>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  {step.impact_description}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-800/60">
                <span className="text-[10px] font-semibold text-amber-400 uppercase">
                  Level: {step.disruption_level}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Compounding Risks List */}
      <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
        <div className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> Compounding Civic Risks
        </div>
        <ul className="text-xs text-slate-400 space-y-1 list-disc list-inside">
          {forecast.compounding_risks.map((risk, idx) => (
            <li key={idx} className="leading-relaxed">{risk}</li>
          ))}
        </ul>
      </div>

      {/* Disclaimer */}
      <p className="text-[10px] text-slate-400 italic text-center">
        ℹ️ {forecast.disclaimer}
      </p>
    </div>
  );
};
