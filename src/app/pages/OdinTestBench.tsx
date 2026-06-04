import { useState, useRef, useEffect, useCallback } from 'react';
import { Navigation } from '../components/Navigation';
import { useAuth } from '../context/AuthContext';
import { useKeystrokeTracker } from '../../hooks/useKeystrokeTracker';
import { submitCode, createSession, getPuzzlesByLevel, type SubmissionResponse } from '../../lib/odinApi';
import { AchievementModal } from '../components/AchievementModal';
import { getAchievementDetail } from '../utils/achievementCatalog';
import { Button } from '../components/ui/button';
import {
  Play, RotateCcw, ChevronDown, CheckCircle2, XCircle,
  MessageSquare, Brain, Activity, Zap, Shield, Plus, Info, Swords,
} from 'lucide-react';

// ── Constants ─────────────────────────────────────────────────────────────────

const DUNGEON_LEVELS = [
  { value: 0, label: 'Level 0 — Tutorial' },
  { value: 1, label: 'Level 1 — Library Maze' },
  { value: 2, label: 'Level 2 — Fast Food Maze' },
  { value: 3, label: 'Level 3 — Billiards Hall' },
];

// Skill type that best represents each dungeon level (used as fallback)
const LEVEL_SKILL: Record<number, string> = {
  0: 'ArrayInitialization',
  1: 'ArrayAccess',
  2: 'ArrayIteration',
  3: 'MultidimensionalArrays',
};

const BEHAVIOR_COLORS: Record<string, string> = {
  ActiveThinking:            'text-emerald-400',
  WheelSpinning:             'text-orange-400',
  GamingTheSystem:           'text-red-400',
  PostFailureDisengagement:  'text-rose-400',
  LowProgressTrialAndError:  'text-yellow-400',
  HintWithheld:              'text-slate-400',
};

const CONFIDENCE_COLORS: Record<string, string> = {
  High:     'text-emerald-400',
  Moderate: 'text-amber-400',
  Low:      'text-muted-foreground',
};

const INTERVENTION_COLORS: Record<string, string> = {
  None:            'text-muted-foreground',
  Rejection:       'text-red-400',
  ScaffoldingHint: 'text-amber-400',
  Reward:          'text-emerald-400',
  LevelUnlock:     'text-purple-400',
};

// ── Behavior presets ──────────────────────────────────────────────────────────

interface Preset {
  label: string;
  targetState: string;
  description: string;
  code: string;
  telemetry: Partial<TelemetryOverrides>;
  tip: string;
}

const PRESETS: Preset[] = [
  {
    label: 'Active Thinking',
    targetState: 'ActiveThinking',
    description: 'Long pause (>15 s) then correct answer',
    code: 'int[] arr = {1, 2, 3, 4, 5};\nfor (int i = 0; i < arr.Length; i++)\n    Console.WriteLine(arr[i]);',
    telemetry: { si: 20, initialLatencyMs: 12000, systemCheckCount: 0 },
    tip: 'SI > 15 s + correct answer + ≤ 1 system check. Submit once with the selected puzzle loaded.',
  },
  {
    label: 'WheelSpinning',
    targetState: 'WheelSpinning',
    description: 'Same wrong code 3+ times in a row',
    code: 'int[] arr = new int[5];\nConsole.WriteLine(arr[10]);',
    telemetry: { si: 3, systemCheckCount: 0 },
    tip: 'Hit Submit 3+ times without changing the code. Structural stasis triggers ind1.',
  },
  {
    label: 'Tinkering',
    targetState: 'LowProgressTrialAndError',
    description: 'Rapid (<6 s) submissions with varying values, same error',
    code: 'int[] arr = new int[3];\nConsole.WriteLine(arr[5]);',
    telemetry: { si: 2, systemCheckCount: 0 },
    tip: 'Change the index each submit (arr[5] → arr[6] → arr[7]) keeping SI < 6 s.',
  },
  {
    label: 'HintWithheld',
    targetState: 'HintWithheld',
    description: 'Long pause (>15 s) then wrong answer with a different error',
    code: 'int[] arr = {1,2,3};\nfor (int i = 0; i <= arr.Length; i++)\n    Console.WriteLine(arr[i]);',
    telemetry: { si: 18, systemCheckCount: 0 },
    tip: 'First submit a different error type, then load this preset (SI > 15 s + new error).',
  },
  {
    label: 'PostFailure Disengage',
    targetState: 'PostFailureDisengagement',
    description: 'Long inactivity (≥120 s) after a previous wrong answer',
    // arr[10] on a 5-element array → IndexOutOfRange → isCorrect: false (required by PostFailure)
    code: 'int[] arr = new int[5];\nConsole.WriteLine(arr[10]);',
    // inactivityDuration is what HBDA reads for this — NOT timeSinceLastSubmit
    telemetry: { si: 5, inactivityDuration: 125, systemCheckCount: 0 },
    tip: 'MUST have a previous wrong submission first. Submit this preset once (gets stored as previous), then submit it again — PostFailure fires on the second attempt.',
  },
  {
    label: 'Gaming System',
    targetState: 'GamingTheSystem',
    description: 'TaskBypassedDuration < 15 s (task completed suspiciously fast)',
    // Non-empty code so [Required] validation passes; gaming fires on taskBypassedDuration
    code: 'int[] arr = {1};\nConsole.WriteLine(arr[0]);',
    telemetry: { si: 2, taskBypassedDuration: 8, systemCheckCount: 0 },
    tip: 'Fires when TaskBypassed < 15 s. Enable TaskBypassed in telemetry overrides.',
  },
];

const BEHAVIOR_GUIDE = [
  { state: 'GamingTheSystem',           priority: 1, color: 'text-red-400',    trigger: 'Task bypass < 15 s or > 3 hints in 60 s',                          delta: '+20.0' },
  { state: 'PostFailureDisengagement',  priority: 2, color: 'text-rose-400',   trigger: 'InactivityDuration ≥ 120 s after error and/or unchanged resubmit', delta: '+8–20' },
  { state: 'WheelSpinning',             priority: 3, color: 'text-orange-400', trigger: '3+ consecutive same error + same normalized structure',              delta: '+5–15' },
  { state: 'LowProgressTrialAndError',  priority: 4, color: 'text-yellow-400', trigger: 'SI < 6 s with varying structure, or persistent error (no stasis)',   delta: '+3–10' },
  { state: 'HintWithheld',              priority: 5, color: 'text-slate-400',  trigger: 'SI > 15 s and new/different error type',                            delta: '−5.0'  },
  { state: 'ActiveThinking',            priority: 6, color: 'text-emerald-400',trigger: 'SI > 15 s + progressive attempt + ≤ 1 system check',                delta: '−8–20' },
];

// ── Types ─────────────────────────────────────────────────────────────────────

interface TelemetryOverrides {
  si: number;
  initialLatencyMs: number;
  inactivityDuration: number;
  postErrorInactivitySeconds: number;
  typingBurstCoverage: number;
  systemCheckCount: number;
  selfCorrectionCount: number;
  taskBypassedDuration: number | null;
}

interface Puzzle {
  id: string;
  title: string;
  description?: string;
  starterCode?: string;
  skillType?: string;
}

interface HistoryEntry {
  n: number;
  code: string;
  state: string;
  confidence: string;
  reasoning: string;
  delta: number;
  helplessness: number;
  mastery: number;
  isCorrect: boolean;
  intervention: string;
  warmUp: boolean;
}

const DEFAULT_TELEMETRY: TelemetryOverrides = {
  si: 5,
  initialLatencyMs: 0,
  inactivityDuration: 0,
  postErrorInactivitySeconds: -1,
  typingBurstCoverage: 0,
  systemCheckCount: 0,
  selfCorrectionCount: 0,
  taskBypassedDuration: null,
};

// ── Component ─────────────────────────────────────────────────────────────────

export function OdinTestBench() {
  const { user, addAchievement } = useAuth();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { getSnapshot, reset: resetKeystrokes } = useKeystrokeTracker(textareaRef);

  const [code, setCode]                       = useState(PRESETS[0].code);
  const [dungeonLevel, setDungeonLevel]       = useState(1);
  const [puzzles, setPuzzles]                 = useState<Puzzle[]>([]);
  const [selectedPuzzle, setSelectedPuzzle]   = useState<Puzzle | null>(null);
  const [puzzlesLoading, setPuzzlesLoading]   = useState(false);
  // When true, bypass level/puzzle selection entirely and use 'test-bench' id
  const [rawMode, setRawMode]                 = useState(false);
  const [sessionId, setSessionId]             = useState<string | null>(null);
  const [result, setResult]                   = useState<SubmissionResponse | null>(null);
  const [history, setHistory]                 = useState<HistoryEntry[]>([]);
  const [error, setError]                     = useState<string | null>(null);
  const [loading, setLoading]                 = useState(false);
  const [showGuide, setShowGuide]             = useState(false);
  const [showTelemetry, setShowTelemetry]     = useState(true);
  const [showLevelDrop, setShowLevelDrop]     = useState(false);
  const [showPuzzleDrop, setShowPuzzleDrop]   = useState(false);
  const [telemetry, setTelemetry]             = useState<TelemetryOverrides>(DEFAULT_TELEMETRY);
  const [achievementQueue, setAchievementQueue] = useState<string[]>([]);
  const [shownAchievement, setShownAchievement] = useState<string | null>(null);

  useEffect(() => {
    if (shownAchievement !== null || achievementQueue.length === 0) return;
    const [next, ...rest] = achievementQueue;
    setAchievementQueue(rest);
    setShownAchievement(next);
    const detail = getAchievementDetail(next);
    void addAchievement({ name: detail.name, emoji: detail.emoji, description: detail.description, unlockedAt: new Date().toISOString(), type: 'success' });
  }, [achievementQueue, shownAchievement]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAchievementClose = useCallback(() => setShownAchievement(null), []);

  // Synthetic entry — uses 'test-bench' puzzle ID so no output comparison runs.
  // Correctness is determined by AST diagnostics only (no errors → isCorrect: true).
  // Ideal for behavior preset testing where you just want to control HBDA inputs.
  const BEHAVIOR_TEST_PUZZLE: Puzzle = { id: 'test-bench', title: '⚗ Behavior Test (no puzzle)' };

  // Load puzzles for a given level
  const loadPuzzles = useCallback(async (level: number) => {
    setPuzzlesLoading(true);
    setPuzzles([]);
    setSelectedPuzzle(null);
    try {
      const data: Puzzle[] = await getPuzzlesByLevel(level);
      const withFallback = [BEHAVIOR_TEST_PUZZLE, ...data];
      setPuzzles(withFallback);
      setSelectedPuzzle(withFallback[0]);
    } catch {
      setPuzzles([BEHAVIOR_TEST_PUZZLE]);
      setSelectedPuzzle(BEHAVIOR_TEST_PUZZLE);
    } finally {
      setPuzzlesLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Start a session for the current level + puzzle
  const startNewSession = useCallback((level: number, puzzleId: string) => {
    if (!user?.id) return;
    createSession(user.id, level, puzzleId)
      .then((s) => { setSessionId(s.id); setHistory([]); setResult(null); setError(null); })
      .catch((e) => setError(`Session creation failed: ${e.message}`));
  }, [user?.id]);

  // On mount: load puzzles for initial level
  useEffect(() => {
    if (!user?.id) return;
    loadPuzzles(dungeonLevel);
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Start session and pre-fill code when puzzle changes
  useEffect(() => {
    if (!selectedPuzzle) return;
    startNewSession(dungeonLevel, selectedPuzzle.id);
    if (selectedPuzzle.starterCode) {
      setCode(selectedPuzzle.starterCode);
      resetKeystrokes();
    }
  }, [selectedPuzzle]); // eslint-disable-line react-hooks/exhaustive-deps

  // Raw mode: start a plain 'test-bench' session (no puzzle, AST-only correctness)
  useEffect(() => {
    if (!rawMode || !user?.id) return;
    startNewSession(dungeonLevel, 'test-bench');
    setCode(PRESETS[0].code);
    resetKeystrokes();
  }, [rawMode]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleLevelChange = (level: number) => {
    setDungeonLevel(level);
    setShowLevelDrop(false);
    if (!rawMode) loadPuzzles(level);
  };

  const handleSubmit = async () => {
    if (!user?.id || !sessionId) { setError('No session — select a puzzle first'); return; }
    setLoading(true);
    setError(null);
    try {
      const snap = getSnapshot();
      const skillType = selectedPuzzle?.skillType ?? LEVEL_SKILL[dungeonLevel] ?? 'ArrayIteration';
      const puzzleId = selectedPuzzle?.id ?? 'test-bench';

      const overriddenSnap = {
        ...snap,
        timeSinceLastSubmit:       telemetry.si,
        initialLatencyMs:          telemetry.initialLatencyMs,
        inactivityDuration:        telemetry.inactivityDuration,
        postErrorInactivitySeconds:telemetry.postErrorInactivitySeconds,
        typingBurstCoverage:       telemetry.typingBurstCoverage,
        systemCheckCount:          telemetry.systemCheckCount,
        selfCorrectionCount:       telemetry.selfCorrectionCount,
        taskBypassedDuration:      telemetry.taskBypassedDuration ?? undefined,
      };

      const res = await submitCode(user.id, sessionId, puzzleId, skillType, code, overriddenSnap, 0);
      setResult(res);
      setHistory((prev) => [{
        n: prev.length + 1,
        code: code.slice(0, 60) + (code.length > 60 ? '…' : ''),
        state: res.behaviorState,
        confidence: res.behaviorConfidence,
        reasoning: res.hbdaReasoning,
        delta: res.helplessnessScoreDelta,
        helplessness: res.helplessnessScore,
        mastery: res.masteryPercentage,
        isCorrect: res.isCorrect,
        intervention: res.interventionType,
        warmUp: res.isWarmUpPhase,
      }, ...prev]);
      if (res.newAchievements?.length) setAchievementQueue(q => [...q, ...res.newAchievements!]);
      resetKeystrokes();
    } catch (e: any) {
      setError(e.message || 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  const loadPreset = (p: Preset) => {
    setCode(p.code);
    setTelemetry({ ...DEFAULT_TELEMETRY, ...p.telemetry });
    setResult(null);
    setError(null);
    resetKeystrokes();
    textareaRef.current?.focus();
  };

  const setT = (key: keyof TelemetryOverrides, val: number | null) =>
    setTelemetry((prev) => ({ ...prev, [key]: val }));

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold font-mono tracking-tight">ODIN Pipeline Test Bench</h1>
            <p className="text-xs text-muted-foreground mt-0.5">HBDA → BKT → Affective State → Intervention</p>
          </div>
          <button
            onClick={() => setShowGuide(!showGuide)}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded border border-border bg-card hover:bg-muted transition-colors"
          >
            <Info className="w-3.5 h-3.5" />
            {showGuide ? 'Hide' : 'Behavior'} Guide
          </button>
        </div>

        {/* Behavior guide */}
        {showGuide && (
          <div className="rounded-lg border border-border bg-card overflow-hidden">
            <div className="px-4 py-2 border-b border-border bg-muted/40">
              <p className="text-xs font-semibold uppercase tracking-wider">Behavior Priority Order — first match wins</p>
            </div>
            <div className="divide-y divide-border/50">
              {BEHAVIOR_GUIDE.map((b) => (
                <div key={b.state} className="grid grid-cols-[1.5rem_10rem_1fr_3rem] gap-3 items-center px-4 py-2 text-xs font-mono">
                  <span className="text-muted-foreground">{b.priority}</span>
                  <span className={`font-semibold ${b.color}`}>{b.state}</span>
                  <span className="text-muted-foreground">{b.trigger}</span>
                  <span className={b.delta.startsWith('−') ? 'text-emerald-400' : 'text-red-400'}>{b.delta}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Presets */}
        <div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-2">Behavior Presets</p>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.targetState}
                onClick={() => loadPreset(p)}
                title={p.tip}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded border border-border bg-card hover:bg-muted transition-colors"
              >
                <span className={`w-1.5 h-1.5 rounded-full ${(BEHAVIOR_COLORS[p.targetState] ?? 'text-muted-foreground').replace('text-', 'bg-')}`} />
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-6">

          {/* ── Left: Editor + Controls ── */}
          <div className="space-y-3">

            {/* Mode toggle */}
            <div className="flex items-center gap-2 p-2 rounded-md border border-border bg-muted/30">
              <button
                onClick={() => { setRawMode(false); loadPuzzles(dungeonLevel); }}
                className={`flex-1 py-1.5 text-xs rounded transition-colors font-medium ${!rawMode ? 'bg-card border border-border shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              >
                Puzzle Mode
              </button>
              <button
                onClick={() => setRawMode(true)}
                className={`flex-1 py-1.5 text-xs rounded transition-colors font-medium ${rawMode ? 'bg-card border border-border shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              >
                ⚗ Test-Bench Mode
              </button>
            </div>

            {/* Level + Puzzle selectors (puzzle mode only) */}
            {!rawMode && (
              <div className="grid grid-cols-2 gap-2">
                {/* Dungeon level */}
                <div className="relative">
                  <button
                    onClick={() => setShowLevelDrop(!showLevelDrop)}
                    className="w-full flex items-center justify-between px-3 py-2 text-xs border border-border rounded-md bg-card hover:bg-muted transition-colors font-mono"
                  >
                    <span className="truncate">{DUNGEON_LEVELS.find(l => l.value === dungeonLevel)?.label}</span>
                    <ChevronDown className="w-3.5 h-3.5 shrink-0 ml-1" />
                  </button>
                  {showLevelDrop && (
                    <div className="absolute z-10 w-full mt-1 border border-border rounded-md bg-card shadow-lg">
                      {DUNGEON_LEVELS.map((l) => (
                        <button
                          key={l.value}
                          onClick={() => handleLevelChange(l.value)}
                          className={`w-full text-left px-3 py-2 text-xs font-mono hover:bg-muted transition-colors ${dungeonLevel === l.value ? 'bg-muted font-semibold' : ''}`}
                        >
                          {l.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Puzzle / enemy selector */}
                <div className="relative">
                  <button
                    onClick={() => setShowPuzzleDrop(!showPuzzleDrop)}
                    disabled={puzzlesLoading || puzzles.length === 0}
                    className="w-full flex items-center justify-between px-3 py-2 text-xs border border-border rounded-md bg-card hover:bg-muted transition-colors font-mono disabled:opacity-50"
                  >
                    <span className="flex items-center gap-1.5 truncate">
                      <Swords className="w-3 h-3 shrink-0 text-muted-foreground" />
                      {puzzlesLoading ? 'Loading…' : (selectedPuzzle?.title ?? 'No puzzles')}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 shrink-0 ml-1" />
                  </button>
                  {showPuzzleDrop && puzzles.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 border border-border rounded-md bg-card shadow-lg max-h-48 overflow-y-auto">
                      {puzzles.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => { setSelectedPuzzle(p); setShowPuzzleDrop(false); }}
                          className={`w-full text-left px-3 py-2 text-xs font-mono hover:bg-muted transition-colors ${selectedPuzzle?.id === p.id ? 'bg-muted font-semibold' : ''}`}
                        >
                          {p.title}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Puzzle description (puzzle mode, real puzzle selected) */}
            {!rawMode && selectedPuzzle && selectedPuzzle.id !== 'test-bench' && selectedPuzzle.description && (
              <div className="rounded-md border border-border bg-muted/30 px-3 py-2 space-y-0.5">
                <p className="text-[10px] font-semibold text-primary uppercase tracking-wider">{selectedPuzzle.title}</p>
                <p className="text-[11px] text-muted-foreground leading-relaxed">{selectedPuzzle.description}</p>
              </div>
            )}

            {/* Raw mode note */}
            {rawMode && (
              <div className="rounded-md border border-amber-500/20 bg-amber-500/5 px-3 py-2">
                <p className="text-[11px] text-amber-400 font-mono">
                  Test-Bench Mode — no puzzle loaded. Correctness is determined by AST diagnostics only (no errors = correct). Ideal for testing HBDA behavior in isolation.
                </p>
              </div>
            )}

            {/* Session info + new session */}
            <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground px-1">
              <span>Session: {sessionId ? sessionId.slice(0, 8) + '…' : '—'}</span>
              <span>Submissions: {history.length}</span>
              <button
                onClick={() => rawMode
                  ? startNewSession(dungeonLevel, 'test-bench')
                  : (selectedPuzzle && startNewSession(dungeonLevel, selectedPuzzle.id))}
                className="flex items-center gap-1 hover:text-foreground transition-colors"
              >
                <Plus className="w-3 h-3" /> New session
              </button>
            </div>

            {/* Telemetry overrides */}
            <div className="border border-border rounded-md bg-card overflow-hidden">
              <button
                onClick={() => setShowTelemetry(!showTelemetry)}
                className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold hover:bg-muted transition-colors"
              >
                <span>Telemetry Overrides</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showTelemetry ? 'rotate-180' : ''}`} />
              </button>
              {showTelemetry && (
                <div className="px-3 pb-3 pt-3 border-t border-border/50 space-y-2">
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                    {([
                      ['si',                    'SI / timeSinceLastSubmit (s)',   0, 300,   0.5 ],
                      ['initialLatencyMs',      'Initial Latency (ms)',           0, 30000, 500 ],
                      ['inactivityDuration',    'Inactivity Duration (s)',        0, 300,   1   ],
                      ['typingBurstCoverage',   'Burst Coverage (0–1)',           0, 1,     0.05],
                      ['systemCheckCount',      'System Checks',                  0, 10,    1   ],
                      ['selfCorrectionCount',   'Self-Corrections',               0, 20,    1   ],
                    ] as [keyof TelemetryOverrides, string, number, number, number][]).map(([key, label, min, max, step]) => (
                      <label key={key} className="flex flex-col gap-0.5">
                        <span className="text-[10px] text-muted-foreground font-mono">{label}</span>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="range" min={min} max={max} step={step}
                            value={telemetry[key] as number}
                            onChange={(e) => setT(key, parseFloat(e.target.value))}
                            className="flex-1 h-1 accent-primary"
                          />
                          <span className="text-[10px] font-mono w-10 text-right tabular-nums">
                            {(telemetry[key] as number).toFixed(step < 1 ? 2 : 0)}
                          </span>
                        </div>
                      </label>
                    ))}
                  </div>

                  {/* PostErrorInactivity */}
                  <label className="flex flex-col gap-0.5">
                    <span className="text-[10px] text-muted-foreground font-mono">PostError Inactivity (s) — −1 = off</span>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="range" min={-1} max={300} step={1}
                        value={telemetry.postErrorInactivitySeconds}
                        onChange={(e) => setT('postErrorInactivitySeconds', parseFloat(e.target.value))}
                        className="flex-1 h-1 accent-primary"
                      />
                      <span className="text-[10px] font-mono w-10 text-right tabular-nums">
                        {telemetry.postErrorInactivitySeconds.toFixed(0)}
                      </span>
                    </div>
                  </label>

                  {/* TaskBypassed */}
                  <label className="flex items-center gap-3">
                    <span className="text-[10px] text-muted-foreground font-mono shrink-0">Task Bypassed</span>
                    <input
                      type="checkbox"
                      checked={telemetry.taskBypassedDuration !== null}
                      onChange={(e) => setT('taskBypassedDuration', e.target.checked ? 8 : null)}
                      className="accent-primary"
                    />
                    {telemetry.taskBypassedDuration !== null && (
                      <>
                        <input
                          type="number" min={0} max={60} step={1}
                          value={telemetry.taskBypassedDuration}
                          onChange={(e) => setT('taskBypassedDuration', parseFloat(e.target.value))}
                          className="w-14 px-2 py-0.5 text-xs font-mono border border-border rounded bg-background"
                        />
                        <span className={`text-[10px] font-mono ${telemetry.taskBypassedDuration < 15 ? 'text-red-400' : 'text-muted-foreground'}`}>
                          {telemetry.taskBypassedDuration < 15 ? '→ Gaming fires' : '≥ 15 s, safe'}
                        </span>
                      </>
                    )}
                  </label>
                </div>
              )}
            </div>

            {/* Code editor */}
            <div className="relative">
              <textarea
                ref={textareaRef}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                spellCheck={false}
                className="w-full h-52 p-3 font-mono text-xs bg-card border border-border rounded-md resize-none focus:outline-none focus:ring-1 focus:ring-primary/50 transition-colors"
                placeholder="C# code…"
              />
              <span className="absolute bottom-2 right-2 text-[10px] text-muted-foreground font-mono">{code.length} ch</span>
            </div>

            {/* Submit */}
            <div className="flex items-center gap-2">
              <Button onClick={handleSubmit} disabled={loading || !sessionId} className="flex-1 h-8 text-xs">
                {loading
                  ? <span className="flex items-center gap-1.5"><div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />Analyzing…</span>
                  : <span className="flex items-center gap-1.5"><Play className="w-3.5 h-3.5" />Submit to Pipeline</span>
                }
              </Button>
              <Button variant="outline" className="h-8 px-3"
                onClick={() => { setResult(null); setError(null); setCode(''); resetKeystrokes(); }}>
                <RotateCcw className="w-3.5 h-3.5" />
              </Button>
            </div>

            {error && (
              <div className="p-2 rounded bg-destructive/10 border border-destructive/30 text-destructive text-xs">{error}</div>
            )}
          </div>

          {/* ── Right: Results + History ── */}
          <div className="space-y-3">

            {result ? (
              <>
                {/* Correctness */}
                <div className={`p-3 rounded border ${result.isCorrect ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-destructive/10 border-destructive/30'}`}>
                  <div className="flex items-center gap-2">
                    {result.isCorrect
                      ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      : <XCircle className="w-4 h-4 text-destructive shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold">{result.isCorrect ? 'Correct' : 'Error Detected'}</p>
                      <p className="text-[11px] text-muted-foreground truncate">{result.diagnosticMessage}</p>
                    </div>
                    {result.xpAwarded > 0 && <span className="text-xs font-mono font-bold text-amber-400 shrink-0">+{result.xpAwarded} XP</span>}
                  </div>
                </div>

                {/* HBDA */}
                <div className="p-3 rounded border border-border bg-card space-y-2">
                  <div className="flex items-center gap-2">
                    <Activity className="w-3.5 h-3.5 text-primary" />
                    <h3 className="text-xs font-semibold">HBDA Behavioral Analysis</h3>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-[11px] font-mono">
                    <div>
                      <p className="text-muted-foreground text-[10px]">State</p>
                      <p className={`font-bold ${BEHAVIOR_COLORS[result.behaviorState] ?? 'text-foreground'}`}>{result.behaviorState}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-[10px]">Confidence</p>
                      <p className={`font-semibold ${CONFIDENCE_COLORS[result.behaviorConfidence] ?? 'text-foreground'}`}>{result.behaviorConfidence}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-[10px]">Helplessness</p>
                      <p className="font-semibold">
                        {result.helplessnessScore.toFixed(1)}
                        <span className={result.helplessnessScoreDelta >= 0 ? 'text-red-400' : 'text-emerald-400'}>
                          {' '}({result.helplessnessScoreDelta >= 0 ? '+' : ''}{result.helplessnessScoreDelta.toFixed(1)})
                        </span>
                      </p>
                    </div>
                  </div>
                  {result.hbdaReasoning && (
                    <p className="text-[10px] text-muted-foreground font-mono bg-muted/40 rounded px-2 py-1.5 leading-relaxed">
                      {result.hbdaReasoning}
                    </p>
                  )}
                </div>

                {/* BKT */}
                <div className="p-3 rounded border border-border bg-card space-y-2">
                  <div className="flex items-center gap-2">
                    <Brain className="w-3.5 h-3.5 text-primary" />
                    <h3 className="text-xs font-semibold">BKT Mastery</h3>
                    {result.isWarmUpPhase && <span className="text-[10px] text-amber-400 font-mono ml-auto">Calibrating…</span>}
                  </div>
                  <div className="flex items-center gap-4 text-[11px] font-mono">
                    <div>
                      <p className="text-muted-foreground text-[10px]">P(L)</p>
                      <p className="font-bold text-base">{result.masteryPercentage}%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-[10px]">Mastered</p>
                      <p className={`font-semibold ${result.isMastered ? 'text-emerald-400' : 'text-muted-foreground'}`}>{result.isMastered ? 'YES' : 'No'}</p>
                    </div>
                    <div className="flex-1">
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden mt-3">
                        <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${result.masteryPercentage}%` }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* AST + Intervention row */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded border border-border bg-card">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Shield className="w-3.5 h-3.5 text-primary" />
                      <h3 className="text-xs font-semibold">AST Diagnosis</h3>
                    </div>
                    <p className="text-[11px] font-mono font-semibold">{result.diagnosticCategory}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{result.compilerDiagnostics?.length ?? 0} compiler error{result.compilerDiagnostics?.length !== 1 ? 's' : ''}</p>
                  </div>
                  <div className="p-3 rounded border border-border bg-card">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Zap className="w-3.5 h-3.5 text-primary" />
                      <h3 className="text-xs font-semibold">Intervention</h3>
                    </div>
                    <p className={`text-[11px] font-mono font-bold ${INTERVENTION_COLORS[result.interventionType] ?? 'text-foreground'}`}>
                      {result.interventionType}{result.levelUnlocked && ' 🔓'}
                    </p>
                  </div>
                </div>

                {/* NPC dialogue */}
                {result.npcDialogue && (
                  <div className="p-3 rounded border-2 border-primary/30 bg-primary/5">
                    <div className="flex items-start gap-2">
                      <MessageSquare className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      <div>
                        <p className="text-[10px] font-semibold text-primary mb-1">{result.npcDialogue.npcName} — Tier {result.npcDialogue.hintTier}</p>
                        <p className="text-xs italic">"{result.npcDialogue.dialogueText}"</p>
                        {result.npcDialogue.technicalHint && (
                          <p className="text-[10px] text-muted-foreground mt-1.5 font-mono bg-muted rounded px-2 py-1">💡 {result.npcDialogue.technicalHint}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center justify-center h-48 border border-dashed border-border rounded-md">
                <div className="text-center">
                  <Brain className="w-8 h-8 mx-auto mb-2 text-muted-foreground/30" />
                  <p className="text-xs text-muted-foreground">
                    {rawMode ? 'Test-Bench Mode ready' : selectedPuzzle ? `Ready — ${selectedPuzzle.title}` : 'Select a puzzle to start'}
                  </p>
                </div>
              </div>
            )}

            {/* Submission history */}
            {history.length > 0 && (
              <div className="rounded border border-border bg-card overflow-hidden">
                <div className="px-3 py-2 border-b border-border bg-muted/40">
                  <p className="text-[10px] font-semibold uppercase tracking-wider">Session History ({history.length})</p>
                </div>
                <div className="divide-y divide-border/40 max-h-56 overflow-y-auto">
                  {history.map((h) => (
                    <div key={h.n} className="px-3 py-2 text-[10px] font-mono grid grid-cols-[1.5rem_6.5rem_3.5rem_1fr_2.5rem] gap-2 items-center">
                      <span className="text-muted-foreground">#{h.n}</span>
                      <span className={BEHAVIOR_COLORS[h.state] ?? 'text-foreground'} title={h.reasoning}>
                        {h.state.replace('LowProgressTrialAndError','Tinkering').replace('PostFailureDisengagement','PFD')}
                      </span>
                      <span className={CONFIDENCE_COLORS[h.confidence] ?? 'text-muted-foreground'}>{h.confidence}</span>
                      <span className="text-muted-foreground truncate" title={h.reasoning}>{h.reasoning || '—'}</span>
                      <span className={h.delta >= 0 ? 'text-red-400' : 'text-emerald-400'}>
                        {h.delta >= 0 ? '+' : ''}{h.delta.toFixed(0)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {shownAchievement && (() => {
        const d = getAchievementDetail(shownAchievement);
        return (
          <AchievementModal
            isOpen
            onClose={handleAchievementClose}
            data={{ status: 'success', badgeName: d.name, badgeEmoji: d.emoji, title: 'Achievement Unlocked!', description: d.description, successMessage: 'Added to your profile.' }}
          />
        );
      })()}
    </div>
  );
}
