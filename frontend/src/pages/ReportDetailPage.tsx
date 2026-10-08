import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { reportsApi } from '../api/reports';
import type { Report, ReportStatus, PriorityLevel, ImpactFactors, YOLODetectionItem } from '../types';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/StatusBadge';
import { CategoryBadge } from '../components/CategoryBadge';
import { ImpactScoreIndicator } from '../components/ImpactScoreIndicator';
import { LocationPickerMap } from '../components/LocationPickerMap';
import { WhatIfSimulatorModal } from '../components/WhatIfSimulatorModal';
import { WorkOrderModal } from '../components/WorkOrderModal';
import { ImpactForecastView } from '../components/ImpactForecastView';
import { DetectionOverlay } from '../components/DetectionOverlay';
import { 
  ArrowLeft, 
  MapPin, 
  Clock, 
  ShieldAlert, 
  User, 
  CheckCircle2, 
  Loader2, 
  AlertTriangle, 
  Camera, 
  Sparkles, 
  Save,
  FileText,
  Accessibility,
  History,
  ShieldCheck
} from 'lucide-react';

export const ReportDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthority } = useAuth();

  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals
  const [simulatorOpen, setSimulatorOpen] = useState(false);
  const [workOrderOpen, setWorkOrderOpen] = useState(false);

  // Authority Triage State
  const [triageStatus, setTriageStatus] = useState<ReportStatus>('OPEN');
  const [triagePriority, setTriagePriority] = useState<PriorityLevel>('MEDIUM');
  const [triageNotes, setTriageNotes] = useState('');
  const [triageScore, setTriageScore] = useState<number>(50.0);
  const [updating, setUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  useEffect(() => {
    const fetchReport = async () => {
      if (!id) return;
      try {
        const data = await reportsApi.getReportById(parseInt(id, 10));
        setReport(data);
        setTriageStatus(data.status);
        setTriagePriority(data.priority_level);
        setTriageNotes(data.impact_notes || '');
        setTriageScore(data.human_impact_score);
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Report not found.');
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [id]);

  const handleStatusUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!report) return;

    setUpdating(true);
    setUpdateSuccess(false);

    try {
      const updated = await reportsApi.updateReportStatus(report.id, {
        status: triageStatus,
        priority_level: triagePriority,
        impact_notes: triageNotes,
        human_impact_score: triageScore,
      });
      setReport(updated);
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 3000);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to update report status.');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
        <p className="text-xs text-slate-400">Loading incident record...</p>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center space-y-4">
        <div className="p-4 rounded-full bg-rose-500/10 text-rose-400 w-12 h-12 mx-auto flex items-center justify-center">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-white">Incident Not Found</h2>
        <p className="text-xs text-slate-400">{error || 'This report may have been archived.'}</p>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 text-slate-200 text-xs font-semibold hover:bg-slate-700 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Dashboard
        </Link>
      </div>
    );
  }

  const timelineSteps: ReportStatus[] = [
    'OPEN',
    'UNDER_REVIEW',
    'ASSIGNED',
    'IN_PROGRESS',
    'RESOLVED',
  ];

  const currentStepIdx = timelineSteps.indexOf(report.status);

  // Parse factor breakdown if available
  let factors: ImpactFactors | null = null;
  if (report.factor_breakdown) {
    try {
      factors = JSON.parse(report.factor_breakdown);
    } catch (e) {
      factors = null;
    }
  }

  // Parse reasons if available
  let reasonsList: string[] = [];
  if (report.reasons) {
    try {
      reasonsList = JSON.parse(report.reasons);
    } catch (e) {
      reasonsList = (report.impact_notes || '').split(';').map(s => s.trim()).filter(Boolean);
    }
  } else if (report.impact_notes) {
    reasonsList = report.impact_notes.split(';').map(s => s.trim()).filter(Boolean);
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="flex items-center gap-2">
          {report.is_demo_data && (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">
              Benchmark Demo Case
            </span>
          )}
          <CategoryBadge category={report.category} />
          <StatusBadge status={report.status} />
        </div>
      </div>

      {/* Main Header & Title */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs font-mono px-2.5 py-1 rounded-md bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 uppercase tracking-wider font-bold">
            {report.case_id || `CM-2026-${report.id.toString().padStart(6, '0')}`}
          </span>
          {report.defect_type && (
            <span className="text-xs font-mono px-2.5 py-1 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-300 font-semibold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              YOLO AI: <strong className="uppercase">{report.defect_type.replace(/_/g, ' ')}</strong>
              {report.ai_confidence != null && (
                <span className="text-slate-400">({(report.ai_confidence * 100).toFixed(1)}%)</span>
              )}
            </span>
          )}
          <ImpactScoreIndicator score={report.human_impact_score} priority={report.priority_level} showDetails size="lg" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          {report.title}
        </h1>

        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            Reported on {new Date(report.created_at).toLocaleString()}
          </span>
          {report.reporter && (
            <span className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-400" />
              Reported by {report.reporter.full_name}
            </span>
          )}
          {report.is_repeated_issue && (
            <span className="flex items-center gap-1 text-amber-400 font-semibold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 text-[11px]">
              <History className="w-3 h-3" /> Repeated Hazard ({report.repeat_count} nearby occurrences)
            </span>
          )}
        </div>
      </div>

      {/* Action Command Ribbon (What-If Simulator & Work Order) */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-cyan-950/20 to-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-3 shadow-lg">
        <div className="text-xs text-slate-300">
          <strong className="text-white">CivicMind Intelligence Suite:</strong> Simulate repair outcome or dispatch work order
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setSimulatorOpen(true)}
            className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-cyan-500/20 transition"
          >
            <Sparkles className="w-3.5 h-3.5" /> What-If Repair Simulator
          </button>

          {isAuthority && (
            <button
              onClick={() => setWorkOrderOpen(true)}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-purple-600/20 transition"
            >
              <FileText className="w-3.5 h-3.5" /> Municipal Work Order
            </button>
          )}
        </div>
      </div>

      {/* Lifecycle Progression Tracker */}
      <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
          Municipal Resolution Timeline
        </div>
        <div className="grid grid-cols-5 gap-2 text-center">
          {timelineSteps.map((step, idx) => {
            const isCompleted = currentStepIdx >= idx && report.status !== 'REJECTED';
            const isCurrent = report.status === step;
            return (
              <div key={step} className="space-y-2">
                <div
                  className={`h-2 rounded-full transition ${
                    isCompleted
                      ? 'bg-cyan-500 shadow-sm shadow-cyan-500/50'
                      : 'bg-slate-800'
                  }`}
                />
                <span
                  className={`block text-[10px] sm:text-xs font-medium uppercase tracking-tight ${
                    isCurrent
                      ? 'text-cyan-400 font-bold'
                      : isCompleted
                      ? 'text-slate-300'
                      : 'text-slate-400'
                  }`}
                >
                  {step.replace('_', ' ')}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two Column Layout: Details & Intelligence */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Description, Factors, Forecast, Map */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl space-y-3">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Issue Description & Impact
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
              {report.description}
            </p>

            {/* Accessibility and Severity Tags */}
            <div className="pt-3 border-t border-slate-800/80 flex flex-wrap gap-2 text-xs">
              <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300">
                Severity: <strong className="text-amber-300">{report.severity}</strong>
              </span>
              {report.accessibility_barrier && report.accessibility_barrier !== 'NONE' && (
                <span className="px-2.5 py-1 rounded-lg bg-indigo-950/60 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                  <Accessibility className="w-3.5 h-3.5" /> Barrier: {report.accessibility_barrier.replace('_', ' ')}
                </span>
              )}
              {report.location_context && (
                <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300">
                  Context: <strong className="text-cyan-300">{report.location_context.replace('_', ' ')}</strong>
                </span>
              )}
            </div>
          </div>

          {/* Human Impact Engine: Factor Breakdown & Reasons */}
          <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                Human Impact Factor Breakdown
              </h2>
              <span className="text-xs font-mono font-bold text-rose-400">
                Total Score: {Math.round(report.human_impact_score <= 10 && report.human_impact_score > 0 ? report.human_impact_score * 10 : report.human_impact_score)} / 100
              </span>
            </div>

            {factors && (
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-1">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Severity</span>
                  <span className="text-sm font-bold font-mono text-slate-100">{factors.severity}/30</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Pedestrian</span>
                  <span className="text-sm font-bold font-mono text-slate-100">{factors.pedestrian_impact}/25</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Accessibility</span>
                  <span className="text-sm font-bold font-mono text-indigo-300">{factors.accessibility_impact}/25</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Location</span>
                  <span className="text-sm font-bold font-mono text-slate-100">{factors.location_context}/15</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center col-span-2 sm:col-span-1">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">History</span>
                  <span className="text-sm font-bold font-mono text-amber-300">{factors.history}/10</span>
                </div>
              </div>
            )}

            {/* Why was this issue prioritized? */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Explainable Algorithmic Rationale:
              </div>
              <ul className="text-xs text-slate-400 space-y-1 list-disc list-inside">
                {reasonsList.map((reason, idx) => (
                  <li key={idx} className="leading-relaxed">{reason}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Temporal Impact Forecast Component */}
          <ImpactForecastView reportId={report.id} />

          {/* Location Map */}
          <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-cyan-400" /> Geographic Coordinates
              </h2>
              <span className="text-xs font-mono text-cyan-400">
                Mode: {report.location_type}
              </span>
            </div>

            {report.address && (
              <div className="text-xs text-slate-300 bg-slate-950 px-3.5 py-2 rounded-xl border border-slate-800">
                <strong>Address / Landmark:</strong> {report.address}
              </div>
            )}

            {report.latitude != null && report.longitude != null ? (
              <LocationPickerMap
                latitude={report.latitude}
                longitude={report.longitude}
                readOnly
                height="260px"
              />
            ) : (
              <div className="p-6 rounded-xl bg-slate-950 border border-dashed border-slate-800 text-center text-xs text-slate-400">
                No GPS or map coordinates were pinned for this submission.
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Evidence & Authority Triage Console */}
        <div className="space-y-6">
          {/* Visual Evidence Photo */}
          <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl space-y-3">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Camera className="w-4 h-4 text-cyan-400" /> Photographic Evidence
            </h2>

            {report.evidence && report.evidence.length > 0 ? (
              <div className="space-y-3">
                {report.evidence.map((ev) => {
                  let parsedDetections: YOLODetectionItem[] = [];
                  if (ev.ai_detections) {
                    try {
                      parsedDetections = JSON.parse(ev.ai_detections);
                    } catch (e) {
                      parsedDetections = [];
                    }
                  }

                  return (
                    <div key={ev.id} className="rounded-xl overflow-hidden border border-slate-700 bg-slate-950 space-y-2">
                      <DetectionOverlay
                        imageUrl={ev.file_path}
                        detections={parsedDetections}
                        alt="Photographic evidence with AI bounding boxes"
                        maxHeight="max-h-72"
                      />

                      {parsedDetections.length > 0 && (
                        <div className="px-3 py-2 bg-slate-900 border-t border-b border-slate-800 text-[11px] text-slate-300 flex items-center justify-between">
                          <span className="font-semibold text-cyan-300 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                            YOLO AI Detections:
                          </span>
                          <span className="font-mono text-slate-200">
                            {parsedDetections.length} object{parsedDetections.length > 1 ? 's' : ''} found
                          </span>
                        </div>
                      )}
                      
                      {/* Evidence Quality Signals */}
                      <div className="p-3 text-[11px] text-slate-400 space-y-1.5 bg-slate-950">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1 font-semibold text-slate-300">
                          <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                          Evidence Confidence:
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded font-bold uppercase text-[10px] ${
                            ev.evidence_confidence === 'HIGH'
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : ev.evidence_confidence === 'MEDIUM'
                              ? 'bg-blue-500/20 text-blue-300'
                              : 'bg-amber-500/20 text-amber-300'
                          }`}
                        >
                          {ev.evidence_confidence || 'MEDIUM'}
                        </span>
                      </div>

                      {ev.capture_source && (
                        <div className="text-[10px] text-slate-400">
                          Source: <strong>{ev.capture_source}</strong>
                        </div>
                      )}

                      {ev.file_hash && (
                        <div className="text-[10px] font-mono text-slate-400 truncate">
                          SHA256: {ev.file_hash.slice(0, 16)}...
                        </div>
                      )}

                      {ev.confidence_reasons && (
                        <div className="text-[10px] text-slate-400 italic">
                          {ev.confidence_reasons}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              </div>
            ) : (
              <div className="p-8 rounded-xl bg-slate-950 border border-dashed border-slate-800 text-center text-xs text-slate-400">
                No photo attached. (Submitted via mobile text report)
              </div>
            )}
          </div>

          {/* Municipal Authority Triage Action Box */}
          {isAuthority && (
            <div className="bg-gradient-to-b from-purple-950/40 to-slate-900 border border-purple-500/30 p-5 rounded-2xl space-y-4">
              <div className="flex items-center gap-2 text-purple-300 font-bold text-sm">
                <ShieldAlert className="w-4 h-4" />
                Authority Triage Console
              </div>

              {updateSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Status & Priority successfully updated!
                </div>
              )}

              <form onSubmit={handleStatusUpdate} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                    Workflow Status
                  </label>
                  <select
                    value={triageStatus}
                    onChange={(e) => setTriageStatus(e.target.value as ReportStatus)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-purple-400"
                  >
                    <option value="OPEN">OPEN (Under Initial Log)</option>
                    <option value="UNDER_REVIEW">UNDER_REVIEW (Inspection)</option>
                    <option value="ASSIGNED">ASSIGNED (Contractor / Dept)</option>
                    <option value="IN_PROGRESS">IN_PROGRESS (Crew Dispatched)</option>
                    <option value="RESOLVED">RESOLVED (Fixed & Verified)</option>
                    <option value="REJECTED">REJECTED (Duplicate / Invalid)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                    Priority Level
                  </label>
                  <select
                    value={triagePriority}
                    onChange={(e) => setTriagePriority(e.target.value as PriorityLevel)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-purple-400"
                  >
                    <option value="CRITICAL">CRITICAL</option>
                    <option value="HIGH">HIGH</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="LOW">LOW</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                    Human Impact Score (0 - 100)
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    max="100"
                    value={triageScore}
                    onChange={(e) => setTriageScore(parseFloat(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-purple-400"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                    Dispatch & Public Resolution Notes
                  </label>
                  <textarea
                    rows={3}
                    value={triageNotes}
                    onChange={(e) => setTriageNotes(e.target.value)}
                    placeholder="Enter dispatch notes, work order number, or repair summary..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-purple-400"
                  />
                </div>

                <button
                  type="submit"
                  disabled={updating}
                  className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs shadow-lg shadow-purple-600/30 flex items-center justify-center gap-1.5 transition disabled:opacity-50"
                >
                  {updating ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" /> Save Workflow Update
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <WhatIfSimulatorModal
        reportId={report.id}
        reportTitle={report.title}
        isOpen={simulatorOpen}
        onClose={() => setSimulatorOpen(false)}
      />

      <WorkOrderModal
        reportId={report.id}
        isOpen={workOrderOpen}
        onClose={() => setWorkOrderOpen(false)}
      />
    </div>
  );
};
