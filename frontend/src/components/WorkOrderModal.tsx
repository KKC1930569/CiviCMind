import React, { useEffect, useState } from 'react';
import { reportsApi } from '../api/reports';
import type { MunicipalWorkOrder } from '../types';
import { 
  FileText, 
  Printer, 
  X, 
  Loader2, 
  Building2, 
  Clock, 
  MapPin, 
  Wrench, 
  ShieldAlert, 
  Copy,
  Check
} from 'lucide-react';

interface Props {
  reportId: number;
  isOpen: boolean;
  onClose: () => void;
}

export const WorkOrderModal: React.FC<Props> = ({ reportId, isOpen, onClose }) => {
  const [workOrder, setWorkOrder] = useState<MunicipalWorkOrder | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const fetchWorkOrder = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await reportsApi.getWorkOrder(reportId);
        setWorkOrder(data);
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to generate work order.');
      } finally {
        setLoading(false);
      }
    };

    fetchWorkOrder();
  }, [isOpen, reportId]);

  const handleCopy = () => {
    if (!workOrder) return;
    navigator.clipboard.writeText(JSON.stringify(workOrder, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 my-8 max-h-[90vh] overflow-y-auto">
        {/* Header Controls */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Municipal Repair Work Order</h2>
              <p className="text-xs text-slate-400">Formal dispatch dossier for municipal public works crews</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1.5 transition"
              title="Copy Work Order JSON"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'JSON'}
            </button>
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1.5 transition"
              title="Print Work Order"
            >
              <Printer className="w-3.5 h-3.5" /> Print
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
            <p className="text-xs text-slate-400">Compiling municipal dispatch manifest...</p>
          </div>
        ) : error ? (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
            {error}
          </div>
        ) : workOrder ? (
          <div className="space-y-6 text-xs text-slate-300 font-sans">
            {/* Work Order Top Banner */}
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row justify-between gap-4">
              <div>
                <span className="text-[10px] font-mono text-purple-400 uppercase tracking-widest block font-bold">
                  OFFICIAL MUNICIPAL WORK ORDER
                </span>
                <h3 className="text-lg font-mono font-extrabold text-white mt-0.5">
                  {workOrder.work_order_id}
                </h3>
                <p className="text-[11px] text-slate-400 mt-1">Generated: {workOrder.generated_at}</p>
              </div>

              <div className="flex sm:flex-col items-end justify-between sm:justify-center gap-1 text-right">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                    workOrder.priority === 'CRITICAL'
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                      : workOrder.priority === 'HIGH'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                  }`}
                >
                  {workOrder.priority} PRIORITY
                </span>
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-cyan-400" /> Resolution SLA: {workOrder.target_sla_hours}h
                </span>
              </div>
            </div>

            {/* Department Assignment */}
            <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/20 flex items-start gap-3">
              <Building2 className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-white text-xs">Assigned Municipal Department</div>
                <div className="text-purple-300 text-xs mt-0.5">{workOrder.assigned_department}</div>
              </div>
            </div>

            {/* Core Incident Data Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] uppercase text-slate-400 font-semibold block">Human Impact</span>
                <span className="text-base font-mono font-bold text-rose-400">{workOrder.human_impact_score}/100</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] uppercase text-slate-400 font-semibold block">Category</span>
                <span className="text-xs font-bold text-white">{workOrder.category}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] uppercase text-slate-400 font-semibold block">Severity</span>
                <span className="text-xs font-bold text-amber-300">{workOrder.severity}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] uppercase text-slate-400 font-semibold block">Accessibility</span>
                <span className="text-xs font-bold text-indigo-300 truncate block">{workOrder.accessibility_barrier}</span>
              </div>
            </div>

            {/* Issue Title & Description */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="font-bold text-white text-xs">Incident: {workOrder.issue_title}</div>
              <p className="text-slate-300 leading-relaxed text-xs">{workOrder.description}</p>
            </div>

            {/* Location & Memory History */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="font-bold text-white text-xs flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-cyan-400" /> Geographic Locus
                </div>
                <p className="text-slate-300 text-xs">{workOrder.location_summary}</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="font-bold text-white text-xs flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-400" /> Infrastructure Memory
                </div>
                <p className="text-slate-300 text-xs">{workOrder.report_history_note}</p>
              </div>
            </div>

            {/* Recommended Action & Equipment */}
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="font-bold text-white text-xs flex items-center gap-2">
                <Wrench className="w-4 h-4 text-cyan-400" /> Recommended Corrective Action
              </div>
              <p className="text-slate-200 text-xs leading-relaxed">{workOrder.recommended_action}</p>

              <div className="pt-2 border-t border-slate-800/80">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold block mb-2">
                  Suggested Equipment & Safety Rigging:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {workOrder.equipment_needed.map((item, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 text-[11px]"
                    >
                      • {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
          >
            Close Work Order
          </button>
        </div>
      </div>
    </div>
  );
};
