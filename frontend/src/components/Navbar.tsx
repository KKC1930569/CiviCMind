import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  PlusCircle, 
  ListFilter, 
  ShieldAlert, 
  LogOut, 
  Menu, 
  X, 
  Home,
  ArrowRight
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout, isAuthority } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile drawer when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isHome = location.pathname === '/';

  return (
    <header className="fixed top-3 sm:top-4 inset-x-0 z-50 flex justify-center px-3 sm:px-4 pointer-events-none">
      <div 
        className={`w-full max-w-6xl rounded-2xl sm:rounded-full px-4 sm:px-6 py-2.5 sm:py-3 transition-all duration-300 pointer-events-auto flex items-center justify-between border ${
          scrolled 
            ? 'bg-slate-950/90 backdrop-blur-xl border-slate-800 shadow-2xl shadow-cyan-950/20' 
            : 'bg-slate-950/75 backdrop-blur-lg border-slate-800/80 shadow-xl shadow-black/40'
        }`}
      >
        {/* Brand Logo & Name */}
        <Link to="/" className="flex items-center gap-2.5 sm:gap-3 group">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center p-0.5 shadow-md shadow-cyan-500/20 group-hover:scale-105 transition">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <span className="text-cyan-400 font-extrabold text-xs tracking-tighter">CM</span>
            </div>
          </div>
          <div>
            <div className="text-base sm:text-lg font-extrabold tracking-tight text-white flex items-center">
              CIVIC<span className="text-cyan-400">MIND</span>
            </div>
            <div className="hidden lg:block text-[9px] text-slate-400 uppercase tracking-wider font-semibold -mt-0.5">
              Inclusive City Intelligence
            </div>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 sm:gap-1.5 text-xs font-medium">
          {user ? (
            <>
              <Link
                to="/dashboard"
                className={`px-3 py-1.5 rounded-full transition flex items-center gap-1.5 ${
                  isActive('/dashboard')
                    ? 'bg-slate-800 text-cyan-400 font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Home className="w-3.5 h-3.5" />
                Dashboard
              </Link>

              <Link
                to="/my-reports"
                className={`px-3 py-1.5 rounded-full transition flex items-center gap-1.5 ${
                  isActive('/my-reports')
                    ? 'bg-slate-800 text-cyan-400 font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900'
                }`}
              >
                <ListFilter className="w-3.5 h-3.5" />
                My Reports
              </Link>

              {isAuthority && (
                <Link
                  to="/authority"
                  className={`px-3 py-1.5 rounded-full transition flex items-center gap-1.5 ${
                    isActive('/authority')
                      ? 'bg-purple-950/70 text-purple-300 border border-purple-500/30'
                      : 'text-purple-400 hover:text-purple-300 hover:bg-purple-950/40'
                  }`}
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  Authority Console
                </Link>
              )}
            </>
          ) : (
            isHome && (
              <>
                <a
                  href="#platform"
                  className="px-3.5 py-1.5 rounded-full text-slate-300 hover:text-white hover:bg-slate-900/80 transition"
                >
                  Platform
                </a>
                <a
                  href="#how-it-works"
                  className="px-3.5 py-1.5 rounded-full text-slate-300 hover:text-white hover:bg-slate-900/80 transition"
                >
                  How it works
                </a>
                <a
                  href="#impact"
                  className="px-3.5 py-1.5 rounded-full text-slate-300 hover:text-white hover:bg-slate-900/80 transition"
                >
                  Impact
                </a>
                <a
                  href="#why-civicmind"
                  className="px-3.5 py-1.5 rounded-full text-slate-300 hover:text-white hover:bg-slate-900/80 transition"
                >
                  About
                </a>
              </>
            )
          )}
        </nav>

        {/* Right Action Controls */}
        <div className="hidden md:flex items-center gap-2.5">
          {user ? (
            <div className="flex items-center gap-3 pl-3 border-l border-slate-800">
              <Link
                to="/report-issue"
                className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-md shadow-cyan-500/25 flex items-center gap-1.5 transition"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                Report Issue
              </Link>
              <div className="text-right">
                <div className="text-xs font-semibold text-slate-200">{user.full_name}</div>
                <div className="text-[10px] text-cyan-400 font-mono font-medium">{user.role}</div>
              </div>
              <button
                onClick={handleLogout}
                title="Sign Out"
                className="p-1.5 rounded-full text-slate-400 hover:text-rose-400 hover:bg-slate-900 transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-3.5 py-1.5 rounded-full text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-900 transition"
              >
                Sign in
              </Link>
              <Link
                to="/register"
                className="px-4 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-md shadow-cyan-500/25 flex items-center gap-1.5 transition transform active:scale-95"
              >
                Get started <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="md:hidden flex items-center gap-1.5 sm:gap-2">
          {user && (
            <Link
              to="/report-issue"
              className="px-2.5 py-1.5 rounded-full text-[11px] font-semibold bg-cyan-500 hover:bg-cyan-400 text-white flex items-center gap-1 shadow-sm active:scale-95 transition"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span className="hidden min-[360px]:inline">Report</span>
            </Link>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="w-10 h-10 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/80 active:bg-slate-800 flex items-center justify-center transition"
            aria-label="Toggle Navigation Menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Drawer Backdrop & Menu */}
      {mobileMenuOpen && (
        <>
          <div 
            className="md:hidden fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-40 pointer-events-auto"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <div className="md:hidden absolute top-16 inset-x-3 bg-slate-950/95 border border-slate-800 rounded-3xl p-4 shadow-2xl backdrop-blur-2xl pointer-events-auto space-y-2 text-sm z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          {user ? (
            <>
              <div className="px-3 py-2 bg-slate-900 rounded-xl mb-2 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-white text-xs">{user.full_name}</div>
                  <div className="text-[10px] text-cyan-400 font-mono">{user.role}</div>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 px-2 py-1 rounded bg-rose-500/10"
                >
                  <LogOut className="w-3.5 h-3.5" /> Sign Out
                </button>
              </div>

              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-slate-200 hover:bg-slate-900 text-xs"
              >
                Dashboard
              </Link>
              <Link
                to="/my-reports"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-slate-200 hover:bg-slate-900 text-xs"
              >
                My Reports
              </Link>
              {isAuthority && (
                <Link
                  to="/authority"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-xl text-purple-400 hover:bg-purple-950/40 text-xs"
                >
                  Authority Console
                </Link>
              )}
              <Link
                to="/report-issue"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center mt-2 px-3 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold text-xs"
              >
                Report New Issue
              </Link>
            </>
          ) : (
            <div className="space-y-2">
              <a
                href="#platform"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-slate-300 hover:bg-slate-900 text-xs"
              >
                Platform
              </a>
              <a
                href="#how-it-works"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-slate-300 hover:bg-slate-900 text-xs"
              >
                How it works
              </a>
              <a
                href="#impact"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-slate-300 hover:bg-slate-900 text-xs"
              >
                Impact
              </a>
              <a
                href="#why-civicmind"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-slate-300 hover:bg-slate-900 text-xs"
              >
                About
              </a>
              <div className="pt-2 border-t border-slate-800 grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-center py-2 rounded-xl text-xs bg-slate-900 text-white font-medium"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-center py-2 rounded-xl text-xs bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold"
                >
                  Get started
                </Link>
              </div>
            </div>
          )}
          </div>
        </>
      )}
    </header>
  );
};
