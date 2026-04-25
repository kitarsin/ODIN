import { useState, useRef, useEffect } from 'react';
import { Navigation } from '../components/Navigation';
import { useAuth } from '../context/AuthContext';
import { useKeystrokeTracker } from '../../hooks/useKeystrokeTracker';
import { submitCode, createSession, getPuzzlesByLevel, type SubmissionResponse } from '../../lib/odinApi';
import { Button } from '../components/ui/button';
import {
  Play,
  RotateCcw,
  ChevronDown,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  MessageSquare,
  Brain,
  Activity,
  Zap,
  Shield,
} from 'lucide-react';

// Skill options matching the ODIN pipeline
const SKILL_OPTIONS = [
  { value: 'ArrayInitialization', label: 'Array Initialization', level: 1 },
  { value: 'ArrayAccess', label: 'Array Access', level: 1 },
  { value: 'ArrayIteration', label: 'Array Iteration', level: 2 },
  { value: 'ArrayOperations', label: 'Array Operations', level: 2 },
  { value: 'MultidimensionalArrays', label: 'Multidimensional Arrays', level: 3 },
  { value: 'JaggedArrays', label: 'Jagged Arrays', level: 3 },
];

// Preset code samples for quick testing
const PRESETS: Record<string, { label: string; code: string; skill: string; description: string }> = {
  correct: {
    label: '✅ Correct Code',
    code: 'int[] arr = {1, 2, 3, 4, 5};\nfor (int i = 0; i < arr.Length; i++)\n{\n    Console.WriteLine(arr[i]);\n}',
    skill: 'ArrayIteration',
    description: 'Should return isCorrect: true, no intervention',
  },
  offByOne: {
    label: '🐛 Off-by-One Error',
    code: 'int[] arr = {1, 2, 3, 4, 5};\nfor (int i = 0; i <= arr.Length; i++)\n{\n    Console.WriteLine(arr[i]);\n}',
    skill: 'ArrayIteration',
    description: 'Uses <= instead of <. Should detect OffByOneError',
  },
  uninitialized: {
    label: '🐛 Uninitialized Array',
    code: 'int[] numbers;\nnumbers[0] = 42;\nConsole.WriteLine(numbers[0]);',
    skill: 'ArrayInitialization',
    description: 'Array declared but never new-initialized',
  },
  outOfBounds: {
    label: '🐛 Index Out of Range',
    code: 'int[] arr = new int[3];\narr[0] = 10;\narr[1] = 20;\narr[5] = 50;',
    skill: 'ArrayAccess',
    description: 'Accesses index 5 on a size-3 array',
  },
  syntaxError: {
    label: '🐛 Syntax Error',
    code: 'int[] arr = new int[5]\narr[0] = 10',
    skill: 'ArrayInitialization',
    description: 'Missing semicolons — should flag SyntaxError',
  },
  empty: {
    label: '🎮 Gaming Test (empty)',
    code: '',
    skill: 'ArrayInitialization',
    description: 'Submit empty code rapidly to trigger Gaming detection',
  },
};

// Color mapping for behavior states
function getBehaviorColor(state: string): string {
  switch (state) {
    case 'ActiveThinking': return 'text-emerald-400';
    case 'ProductiveFailure': return 'text-blue-400';
    case 'Tinkering': return 'text-amber-400';
    case 'WheelSpinning': return 'text-orange-400';
    case 'GamingTheSystem': return 'text-red-400';
    default: return 'text-muted-foreground';
  }
}

function getInterventionColor(type: string): string {
  switch (type) {
    case 'None': return 'text-muted-foreground';
    case 'Rejection': return 'text-red-400';
    case 'ScaffoldingHint': return 'text-amber-400';
    case 'Reward': return 'text-emerald-400';
    case 'LevelUnlock': return 'text-purple-400';
    default: return 'text-muted-foreground';
  }
}

export function OdinTestBench() {
  const { user } = useAuth();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { getSnapshot, reset: resetKeystrokes } = useKeystrokeTracker(textareaRef);

  const [code, setCode] = useState(PRESETS.correct.code);
  const [skillType, setSkillType] = useState('ArrayIteration');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [result, setResult] = useState<SubmissionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submissionCount, setSubmissionCount] = useState(0);
  const [showSkillDropdown, setShowSkillDropdown] = useState(false);

  // Create a session on mount
  useEffect(() => {
    if (!user?.id) return;
    createSession(user.id, 1, 'test-bench')
      .then((session) => setSessionId(session.id))
      .catch((err) => setError(`Session creation failed: ${err.message}`));
  }, [user?.id]);

  const handleSubmit = async () => {
    if (!user?.id || !sessionId) {
      setError('No user or session — please log in and refresh');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const keystrokeData = getSnapshot();
      const response = await submitCode(
        user.id,
        sessionId,
        'test-bench',
        skillType,
        code,
        keystrokeData,
        0,
      );
      setResult(response);
      setSubmissionCount((c) => c + 1);
      resetKeystrokes();
    } catch (err: any) {
      setError(err.message || 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  const loadPreset = (key: string) => {
    const preset = PRESETS[key];
    setCode(preset.code);
    setSkillType(preset.skill);
    setResult(null);
    setError(null);
    resetKeystrokes();
    textareaRef.current?.focus();
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold font-mono tracking-tight mb-1">
            ODIN Pipeline Test Bench
          </h1>
          <p className="text-sm text-muted-foreground">
            Submit C# code to test the full pipeline: HBDA → AST Diagnosis → BKT → Affective State → Intervention
          </p>
        </div>

        {/* Presets */}
        <div className="mb-6">
          <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider font-semibold">Quick Presets</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(PRESETS).map(([key, preset]) => (
              <button
                key={key}
                onClick={() => loadPreset(key)}
                className="text-xs px-3 py-1.5 rounded-md border border-border bg-card hover:bg-accent hover:text-accent-foreground transition-colors"
                title={preset.description}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Code Editor */}
          <div className="space-y-4">
            {/* Skill selector */}
            <div className="relative">
              <button
                onClick={() => setShowSkillDropdown(!showSkillDropdown)}
                className="w-full flex items-center justify-between px-3 py-2 text-sm border border-border rounded-md bg-card hover:bg-accent transition-colors"
              >
                <span>
                  Skill: <span className="font-mono font-semibold">{skillType}</span>
                  <span className="text-muted-foreground ml-2">
                    (Level {SKILL_OPTIONS.find((s) => s.value === skillType)?.level})
                  </span>
                </span>
                <ChevronDown className="w-4 h-4" />
              </button>
              {showSkillDropdown && (
                <div className="absolute z-10 w-full mt-1 border border-border rounded-md bg-card shadow-lg">
                  {SKILL_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => { setSkillType(opt.value); setShowSkillDropdown(false); }}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-accent transition-colors ${
                        skillType === opt.value ? 'bg-accent font-semibold' : ''
                      }`}
                    >
                      {opt.label}
                      <span className="text-muted-foreground ml-2 text-xs">Level {opt.level}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Code textarea */}
            <div className="relative">
              <textarea
                ref={textareaRef}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                spellCheck={false}
                className="w-full h-72 p-4 font-mono text-sm bg-card border border-border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                placeholder="Type your C# code here..."
              />
              <div className="absolute bottom-2 right-2 text-xs text-muted-foreground font-mono">
                {code.length} chars
              </div>
            </div>

            {/* Submit bar */}
            <div className="flex items-center gap-3">
              <Button
                onClick={handleSubmit}
                disabled={loading || !sessionId}
                className="flex-1"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Analyzing...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Play className="w-4 h-4" />
                    Submit to ODIN Pipeline
                  </span>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => { setResult(null); setError(null); setCode(''); resetKeystrokes(); }}
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>

            {/* Status bar */}
            <div className="flex items-center gap-4 text-xs text-muted-foreground font-mono">
              <span>Session: {sessionId ? sessionId.slice(0, 8) + '...' : 'none'}</span>
              <span>Submissions: {submissionCount}</span>
              <span>User: {user?.id?.slice(0, 8) ?? 'none'}...</span>
            </div>

            {error && (
              <div className="p-3 rounded-md bg-destructive/10 border border-destructive/30 text-destructive text-sm">
                <span className="font-semibold">Error:</span> {error}
              </div>
            )}
          </div>

          {/* Right: Results Panel */}
          <div className="space-y-4">
            {!result ? (
              <div className="h-full flex items-center justify-center border border-dashed border-border rounded-md p-12 text-center">
                <div>
                  <Brain className="w-10 h-10 mx-auto mb-3 text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground">
                    Submit code to see the pipeline results
                  </p>
                  <p className="text-xs text-muted-foreground/60 mt-1">
                    HBDA → AST → BKT → Affective → Intervention
                  </p>
                </div>
              </div>
            ) : (
              <>
                {/* Correctness Banner */}
                <div className={`p-4 rounded-md border ${
                  result.isCorrect
                    ? 'bg-emerald-500/10 border-emerald-500/30'
                    : 'bg-destructive/10 border-destructive/30'
                }`}>
                  <div className="flex items-center gap-3">
                    {result.isCorrect
                      ? <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      : <XCircle className="w-5 h-5 text-destructive" />
                    }
                    <div>
                      <p className="font-semibold text-sm">
                        {result.isCorrect ? 'Code Correct' : 'Error Detected'}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {result.diagnosticMessage}
                      </p>
                    </div>
                    {result.xpAwarded > 0 && (
                      <span className="ml-auto text-xs font-mono font-bold text-amber-400">
                        +{result.xpAwarded} XP
                      </span>
                    )}
                  </div>
                </div>

                {/* AST Diagnosis */}
                <div className="p-4 rounded-md border border-border bg-card">
                  <div className="flex items-center gap-2 mb-3">
                    <Shield className="w-4 h-4 text-primary" />
                    <h3 className="text-sm font-semibold">AST Diagnosis</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                    <div>
                      <span className="text-muted-foreground">Category:</span>
                      <p className="font-semibold">{result.diagnosticCategory}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Compiler Errors:</span>
                      <p className="font-semibold">{result.compilerDiagnostics?.length ?? 0}</p>
                    </div>
                  </div>
                  {result.compilerDiagnostics && result.compilerDiagnostics.length > 0 && (
                    <div className="mt-3 space-y-1">
                      {result.compilerDiagnostics.slice(0, 3).map((d, i) => (
                        <p key={i} className="text-xs text-muted-foreground font-mono">
                          L{d.line}:{d.column} — {d.message}
                        </p>
                      ))}
                    </div>
                  )}
                </div>

                {/* HBDA Behavior */}
                <div className="p-4 rounded-md border border-border bg-card">
                  <div className="flex items-center gap-2 mb-3">
                    <Activity className="w-4 h-4 text-primary" />
                    <h3 className="text-sm font-semibold">HBDA Behavioral Analysis</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                    <div>
                      <span className="text-muted-foreground">Behavior State:</span>
                      <p className={`font-bold ${getBehaviorColor(result.behaviorState)}`}>
                        {result.behaviorState}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Helplessness Score:</span>
                      <p className="font-semibold">
                        {result.helplessnessScore.toFixed(1)}
                        <span className={result.helplessnessScoreDelta >= 0 ? 'text-red-400' : 'text-emerald-400'}>
                          {' '}({result.helplessnessScoreDelta >= 0 ? '+' : ''}{result.helplessnessScoreDelta.toFixed(1)})
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* BKT Mastery */}
                <div className="p-4 rounded-md border border-border bg-card">
                  <div className="flex items-center gap-2 mb-3">
                    <Brain className="w-4 h-4 text-primary" />
                    <h3 className="text-sm font-semibold">BKT Mastery Tracking</h3>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-xs font-mono">
                    <div>
                      <span className="text-muted-foreground">P(L):</span>
                      <p className="font-bold text-lg">{(result.masteryProbability * 100).toFixed(1)}%</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Mastered:</span>
                      <p className={`font-semibold ${result.isMastered ? 'text-emerald-400' : 'text-muted-foreground'}`}>
                        {result.isMastered ? 'YES' : 'No'}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Warm-Up:</span>
                      <p className="font-semibold">{result.isWarmUpPhase ? 'Active' : 'Done'}</p>
                    </div>
                  </div>
                  {/* Mastery bar */}
                  <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(result.masteryProbability * 100, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Intervention */}
                <div className="p-4 rounded-md border border-border bg-card">
                  <div className="flex items-center gap-2 mb-3">
                    <Zap className="w-4 h-4 text-primary" />
                    <h3 className="text-sm font-semibold">Intervention Decision</h3>
                  </div>
                  <p className={`text-sm font-mono font-bold ${getInterventionColor(result.interventionType)}`}>
                    {result.interventionType}
                    {result.levelUnlocked && ' 🔓 Level Unlocked!'}
                  </p>
                </div>

                {/* NPC Dialogue */}
                {result.npcDialogue && (
                  <div className="p-4 rounded-md border-2 border-primary/30 bg-primary/5">
                    <div className="flex items-start gap-3">
                      <MessageSquare className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs font-semibold text-primary mb-1">
                          {result.npcDialogue.npcName} says (Tier {result.npcDialogue.hintTier}):
                        </p>
                        <p className="text-sm italic">
                          "{result.npcDialogue.dialogueText}"
                        </p>
                        {result.npcDialogue.technicalHint && (
                          <p className="text-xs text-muted-foreground mt-2 font-mono p-2 bg-muted rounded">
                            💡 {result.npcDialogue.technicalHint}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
