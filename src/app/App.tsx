import { useState } from 'react';
import { Dashboard } from '@/app/components/Dashboard';
import { Workspace } from '@/app/components/Workspace';
import { HintCard } from '@/app/components/HintCard';
import { LockdownModal } from '@/app/components/LockdownModal';
import { LevelCompleteModal } from '@/app/components/LevelCompleteModal';
import { AuthPortal } from '@/app/components/AuthPortal';
import { CommandCenter } from '@/app/components/CommandCenter';
import { AgentDossier } from '@/app/components/AgentDossier';
import { Navigation } from '@/app/components/Navigation';
import { SystemCalibration } from '@/app/components/SystemCalibration';

type Screen = 'auth' | 'calibration' | 'dashboard' | 'workspace' | 'admin' | 'profile';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('auth');
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [showLockdown, setShowLockdown] = useState(false);
  const [showComplete, setShowComplete] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [userRank, setUserRank] = useState('RECRUIT');
  const [userLevel, setUserLevel] = useState('Novice');

  const handleLogin = (user: string) => {
    setUsername(user);
    setIsAuthenticated(true);
    setCurrentScreen('calibration');
  };

  const handleCalibrationComplete = (result: any) => {
    setUserRank(result.rank);
    setUserLevel(result.level);
    setCurrentScreen('dashboard');
  };

  const handleSelectLevel = (levelId: number) => {
    setSelectedLevel(levelId);
    setCurrentScreen('workspace');
  };

  const handleBackToDashboard = () => {
    setCurrentScreen('dashboard');
    setSelectedLevel(null);
    setShowHint(false);
    setShowLockdown(false);
    setShowComplete(false);
  };

  const handleNextLevel = () => {
    if (selectedLevel) {
      setSelectedLevel(selectedLevel + 1);
      setShowComplete(false);
    }
  };

  const handleNavigate = (page: string) => {
    if (page === 'workspace' && !selectedLevel) {
      // If navigating to workspace but no level selected, pick first level
      setSelectedLevel(3);
    }
    setCurrentScreen(page as Screen);
  };

  // Show auth screen if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="w-[1920px] h-[1080px] overflow-hidden">
        <AuthPortal onLogin={handleLogin} />
      </div>
    );
  }

  // Show calibration screen after auth
  if (currentScreen === 'calibration') {
    return (
      <div className="w-[1920px] h-[1080px] overflow-hidden">
        <SystemCalibration onComplete={handleCalibrationComplete} />
      </div>
    );
  }

  // Full workspace view (no sidebar)
  if (currentScreen === 'workspace' && selectedLevel) {
    return (
      <div className="w-[1920px] h-[1080px] overflow-hidden">
        <Workspace
          levelId={selectedLevel}
          onBack={handleBackToDashboard}
          onShowHint={() => setShowHint(true)}
          onShowLockdown={() => setShowLockdown(true)}
          onShowComplete={() => setShowComplete(true)}
        />

        {/* Overlay Modals */}
        {showHint && (
          <HintCard
            hint="Start by declaring your array using the syntax: int[] arrayName = new int[size]. Then, use a for loop to initialize each element to 0."
            onClose={() => setShowHint(false)}
          />
        )}

        {showLockdown && (
          <LockdownModal
            onClose={() => setShowLockdown(false)}
          />
        )}

        {showComplete && (
          <LevelCompleteModal
            level={selectedLevel}
            xpEarned={200}
            onNextLevel={handleNextLevel}
            onBackToDashboard={handleBackToDashboard}
          />
        )}
      </div>
    );
  }

  // Main layout with navigation
  return (
    <div className="w-[1920px] h-[1080px] overflow-hidden flex">
      <Navigation 
        currentPage={currentScreen} 
        onNavigate={handleNavigate}
        isAdmin={true}
      />
      
      <div className="flex-1 relative overflow-hidden">
        {currentScreen === 'dashboard' && (
          <Dashboard onSelectLevel={handleSelectLevel} />
        )}
        
        {currentScreen === 'admin' && (
          <CommandCenter />
        )}
        
        {currentScreen === 'profile' && (
          <AgentDossier />
        )}
      </div>
    </div>
  );
}
