import { useState } from 'react';
import { Navigation } from '../components/Navigation';
import { ChevronRight, ChevronLeft, Target, Code } from 'lucide-react';
import { Button } from '../components/ui/button';

export function GameContainer() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-[#0F172A]">
      <Navigation />

      {/* Game Header */}
      <div className="border-b border-[#334155] bg-[#1E293B]">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-[#10B981]" />
                <span className="text-sm text-[#F1F5F9]" style={{ fontFamily: 'var(--font-mono)' }}>
                  District: Terminal
                </span>
              </div>
              <div className="h-4 w-px bg-[#334155]" />
              <span className="text-sm text-[#94A3B8]">Level 3: Grid Navigation</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-sm text-[#94A3B8]">
                Objectives: <span className="text-[#10B981]">2/5</span>
              </div>
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
              <div className="absolute inset-0 bg-[#1E293B] rounded-lg border-4 border-[#10B981] flex items-center justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-4 bg-[#10B981]/20 rounded-full flex items-center justify-center">
                    <Code className="w-10 h-10 text-[#10B981]" />
                  </div>
                  <p className="text-2xl text-[#10B981] mb-2" style={{ fontFamily: 'var(--font-mono)' }}>
                    Game Placeholder
                  </p>
                  <p className="text-lg text-[#94A3B8]">Game Loads Here</p>
                  <div className="mt-6 space-y-2 text-sm text-[#64748B]">
                    <p>→ Navigate the Terminal District maze</p>
                    <p>→ Use arrow keys to move</p>
                    <p>→ Collect data packets to progress</p>
                  </div>
                </div>
              </div>

              {/* Corner Labels */}
              <div className="absolute -top-8 left-0 text-xs text-[#10B981]" style={{ fontFamily: 'var(--font-mono)' }}>
                [GAME_WINDOW]
              </div>
              <div className="absolute -bottom-8 right-0 text-xs text-[#64748B]" style={{ fontFamily: 'var(--font-mono)' }}>
                Resolution: 1920x1080
              </div>
            </div>
          </div>
        </div>

        {/* Collapsible Syntax Guide Sidebar */}
        <div
          className={`relative border-l border-[#334155] bg-[#1E293B] transition-all duration-300 ${
            sidebarOpen ? 'w-80' : 'w-0'
          }`}
        >
          <Button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="absolute -left-8 top-4 bg-[#1E293B] border border-[#334155] hover:bg-[#334155] text-[#F1F5F9] w-8 h-8 p-0 rounded-l-lg rounded-r-none"
          >
            {sidebarOpen ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </Button>

          {sidebarOpen && (
            <div className="p-6 h-full overflow-y-auto">
              <h3 className="text-lg font-semibold text-[#F1F5F9] mb-4 flex items-center gap-2">
                <Code className="w-5 h-5 text-[#10B981]" />
                Syntax Guide
              </h3>

              <div className="space-y-4 text-sm">
                {/* Arrays Section */}
                <div className="bg-[#0F172A] border border-[#334155] rounded-lg p-4">
                  <h4 className="text-[#10B981] font-semibold mb-2" style={{ fontFamily: 'var(--font-mono)' }}>
                    Arrays
                  </h4>
                  <div className="space-y-2">
                    <div>
                      <p className="text-[#94A3B8] text-xs mb-1">Declaration:</p>
                      <code className="block bg-[#1E293B] p-2 rounded text-[#10B981] text-xs" style={{ fontFamily: 'var(--font-mono)' }}>
                        let arr = [1, 2, 3];
                      </code>
                    </div>
                    <div>
                      <p className="text-[#94A3B8] text-xs mb-1">Access:</p>
                      <code className="block bg-[#1E293B] p-2 rounded text-[#10B981] text-xs" style={{ fontFamily: 'var(--font-mono)' }}>
                        arr[0] // returns 1
                      </code>
                    </div>
                  </div>
                </div>

                {/* Loops Section */}
                <div className="bg-[#0F172A] border border-[#334155] rounded-lg p-4">
                  <h4 className="text-[#3B82F6] font-semibold mb-2" style={{ fontFamily: 'var(--font-mono)' }}>
                    Loops
                  </h4>
                  <div className="space-y-2">
                    <div>
                      <p className="text-[#94A3B8] text-xs mb-1">For Loop:</p>
                      <code className="block bg-[#1E293B] p-2 rounded text-[#3B82F6] text-xs" style={{ fontFamily: 'var(--font-mono)' }}>
                        for (let i=0; i&lt;n; i++)
                      </code>
                    </div>
                    <div>
                      <p className="text-[#94A3B8] text-xs mb-1">While Loop:</p>
                      <code className="block bg-[#1E293B] p-2 rounded text-[#3B82F6] text-xs" style={{ fontFamily: 'var(--font-mono)' }}>
                        while (condition)
                      </code>
                    </div>
                  </div>
                </div>

                {/* 2D Grids Section */}
                <div className="bg-[#0F172A] border border-[#334155] rounded-lg p-4">
                  <h4 className="text-[#F59E0B] font-semibold mb-2" style={{ fontFamily: 'var(--font-mono)' }}>
                    2D Grids
                  </h4>
                  <div className="space-y-2">
                    <div>
                      <p className="text-[#94A3B8] text-xs mb-1">Declaration:</p>
                      <code className="block bg-[#1E293B] p-2 rounded text-[#F59E0B] text-xs" style={{ fontFamily: 'var(--font-mono)' }}>
                        let grid = [[1,2],[3,4]];
                      </code>
                    </div>
                    <div>
                      <p className="text-[#94A3B8] text-xs mb-1">Access:</p>
                      <code className="block bg-[#1E293B] p-2 rounded text-[#F59E0B] text-xs" style={{ fontFamily: 'var(--font-mono)' }}>
                        grid[row][col]
                      </code>
                    </div>
                  </div>
                </div>

                {/* Quick Tips */}
                <div className="bg-[#10B981]/10 border border-[#10B981]/30 rounded-lg p-4">
                  <h4 className="text-[#10B981] font-semibold mb-2 text-xs">💡 Quick Tips</h4>
                  <ul className="space-y-1 text-xs text-[#94A3B8]">
                    <li>• Use nested loops for 2D arrays</li>
                    <li>• Always check array bounds</li>
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
