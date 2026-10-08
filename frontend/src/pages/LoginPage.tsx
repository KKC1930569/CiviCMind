import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { formatApiError } from '../api/client';
import { 
  LogIn, 
  AlertCircle, 
  Shield, 
  User, 
  Loader2, 
  KeyRound, 
  Sparkles,
  ShieldCheck,
  Lock
} from 'lucide-react';

interface LoginPageProps {
  initialPortal?: 'citizen' | 'authority';
}

export const LoginPage: React.FC<LoginPageProps> = ({ initialPortal }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();

  // Determine portal from URL path or prop
  const isAuthorityPath = location.pathname.includes('/authority') || initialPortal === 'authority';
  const [portal, setPortal] = useState<'citizen' | 'authority'>(isAuthorityPath ? 'authority' : 'citizen');

  useEffect(() => {
    if (location.pathname === '/sign-in/authority') {
      setPortal('authority');
    } else if (location.pathname === '/sign-in/citizen') {
      setPortal('citizen');
    }
  }, [location.pathname]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const from = (location.state as any)?.from?.pathname || (portal === 'authority' ? '/authority' : '/dashboard');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await login({ email: email.trim(), password });
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(formatApiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickLogin = (demoEmail: string, demoPass: string, targetPortal: 'citizen' | 'authority') => {
    setPortal(targetPortal);
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-3.5 sm:px-4 py-6 sm:py-12">
      <div className="w-full max-w-4xl bg-slate-900/80 border border-slate-800/80 rounded-2xl sm:rounded-3xl shadow-2xl backdrop-blur-xl overflow-hidden grid grid-cols-1 md:grid-cols-12 relative">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Left Side: Form Area (7 Cols) */}
        <div className="p-4 sm:p-8 md:p-10 md:col-span-7 flex flex-col justify-between space-y-6">
          <div>
            {/* Portal Switcher Tabs */}
            <div className="flex p-1 rounded-2xl bg-slate-950 border border-slate-800 mb-6">
              <button
                type="button"
                onClick={() => {
                  setPortal('citizen');
                  setError(null);
                }}
                className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                  portal === 'citizen'
                    ? 'bg-slate-800 text-cyan-400 shadow-sm shadow-cyan-500/10'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                Citizen Portal
              </button>
              <button
                type="button"
                onClick={() => {
                  setPortal('authority');
                  setError(null);
                }}
                className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                  portal === 'authority'
                    ? 'bg-purple-950/70 text-purple-300 border border-purple-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                Authority Portal
              </button>
            </div>

            {/* Portal Header */}
            <div className="space-y-1.5 mb-6">
              <div className="flex items-center gap-2">
                <span
                  className={`text-[11px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                    portal === 'authority'
                      ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                      : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                  }`}
                >
                  {portal === 'authority' ? 'Authority Portal' : 'Citizen Portal'}
                </span>
              </div>
              <h1 className="text-2xl font-extrabold text-white tracking-tight">
                {portal === 'authority'
                  ? 'Turn infrastructure data into action.'
                  : 'Make your city better, one report at a time.'}
              </h1>
              <p className="text-xs text-slate-400">
                {portal === 'authority'
                  ? 'Protected access for authorized city personnel and public works departments.'
                  : 'Sign in to report local hazards, track municipal repair tickets, and monitor community fixes.'}
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {portal === 'authority' ? 'Official Municipal Email' : 'Email Address'}
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={portal === 'authority' ? 'officer@civicmind.org' : 'citizen@civicmind.org'}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500 transition"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-300">
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-[11px] text-cyan-400 hover:text-cyan-300 hover:underline flex items-center gap-1"
                  >
                    <KeyRound className="w-3 h-3" /> Forgot password?
                  </Link>
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500 transition"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className={`w-full py-3 rounded-xl font-semibold text-sm shadow-lg flex items-center justify-center gap-2 transition disabled:opacity-50 text-white ${
                  portal === 'authority'
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-purple-600/20'
                    : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-cyan-500/20'
                }`}
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Authenticating...
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" /> {portal === 'authority' ? 'Authority sign in' : 'Sign in'}
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Quick Demo Credentials & Registration Links */}
          <div className="pt-4 border-t border-slate-800/80 space-y-3">
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider text-center">
              Quick One-Click Demo Access
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('citizen@civicmind.org', 'Citizen123!', 'citizen')}
                className="px-3 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-750 border border-slate-700 text-slate-200 text-xs font-medium flex items-center justify-center gap-1.5 transition text-left"
              >
                <User className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>Citizen Demo</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('authority@civicmind.org', 'Authority123!', 'authority')}
                className="px-3 py-2 rounded-xl bg-purple-950/40 hover:bg-purple-900/40 border border-purple-500/30 text-purple-300 text-xs font-medium flex items-center justify-center gap-1.5 transition text-left"
              >
                <Shield className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                <span>Authority Demo</span>
              </button>
            </div>

            <div className="text-center pt-2 text-xs text-slate-400">
              {portal === 'authority' ? (
                <>
                  Need official department credentials?{' '}
                  <Link to="/register/authority" className="text-purple-400 hover:underline font-medium">
                    Register authority account
                  </Link>
                </>
              ) : (
                <>
                  Don't have a citizen account yet?{' '}
                  <Link to="/register" className="text-cyan-400 hover:underline font-medium">
                    Create citizen account
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Visual Context Panel (5 Cols) */}
        <div className={`hidden md:flex md:col-span-5 p-8 flex-col justify-between border-l border-slate-800 relative ${
          portal === 'authority' ? 'bg-gradient-to-b from-purple-950/30 to-slate-950' : 'bg-gradient-to-b from-slate-900/40 to-slate-950'
        }`}>
          {portal === 'authority' ? (
            /* Authority Priority Queue Mockup */
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-purple-300 uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-purple-400" />
                Live Priority Queue
              </div>
              <p className="text-[11px] text-slate-400">
                Incoming municipal queue sorted automatically by Human Impact Index and universal accessibility need.
              </p>

              <div className="space-y-2.5 pt-2">
                <div className="p-3 rounded-xl bg-slate-900/90 border border-rose-500/30 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 font-mono">
                      CRITICAL • 94
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">T. Nagar (Ward 136)</span>
                  </div>
                  <div className="text-xs font-semibold text-white">Wheelchair Ramp Blocked</div>
                  <div className="text-[10px] text-slate-400">Clinic Arterial • 24h SLA</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/90 border border-amber-500/30 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono">
                      HIGH • 88
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">Adyar (Ward 173)</span>
                  </div>
                  <div className="text-xs font-semibold text-white">Heaved Concrete Slab</div>
                  <div className="text-[10px] text-slate-400">Hospital Transit • 72h SLA</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-700/60 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                      MEDIUM • 67
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">Anna Nagar (Ward 102)</span>
                  </div>
                  <div className="text-xs font-semibold text-white">Pathway Obstruction</div>
                  <div className="text-[10px] text-slate-400">Commercial Zone</div>
                </div>
              </div>
            </div>
          ) : (
            /* Citizen Lifecycle Visual */
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider">
                <Sparkles className="w-4 h-4" />
                The CivicMind Loop
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Every citizen report moves from photo capture to prioritized municipal repair action.
              </p>

              <div className="space-y-3 pt-2">
                {[
                  { step: '01', title: 'Report', desc: 'Snap photo & location pin' },
                  { step: '02', title: 'Analyze', desc: 'Computer vision defect categorization' },
                  { step: '03', title: 'Prioritize', desc: 'Human Impact Index algorithm' },
                  { step: '04', title: 'Resolve', desc: 'Dispatched municipal work orders' },
                ].map((s, idx) => (
                  <div key={s.step} className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                    <div className="w-6 h-6 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-mono font-bold text-[10px] shrink-0 mt-0.5">
                      {s.step}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        {s.title}
                        {idx === 0 && <span className="text-[9px] px-1 rounded bg-cyan-500/20 text-cyan-300">You</span>}
                      </div>
                      <div className="text-[10px] text-slate-400">{s.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-slate-800/80 text-[10px] text-slate-400 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Lock className="w-3 h-3 text-cyan-400" /> Argon2 Encrypted
            </span>
            <span className="font-mono text-cyan-400">CivicMind v1.0</span>
          </div>
        </div>
      </div>
    </div>
  );
};
