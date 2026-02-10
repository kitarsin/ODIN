import { createBrowserRouter, Navigate } from 'react-router';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { StudentDashboard } from './pages/StudentDashboard';
import { GameContainer } from './pages/GameContainer';
import { Wiki } from './pages/Wiki';
import { Profile } from './pages/Profile';
import { AdminDatabase } from './pages/AdminDatabase';
import { Analytics } from './pages/Analytics';
import { ProtectedRoute } from './components/ProtectedRoute';

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
    path: '*',
    element: <Navigate to="/login" replace />
  }
]);
