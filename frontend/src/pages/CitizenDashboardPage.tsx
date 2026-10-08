import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { reportsApi } from '../api/reports';
import type { Report, DashboardStats } from '../types';
import { CommunityIncidentMap } from '../components/CommunityIncidentMap';
import { StatusBadge } from '../components/StatusBadge';
import { CategoryBadge } from '../components/CategoryBadge';
import { ImpactScoreIndicator } from '../components/ImpactScoreIndicator';
import { 
  PlusCircle, 
  MapPin, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  Layers, 
  Loader2, 
  Sparkles,
  Maximize2
} from 'lucide-react';

export const CitizenDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [myReports, setMyReports] = useState<Report[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [allReps, statsData, myReps] = await Promise.all([
          reportsApi.getReports({ sort_by: 'created_at' }),
          reportsApi.getDashboardStats(),
          reportsApi.getReports({ mine_only: true }),
        ]);
        setReports(allReps);
        setStats(statsData);
        setMyReports(myReps);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
        <p className="text-sm text-slate-400">Loading civic intelligence stream...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 pb-24 md:pb-12 space-y-6 sm:space-y-8">
      {/* Mobile-Friendly Hero / Header Card */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950/40 to-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 sm:gap-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" /> CivicMind Intelligence
          </div>
          
          <h1 className="text-xl sm:text-3xl font-extrabold text-white tracking-tight">
            Welcome back, {user?.full_name?.split(' ')[0] || 'Citizen'}
          </h1>
          
          <p className="text-xs sm:text-sm text-cyan-300/90 font-medium">
            "Make your city better, one report at a time."
          </p>
          
          <p className="text-xs text-slate-400 max-w-xl hidden sm:block">
            See active hazards in your area. You have submitted{' '}
            <strong className="text-cyan-400">{myReports.length}</strong> report{myReports.length === 1 ? '' : 's'}.
          </p>
        </div>

        {/* Primary Action Button */}
        <div className="w-full md:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 relative z-10">
          <Link
            to="/report-issue"
            className="w-full sm:w-auto py-3 px-5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 transition active:scale-98"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Report an Issue</span>
          </Link>

          <Link
            to="/my-reports"
            className="w-full sm:w-auto py-3 px-4 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
          >
            <span>My Reports ({myReports.length})</span>
          </Link>
        </div>
      </div>

      {/* Metrics Row - Thumb Friendly Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-slate-900/60 border border-slate-800 p-4 sm:p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[11px] sm:text-xs font-medium">Total Reports</span>
            <Layers className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-xl sm:text-3xl font-extrabold text-white">
            {stats?.total_reports || 0}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Municipal Grid</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 p-4 sm:p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[11px] sm:text-xs font-medium">Under Review</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl sm:text-3xl font-extrabold text-amber-400">
            {(stats?.open_reports || 0) + (stats?.under_review_reports || 0)}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Pending Action</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 p-4 sm:p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[11px] sm:text-xs font-medium">Critical Priority</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-xl sm:text-3xl font-extrabold text-rose-400">
            {stats?.high_impact_count || 0}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">High Impact</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 p-4 sm:p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[11px] sm:text-xs font-medium">Resolved</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl sm:text-3xl font-extrabold text-emerald-400">
            {stats?.resolved_reports || 0}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Completed Fixes</div>
        </div>
      </div>

      {/* Small Mobile Map Preview with Expand to /map */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm sm:text-lg font-bold text-white flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-cyan-400" /> City Incident Map
            </h2>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Pins colored by human urgency (Red = High Impact)
            </p>
          </div>

          <Link
            to="/map"
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition"
          >
            <span>Full Map Radar</span>
            <Maximize2 className="w-3 h-3" />
          </Link>
        </div>

        <div className="rounded-2xl overflow-hidden border border-slate-800 relative">
          <CommunityIncidentMap reports={reports} height="240px" />
          <Link
            to="/map"
            className="absolute bottom-2.5 right-2.5 z-[1000] px-3 py-1 rounded-xl bg-slate-950/90 hover:bg-slate-900 border border-slate-700 text-xs font-medium text-cyan-300 shadow-md backdrop-blur-sm flex items-center gap-1"
          >
            <span>Explore Map</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* My Recent Reports (Mobile Friendly) */}
      {myReports.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm sm:text-lg font-bold text-white">My Recent Reports</h2>
            <Link
              to="/my-reports"
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition"
            >
              <span>View All</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden divide-y divide-slate-800/80">
            {myReports.slice(0, 3).map((r) => (
              <Link
                key={r.id}
                to={`/report/${r.id}`}
                className="p-3.5 flex items-center justify-between hover:bg-slate-900/80 transition"
              >
                <div className="space-y-1 pr-3 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-white truncate">
                      {r.title}
                    </span>
                    {r.defect_type && (
                      <span className="text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 uppercase shrink-0">
                        {r.defect_type.replace(/_/g, ' ')}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400">
                    <span>{r.category}</span>
                    <span>•</span>
                    <span>Score: {Math.round(r.human_impact_score)}/100</span>
                  </div>
                </div>

                <StatusBadge status={r.status} size="sm" />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Nearby Community Incidents */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm sm:text-lg font-bold text-white">Nearby Civic Issues</h2>
          <Link
            to="/map"
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition"
          >
            <span>Live Grid</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {reports.slice(0, 6).map((r) => (
            <Link
              key={r.id}
              to={`/report/${r.id}`}
              className="bg-slate-900/60 border border-slate-800 hover:border-slate-700 p-4 rounded-2xl flex flex-col justify-between transition group shadow-sm"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <CategoryBadge category={r.category} />
                    {r.case_id && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                        {r.case_id}
                      </span>
                    )}
                  </div>
                  <StatusBadge status={r.status} size="sm" />
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-white group-hover:text-cyan-400 transition line-clamp-1">
                    {r.title}
                  </h3>
                  {r.defect_type && (
                    <div className="mt-1 inline-flex items-center gap-1 text-[10px] font-medium text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded">
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      <span>AI: {r.defect_type.replace(/_/g, ' ')}</span>
                      {r.ai_confidence != null && (
                        <span className="text-amber-400/80">({(r.ai_confidence * 100).toFixed(0)}%)</span>
                      )}
                    </div>
                  )}
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {r.description}
                  </p>
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <ImpactScoreIndicator score={r.human_impact_score} priority={r.priority_level} showDetails size="sm" />
                <span className="text-slate-400 text-[10px]">
                  {new Date(r.created_at).toLocaleDateString()}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};
