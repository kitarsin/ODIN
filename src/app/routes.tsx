import { type ReactNode } from 'react';
import { createBrowserRouter, Link, Navigate } from 'react-router-dom';
import { ArrowLeft, Keyboard } from 'lucide-react';
import { LandingPage } from './pages/LandingPage';
import odinMark from '../img/brand/new-logo.png';
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
import { AdminResponseEditor } from './pages/AdminResponseEditor';
import { ProtectedRoute } from './components/ProtectedRoute';
import AccountSettings from './pages/AccountSettings';
import { OdinTestBench } from './pages/OdinTestBench';
import { Pretest } from './pages/Pretest';
import { Posttest } from './pages/Posttest';
import { isMobileDevice } from './utils/mobileDevice';

function DesktopExperience({ children }: { children: ReactNode }) {
  const isMobile = isMobileDevice();

  if (!isMobile) return children;

  return (
    <main className="odin-mobile-gate">
      <section className="mobile-gate-card" aria-labelledby="mobile-gate-title">
        <img src={odinMark} alt="ODIN pixel robot" />
        <p className="mobile-gate-kicker">ODIN // DESKTOP MODE</p>
        <span className="mobile-gate-keyboard"><Keyboard aria-hidden="true" /></span>
        <h1 id="mobile-gate-title">Open ODIN on desktop</h1>
        <p>ODIN’s coding game is designed for a desktop browser and a physical keyboard. Switch to a laptop or desktop to sign in and continue.</p>
        <Link className="pixel-button primary-button" to="/"> <ArrowLeft aria-hidden="true" /> Back to the landing page</Link>
        <span className="mobile-gate-foot">C# ARRAY QUEST // READY WHEN YOU ARE</span>
      </section>
    </main>
  );
}

const onDesktop = (page: ReactNode) => <DesktopExperience>{page}</DesktopExperience>;

export const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingPage />
  },
  {
    path: '/login',
    element: onDesktop(<Login />)
  },
  {
    path: '/register',
    element: onDesktop(<Register />)
  },
  {
    path: '/forgot-password',
    element: onDesktop(<ForgotPassword />)
  },
  {
    path: '/update-password',
    element: onDesktop(<UpdatePassword />)
  },
  {
    path: '/dashboard',
    element: onDesktop(
      <ProtectedRoute featureKey="dashboard">
        <StudentDashboard />
      </ProtectedRoute>
    )
  },
  {
    path: '/play',
    element: onDesktop(
      <ProtectedRoute featureKey="game">
        <GameContainer />
      </ProtectedRoute>
    )
  },
  {
    path: '/wiki',
    element: onDesktop(
      <ProtectedRoute featureKey="wiki">
        <Wiki />
      </ProtectedRoute>
    )
  },
  {
    path: '/profile',
    element: onDesktop(
      <ProtectedRoute featureKey="profile">
        <Profile />
      </ProtectedRoute>
    )
  },
  {
    path: '/account-settings',
    element: onDesktop(
      <ProtectedRoute featureKey="account-settings">
        <AccountSettings />
      </ProtectedRoute>
    )
  },
  {
    path: '/admin',
    element: onDesktop(
      <ProtectedRoute requireAdmin>
        <AdminDatabase />
      </ProtectedRoute>
    )
  },
  {
    path: '/admin/analytics',
    element: onDesktop(
      <ProtectedRoute requireAdmin>
        <Analytics />
      </ProtectedRoute>
    )
  },
  {
    path: '/admin/lockdown',
    element: onDesktop(
      <ProtectedRoute requireAdmin>
        <FeatureLockdown />
      </ProtectedRoute>
    )
  },
  {
    path: '/admin/gamelogs',
    element: onDesktop(
      <ProtectedRoute requireAdmin>
        <AdminGameLogs />
      </ProtectedRoute>
    )
  },
  {
    path: '/admin/responses',
    element: onDesktop(
      <ProtectedRoute requireAdmin>
        <AdminResponseEditor />
      </ProtectedRoute>
    )
  },
  {
    path: '/test-bench',
    element: onDesktop(
      <ProtectedRoute featureKey="test-bench">
      <OdinTestBench />
      </ProtectedRoute>
    )
  },
  {
    path: '/pretest',
    element: onDesktop(
      <ProtectedRoute skipPretestGate>
        <Pretest />
      </ProtectedRoute>
    )
  },
  {
    path: '/posttest',
    element: onDesktop(
      <ProtectedRoute featureKey="posttest">
        <Posttest />
      </ProtectedRoute>
    )
  },
  {
    path: '*',
    element: <Navigate to="/" replace />
  }
]);
