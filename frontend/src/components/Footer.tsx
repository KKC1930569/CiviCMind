import React from 'react';
import { ShieldCheck, HeartHandshake, Eye, Sparkles } from 'lucide-react';

export const Footer: React.FC = () => {
  const pipelineSteps = [
    { name: 'DETECT', desc: 'Citizen & Sensor Capture' },
    { name: 'UNDERSTAND', desc: 'AI/CV Classification' },
    { name: 'IMPACT', desc: 'Human Vulnerability Scoring' },
    { name: 'PREDICT', desc: 'Risk Decay Modeling' },
    { name: 'SIMULATE', desc: 'Mobility Bottlenecks' },
    { name: 'PRIORITIZE', desc: 'Equitable Civic Queue' },
    { name: 'ROUTE', desc: 'Dispatch Optimization' },
    { name: 'REPAIR', desc: 'Verified Resolution' },
  ];

  return (
    <footer className="mt-auto border-t border-slate-800 bg-slate-950/60 backdrop-blur-sm text-slate-400 pb-20 md:pb-0">
      {/* Pipeline Visual Ribbon */}
      <div className="border-b border-slate-800/80 py-5 bg-slate-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400 flex items-center justify-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              CivicMind Platform Pipeline
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 text-xs">
            {pipelineSteps.map((step, idx) => (
              <React.Fragment key={step.name}>
                <div
                  className="px-2.5 py-1 rounded-md bg-slate-800/80 border border-slate-700/60 text-slate-200 font-mono text-[11px] font-semibold flex items-center gap-1"
                  title={step.desc}
                >
                  <span className="text-cyan-400">0{idx + 1}.</span> {step.name}
                </div>
                {idx < pipelineSteps.length - 1 && (
                  <span className="text-slate-600 font-bold text-xs select-none">→</span>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Main Footer Info */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2 text-slate-300 font-medium">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>CIVICMIND</span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400">
              AI-Powered Inclusive City Intelligence Platform
            </span>
          </div>

          <div className="flex items-center gap-6 text-slate-400">
            <span className="flex items-center gap-1.5">
              <HeartHandshake className="w-3.5 h-3.5 text-rose-400" />
              Human-Impact Prioritized
            </span>
            <span className="flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-cyan-400" />
              Pluggable CV/AI Architecture
            </span>
            <span>&copy; {new Date().getFullYear()} Civic Works</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
