import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { router } from './routes';
import { Suspense } from 'react';

// Fallback loading screen
function LoadingScreen() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: '#0F172A',
      color: '#10B981',
      fontFamily: 'monospace',
      fontSize: '16px',
      flexDirection: 'column',
      gap: '20px'
    }}>
      <div style={{ fontSize: '24px' }}>⏳ Initializing ODIN System...</div>
      <div style={{ fontSize: '12px', color: '#94A3B8' }}>Please wait while we establish connection</div>
    </div>
  );
}

export default function App() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <ThemeProvider>
        <AuthProvider>
          <Suspense fallback={<LoadingScreen />}>
            <RouterProvider router={router} />
          </Suspense>
        </AuthProvider>
      </ThemeProvider>
    </Suspense>
  );
}