import { createBrowserRouter, Navigate } from 'react-router-dom';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ForgotPassword } from './pages/ForgotPassword';
import { UpdatePassword } from './pages/UpdatePassword';
import { StudentDashboard } from './pages/StudentDashboard';
import { GameContainer } from './pages/GameContainer';
import { Wiki } from './pages/Wiki';
import { Profile } from './pages/Profile';
import { AdminDatabase } from './pages/AdminDatabase';
import { Analytics } from './pages/Analytics';
import { FeatureLockdown } from './pages/FeatureLockdown';
import { AdminGameLogs } from './pages/AdminGameLogs';
import { ProtectedRoute } from './components/ProtectedRoute';
import AccountSettings from './pages/AccountSettings';
import { OdinTestBench } from './pages/OdinTestBench';
import { Pretest } from './pages/Pretest';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/login" replace />
  },
  {
    path: '/login',
    element: <Login />
  },
  {
    path: '/register',
    element: <Register />
  },
  {
    path: '/forgot-password',
    element: <ForgotPassword />
  },
  {
    path: '/update-password',
    element: <UpdatePassword />
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute featureKey="dashboard">
        <StudentDashboard />
      </ProtectedRoute>
    )
  },
  {
    path: '/play',
    element: (
      <ProtectedRoute featureKey="game">
        <GameContainer />
      </ProtectedRoute>
    )
  },
  {
    path: '/wiki',
    element: (
      <ProtectedRoute featureKey="wiki">
        <Wiki />
      </ProtectedRoute>
    )
  },
  {
    path: '/profile',
    element: (
      <ProtectedRoute featureKey="profile">
        <Profile />
      </ProtectedRoute>
    )
  },
  {
    path: '/account-settings',
    element: (
      <ProtectedRoute featureKey="account-settings">
        <AccountSettings />
      </ProtectedRoute>
    )
  },
  {
    path: '/admin',
    element: (
      <ProtectedRoute requireAdmin>
        <AdminDatabase />
      </ProtectedRoute>
    )
  },
  {
    path: '/admin/analytics',
    element: (
      <ProtectedRoute requireAdmin>
        <Analytics />
      </ProtectedRoute>
    )
  },
  {
    path: '/admin/lockdown',
    element: (
      <ProtectedRoute requireAdmin>
        <FeatureLockdown />
      </ProtectedRoute>
    )
  },
  {
    path: '/admin/gamelogs',
    element: (
      <ProtectedRoute requireAdmin>
        <AdminGameLogs />
      </ProtectedRoute>
    )
  },
  {
    path: '/test-bench',
    element: (
      <ProtectedRoute featureKey="test-bench">
      <OdinTestBench />
      </ProtectedRoute>
    )
  },
  {
    path: '/pretest',
    element: (
      <ProtectedRoute skipPretestGate>
        <Pretest />
      </ProtectedRoute>
    )
  },
  {
    path: '*',
    element: <Navigate to="/login" replace />
  }
]);
