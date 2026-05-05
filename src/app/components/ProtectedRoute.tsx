import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
  skipPretestGate?: boolean;
}

export function ProtectedRoute({ children, requireAdmin = false, skipPretestGate = false }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  // While loading, show loading screen
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground font-mono text-base">
        ⏳ Initializing...
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Gate all protected routes until pretest is completed
  if (!skipPretestGate && !user.pretestCompleted) {
    return <Navigate to="/pretest" replace />;
  }

  // If admin required but user is not admin, redirect to dashboard
  if (requireAdmin && user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
