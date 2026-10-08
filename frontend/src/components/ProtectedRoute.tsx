import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

interface Props {
  children: React.ReactNode;
  requireAuthority?: boolean;
}

export const ProtectedRoute: React.FC<Props> = ({ children, requireAuthority = false }) => {
  const { user, token, isLoading, isAuthority } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
        <p className="text-sm text-slate-400">Verifying session...</p>
      </div>
    );
  }

  if (!token || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAuthority && !isAuthority) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};
