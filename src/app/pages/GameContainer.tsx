import { Navigation } from '../components/Navigation';
import { useState } from 'react';
import { Code, Terminal } from 'lucide-react';
import { BasicExplorerGame } from '../components/BasicExplorerGame';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';

const QUESTION_ID = 'array-level-1';

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export function GameContainer() {
  const { user } = useAuth();
  const [code, setCode] = useState('');
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [terminalOutput, setTerminalOutput] = useState('Terminal output sample');

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

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors">
      <Navigation />

      {/* Game Header */}
      <div className="border-b border-border bg-card transition-colors">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto grid h-[calc(100vh-140px)] max-w-7xl grid-cols-1 gap-6 px-6 py-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)]">
        <div className="flex h-full items-start justify-center">
          <div className="aspect-square w-full max-w-[720px]">
            <BasicExplorerGame />
          </div>
        </div>

        <div className="flex h-full flex-col gap-6">
          <div className="flex-1 rounded-xl border border-border bg-card p-4 shadow-sm">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Code className="h-4 w-4 text-primary" />
                Code Editor
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleRun}
                  className="rounded-md border border-border px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted"
                >
                  Run
                </button>
                <button
                  type="button"
                  onClick={handleCastCode}
                  className="rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"
                >
                  {saveStatus === 'saving' ? 'Casting...' : 'Cast Code'}
                </button>
              </div>
            </div>
            <textarea
              value={code}
              onChange={(event) => setCode(event.target.value)}
              placeholder="// insert code here"
              className="h-[calc(100%-32px)] w-full resize-none rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm text-foreground focus:border-primary focus:outline-none"
              style={{ fontFamily: 'var(--font-mono)' }}
            />
            <div
              className="mt-3 flex items-center justify-between text-[10px] text-muted-foreground"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              <span>Cast Code saves your current snippet.</span>
              <span>
                {saveStatus === 'saved' && 'Saved.'}
                {saveStatus === 'error' && 'Save failed.'}
                {saveStatus === 'idle' && 'Ready.'}
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
              <Terminal className="h-4 w-4 text-primary" />
              Terminal Output
            </div>
            <div
              className="min-h-[120px] rounded-lg border border-border bg-muted/60 px-4 py-3 text-xs text-muted-foreground"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              {terminalOutput}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
