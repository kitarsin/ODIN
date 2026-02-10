import { useState } from 'react';
import { Navigation } from '../components/Navigation';
import { ChevronRight, ChevronLeft, Target, Code } from 'lucide-react';
import { Button } from '../components/ui/button';
import { BasicExplorerGame } from '../components/BasicExplorerGame';

export function GameContainer() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

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

      <div className="flex h-[calc(100vh-140px)]">
        {/* Main Game Area */}
        <div className="flex-1 p-6">
          <div className="h-full flex items-center justify-center">
            {/* Game Placeholder */}
            <div className="relative w-full max-w-6xl" style={{ aspectRatio: '16/9' }}>
              <div className="absolute inset-0">
                <BasicExplorerGame />
              </div>

              {/* Corner Labels */}
              <div className="absolute -top-8 left-0 text-xs text-primary" style={{ fontFamily: 'var(--font-mono)' }}>
                [GAME_WINDOW]
              </div>
              <div className="absolute -bottom-8 right-0 text-xs text-muted-foreground" style={{ fontFamily: 'var(--font-mono)' }}>
                Demo: Basic Explorer
              </div>
            </div>
          </div>
        </div>

        {/* Collapsible Syntax Guide Sidebar */}
        <div
          className={`relative border-l transition-all duration-300 ${
            `border-border bg-card ${sidebarOpen ? 'w-80' : 'w-0'}`
          }`}
        >
          <Button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`absolute -left-8 top-4 w-8 h-8 p-0 rounded-l-lg rounded-r-none border transition-colors ${
              'bg-card border-border hover:bg-muted text-foreground'
            }`}
          >
            {sidebarOpen ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </Button>

          {sidebarOpen && (
            <div className="p-6 h-full overflow-y-auto transition-colors">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Code className="w-5 h-5 text-primary" />
                Syntax Guide
              </h3>

              <div className="space-y-4 text-sm">
                {/* Arrays Section */}
                <div className="border rounded-lg p-4 bg-muted/40 border-border transition-colors">
                  <h4 className="text-primary font-semibold mb-2" style={{ fontFamily: 'var(--font-mono)' }}>
                    Arrays
                  </h4>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs mb-1 text-muted-foreground">Declaration:</p>
                      <code className="block p-2 rounded text-primary text-xs bg-background border border-border transition-colors" style={{ fontFamily: 'var(--font-mono)' }}>
                        int[] numbers = { 1, 2, 3 };
                      </code>
                    </div>
                    <div>
                      <p className="text-xs mb-1 text-muted-foreground">Access:</p>
                      <code className="block p-2 rounded text-primary text-xs bg-background border border-border transition-colors" style={{ fontFamily: 'var(--font-mono)' }}>
                        numbers[0] // returns 1
                      </code>
                    </div>
                  </div>
                </div>

                {/* Loops Section */}
                <div className="border rounded-lg p-4 bg-muted/40 border-border transition-colors">
                  <h4 className="text-secondary font-semibold mb-2" style={{ fontFamily: 'var(--font-mono)' }}>
                    Loops
                  </h4>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs mb-1 text-muted-foreground">For Loop:</p>
                      <code className="block p-2 rounded text-secondary text-xs bg-background border border-border transition-colors" style={{ fontFamily: 'var(--font-mono)' }}>
                        for (int i = 0; i &lt; n; i++)
                      </code>
                    </div>
                    <div>
                      <p className="text-xs mb-1 text-muted-foreground">While Loop:</p>
                      <code className="block p-2 rounded text-secondary text-xs bg-background border border-border transition-colors" style={{ fontFamily: 'var(--font-mono)' }}>
                        while (condition)
                      </code>
                    </div>
                  </div>
                </div>

                {/* 2D Grids Section */}
                <div className="border rounded-lg p-4 bg-muted/40 border-border transition-colors">
                  <h4 className="text-amber-500 font-semibold mb-2" style={{ fontFamily: 'var(--font-mono)' }}>
                    2D Grids
                  </h4>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs mb-1 text-muted-foreground">Declaration:</p>
                      <code className="block p-2 rounded text-amber-500 text-xs bg-background border border-border transition-colors" style={{ fontFamily: 'var(--font-mono)' }}>
                        int[,] grid = {'{'} {'{'} 1, 2 {'}'}, {'{'} 3, 4 {'}'} {'}'};
                      </code>
                    </div>
                    <div>
                      <p className="text-xs mb-1 text-muted-foreground">Access:</p>
                      <code className="block p-2 rounded text-amber-500 text-xs bg-background border border-border transition-colors" style={{ fontFamily: 'var(--font-mono)' }}>
                        grid[row, col]
                      </code>
                    </div>
                  </div>
                </div>

                {/* Quick Tips */}
                <div className="border rounded-lg p-4 bg-primary/10 border-primary/30 transition-colors">
                  <h4 className="text-primary font-semibold mb-2 text-xs">💡 Quick Tips</h4>
                  <ul className="space-y-1 text-xs text-muted-foreground">
                    <li>• Use nested loops for 2D arrays</li>
                    <li>• Use Length and GetLength()</li>
                    <li>• Index starts at 0</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
