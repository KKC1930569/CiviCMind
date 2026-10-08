import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { reportsApi } from '../api/reports';
import type { Report } from '../types';
import { 
  LogOut, 
  ShieldAlert, 
  ClipboardList, 
  Camera, 
  MapPin, 
  ChevronRight, 
  ShieldCheck, 
  Sparkles 
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, logout, isAuthority } = useAuth();
  const navigate = useNavigate();
  const [myReports, setMyReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyActivity = async () => {
      try {
        const data = await reportsApi.getReports({ mine_only: true });
        setMyReports(data);
      } catch (err) {
        console.error('Failed to load profile data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMyActivity();
  }, []);

  const handleSignOut = () => {
    logout();
    navigate('/login');
  };

  const resolvedCount = myReports.filter(r => r.status === 'RESOLVED').length;
  const pendingCount = myReports.filter(r => r.status === 'OPEN' || r.status === 'UNDER_REVIEW' || r.status === 'IN_PROGRESS').length;

  const initials = user?.full_name
    ? user.full_name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'CM';

  return (
    <div className="max-w-xl mx-auto px-4 py-6 pb-24 md:pb-8 space-y-6">
      {/* Profile Header Card */}
      <div className="p-6 rounded-3xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center gap-4 relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 p-0.5 shadow-lg shadow-cyan-500/25 flex items-center justify-center shrink-0">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <span className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-tr from-cyan-400 to-blue-400">
                {initials}
              </span>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-white tracking-tight">
                {user?.full_name || 'Citizen'}
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                {user?.role || 'CITIZEN'}
              </span>
            </div>
            <p className="text-xs text-slate-400">{user?.email}</p>
          </div>
        </div>

        {/* Activity Summary Stats */}
        <div className="grid grid-cols-3 gap-2.5 mt-6 pt-5 border-t border-slate-800/80 text-center">
          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="block text-xs text-slate-400">Total</span>
            <span className="text-base font-bold font-mono text-white">
              {loading ? '...' : myReports.length}
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="block text-xs text-amber-400">Pending</span>
            <span className="text-base font-bold font-mono text-amber-300">
              {loading ? '...' : pendingCount}
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="block text-xs text-emerald-400">Fixed</span>
            <span className="text-base font-bold font-mono text-emerald-300">
              {loading ? '...' : resolvedCount}
            </span>
          </div>
        </div>
      </div>

      {/* Authority Command Center Shortcut if authority */}
      {isAuthority && (
        <Link
          to="/authority"
          className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/40 hover:bg-purple-950/50 transition flex items-center justify-between group shadow-lg shadow-purple-950/20"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-300">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-white group-hover:text-purple-300 transition">
                Authority Triage Console
              </div>
              <div className="text-[11px] text-purple-300/80">
                Dispatch municipal crews & work orders
              </div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-purple-400 group-hover:translate-x-0.5 transition" />
        </Link>
      )}

      {/* Quick Navigation Items */}
      <div className="space-y-2">
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1">
          Activity & Navigation
        </h2>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden divide-y divide-slate-800/80">
          <Link
            to="/my-reports"
            className="p-3.5 flex items-center justify-between hover:bg-slate-900 transition text-xs text-slate-200"
          >
            <div className="flex items-center gap-3">
              <ClipboardList className="w-4 h-4 text-cyan-400" />
              <span>My Submitted Reports</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-400 font-mono text-[11px]">
              <span>{myReports.length} cases</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </Link>

          <Link
            to="/map"
            className="p-3.5 flex items-center justify-between hover:bg-slate-900 transition text-xs text-slate-200"
          >
            <div className="flex items-center gap-3">
              <MapPin className="w-4 h-4 text-cyan-400" />
              <span>City Incident Radar Map</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </Link>

          <Link
            to="/report-issue"
            className="p-3.5 flex items-center justify-between hover:bg-slate-900 transition text-xs text-cyan-300 font-semibold"
          >
            <div className="flex items-center gap-3">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Report New Infrastructure Hazard</span>
            </div>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Device & Hardware Capabilities Status */}
      <div className="space-y-2">
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1">
          Device Readiness
        </h2>

        <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-2.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-slate-300">
              <Camera className="w-4 h-4 text-cyan-400" /> Live Optical Camera
            </span>
            <span className="text-[11px] font-mono text-emerald-400 font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Supported
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-slate-300">
              <MapPin className="w-4 h-4 text-cyan-400" /> Geolocation Telemetry
            </span>
            <span className="text-[11px] font-mono text-emerald-400 font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Active
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-slate-300">
              <Sparkles className="w-4 h-4 text-cyan-400" /> On-Device YOLO CV Engine
            </span>
            <span className="text-[11px] font-mono text-emerald-400 font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> v8 Connected
            </span>
          </div>
        </div>
      </div>

      {/* Sign Out Button */}
      <div className="pt-2">
        <button
          type="button"
          onClick={handleSignOut}
          className="w-full py-3.5 px-4 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-bold flex items-center justify-center gap-2 transition active:scale-98 shadow-sm"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out of CivicMind</span>
        </button>
      </div>

      <div className="text-center text-[10px] text-slate-500 font-mono">
        CivicMind Mobile Edition v1.0 • Inclusive City Intelligence
      </div>
    </div>
  );
};
