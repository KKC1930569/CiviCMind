import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { reportsApi } from '../api/reports';
import type { Report, DashboardStats, ReportStatus, PriorityLevel } from '../types';
import { CommunityIncidentMap } from '../components/CommunityIncidentMap';
import { StatusBadge } from '../components/StatusBadge';
import { CategoryBadge } from '../components/CategoryBadge';
import { ImpactScoreIndicator } from '../components/ImpactScoreIndicator';
import { WhatIfSimulatorModal } from '../components/WhatIfSimulatorModal';
import { WorkOrderModal } from '../components/WorkOrderModal';
import { 
  ShieldAlert, 
  Layers, 
  Clock, 
  Flame, 
  Search, 
  RefreshCw, 
  ExternalLink, 
  Loader2,
  SlidersHorizontal,
  Accessibility,
  History,
  Sparkles,
  MapPin
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';

const CATEGORY_COLORS: Record<string, string> = {
  ACCESSIBILITY: '#6366f1',
  POTHOLE: '#f59e0b',
  ROAD_DAMAGE: '#f97316',
  SIDEWALK: '#14b8a6',
  GARBAGE: '#10b981',
  SIGNAGE: '#0284c7',
  OTHER: '#64748b',
};

export const AuthorityDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters & Sorting
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [accessibilityOnly, setAccessibilityOnly] = useState(false);
  const [demoFilter, setDemoFilter] = useState<'ALL' | 'CITIZEN' | 'DEMO'>('ALL');
  const [sortBy, setSortBy] = useState<'impact' | 'priority' | 'severity' | 'created_at'>('impact');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [simReportId, setSimReportId] = useState<number | null>(null);
  const [simReportTitle, setSimReportTitle] = useState('');
  const [woReportId, setWoReportId] = useState<number | null>(null);

  // Quick Triage Modal State
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [triageModalOpen, setTriageModalOpen] = useState(false);
  const [triageStatus, setTriageStatus] = useState<ReportStatus>('OPEN');
  const [triagePriority, setTriagePriority] = useState<PriorityLevel>('MEDIUM');
  const [triageNotes, setTriageNotes] = useState('');
  const [triageScore, setTriageScore] = useState<number>(50.0);
  const [savingTriage, setSavingTriage] = useState(false);

  const loadData = async () => {
    try {
      const [statsData, reportsData] = await Promise.all([
        reportsApi.getDashboardStats(),
        reportsApi.getReports({ 
          sort_by: sortBy,
          accessibility_only: accessibilityOnly 
        }),
      ]);
      setStats(statsData);
      setReports(reportsData);
    } catch (err) {
      console.error('Failed to load authority dashboard data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [sortBy, accessibilityOnly]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const openTriageModal = (rep: Report) => {
    setSelectedReport(rep);
    setTriageStatus(rep.status);
    setTriagePriority(rep.priority_level);
    setTriageNotes(rep.impact_notes || '');
    setTriageScore(rep.human_impact_score);
    setTriageModalOpen(true);
  };

  const handleSaveTriage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReport) return;

    setSavingTriage(true);
    try {
      const updated = await reportsApi.updateReportStatus(selectedReport.id, {
        status: triageStatus,
        priority_level: triagePriority,
        impact_notes: triageNotes,
        human_impact_score: triageScore,
      });

      setReports((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
      const newStats = await reportsApi.getDashboardStats();
      setStats(newStats);

      setTriageModalOpen(false);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to update report status.');
    } finally {
      setSavingTriage(false);
    }
  };

  const filteredReports = reports.filter((r) => {
    const matchesCat = categoryFilter === 'ALL' || r.category === categoryFilter;
    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
    const matchesPriority = priorityFilter === 'ALL' || r.priority_level === priorityFilter;
    
    let matchesDemo = true;
    if (demoFilter === 'CITIZEN') matchesDemo = !r.is_demo_data;
    if (demoFilter === 'DEMO') matchesDemo = r.is_demo_data;

    const matchesSearch =
      r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.address && r.address.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesCat && matchesStatus && matchesPriority && matchesDemo && matchesSearch;
  });

  const categoryChartData = stats
    ? Object.entries(stats.category_breakdown).map(([key, count]) => ({
        name: key.replace('_', ' '),
        categoryKey: key,
        count,
      }))
    : [];

  const priorityChartData = stats
    ? Object.entries(stats.priority_breakdown).map(([key, count]) => ({
        name: key,
        count,
      }))
    : [];

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
        <p className="text-xs text-slate-400">Loading municipal command intelligence...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Command Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold mb-2">
            <ShieldAlert className="w-3.5 h-3.5" /> MUNICIPAL AUTHORITY COMMAND CONSOLE
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            City Infrastructure Operations
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Real-time human-impact dispatch queue, universal accessibility tracking, and work order dispatch.
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh Live Feeds
        </button>
      </div>

      {/* KPI Cards Grid (Requirement 12) */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Issues */}
        <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Total Issues</span>
            <Layers className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">
            {stats?.total_reports || 0}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Grid workorders</div>
        </div>

        {/* Open Issues */}
        <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Open Issues</span>
            <Clock className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-3xl font-extrabold text-blue-400">
            {stats?.open_reports || 0}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Pending initial review</div>
        </div>

        {/* Critical Issues */}
        <div className="bg-rose-950/20 border border-rose-500/30 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-rose-300 mb-2">
            <span className="text-xs font-medium">Critical Issues</span>
            <Flame className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-3xl font-extrabold text-rose-400">
            {stats?.critical_reports || 0}
          </div>
          <div className="text-[11px] text-rose-300/80 mt-1">Priority: CRITICAL</div>
        </div>

        {/* Average Impact Score */}
        <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Avg Impact Score</span>
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold text-amber-400">
            {stats?.average_impact_score || 0}
            <span className="text-xs font-normal text-slate-400">/100</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Civic exposure average</div>
        </div>

        {/* Accessibility-Related Issues */}
        <div className="bg-indigo-950/20 border border-indigo-500/30 p-5 rounded-2xl col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-indigo-300 mb-2">
            <span className="text-xs font-medium">Accessibility Barriers</span>
            <Accessibility className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-3xl font-extrabold text-indigo-300">
            {stats?.accessibility_issue_count || 0}
          </div>
          <div className="text-[11px] text-indigo-200/80 mt-1">Mobility & ADA queues</div>
        </div>
      </div>

      {/* Analytics Charts & High-Impact Locations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Breakdown Bar Chart */}
        <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-white uppercase tracking-wider">
              Category Distribution
            </h2>
            <span className="text-[10px] text-slate-400">Live Grid</span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryChartData} margin={{ top: 10, right: 10, left: -25, bottom: 25 }}>
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: '#94a3b8', fontSize: 9 }} 
                  interval={0} 
                  angle={-25} 
                  textAnchor="end" 
                />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '11px' }} 
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {categoryChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.categoryKey] || '#38bdf8'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Priority Breakdown Bar Chart */}
        <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-white uppercase tracking-wider">
              Priority Tier Distribution
            </h2>
            <span className="text-[10px] text-slate-400">Human Impact Tiers</span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priorityChartData} margin={{ top: 10, right: 10, left: -25, bottom: 5 }}>
                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '11px' }} 
                />
                <Bar dataKey="count" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* High-Impact Locations (Requirement 12) */}
        <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl space-y-3 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-rose-400" /> High-Impact Locations
            </h2>
            <span className="text-[10px] text-rose-400 font-semibold">Priority Hotspots</span>
          </div>

          <div className="space-y-2 overflow-y-auto max-h-52 pr-1">
            {stats?.high_impact_locations && stats.high_impact_locations.length > 0 ? (
              stats.high_impact_locations.map((loc) => (
                <div
                  key={loc.id}
                  onClick={() => {
                    const found = reports.find(r => r.id === loc.id);
                    if (found) openTriageModal(found);
                  }}
                  className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 hover:border-slate-700 cursor-pointer transition flex items-center justify-between text-xs"
                >
                  <div className="truncate max-w-[170px]">
                    <div className="font-semibold text-slate-200 truncate">{loc.title}</div>
                    <div className="text-[10px] text-slate-400 truncate">{loc.address || 'GPS Telemetry'}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-mono font-bold text-rose-400">{loc.impact_score}/100</span>
                    <span className="block text-[9px] uppercase font-bold text-slate-400">{loc.priority}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 italic text-center py-8">No high impact locations logged.</p>
            )}
          </div>
        </div>
      </div>

      {/* GIS Spatial Command Map */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-purple-400" /> Municipal Incident Map
          </h2>
          <span className="text-xs text-slate-400">
            Pins rendered with Human Impact severity colors (Pulsing Red = Critical &ge; 80)
          </span>
        </div>

        <CommunityIncidentMap 
          reports={filteredReports} 
          height="400px" 
          onSelectReport={(rep) => openTriageModal(rep)}
        />
      </div>

      {/* Smart Prioritization Queue Table (Requirement 6) */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl overflow-hidden space-y-4 p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white">
              Smart Prioritization Queue
            </h2>
            <p className="text-xs text-slate-400">
              Ranked by Human Impact Score (how much the issue affects people) with full explainable rationale.
            </p>
          </div>

          {/* Ranking Mode Toggle Buttons */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => setSortBy('impact')}
              className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
                sortBy === 'impact' ? 'bg-cyan-500 text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Flame className="w-3.5 h-3.5" /> Human Impact (Main)
            </button>
            <button
              type="button"
              onClick={() => setSortBy('priority')}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                sortBy === 'priority' ? 'bg-slate-800 text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Priority Tier
            </button>
            <button
              type="button"
              onClick={() => setSortBy('severity')}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                sortBy === 'severity' ? 'bg-slate-800 text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Severity
            </button>
            <button
              type="button"
              onClick={() => setSortBy('created_at')}
              className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
                sortBy === 'created_at' ? 'bg-slate-800 text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Clock className="w-3.5 h-3.5" /> Recency
            </button>
          </div>
        </div>

        {/* Filter controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by keyword, street..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Priority Filter */}
          <div>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
            >
              <option value="ALL">All Priorities</option>
              <option value="CRITICAL">CRITICAL (&ge; 80)</option>
              <option value="HIGH">HIGH (60 - 79)</option>
              <option value="MEDIUM">MEDIUM (30 - 59)</option>
              <option value="LOW">LOW (0 - 29)</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
            >
              <option value="ALL">All Categories</option>
              <option value="ACCESSIBILITY">Accessibility Barrier</option>
              <option value="POTHOLE">Pothole</option>
              <option value="ROAD_DAMAGE">Road Damage</option>
              <option value="SIDEWALK">Sidewalk</option>
              <option value="GARBAGE">Garbage</option>
              <option value="SIGNAGE">Signage</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="OPEN">Open</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>

          {/* Demo Mode Toggle (Requirement 13) */}
          <div>
            <select
              value={demoFilter}
              onChange={(e) => setDemoFilter(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
            >
              <option value="ALL">All Data (Live + Demo)</option>
              <option value="CITIZEN">Live Citizen Submissions Only</option>
              <option value="DEMO">Demo Benchmark Cases Only</option>
            </select>
          </div>
        </div>

        {/* Accessibility Quick Toggle */}
        <div className="flex items-center justify-between text-xs text-slate-300 pt-1">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={accessibilityOnly}
              onChange={(e) => setAccessibilityOnly(e.target.checked)}
              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 bg-slate-900 border-slate-700"
            />
            <span className="flex items-center gap-1.5 font-medium">
              <Accessibility className="w-4 h-4 text-indigo-400" />
              Filter Accessibility Barriers Only (Universal Mobility Queue)
            </span>
          </label>

          <span className="text-slate-400 text-[11px]">
            Showing {filteredReports.length} incidents
          </span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Rank / Impact</th>
                <th className="py-3 px-4">Incident & Why Prioritized</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredReports.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No reports match the current criteria.
                  </td>
                </tr>
              ) : (
                filteredReports.map((r, idx) => {
                  let parsedReasons: string[] = [];
                  if (r.reasons) {
                    try {
                      parsedReasons = JSON.parse(r.reasons);
                    } catch (e) {
                      parsedReasons = (r.impact_notes || '').split(';').map(s => s.trim()).filter(Boolean);
                    }
                  } else if (r.impact_notes) {
                    parsedReasons = r.impact_notes.split(';').map(s => s.trim()).filter(Boolean);
                  }

                  return (
                    <tr key={r.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-slate-400 font-bold">#{idx + 1}</span>
                          <ImpactScoreIndicator score={r.human_impact_score} priority={r.priority_level} showDetails size="sm" />
                        </div>
                      </td>

                      <td className="py-3 px-4 max-w-sm">
                        <div className="font-semibold text-white truncate flex items-center gap-2">
                          <span className="truncate">{r.title}</span>
                          {r.case_id && (
                            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 shrink-0">
                              {r.case_id}
                            </span>
                          )}
                          {r.defect_type && (
                            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 shrink-0 flex items-center gap-1">
                              <Sparkles className="w-2.5 h-2.5" />
                              {r.defect_type.replace(/_/g, ' ')}
                            </span>
                          )}
                          {r.is_demo_data && (
                            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20 shrink-0">
                              DEMO
                            </span>
                          )}
                          {r.is_repeated_issue && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 shrink-0 flex items-center gap-0.5">
                              <History className="w-2.5 h-2.5" /> REPEAT
                            </span>
                          )}
                        </div>

                        {/* Explainable Rationale Preview (Requirement 6) */}
                        <div className="text-[11px] text-slate-400 mt-1 line-clamp-1 italic">
                          Reasons: {parsedReasons.slice(0, 2).join(' • ') || r.description}
                        </div>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <CategoryBadge category={r.category} />
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <StatusBadge status={r.status} size="sm" />
                      </td>

                      <td className="py-3 px-4 max-w-[140px] truncate text-slate-400">
                        {r.address || (r.latitude != null ? `${r.latitude.toFixed(3)}, ${r.longitude?.toFixed(3)}` : 'None')}
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap space-x-1.5">
                        {/* What-If Simulator Button */}
                        <button
                          onClick={() => {
                            setSimReportId(r.id);
                            setSimReportTitle(r.title);
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[11px] font-semibold transition"
                          title="Run What-If Repair Simulator"
                        >
                          Simulate
                        </button>

                        {/* Work Order Button */}
                        <button
                          onClick={() => setWoReportId(r.id)}
                          className="px-2.5 py-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[11px] font-semibold transition"
                          title="Generate Municipal Work Order"
                        >
                          Work Order
                        </button>

                        {/* Quick Triage */}
                        <button
                          onClick={() => openTriageModal(r)}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold transition"
                        >
                          Triage
                        </button>

                        <Link
                          to={`/report/${r.id}`}
                          className="p-1.5 inline-flex rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                          title="Full Incident Dossier"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Triage Modal */}
      {triageModalOpen && selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
                <SlidersHorizontal className="w-4 h-4" />
                Triage Incident #{selectedReport.id}
              </div>
              <button
                type="button"
                onClick={() => setTriageModalOpen(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white">{selectedReport.title}</h3>
              <p className="text-xs text-slate-400 line-clamp-2">{selectedReport.description}</p>
            </div>

            <form onSubmit={handleSaveTriage} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Workflow Status
                </label>
                <select
                  value={triageStatus}
                  onChange={(e) => setTriageStatus(e.target.value as ReportStatus)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-purple-400"
                >
                  <option value="OPEN">OPEN</option>
                  <option value="UNDER_REVIEW">UNDER REVIEW</option>
                  <option value="ASSIGNED">ASSIGNED</option>
                  <option value="IN_PROGRESS">IN PROGRESS</option>
                  <option value="RESOLVED">RESOLVED</option>
                  <option value="REJECTED">REJECTED</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Priority Tier
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
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Human Impact Priority Score (0 - 100)
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
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Authority / Dispatch Resolution Notes
                </label>
                <textarea
                  rows={3}
                  value={triageNotes}
                  onChange={(e) => setTriageNotes(e.target.value)}
                  placeholder="Notes, department assigned, or public repair update..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-purple-400"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setTriageModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingTriage}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition flex items-center gap-1.5"
                >
                  {savingTriage ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...
                    </>
                  ) : (
                    'Save Triage Record'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Simulator Modal */}
      {simReportId && (
        <WhatIfSimulatorModal
          reportId={simReportId}
          reportTitle={simReportTitle}
          isOpen={true}
          onClose={() => setSimReportId(null)}
        />
      )}

      {/* Work Order Modal */}
      {woReportId && (
        <WorkOrderModal
          reportId={woReportId}
          isOpen={true}
          onClose={() => setWoReportId(null)}
        />
      )}
    </div>
  );
};
