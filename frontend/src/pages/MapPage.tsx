import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { reportsApi } from '../api/reports';
import type { Report } from '../types';
import { CommunityIncidentMap } from '../components/CommunityIncidentMap';
import { StatusBadge } from '../components/StatusBadge';
import { CategoryBadge } from '../components/CategoryBadge';
import { ImpactScoreIndicator } from '../components/ImpactScoreIndicator';
import { 
  PlusCircle, 
  MapPin, 
  Sparkles, 
  X, 
  ArrowRight, 
  Loader2,
  Filter
} from 'lucide-react';

export const MapPage: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<string>('ALL');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  useEffect(() => {
    const fetchMapReports = async () => {
      try {
        const data = await reportsApi.getReports({ sort_by: 'impact' });
        // Only keep reports with valid geographic coordinates
        const withCoords = data.filter(r => r.latitude != null && r.longitude != null);
        setReports(withCoords);
      } catch (err) {
        console.error('Failed to load map incidents:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMapReports();
  }, []);

  const filterOptions = [
    { id: 'ALL', label: 'All Hazards' },
    { id: 'CRITICAL', label: 'Critical Urgency' },
    { id: 'POTHOLE', label: 'Potholes' },
    { id: 'ROAD_DAMAGE', label: 'Road Damage' },
    { id: 'ACCESSIBILITY', label: 'Accessibility' },
    { id: 'SIDEWALK', label: 'Sidewalks' },
  ];

  const filteredReports = reports.filter((r) => {
    if (selectedFilter === 'ALL') return true;
    if (selectedFilter === 'CRITICAL') return r.priority_level === 'CRITICAL' || r.human_impact_score >= 80;
    if (selectedFilter === 'ACCESSIBILITY') {
      return r.category === 'ACCESSIBILITY' || r.affects_mobility_impaired || (r.accessibility_barrier && r.accessibility_barrier !== 'NONE');
    }
    return r.category === selectedFilter;
  });

  if (loading) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
        <p className="text-xs text-slate-400">Loading spatial city intelligence...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-7xl mx-auto px-2 sm:px-4 pb-20 md:pb-6 relative">
      {/* Top Mobile Bar with Title & Filter Pills */}
      <div className="pt-2 pb-3 space-y-2.5 z-10 bg-slate-950/80 backdrop-blur-md">
        <div className="flex items-center justify-between px-2">
          <div>
            <h1 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-cyan-400" />
              <span>Civic Hazard Radar</span>
            </h1>
            <p className="text-[11px] text-slate-400">
              Showing {filteredReports.length} geo-tagged incident{filteredReports.length === 1 ? '' : 's'}
            </p>
          </div>

          <Link
            to="/report-issue"
            className="px-3 py-1.5 rounded-full bg-cyan-500 hover:bg-cyan-400 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-cyan-500/20 active:scale-95 transition"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Pin Hazard</span>
          </Link>
        </div>

        {/* Filter Pills scrollable horizontally */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar px-1 pb-1">
          <Filter className="w-3.5 h-3.5 text-slate-500 shrink-0 ml-1" />
          {filterOptions.map((opt) => {
            const isSelected = selectedFilter === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setSelectedFilter(opt.id)}
                className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition ${
                  isSelected
                    ? 'bg-cyan-500 text-white font-semibold shadow-sm shadow-cyan-500/25'
                    : 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Map View */}
      <div className="flex-1 w-full rounded-2xl overflow-hidden border border-slate-800 relative shadow-inner">
        <CommunityIncidentMap
          reports={filteredReports}
          height="100%"
          selectedReportId={selectedReport?.id}
          onSelectReport={(rep) => setSelectedReport(rep)}
        />

        {/* Selected Incident Bottom Sheet / Drawer */}
        {selectedReport && (
          <div className="absolute bottom-3 inset-x-3 sm:inset-x-6 z-[1000] bg-slate-950/95 border border-slate-800 rounded-2xl p-4 shadow-2xl backdrop-blur-xl animate-in slide-in-from-bottom-5 duration-200 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <CategoryBadge category={selectedReport.category} />
                <StatusBadge status={selectedReport.status} size="sm" />
                {selectedReport.case_id && (
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 text-cyan-300 border border-slate-800">
                    {selectedReport.case_id}
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={() => setSelectedReport(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                aria-label="Close Preview"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <h3 className="text-sm font-bold text-white line-clamp-1">
                {selectedReport.title}
              </h3>
              {selectedReport.defect_type && (
                <div className="mt-1 inline-flex items-center gap-1 text-[11px] font-medium text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>AI: {selectedReport.defect_type.replace(/_/g, ' ')}</span>
                  {selectedReport.ai_confidence != null && (
                    <span className="text-amber-400/80">
                      ({(selectedReport.ai_confidence * 100).toFixed(0)}%)
                    </span>
                  )}
                </div>
              )}
              {selectedReport.address && (
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                  📍 {selectedReport.address}
                </p>
              )}
            </div>

            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
              <ImpactScoreIndicator
                score={selectedReport.human_impact_score}
                priority={selectedReport.priority_level}
                showDetails
                size="sm"
              />

              <Link
                to={`/report/${selectedReport.id}`}
                className="px-3.5 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white text-xs font-semibold flex items-center gap-1 shadow-md shadow-cyan-500/20 transition active:scale-95"
              >
                <span>View Full Case</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
