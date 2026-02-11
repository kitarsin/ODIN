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
  const [navPinned, setNavPinned] = useState(false);

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
    <div className="flex min-h-screen flex-col bg-background text-foreground transition-colors">
      <div className="group/nav fixed inset-x-0 top-0 z-40">
        <div className="h-3" />
        <div
          className={`transition-[opacity,transform] duration-300 ease-out ${
            navPinned
              ? 'translate-y-0 opacity-100'
              : '-translate-y-full opacity-0 group-hover/nav:translate-y-0 group-hover/nav:opacity-100'
          }`}
        >
          <Navigation />
        </div>
        <button
          type="button"
          onClick={() => setNavPinned((prev) => !prev)}
          className="absolute right-4 top-3 rounded-full border border-border bg-background/90 px-3 py-1 text-[10px] font-semibold text-foreground shadow-sm"
          aria-pressed={navPinned}
        >
          {navPinned ? 'Hide menu' : 'Show menu'}
        </button>
      </div>

      {/* Game Header */}
      <div
        className={`mx-auto flex w-full max-w-7xl flex-1 flex-col items-stretch gap-6 px-6 py-6 lg:flex-row ${
          battleMode ? 'lg:items-center lg:justify-center' : ''
        }`}
      >
        <div className="flex min-h-[60vh] flex-1 items-stretch justify-center">
          <div className="h-full w-full max-w-[920px]">
            <BasicExplorerGame
              battleActive={battleMode}
              onTerminalInteract={handleTerminalInteract}
              onExitBattle={handleExitBattle}
            />
          </div>
        </div>
        <div
          className={`flex min-h-[60vh] min-w-0 overflow-hidden transition-[flex-basis,opacity,transform] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] lg:self-stretch lg:items-stretch ${
            terminalOpen
              ? 'opacity-100 lg:basis-[460px] lg:translate-x-0'
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
  );
}
