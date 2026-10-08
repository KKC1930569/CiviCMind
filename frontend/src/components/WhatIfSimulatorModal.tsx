import React, { useEffect, useState } from 'react';
import { reportsApi } from '../api/reports';
import type { RepairSimulationResult } from '../types';
import { 
  Sparkles, 
  X, 
  Loader2, 
  TrendingDown, 
  Accessibility 
} from 'lucide-react';

interface Props {
  reportId: number;
  reportTitle: string;
  isOpen: boolean;
  onClose: () => void;
}

export const WhatIfSimulatorModal: React.FC<Props> = ({
  reportId,
  reportTitle,
  isOpen,
  onClose,
}) => {
  const [simulation, setSimulation] = useState<RepairSimulationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const runSimulation = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await reportsApi.simulateRepair(reportId);
        setSimulation(data);
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to compute repair simulation.');
      } finally {
        setLoading(false);
      }
    };

    runSimulation();
  }, [isOpen, reportId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-2xl space-y-4 sm:space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">What-If Repair Simulator</h2>
              <p className="text-xs text-slate-400">Algorithmic civic relief simulation model</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Issue Title */}
        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80">
          <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider block mb-0.5">
            Target Incident
          </span>
          <p className="text-xs sm:text-sm font-semibold text-slate-200 line-clamp-1">{reportTitle}</p>
        </div>

        {/* Content */}
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
            <p className="text-xs text-slate-400">Computing civic impact relief delta...</p>
          </div>
        ) : error ? (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
            {error}
          </div>
        ) : simulation ? (
          <div className="space-y-6">
            {/* Before vs After Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* BEFORE */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="text-[11px] font-bold uppercase tracking-wider text-rose-400 flex items-center justify-between">
                  <span>Current State (Before)</span>
                  <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 text-[10px]">
                    {simulation.current_priority}
                  </span>
                </div>
                <div className="text-3xl font-extrabold text-white">
                  {simulation.current_impact_score}
                  <span className="text-xs text-slate-400 font-normal"> / 100</span>
                </div>
                <div className="space-y-1.5 text-[11px] text-slate-400 pt-2 border-t border-slate-800/60">
                  <div className="flex justify-between">
                    <span>Severity:</span>
                    <span className="text-slate-200">{simulation.current_factors.severity}/30</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pedestrian Disruption:</span>
                    <span className="text-slate-200">{simulation.current_factors.pedestrian_impact}/25</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Accessibility Barrier:</span>
                    <span className="text-slate-200">{simulation.current_factors.accessibility_impact}/25</span>
                  </div>
                </div>
              </div>

              {/* AFTER */}
              <div className="p-5 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-3">
                <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center justify-between">
                  <span>After Municipal Repair</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px]">
                    {simulation.simulated_priority}
                  </span>
                </div>
                <div className="text-3xl font-extrabold text-emerald-300">
                  {simulation.simulated_impact_score}
                  <span className="text-xs text-emerald-400/80 font-normal"> / 100</span>
                </div>
                <div className="space-y-1.5 text-[11px] text-emerald-200/80 pt-2 border-t border-emerald-500/20">
                  <div className="flex justify-between">
                    <span>Severity:</span>
                    <span className="text-emerald-100">{simulation.simulated_factors.severity}/30</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pedestrian Hazard:</span>
                    <span className="text-emerald-100">{simulation.simulated_factors.pedestrian_impact}/25</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Accessibility Restored:</span>
                    <span className="text-emerald-300 font-semibold">Cleared (0-2/25)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Impact Reduction Summary Banner */}
            <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400">
                  <TrendingDown className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Estimated Impact Relief</div>
                  <div className="text-xs text-cyan-300">
                    -{simulation.impact_reduction_points} points ({simulation.percentage_improvement}% improvement)
                  </div>
                </div>
              </div>

              {simulation.accessibility_restored && (
                <div className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-emerald-300 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
                  <Accessibility className="w-4 h-4 text-emerald-400" />
                  Universal Mobility Restored
                </div>
              )}
            </div>

            {/* Disclaimer */}
            <p className="text-[11px] text-slate-400 italic text-center">
              ⚠️ {simulation.disclaimer}
            </p>
          </div>
        ) : null}

        {/* Footer */}
        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
          >
            Close Simulation
          </button>
        </div>
      </div>
    </div>
  );
};
