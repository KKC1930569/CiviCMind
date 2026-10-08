import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Home, 
  Map, 
  Plus, 
  ClipboardList, 
  User as UserIcon 
} from 'lucide-react';

export const MobileBottomNav: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();

  // Only render on mobile when user is logged in
  if (!user) return null;

  const pathname = location.pathname;

  const isHomeActive = pathname === '/dashboard' || pathname === '/';
  const isMapActive = pathname === '/map';
  const isReportActive = pathname === '/report-issue';
  const isReportsActive = pathname === '/my-reports' || pathname.startsWith('/report/');
  const isProfileActive = pathname === '/profile';

  return (
    <nav 
      aria-label="Mobile Navigation Bar"
      className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-slate-950/95 backdrop-blur-2xl border-t border-slate-800/90 shadow-[0_-8px_25px_rgba(0,0,0,0.6)] pb-[max(env(safe-area-inset-bottom),8px)] pt-1.5"
    >
      <div className="grid grid-cols-5 items-center px-2">
        {/* 1. Home */}
        <Link
          to="/dashboard"
          className={`flex flex-col items-center justify-center py-1 rounded-xl transition ${
            isHomeActive
              ? 'text-cyan-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <Home className="w-5 h-5" />
            {isHomeActive && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-cyan-400" />
            )}
          </div>
          <span className="text-[10px] mt-1 tracking-tight">Home</span>
        </Link>

        {/* 2. Map */}
        <Link
          to="/map"
          className={`flex flex-col items-center justify-center py-1 rounded-xl transition ${
            isMapActive
              ? 'text-cyan-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <Map className="w-5 h-5" />
            {isMapActive && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-cyan-400" />
            )}
          </div>
          <span className="text-[10px] mt-1 tracking-tight">Map</span>
        </Link>

        {/* 3. Central + Report Action */}
        <div className="flex justify-center -mt-5">
          <Link
            to="/report-issue"
            aria-label="Report new civic issue"
            className="group relative flex flex-col items-center focus:outline-none"
          >
            <div className="w-13 h-13 rounded-full bg-gradient-to-tr from-cyan-500 via-cyan-400 to-blue-600 p-0.5 shadow-lg shadow-cyan-500/40 active:scale-95 transition-transform flex items-center justify-center">
              <div className="w-full h-full rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white">
                <Plus className="w-7 h-7 stroke-[2.5]" />
              </div>
            </div>
            <span className={`text-[10px] mt-1 font-bold ${
              isReportActive ? 'text-cyan-400' : 'text-slate-300'
            }`}>
              Report
            </span>
          </Link>
        </div>

        {/* 4. My Reports */}
        <Link
          to="/my-reports"
          className={`flex flex-col items-center justify-center py-1 rounded-xl transition ${
            isReportsActive
              ? 'text-cyan-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <ClipboardList className="w-5 h-5" />
            {isReportsActive && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-cyan-400" />
            )}
          </div>
          <span className="text-[10px] mt-1 tracking-tight">Reports</span>
        </Link>

        {/* 5. Profile */}
        <Link
          to="/profile"
          className={`flex flex-col items-center justify-center py-1 rounded-xl transition ${
            isProfileActive
              ? 'text-cyan-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <UserIcon className="w-5 h-5" />
            {isProfileActive && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-cyan-400" />
            )}
          </div>
          <span className="text-[10px] mt-1 tracking-tight">Profile</span>
        </Link>
      </div>
    </nav>
  );
};
