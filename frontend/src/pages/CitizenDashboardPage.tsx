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
  Sparkles 
} from 'lucide-react';

export const CitizenDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [myReportCount, setMyReportCount] = useState<number>(0);
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
        setMyReportCount(myReps.length);
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950/30 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" /> Citizen Command Hub
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Welcome back, {user?.full_name}
          </h1>
          <p className="text-sm text-slate-300 max-w-xl">
            See active infrastructure hazards in your area. You have submitted{' '}
            <strong className="text-cyan-400">{myReportCount}</strong> report{myReportCount === 1 ? '' : 's'}.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/report-issue"
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-sm shadow-lg shadow-cyan-500/25 flex items-center gap-2 transition transform active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            Report Issue Now
          </Link>
          <Link
            to="/my-reports"
            className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-sm font-semibold transition"
          >
            My Reports ({myReportCount})
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Community Reports</span>
            <Layers className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white">
            {stats?.total_reports || 0}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Logged across municipal grid</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Open / Under Review</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-400">
            {(stats?.open_reports || 0) + (stats?.under_review_reports || 0)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Pending dispatch</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Critical Impact</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-rose-400">
            {stats?.high_impact_count || 0}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Vulnerable transit priority</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Resolved Fixes</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400">
            {stats?.resolved_reports || 0}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Completed repairs</div>
        </div>
      </div>

      {/* Interactive Incident Map */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <MapPin className="w-5 h-5 text-cyan-400" /> Live Community Incident Map
            </h2>
            <p className="text-xs text-slate-400">
              Interactive map pins colored by human urgency (Red = High Human Impact, Blue/Orange = General Infrastructure)
            </p>
          </div>
        </div>

        <CommunityIncidentMap reports={reports} height="380px" />
      </div>

      {/* Recent Community Incidents */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Recent Infrastructure Reports</h2>
          <Link
            to="/my-reports"
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition"
          >
            View My Activity <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reports.slice(0, 6).map((r) => (
            <Link
              key={r.id}
              to={`/report/${r.id}`}
              className="bg-slate-900/60 border border-slate-800 hover:border-slate-700 p-5 rounded-2xl flex flex-col justify-between transition group shadow-sm hover:shadow-cyan-500/5"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <CategoryBadge category={r.category} />
                  <StatusBadge status={r.status} size="sm" />
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-white group-hover:text-cyan-400 transition line-clamp-1">
                    {r.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {r.description}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <ImpactScoreIndicator score={r.human_impact_score} priority={r.priority_level} showDetails />
                <span className="text-slate-400 text-[11px]">
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
