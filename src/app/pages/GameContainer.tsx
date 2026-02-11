import { Navigation } from '../components/Navigation';
import { useState } from 'react';
import { Code, Terminal } from 'lucide-react';
import { BasicExplorerGame } from '../components/BasicExplorerGame';

export function GameContainer() {
  const [code, setCode] = useState('');

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
        <div className="h-full">
          <BasicExplorerGame />
        </div>

        <div className="flex h-full flex-col gap-6">
          <div className="flex-1 rounded-xl border border-border bg-card p-4 shadow-sm">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
              <Code className="h-4 w-4 text-primary" />
              Code Editor
            </div>
            <textarea
              value={code}
              onChange={(event) => setCode(event.target.value)}
              placeholder="// insert code here"
              className="h-[calc(100%-32px)] w-full resize-none rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm text-foreground focus:border-primary focus:outline-none"
              style={{ fontFamily: 'var(--font-mono)' }}
            />
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
              Compiled successfully after 0.08ms
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
