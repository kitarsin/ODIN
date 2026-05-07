import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useFeatureLockdown } from '../context/FeatureLockdownContext';
import { FeatureLockedScreen } from './FeatureLockedScreen';
import { LOCKABLE_FEATURES } from '../context/FeatureLockdownContext';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
  skipPretestGate?: boolean;
  featureKey?: string;
}

export function ProtectedRoute({ children, requireAdmin = false, skipPretestGate = false, featureKey }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const { isFeatureLocked } = useFeatureLockdown();

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

  // Feature lockdown check (admins bypass automatically inside isFeatureLocked)
  if (featureKey) {
    const { locked, message } = isFeatureLocked(featureKey);
    if (locked) {
      const featureMeta = LOCKABLE_FEATURES.find((f) => f.key === featureKey);
      return <FeatureLockedScreen featureName={featureMeta?.label || featureKey} message={message} />;
    }
  }

  return <>{children}</>;
}
