import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { formatApiError } from '../api/client';
import { 
  UserPlus, 
  AlertCircle, 
  User, 
  Shield, 
  Loader2, 
  Building2, 
  Key
} from 'lucide-react';

interface RegisterPageProps {
  initialRole?: 'citizen' | 'authority';
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ initialRole }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { register, registerAuthority } = useAuth();

  const isAuthorityPath = location.pathname.includes('/authority') || initialRole === 'authority';
  const [role, setRole] = useState<'citizen' | 'authority'>(isAuthorityPath ? 'authority' : 'citizen');

  useEffect(() => {
    if (location.pathname === '/register/authority') {
      setRole('authority');
    } else if (location.pathname === '/register/citizen' || location.pathname === '/register') {
      setRole('citizen');
    }
  }, [location.pathname]);

  // Form fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [department, setDepartment] = useState('');
  const [accessCode, setAccessCode] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      if (role === 'authority') {
        if (!department.trim()) {
          setError('Please provide your municipal department or agency.');
          setSubmitting(false);
          return;
        }
        await registerAuthority({
          full_name: fullName.trim(),
          email: email.trim(),
          password,
          department: department.trim(),
          access_code: accessCode.trim() || undefined,
        });
        navigate('/authority', { replace: true });
      } else {
        await register({
          full_name: fullName.trim(),
          email: email.trim(),
          password,
        });
        navigate('/dashboard', { replace: true });
      }
    } catch (err: any) {
      setError(formatApiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg bg-slate-900/80 border border-slate-800/80 p-8 sm:p-10 rounded-3xl shadow-2xl backdrop-blur-xl relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Role Switcher */}
        <div className="flex p-1 rounded-2xl bg-slate-950 border border-slate-800 mb-6">
          <button
            type="button"
            onClick={() => {
              setRole('citizen');
              setError(null);
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
              role === 'citizen'
                ? 'bg-slate-800 text-cyan-400 shadow-sm shadow-cyan-500/10'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            Citizen Account
          </button>
          <button
            type="button"
            onClick={() => {
              setRole('authority');
              setError(null);
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
              role === 'authority'
                ? 'bg-purple-950/70 text-purple-300 border border-purple-500/30 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            Municipal Authority
          </button>
        </div>

        <div className="text-center space-y-2 mb-6">
          <div
            className={`inline-flex p-3 rounded-2xl mb-1 ${
              role === 'authority'
                ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
            }`}
          >
            <UserPlus className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            {role === 'authority' ? 'Onboard Municipal Authority' : 'Create Citizen Account'}
          </h1>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {role === 'authority'
              ? 'Authorized access for municipal works, ADA compliance, and infrastructure dispatch personnel.'
              : 'Join your community to report and track neighborhood infrastructure repairs.'}
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Full Legal / Display Name
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Alex Morgan"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {role === 'authority' ? 'Official Municipal Email' : 'Email Address'}
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={role === 'authority' ? 'officer@civicmind.org' : 'alex@domain.com'}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500 transition"
            />
          </div>

          {role === 'authority' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Municipal Department / Agency
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-500 absolute left-3.5 top-3 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="e.g. Dept. of Public Works or ADA Division"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-purple-400 transition"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-300">
                    Department Authorization Code
                  </label>
                  <span className="text-[10px] text-purple-400 font-mono">Dev: CIVIC-AUTHORITY-2026</span>
                </div>
                <div className="relative">
                  <Key className="w-4 h-4 text-slate-500 absolute left-3.5 top-3 pointer-events-none" />
                  <input
                    type="text"
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value)}
                    placeholder="Enter passkey (e.g. CIVIC-AUTHORITY-2026)"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 font-mono text-xs placeholder-slate-500 focus:outline-none focus:border-purple-400 transition"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Password (min. 6 characters)
            </label>
            <input
              type="password"
              required
              minLength={6}
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
              role === 'authority'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-purple-600/20'
                : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-cyan-500/20'
            }`}
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Provisioning Account...
              </>
            ) : (
              role === 'authority' ? 'Complete Authority Onboarding' : 'Complete Citizen Registration'
            )}
          </button>
        </form>

        <div className="text-center pt-4 border-t border-slate-800/80 mt-6">
          <p className="text-xs text-slate-400">
            Already have an account?{' '}
            <Link
              to={role === 'authority' ? '/sign-in/authority' : '/sign-in/citizen'}
              className="text-cyan-400 hover:underline font-medium"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
