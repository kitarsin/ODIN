import { Navigation } from '../components/Navigation';
import { useState } from 'react';
import { BasicExplorerGame } from '../components/BasicExplorerGame';
import { CodeEditorPanel } from '../components/CodeEditorPanel';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';

const QUESTION_ID = 'array-level-1';

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export function GameContainer() {
  const { user } = useAuth();
  const [code, setCode] = useState('');
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [terminalOutput, setTerminalOutput] = useState('Terminal output sample');
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [battleMode, setBattleMode] = useState(false);

  const handleRun = () => {
    const elapsedMs = (Math.random() * 2 + 0.05).toFixed(2);
    const timestamp = new Date().toLocaleTimeString();
    setTerminalOutput(`Compiled successfully after ${elapsedMs}ms\n${timestamp}`);
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

      {/* Game Header */}
      <div className="mx-auto flex w-full max-w-7xl flex-1 items-center justify-center px-6">
        <div
          className={`flex w-full h-[80vh] max-h-[900px] flex-col items-center gap-4 lg:flex-row lg:items-stretch lg:justify-center ${
            battleMode ? '' : ''
          }`}
        >
          <div className="flex min-h-0 items-center justify-center h-full">
            <div className="h-full w-full max-w-[820px]">
              <BasicExplorerGame
                battleActive={battleMode}
                onTerminalInteract={handleTerminalInteract}
                onExitBattle={handleExitBattle}
              />
            </div>
          </div>
          <div
            className={`flex min-h-0 min-w-0 h-full overflow-hidden transition-[flex-basis,opacity,transform] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              terminalOpen
                ? 'opacity-100 lg:basis-[580px] lg:translate-x-0'
                : 'pointer-events-none opacity-0 lg:basis-0 lg:translate-x-6'
            }`}
            aria-hidden={!terminalOpen}
          >
            <CodeEditorPanel
              code={code}
              onCodeChange={setCode}
              onRun={handleRun}
              onCastCode={handleCastCode}
              saveStatus={saveStatus}
              terminalOutput={terminalOutput}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
