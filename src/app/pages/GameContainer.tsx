import { Navigation } from '../components/Navigation';
import { useState } from 'react';
import { BasicExplorerGame } from '../components/BasicExplorerGame';
import { CodeEditorPanel } from '../components/CodeEditorPanel';
import { AchievementModal, AchievementData } from '../components/AchievementModal';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { diagnoseCode, diagnoseCSharpSyntax } from '../utils/diagnosticSystem';

const QUESTION_ID = 'array-level-1';

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export function GameContainer() {
  const { user, addAchievement } = useAuth();
  const [code, setCode] = useState('');
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [terminalOutput, setTerminalOutput] = useState('Terminal output sample');
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [battleMode, setBattleMode] = useState(false);
  const [achievementData, setAchievementData] = useState<AchievementData | null>(null);
  const [showAchievement, setShowAchievement] = useState(false);

  const handleRun = () => {
    const elapsedMs = (Math.random() * 2 + 0.05).toFixed(2);
    const timestamp = new Date().toLocaleTimeString();
    
    const syntaxDiagnostic = diagnoseCSharpSyntax(code);
    const isSuccess = !syntaxDiagnostic;

    if (isSuccess) {
      setTerminalOutput(`✓ Code executed successfully\nOutput: [1, 2, 3, 4, 5]\nCompleted after ${elapsedMs}ms\n${timestamp}`);
      
      // Show success achievement
      const successData: AchievementData = {
        status: 'success',
        badgeName: 'First Victory',
        badgeEmoji: '⚔️',
        title: 'Code Executed',
        description: 'Your code ran without errors!',
        successMessage: 'Great job! Your logic is correct!',
      };
      setAchievementData(successData);
      setShowAchievement(true);

      // Add to user achievements
      if (user && addAchievement) {
        addAchievement({
          name: 'First Victory',
          emoji: '⚔️',
          description: 'Successfully executed code without errors',
          unlockedAt: new Date().toISOString(),
          type: 'success',
        });
      }
    } else {
      const diagnostic = syntaxDiagnostic || diagnoseCode(code, 'loop');
      const failureData: AchievementData = {
        status: 'failure',
        badgeName: 'Debugging Session',
        badgeEmoji: '🔍',
        title: 'Error Detected',
        description: 'Your code needs some work. Let Odin help!',
        diagnosticTitle: diagnostic.diagnosticTitle,
        diagnosticMessage: diagnostic.diagnosticMessage,
        suggestions: diagnostic.suggestions,
      };
      setAchievementData(failureData);
      setShowAchievement(true);

      setTerminalOutput(`✗ Runtime Error\n${diagnostic.diagnosticTitle}\nLine: ${Math.floor(Math.random() * 10) + 1}`);
    }
  };

  const handleCastCode = async () => {
    if (!user) {
      setSaveStatus('error');
      return;
    }

    setSaveStatus('saving');
    const { error } = await supabase.from('submissions').insert({
      user_id: user.id,
      question_id: QUESTION_ID,
      code_snippet: code,
      is_correct: false,
    });

    if (error) {
      setSaveStatus('error');
      return;
    }

    setSaveStatus('saved');
    setTimeout(() => setSaveStatus('idle'), 1600);
  };

  const handleTerminalInteract = () => {
    setTerminalOpen(true);
    setBattleMode(true);
  };

  const handleExitBattle = () => {
    setBattleMode(false);
    setTerminalOpen(false);
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background text-foreground transition-colors">
      <Navigation />

      {/* Achievement Modal */}
      {achievementData && (
        <AchievementModal
          isOpen={showAchievement}
          onClose={() => setShowAchievement(false)}
          data={achievementData}
        />
      )}

      {/* Game Header */}
      <div className="flex flex-1 items-center justify-center px-6 py-6">
        <div className="flex h-full max-h-[85vh] items-center justify-center gap-6">
          <div className="aspect-square h-full max-h-full w-auto">
            <BasicExplorerGame
              battleActive={battleMode}
              onTerminalInteract={handleTerminalInteract}
              onExitBattle={handleExitBattle}
            />
          </div>
          {terminalOpen && (
            <div className="flex h-full w-[292px] flex-shrink-0 transition-opacity duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]">
              <CodeEditorPanel
              code={code}
              onCodeChange={setCode}
              onRun={handleRun}
              onCastCode={handleCastCode}
              saveStatus={saveStatus}
              terminalOutput={terminalOutput}
            />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
