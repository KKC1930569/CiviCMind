import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { reportsApi } from '../api/reports';
import type { Report } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { CategoryBadge } from '../components/CategoryBadge';
import { ImpactScoreIndicator } from '../components/ImpactScoreIndicator';
import { 
  PlusCircle, 
  MapPin, 
  Loader2, 
  Search, 
  ArrowRight, 
  Inbox 
} from 'lucide-react';

export const MyReportsPage: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchMyReports = async () => {
      try {
        const data = await reportsApi.getReports({ mine_only: true });
        setReports(data);
      } catch (err) {
        console.error('Error fetching reports:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMyReports();
  }, []);

  const filteredReports = reports.filter((r) => {
    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
    const matchesSearch =
      r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.address && r.address.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            My Submitted Reports
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Track the status, investigation, and repair progress of infrastructure you reported.
          </p>
        </div>

        <Link
          to="/report-issue"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white font-semibold text-xs shadow-lg shadow-cyan-500/20 transition self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" /> Report New Issue
        </Link>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search your reports by title, keyword, address..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
          {['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                statusFilter === st
                  ? 'bg-slate-700 text-cyan-300 font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {st === 'ALL' ? 'All Statuses' : st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="min-h-[40vh] flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
          <p className="text-xs text-slate-400">Loading your submissions...</p>
        </div>
      ) : filteredReports.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/40 rounded-3xl border border-dashed border-slate-800 space-y-3">
          <div className="p-4 rounded-full bg-slate-800/80 text-slate-400 w-14 h-14 mx-auto flex items-center justify-center">
            <Inbox className="w-7 h-7" />
          </div>
          <h3 className="text-base font-semibold text-white">No reports found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {reports.length === 0
              ? "You haven't submitted any infrastructure reports yet. Help improve your city by submitting an issue."
              : 'No reports match your selected filters.'}
          </p>
          {reports.length === 0 && (
            <div className="pt-2">
              <Link
                to="/report-issue"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500 text-white text-xs font-semibold hover:bg-cyan-400 transition"
              >
                <PlusCircle className="w-4 h-4" /> Create First Report
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredReports.map((report) => {
            const hasEvidence = report.evidence && report.evidence.length > 0;
            const evidenceUrl = hasEvidence ? report.evidence[0].file_path : null;

            return (
              <Link
                key={report.id}
                to={`/report/${report.id}`}
                className="bg-slate-900/60 border border-slate-800 hover:border-slate-700 rounded-2xl overflow-hidden flex flex-col justify-between transition group shadow-sm hover:shadow-cyan-500/10"
              >
                {/* Photo Thumbnail if exists */}
                {evidenceUrl ? (
                  <div className="h-44 w-full bg-slate-950 overflow-hidden relative">
                    <img
                      src={evidenceUrl}
                      alt={report.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    <div className="absolute top-3 left-3">
                      <CategoryBadge category={report.category} />
                    </div>
                    <div className="absolute top-3 right-3">
                      <StatusBadge status={report.status} size="sm" />
                    </div>
                  </div>
                ) : (
                  <div className="p-5 pb-0 flex items-center justify-between">
                    <CategoryBadge category={report.category} />
                    <StatusBadge status={report.status} size="sm" />
                  </div>
                )}

                <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white group-hover:text-cyan-400 transition line-clamp-1">
                      {report.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                      {report.description}
                    </p>
                  </div>

                  {report.address && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 truncate">
                      <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span className="truncate">{report.address}</span>
                    </div>
                  )}

                  {report.accessibility_barrier && report.accessibility_barrier !== 'NONE' && (
                    <div className="text-[10px] text-indigo-300 font-semibold bg-indigo-950/40 px-2 py-0.5 rounded border border-indigo-500/20 w-fit">
                      ♿ Barrier: {report.accessibility_barrier.replace('_', ' ')}
                    </div>
                  )}

                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                    <ImpactScoreIndicator score={report.human_impact_score} priority={report.priority_level} showDetails />
                    <span className="text-[11px] text-slate-400 flex items-center gap-1 group-hover:text-cyan-400 transition">
                      Details <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};
