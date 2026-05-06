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
      <ProtectedRoute>
        <StudentDashboard />
      </ProtectedRoute>
    )
  },
  {
    path: '/play',
    element: (
      <ProtectedRoute>
        <GameContainer />
      </ProtectedRoute>
    )
  },
  {
    path: '/wiki',
    element: (
      <ProtectedRoute>
        <Wiki />
      </ProtectedRoute>
    )
  },
  {
    path: '/profile',
    element: (
      <ProtectedRoute>
        <Profile />
      </ProtectedRoute>
    )
  },
  {
    path: '/account-settings',
    element: (
      <ProtectedRoute>
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
    path: '/test-bench',
    element: (
      <ProtectedRoute>
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
