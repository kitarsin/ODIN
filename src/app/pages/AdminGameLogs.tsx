import { useEffect, useState, useCallback } from 'react';
import { Navigation } from '../components/Navigation';
import { Gamepad2, Users, Brain, AlertTriangle, ChevronDown, ChevronRight, Clock, CheckCircle, XCircle, Search, RotateCcw, Download } from 'lucide-react';
import { getClassOverview, getStudentList, getPlayerSessions, getSessionSubmissions, buildPuzzleTitleMap, resetPlayerProgress } from '../../lib/odinApi';
import JSZip from 'jszip';

// ── Types ──────────────────────────────────────────────────────────────────

interface ClassOverview {
  totalStudents: number;
  totalSubmissions: number;
  averageHelplessnessScore: number;
  studentsInDistress: number;
  behaviorDistribution: Record<string, number>;
}

interface StudentEntry {
  id: string;
  studentId: string;
  displayName: string;
  section: string;
  currentLevel: number;
  helplessnessScore: number;
  totalSubmissions: number;
  overallMastery: number;
  status: 'STABLE' | 'AT_RISK' | 'CRITICAL';
}

interface GameSession {
  id: string;
  dungeonLevel: number;
  puzzleId: string;
  startedAt: string;
  endedAt: string | null;
  submissionCount: number;
  isCompleted: boolean;
}

interface SubmissionRecord {
  id: string;
  submittedAt: string;
  isCorrect: boolean;
  skillType: string;
  behaviorState: string;
  diagnosticCategory: string;
  diagnosticMessage: string;
  interventionType: string;
  averageFlightTimeMs: number;
  averageDwellTimeMs: number;
  initialLatencyMs: number;
  totalTimeSeconds: number;
  hintUsageCount: number;
  editDistance: number;
  submissionIntervalSeconds: number;
}

// ── Helpers ────────────────────────────────────────────────────────────────

const STATUS_STYLE: Record<string, string> = {
  STABLE: 'text-green-500 bg-green-500/10 border-green-500/30',
  AT_RISK: 'text-amber-500 bg-amber-500/10 border-amber-500/30',
  CRITICAL: 'text-red-500 bg-red-500/10 border-red-500/30',
};

const BEHAVIOR_STYLE: Record<string, string> = {
  ActiveThinking:           'text-emerald-400 bg-emerald-400/10',
  HintWithheld:             'text-slate-400 bg-slate-400/10',
  LowProgressTrialAndError: 'text-yellow-400 bg-yellow-400/10',
  WheelSpinning:            'text-orange-400 bg-orange-400/10',
  PostFailureDisengagement: 'text-rose-400 bg-rose-400/10',
  GamingTheSystem:          'text-red-500 bg-red-500/10',
};



function formatDuration(startedAt: string, endedAt: string | null) {
  if (!endedAt) return '—';
  const ms = new Date(endedAt).getTime() - new Date(startedAt).getTime();
  const mins = Math.floor(ms / 60000);
  const secs = Math.floor((ms % 60000) / 1000);
  return `${mins}m ${secs}s`;
}

function fmtMs(ms: number) {
  if (ms < 0) return '—';
  return `${ms.toFixed(0)} ms`;
}

function helplessnessColor(score: number) {
  if (score < 30) return 'text-green-500';
  if (score < 70) return 'text-amber-500';
  return 'text-red-500';
}

function elapsedSince(base: string, target: string) {
  const ms = new Date(target).getTime() - new Date(base).getTime();
  const s = Math.floor(ms / 1000);
  return s < 60 ? `+${s}s` : `+${Math.floor(s / 60)}m ${s % 60}s`;
}

// ── Component ───────────────────────────────────────────────────────────────

export function AdminGameLogs() {
  const [overview, setOverview] = useState<ClassOverview | null>(null);
  const [students, setStudents] = useState<StudentEntry[]>([]);
  const [puzzleTitles, setPuzzleTitles] = useState<Map<string, string>>(new Map());
  const [overviewLoading, setOverviewLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [studentSessions, setStudentSessions] = useState<GameSession[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);

  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [sessionSubmissions, setSessionSubmissions] = useState<SubmissionRecord[]>([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);

  const [expandedSubmissionId, setExpandedSubmissionId] = useState<string | null>(null);
  const [resetTargetStudent, setResetTargetStudent] = useState<StudentEntry | null>(null);
  const [resetting, setResetting] = useState(false);
  const [exportingAll, setExportingAll] = useState(false);
  const handleResetConfirm = useCallback(async () => {
    if (!resetTargetStudent) return;
    setResetting(true);
    try {
      await resetPlayerProgress(resetTargetStudent.id);
      // Deselect and refresh student list
      if (selectedStudentId === resetTargetStudent.id) {
        setSelectedStudentId(null);
        setStudentSessions([]);
        setSelectedSessionId(null);
        setSessionSubmissions([]);
      }
      const updated = await getStudentList();
      setStudents(updated);
    } catch (error) {
      console.error('Reset failed:', error);
      alert('Failed to reset progress. See console for details.');
    } finally {
      setResetting(false);
      setResetTargetStudent(null);
    }
  }, [resetTargetStudent, selectedStudentId]);

  // Load class overview + student list + puzzle titles on mount
  useEffect(() => {
    setOverviewLoading(true);
    Promise.all([getClassOverview(), getStudentList(), buildPuzzleTitleMap()])
      .then(([ov, st, titleMap]) => {
        setOverview(ov);
        setStudents(st);
        setPuzzleTitles(titleMap);
      })
      .finally(() => setOverviewLoading(false));
  }, []);

  // Load sessions when student selected
  const selectStudent = useCallback((student: StudentEntry) => {
    if (selectedStudentId === student.id) {
      setSelectedStudentId(null);
      setStudentSessions([]);
      setSelectedSessionId(null);
      setSessionSubmissions([]);
      return;
    }
    setSelectedStudentId(student.id);
    setSelectedSessionId(null);
    setSessionSubmissions([]);
    setSessionsLoading(true);
    getPlayerSessions(student.id, 20)
      .then(setStudentSessions)
      .finally(() => setSessionsLoading(false));
  }, [selectedStudentId]);

  // Load submissions when session selected
  const selectSession = useCallback((session: GameSession) => {
    if (selectedSessionId === session.id) {
      setSelectedSessionId(null);
      setSessionSubmissions([]);
      return;
    }
    setSelectedSessionId(session.id);
    setExpandedSubmissionId(null);
    setSubmissionsLoading(true);
    getSessionSubmissions(session.id)
      .then(setSessionSubmissions)
      .finally(() => setSubmissionsLoading(false));
  }, [selectedSessionId]);

  const filteredStudents = students.filter(s =>
    s.displayName.toLowerCase().includes(search.toLowerCase()) ||
    s.studentId.toLowerCase().includes(search.toLowerCase()) ||
    s.section.toLowerCase().includes(search.toLowerCase())
  );

  // ── Export All Game Logs ─────────────────────────────────────────────────
  const handleExportAllLogs = async () => {
    setExportingAll(true);
    try {
      const playedStudents = students.filter(s => s.totalSubmissions > 0);
      if (playedStudents.length === 0) {
        alert('No students have played the game yet.');
        setExportingAll(false);
        return;
      }
      const zip = new JSZip();
      for (const student of playedStudents) {
        const safeName = (student.displayName || student.studentId).replace(/[^a-zA-Z0-9@._-]/g, '_');
        const sessions = await getPlayerSessions(student.id, 100);
        const sessionsWithSubs = [];
        for (const session of sessions) {
          let submissions: any[] = [];
          try {
            submissions = await getSessionSubmissions(session.id);
          } catch { /* skip */ }
          sessionsWithSubs.push({ ...session, submissions });
        }
        const payload = {
          student: {
            id: student.id,
            studentId: student.studentId,
            displayName: student.displayName,
            section: student.section,
            currentLevel: student.currentLevel,
            overallMastery: student.overallMastery,
            helplessnessScore: student.helplessnessScore,
            totalSubmissions: student.totalSubmissions,
            status: student.status,
          },
          sessions: sessionsWithSubs,
        };
        zip.file(`${safeName}_gamelogs.json`, JSON.stringify(payload, null, 2));
      }
      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `all_gamelogs_export_${new Date().toISOString().slice(0, 10)}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Game log export failed:', err);
      alert('Failed to export game logs. Check console for details.');
    } finally {
      setExportingAll(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold mb-2 flex items-center gap-3">
            <Gamepad2 className="w-7 h-7 text-primary" />
            Game Logs
          </h1>
          <p className="text-sm text-muted-foreground">Per-student session drill-down with keystroke and behavioral analytics</p>
        </div>

        {/* ── Tier 1: Class Overview ─────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {overviewLoading ? (
            [...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
            ))
          ) : (
            <>
              <div className="border rounded-lg p-4 text-center bg-card border-border">
                <Users className="w-5 h-5 text-primary mx-auto mb-1" />
                <p className="text-2xl font-semibold text-primary" style={{ fontFamily: 'var(--font-mono)' }}>
                  {overview?.totalStudents ?? 0}
                </p>
                <p className="text-xs text-muted-foreground">Students</p>
              </div>
              <div className="border rounded-lg p-4 text-center bg-card border-border">
                <Brain className="w-5 h-5 text-secondary mx-auto mb-1" />
                <p className="text-2xl font-semibold text-secondary" style={{ fontFamily: 'var(--font-mono)' }}>
                  {overview?.totalSubmissions ?? 0}
                </p>
                <p className="text-xs text-muted-foreground">Total Submissions</p>
              </div>
              <div className="border rounded-lg p-4 text-center bg-card border-border">
                <AlertTriangle className={`w-5 h-5 mx-auto mb-1 ${helplessnessColor(overview?.averageHelplessnessScore ?? 0)}`} />
                <p className={`text-2xl font-semibold ${helplessnessColor(overview?.averageHelplessnessScore ?? 0)}`} style={{ fontFamily: 'var(--font-mono)' }}>
                  {(overview?.averageHelplessnessScore ?? 0).toFixed(1)}
                </p>
                <p className="text-xs text-muted-foreground">Avg Helplessness</p>
              </div>
              <div className="border rounded-lg p-4 text-center bg-card border-border">
                <AlertTriangle className="w-5 h-5 text-red-500 mx-auto mb-1" />
                <p className="text-2xl font-semibold text-red-500" style={{ fontFamily: 'var(--font-mono)' }}>
                  {overview?.studentsInDistress ?? 0}
                </p>
                <p className="text-xs text-muted-foreground">In Distress</p>
              </div>
            </>
          )}
        </div>

        {/* Behavior distribution */}
        {!overviewLoading && overview?.behaviorDistribution && (
          <div className="border rounded-lg p-4 bg-card border-border mb-6 flex flex-wrap gap-2 items-center">
            <span className="text-xs text-muted-foreground mr-2">Behavior Distribution:</span>
            {Object.entries(overview.behaviorDistribution).map(([state, count]) => (
              <span
                key={state}
                className={`text-xs px-2 py-1 rounded-full font-medium ${BEHAVIOR_STYLE[state] ?? 'text-muted-foreground bg-muted'}`}
              >
                {state.replace(/([A-Z])/g, ' $1').trim()}: {count}
              </span>
            ))}
          </div>
        )}

        {/* ── Tier 2: Student Table ──────────────────────────────────────── */}
        <div className="border rounded-lg bg-card border-border mb-6">
          <div className="p-4 border-b border-border flex items-center gap-3">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name, ID, or section…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            <div className="flex items-center gap-2">
              <button
                onClick={handleExportAllLogs}
                disabled={exportingAll || overviewLoading || students.filter(s => s.totalSubmissions > 0).length === 0}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded border border-border bg-secondary text-secondary-foreground hover:bg-secondary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
              >
                <Download className={`w-4 h-4 ${exportingAll ? 'animate-spin' : ''}`} />
                {exportingAll ? 'Exporting…' : `Export All (${students.filter(s => s.totalSubmissions > 0).length})`}
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-xs text-muted-foreground uppercase tracking-wider">
                  <th className="text-left p-3">Student</th>
                  <th className="text-left p-3">Section</th>
                  <th className="text-center p-3">Level</th>
                  <th className="text-center p-3">Submissions</th>
                  <th className="text-center p-3">Mastery</th>
                  <th className="text-center p-3">Helplessness</th>
                  <th className="text-center p-3">Status</th>
                  <th className="p-3" />
                </tr>
              </thead>
              <tbody>
                {overviewLoading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="border-b border-border">
                      <td colSpan={8} className="p-3">
                        <div className="h-5 bg-muted animate-pulse rounded" />
                      </td>
                    </tr>
                  ))
                ) : filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-6 text-center text-muted-foreground text-sm">
                      No students found.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map(student => (
                    <>
                      <tr
                        key={student.id}
                        onClick={() => selectStudent(student)}
                        className={`border-b border-border cursor-pointer transition-colors ${
                          selectedStudentId === student.id
                            ? 'bg-primary/5 border-l-2 border-l-primary'
                            : 'hover:bg-muted/40'
                        }`}
                      >
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            {selectedStudentId === student.id
                              ? <ChevronDown className="w-3.5 h-3.5 text-primary shrink-0" />
                              : <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                            }
                            <div>
                              <p className="font-medium">{student.displayName}</p>
                              <p className="text-xs text-muted-foreground" style={{ fontFamily: 'var(--font-mono)' }}>{student.studentId}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-3 text-muted-foreground">{student.section}</td>
                        <td className="p-3 text-center">
                          <span className="text-primary font-semibold" style={{ fontFamily: 'var(--font-mono)' }}>{student.currentLevel}</span>
                        </td>
                        <td className="p-3 text-center text-muted-foreground">{student.totalSubmissions}</td>
                        <td className="p-3 text-center">
                          <span className="font-semibold text-secondary" style={{ fontFamily: 'var(--font-mono)' }}>{student.overallMastery.toFixed(0)}%</span>
                        </td>
                        <td className="p-3 text-center">
                          <span className={`font-semibold ${helplessnessColor(student.helplessnessScore)}`} style={{ fontFamily: 'var(--font-mono)' }}>
                            {student.helplessnessScore.toFixed(1)}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${STATUS_STYLE[student.status]}`}>
                            {student.status}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <button
                            onClick={e => { e.stopPropagation(); setResetTargetStudent(student); }}
                            title="Reset game progress"
                            className="p-1.5 rounded text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>

                      {/* ── Tier 3: Session List (inline expansion) ── */}
                      {selectedStudentId === student.id && (
                        <tr key={`${student.id}-sessions`} className="bg-muted/20">
                          <td colSpan={8} className="p-0">
                            <div className="px-6 py-4 border-b border-border">
                              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                                Sessions — {student.displayName}
                              </p>

                              {sessionsLoading ? (
                                <div className="space-y-2">
                                  {[...Array(3)].map((_, i) => (
                                    <div key={i} className="h-10 bg-muted animate-pulse rounded" />
                                  ))}
                                </div>
                              ) : studentSessions.length === 0 ? (
                                <p className="text-sm text-muted-foreground py-4 text-center">No sessions recorded yet.</p>
                              ) : (
                                <div className="space-y-1">
                                  {studentSessions.map(session => (
                                    <div key={session.id}>
                                      <div
                                        onClick={() => selectSession(session)}
                                        className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors text-sm ${
                                          selectedSessionId === session.id
                                            ? 'bg-primary/10 border border-primary/30'
                                            : 'bg-card border border-border hover:bg-muted/40'
                                        }`}
                                      >
                                        <span className="text-xs font-semibold text-primary bg-primary/10 border border-primary/20 rounded px-2 py-0.5 shrink-0" style={{ fontFamily: 'var(--font-mono)' }}>
                                          LVL {session.dungeonLevel}
                                        </span>
                                        <span className="text-muted-foreground truncate flex-1" style={{ fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
                                          {puzzleTitles.get(session.puzzleId) ?? session.puzzleId}
                                        </span>
                                        <span className="text-xs text-muted-foreground shrink-0">
                                          {new Date(session.startedAt).toLocaleDateString()} {new Date(session.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                        <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                                          <Clock className="w-3 h-3" />
                                          {formatDuration(session.startedAt, session.endedAt)}
                                        </div>
                                        <span className="text-xs text-muted-foreground shrink-0">{session.submissionCount} tries</span>
                                        {session.isCompleted
                                          ? <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                                          : <span className="text-xs text-amber-500 shrink-0">Open</span>
                                        }
                                        {selectedSessionId === session.id
                                          ? <ChevronDown className="w-3.5 h-3.5 text-primary shrink-0" />
                                          : <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                                        }
                                      </div>

                                      {/* ── Tier 4: Submission Timeline ── */}
                                      {selectedSessionId === session.id && (
                                        <div className="mt-1 ml-4 pl-4 border-l border-primary/20">
                                          {submissionsLoading ? (
                                            <div className="space-y-2 py-2">
                                              {[...Array(3)].map((_, i) => (
                                                <div key={i} className="h-8 bg-muted animate-pulse rounded" />
                                              ))}
                                            </div>
                                          ) : sessionSubmissions.length === 0 ? (
                                            <p className="text-xs text-muted-foreground py-3">No submissions in this session.</p>
                                          ) : (
                                            <div className="py-2 space-y-1">
                                              <div className="grid grid-cols-[2rem_1fr_auto_auto_auto_auto_auto_1.5rem] gap-2 text-[10px] text-muted-foreground uppercase tracking-wider px-2 pb-1">
                                                <span>#</span>
                                                <span>Behavior</span>
                                                <span>Diagnostic</span>
                                                <span>Intervention</span>
                                                <span>Hints</span>
                                                <span>Time</span>
                                                <span>Result</span>
                                                <span />
                                              </div>
                                              {sessionSubmissions.map((sub, idx) => (
                                                <div key={sub.id}>
                                                  <div
                                                    className={`grid grid-cols-[2rem_1fr_auto_auto_auto_auto_auto_1.5rem] gap-2 items-center px-2 py-2 rounded cursor-pointer transition-colors text-xs ${
                                                      expandedSubmissionId === sub.id ? 'bg-muted/60' : 'hover:bg-muted/40'
                                                    }`}
                                                    onClick={() => setExpandedSubmissionId(expandedSubmissionId === sub.id ? null : sub.id)}
                                                  >
                                                    <span className="text-muted-foreground font-mono">{idx + 1}</span>
                                                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium w-fit ${BEHAVIOR_STYLE[sub.behaviorState] ?? 'text-muted-foreground bg-muted'}`}>
                                                      {sub.behaviorState.replace(/([A-Z])/g, ' $1').trim()}
                                                    </span>
                                                    <span className="text-muted-foreground">{sub.diagnosticCategory !== 'None' ? sub.diagnosticCategory : '—'}</span>
                                                    <span className="text-muted-foreground">{sub.interventionType !== 'None' ? sub.interventionType : '—'}</span>
                                                    <span className="text-center text-muted-foreground">{sub.hintUsageCount}</span>
                                                    <span className="text-muted-foreground font-mono">
                                                      {elapsedSince(session.startedAt, sub.submittedAt)}
                                                    </span>
                                                    {sub.isCorrect
                                                      ? <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                                                      : <XCircle className="w-3.5 h-3.5 text-red-400" />
                                                    }
                                                    {expandedSubmissionId === sub.id
                                                      ? <ChevronDown className="w-3 h-3 text-muted-foreground" />
                                                      : <ChevronRight className="w-3 h-3 text-muted-foreground" />
                                                    }
                                                  </div>

                                                  {/* Keystroke metrics expandable row */}
                                                  {expandedSubmissionId === sub.id && (
                                                    <div className="mx-2 mb-2 p-3 rounded bg-muted/40 border border-border text-xs space-y-2">
                                                      <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Keystroke Dynamics</p>
                                                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono">
                                                        <div>
                                                          <p className="text-[10px] text-muted-foreground">Flight Time</p>
                                                          <p className="text-foreground">{fmtMs(sub.averageFlightTimeMs)}</p>
                                                        </div>
                                                        <div>
                                                          <p className="text-[10px] text-muted-foreground">Dwell Time</p>
                                                          <p className="text-foreground">{fmtMs(sub.averageDwellTimeMs)}</p>
                                                        </div>
                                                        <div>
                                                          <p className="text-[10px] text-muted-foreground">Initial Latency</p>
                                                          <p className="text-foreground">{fmtMs(sub.initialLatencyMs)}</p>
                                                        </div>
                                                        <div>
                                                          <p className="text-[10px] text-muted-foreground">Total Time</p>
                                                          <p className="text-foreground">{sub.totalTimeSeconds.toFixed(1)}s</p>
                                                        </div>
                                                      </div>
                                                      {sub.diagnosticMessage && sub.diagnosticCategory !== 'None' && (
                                                        <div className="pt-1 border-t border-border">
                                                          <p className="text-[10px] text-muted-foreground">Diagnostic</p>
                                                          <p className="text-foreground mt-0.5">{sub.diagnosticMessage}</p>
                                                        </div>
                                                      )}
                                                    </div>
                                                  )}
                                                </div>
                                              ))}
                                            </div>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Reset confirmation modal */}
      {resetTargetStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-card border border-border rounded-lg p-6 max-w-sm w-full mx-4 shadow-xl">
            <h3 className="text-lg font-semibold mb-2 text-red-500">Reset Game Progress?</h3>
            <p className="text-sm text-muted-foreground mb-1">
              This will permanently reset all game data for:
            </p>
            <p className="text-sm font-semibold mb-1">{resetTargetStudent.displayName}</p>
            <p className="text-xs text-muted-foreground mb-4" style={{ fontFamily: 'var(--font-mono)' }}>
              {resetTargetStudent.studentId}
            </p>
            <ul className="text-xs text-muted-foreground mb-6 space-y-1 list-disc list-inside">
              <li>Level, XP, and helplessness score → zeroed</li>
              <li>All BKT skill mastery → wiped</li>
              <li>In-game progress (enemies, dialogues) → cleared</li>
              <li>Achievements and sync rate (profile fields) → reset</li>
              <li>All sessions, submissions, and interaction logs → deleted</li>
              <li className="text-foreground/90">Pretest completion and stored pretest responses are not changed</li>
            </ul>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setResetTargetStudent(null)}
                disabled={resetting}
                className="px-4 py-2 text-sm rounded border border-border hover:bg-muted transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleResetConfirm}
                disabled={resetting}
                className="px-4 py-2 text-sm rounded bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {resetting && <RotateCcw className="w-3.5 h-3.5 animate-spin" />}
                {resetting ? 'Resetting…' : 'Reset Progress'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
