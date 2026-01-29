import { useState } from 'react';
import { 
  CheckSquare, 
  Square, 
  Play, 
  ArrowLeft, 
  Activity,
  Zap,
  AlertCircle,
  Terminal as TerminalIcon
} from 'lucide-react';

interface Task {
  id: number;
  text: string;
  completed: boolean;
}

interface WorkspaceProps {
  levelId: number;
  onBack: () => void;
  onShowHint?: () => void;
  onShowLockdown?: () => void;
  onShowComplete?: () => void;
}

const mockTasks: Task[] = [
  { id: 1, text: 'Create an integer array named "numbers"', completed: true },
  { id: 2, text: 'Set the array size to 5', completed: true },
  { id: 3, text: 'Initialize all elements to 0', completed: false },
  { id: 4, text: 'Print the array length', completed: false },
];

export function Workspace({ levelId, onBack, onShowHint, onShowLockdown, onShowComplete }: WorkspaceProps) {
  const [code, setCode] = useState(`// Level ${levelId}: Loop Fundamentals
int[] numbers;

void setup() {
  size(400, 300);
  // TODO: Initialize the array
  
}

void draw() {
  background(0);
  // Your code here
}`);

  const [output, setOutput] = useState('> Ready to compile...');
  const [tasks, setTasks] = useState(mockTasks);
  const [compilations, setCompilations] = useState(0);

  const handleCompile = () => {
    setCompilations(prev => prev + 1);
    
    // Mock compilation logic
    if (compilations >= 3) {
      // Too many attempts - show lockdown
      onShowLockdown?.();
      return;
    }

    setOutput(`> Compiling...\n> Build started at ${new Date().toLocaleTimeString()}\n> Checking syntax...\n> Build successful!\n> Output: Array length = 5`);
    
    // Simulate completing tasks
    setTimeout(() => {
      setTasks(prev => prev.map(task => 
        task.id === 3 ? { ...task, completed: true } : task
      ));
    }, 1000);

    // Check if all tasks are complete
    const allComplete = tasks.every(task => task.completed);
    if (allComplete && compilations > 0) {
      setTimeout(() => {
        onShowComplete?.();
      }, 2000);
    }
  };

  const toggleTask = (taskId: number) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };

  return (
    <div className="h-screen bg-background text-foreground flex flex-col overflow-hidden">
      {/* Top Bar */}
      <div className="h-14 border-b border-border backdrop-blur-md bg-card/80 flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 rounded-lg hover:bg-secondary/50 transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
          </button>
          <div>
            <h2 className="font-semibold">Level {levelId}: Loop Fundamentals</h2>
            <p className="text-xs text-muted-foreground">Traverse arrays with for loops</p>
          </div>
        </div>

        <button
          onClick={handleCompile}
          className="px-6 py-2 rounded-lg bg-gradient-to-r from-[#2979FF] to-[#00E676] hover:shadow-lg hover:shadow-[#2979FF]/30 transition-all font-semibold flex items-center gap-2 group"
        >
          <Play className="w-4 h-4 group-hover:scale-110 transition-transform" />
          COMPILE
        </button>
      </div>

      {/* Main Workspace - 3 Pane Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Pane - Mission Log */}
        <div className="w-80 border-r border-border backdrop-blur-md bg-card/40 overflow-y-auto shrink-0">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-[#2979FF]/20 flex items-center justify-center">
                <AlertCircle className="w-4 h-4 text-[#2979FF]" />
              </div>
              <h3 className="font-semibold">Current Objective</h3>
            </div>

            <div className="space-y-3">
              {tasks.map((task) => (
                <button
                  key={task.id}
                  onClick={() => toggleTask(task.id)}
                  className="w-full flex items-start gap-3 p-3 rounded-lg bg-secondary/50 border border-border hover:border-[#2979FF]/30 transition-all text-left group"
                >
                  {task.completed ? (
                    <CheckSquare className="w-5 h-5 text-[#00E676] shrink-0 mt-0.5" />
                  ) : (
                    <Square className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5 group-hover:text-[#2979FF] transition-colors" />
                  )}
                  <span className={`text-sm ${task.completed ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                    {task.text}
                  </span>
                </button>
              ))}
            </div>

            {/* Progress */}
            <div className="mt-6 p-4 rounded-lg bg-secondary/30 border border-border">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-muted-foreground">Progress</span>
                <span className="text-sm font-semibold text-[#2979FF]">
                  {tasks.filter(t => t.completed).length}/{tasks.length}
                </span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-[#2979FF] to-[#00E676] transition-all duration-500"
                  style={{ width: `${(tasks.filter(t => t.completed).length / tasks.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Hint Button */}
            <button
              onClick={onShowHint}
              className="w-full mt-4 px-4 py-3 rounded-lg bg-[#FFAB00]/10 border border-[#FFAB00]/30 hover:bg-[#FFAB00]/20 transition-colors text-[#FFAB00] font-semibold flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4" />
              Request Hint
            </button>
          </div>
        </div>

        {/* Center Pane - Code Editor */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-auto">
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full h-full p-6 bg-[#1a1a1a] text-foreground code-font text-sm resize-none focus:outline-none leading-relaxed"
              style={{
                tabSize: 2,
                fontFamily: "'JetBrains Mono', monospace"
              }}
              spellCheck={false}
            />
          </div>

          {/* Bottom Pane - Terminal/Console */}
          <div className="h-48 border-t border-border backdrop-blur-md bg-card/60 overflow-hidden shrink-0">
            <div className="h-full flex flex-col">
              <div className="h-10 border-b border-border/50 flex items-center px-4 gap-2 bg-card/40">
                <TerminalIcon className="w-4 h-4 text-[#00E676]" />
                <span className="text-sm font-semibold">Console Output</span>
              </div>
              <div className="flex-1 overflow-auto p-4">
                <pre className="code-font text-sm text-muted-foreground whitespace-pre-wrap">
                  {output}
                </pre>
              </div>
            </div>
          </div>
        </div>

        {/* Right Pane - ODIN AI HUD */}
        <div className="w-80 border-l border-border backdrop-blur-md bg-card/40 overflow-y-auto shrink-0">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              {/* ODIN Avatar */}
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#2979FF] to-[#00E676] flex items-center justify-center animate-pulse">
                  <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center">
                    <Activity className="w-6 h-6 text-[#00E676]" />
                  </div>
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#00E676] rounded-full border-2 border-background" />
              </div>
              <div>
                <h3 className="font-semibold">ODIN Assistant</h3>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#00E676]">● Online</span>
                </div>
              </div>
            </div>

            {/* Status Panel */}
            <div className="p-4 rounded-lg bg-secondary/30 border border-[#00E676]/30 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-4 h-4 text-[#00E676]" />
                <span className="text-sm font-semibold text-[#00E676]">Status: Monitoring</span>
              </div>
              <p className="text-xs text-muted-foreground">
                I'm watching your progress and ready to help when needed.
              </p>
            </div>

            {/* AI Feedback Section */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Live Analysis
              </h4>

              {/* Feedback Card */}
              <div className="p-4 rounded-lg bg-[#2979FF]/10 border border-[#2979FF]/30">
                <div className="flex items-start gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-[#2979FF] mt-2" />
                  <div>
                    <p className="text-sm font-semibold">Syntax Check</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Your code structure looks good. Remember to initialize the array before using it.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-secondary/30 border border-border">
                <div className="flex items-start gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-muted-foreground mt-2" />
                  <div>
                    <p className="text-sm font-semibold">Logic Analysis</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Compile your code to see my analysis of your logic flow.
                    </p>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="mt-6 p-4 rounded-lg bg-secondary/30 border border-border">
                <h4 className="text-sm font-semibold mb-3">Session Stats</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Compilations</span>
                    <span className="font-semibold">{compilations}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Hints Used</span>
                    <span className="font-semibold">0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Time Elapsed</span>
                    <span className="font-semibold">3:24</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
