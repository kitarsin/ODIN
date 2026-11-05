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
import '../styles/odin-public.css';
import '../styles/odin-app.css';

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

// Signed-in pages sit inside the ODIN frame (src/styles/odin-app.css): the landing page's look,
// with a scene behind each tab. `tab` picks the scene; the pages themselves are unchanged.
type AppTab = 'dashboard' | 'play' | 'wiki' | 'test' | 'profile' | 'settings' | 'admin';
const onApp = (tab: AppTab, page: ReactNode) => onDesktop(<div className="odin-public odin-app" data-tab={tab}>{page}</div>);

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
    element: onApp('dashboard', 
      <ProtectedRoute featureKey="dashboard">
        <StudentDashboard />
      </ProtectedRoute>
    )
  },
  {
    path: '/play',
    element: onApp('play', 
      <ProtectedRoute featureKey="game">
        <GameContainer />
      </ProtectedRoute>
    )
  },
  {
    path: '/wiki',
    element: onApp('wiki', 
      <ProtectedRoute featureKey="wiki">
        <Wiki />
      </ProtectedRoute>
    )
  },
  {
    path: '/profile',
    element: onApp('profile', 
      <ProtectedRoute featureKey="profile">
        <Profile />
      </ProtectedRoute>
    )
  },
  {
    path: '/account-settings',
    element: onApp('settings', 
      <ProtectedRoute featureKey="account-settings">
        <AccountSettings />
      </ProtectedRoute>
    )
  },
  {
    path: '/admin',
    element: onApp('admin', 
      <ProtectedRoute requireAdmin>
        <AdminDatabase />
      </ProtectedRoute>
    )
  },
  {
    path: '/admin/analytics',
    element: onApp('admin', 
      <ProtectedRoute requireAdmin>
        <Analytics />
      </ProtectedRoute>
    )
  },
  {
    path: '/admin/lockdown',
    element: onApp('admin', 
      <ProtectedRoute requireAdmin>
        <FeatureLockdown />
      </ProtectedRoute>
    )
  },
  {
    path: '/admin/gamelogs',
    element: onApp('admin', 
      <ProtectedRoute requireAdmin>
        <AdminGameLogs />
      </ProtectedRoute>
    )
  },
  {
    path: '/admin/responses',
    element: onApp('admin', 
      <ProtectedRoute requireAdmin>
        <AdminResponseEditor />
      </ProtectedRoute>
    )
  },
  {
    path: '/test-bench',
    element: onApp('admin', 
      <ProtectedRoute featureKey="test-bench">
      <OdinTestBench />
      </ProtectedRoute>
    )
  },
  {
    path: '/pretest',
    element: onApp('test', 
      <ProtectedRoute skipPretestGate>
        <Pretest />
      </ProtectedRoute>
    )
  },
  {
    path: '/posttest',
    element: onApp('test', 
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
