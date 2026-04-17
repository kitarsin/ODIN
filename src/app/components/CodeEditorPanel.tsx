import { Code, Terminal } from 'lucide-react';

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

type CodeEditorPanelProps = {
  code: string;
  onCodeChange: (value: string) => void;
  onRun: () => void;
  onCastCode: () => void;
  saveStatus: SaveStatus;
  terminalOutput: string;
};

export function CodeEditorPanel({
  code,
  onCodeChange,
  onRun,
  onCastCode,
  saveStatus,
  terminalOutput
}: CodeEditorPanelProps) {
  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <div className="flex min-h-0 flex-[7] flex-col rounded-xl border border-border bg-card p-4 shadow-sm">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Code className="h-4 w-4 text-primary" />
            Code Editor
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onRun}
              className="rounded-md border border-border px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted"
            >
              Run
            </button>
            <button
              type="button"
              onClick={onCastCode}
              className="rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"
            >
              {saveStatus === 'saving' ? 'Casting...' : 'Cast Code'}
            </button>
          </div>
        </div>
        <textarea
          value={code}
          onChange={(event) => onCodeChange(event.target.value)}
          placeholder="// insert code here"
          className="min-h-0 flex-1 w-full resize-none rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm text-foreground focus:border-primary focus:outline-none"
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

      <div className="flex min-h-0 flex-[3] flex-col rounded-xl border border-border bg-card p-4 shadow-sm">
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
          <Terminal className="h-4 w-4 text-primary" />
          Terminal Output
        </div>
        <div
          className="min-h-0 flex-1 whitespace-pre-wrap rounded-lg border border-border bg-muted/60 px-4 py-3 text-xs text-muted-foreground"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          {terminalOutput}
        </div>
      </div>
    </div>
  );
}
