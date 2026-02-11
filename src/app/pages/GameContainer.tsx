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

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors">
      <Navigation />

      {/* Game Header */}
      <div className="mx-auto grid h-[calc(100vh-140px)] max-w-7xl grid-cols-1 gap-6 px-6 py-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)]">
        <div className="flex h-full items-start justify-center">
          <div className="aspect-square w-full max-w-[720px]">
            <BasicExplorerGame
              battleActive={battleMode}
              onTerminalInteract={handleTerminalInteract}
            />
          </div>
        </div>
        {terminalOpen && (
          <CodeEditorPanel
            code={code}
            onCodeChange={setCode}
            onRun={handleRun}
            onCastCode={handleCastCode}
            saveStatus={saveStatus}
            terminalOutput={terminalOutput}
          />
        )}
      </div>
    </div>
  );
}
