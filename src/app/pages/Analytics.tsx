import { useEffect, useState } from 'react';
import { Navigation } from '../components/Navigation';
import { AlertTriangle, Activity, TrendingDown, ClipboardList, ChevronDown, ChevronRight, CheckCircle, Clock, Keyboard, ClipboardCopy, XCircle } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { calculateSyncRate } from '../utils/achievementCatalog';

type Student = {
  id: string;
  name: string;
  studentId: string;
  section: string;
  avatar: string;
  syncRate: number;
  createdAt?: string;
  progress: {
    arrays: number;
    loops: number;
    grids: number;
  };
};

type RawEvent = {
  t: number;
  type: string;
  key?: string;
  dwell?: number;
  flight?: number;
  chars?: number;
  idle?: number;
  pass?: boolean;
  diag?: string;
};

type TimelineSegment =
  | { kind: 'event'; t: number; type: string; meta?: string }
  | { kind: 'burst'; startT: number; endT: number; keys: number; backspaces: number; deletes: number };

type PretestQuestionRow = {
  questionId: string;
  response: string;
  totalTimeMs: number;
  timeToFirstKeyMs: number;
  avgFlightTimeMs: number;
  avgDwellTimeMs: number;
  pasteCount: number;
  pasteCharCount: number;
  typedCharCount: number;
  isCorrect: boolean;
  rawEvents: RawEvent[];
};

// ── Timeline helpers ────────────────────────────────────────────────────────

/** Format milliseconds as MM:SS.mmm */
function fmtTs(ms: number): string {
  const m   = Math.floor(ms / 60_000);
  const s   = Math.floor((ms % 60_000) / 1_000);
  const ms3 = Math.floor(ms % 1_000);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(ms3).padStart(3, '0')}`;
}

/** Collapse consecutive keydown/keyup events into typing bursts for readability */
function buildTimeline(events: RawEvent[]): TimelineSegment[] {
  const segments: TimelineSegment[] = [];
  let burst: { startT: number; endT: number; keys: number; backspaces: number; deletes: number } | null = null;

  const flushBurst = () => {
    if (burst) { segments.push({ kind: 'burst', ...burst }); burst = null; }
  };

  for (const e of events) {
    if (e.type === 'keydown') {
      if (!burst) burst = { startT: e.t, endT: e.t, keys: 0, backspaces: 0, deletes: 0 };
      burst.endT = e.t;
      burst.keys += 1;
      if (e.key === 'Backspace') burst.backspaces += 1;
      if (e.key === 'Delete')    burst.deletes    += 1;
    } else if (e.type === 'keyup') {
      if (burst) burst.endT = e.t;
    } else {
      flushBurst();
      let meta: string | undefined;
      if (e.type === 'paste')      meta = `${e.chars ?? 0} chars pasted`;
      if (e.type === 'idle_end')   meta = `idle for ${((e.idle ?? 0) / 1000).toFixed(1)}s`;
      if (e.type === 'run_result') meta = e.pass ? 'PASS' : `FAIL — ${e.diag ?? ''}`;
      segments.push({ kind: 'event', t: e.t, type: e.type, meta });
    }
  }
  flushBurst();
  return segments;
}

const EVENT_LABEL: Record<string, string> = {
  question_shown: 'Question shown',
  idle_start:     'Stopped typing (idle)',
  idle_end:       'Resumed typing',
  paste:          'Paste',
  run_click:      'Run Code clicked',
  run_result:     'Run result',
  advance:        'Moved to next problem',
};

type PretestStudentResult = {
  userId: string;
  fullName: string;
  studentId: string;
  section: string;
  completed: boolean;
  avgFlightTimeMs: number;
  avgDwellTimeMs: number;
  avgTimeToFirstKeyMs: number;
  avgTotalTimeMs: number;
  totalPasteCount: number;
  responses: PretestQuestionRow[];
};

const PROBLEM_LABELS: Record<string, string> = {
  p1: 'P1 — Declare and Print',
  p2: 'P2 — Fix Out-of-Bounds Error',
  p3: 'P3 — Sum the Elements',
  p4: 'P4 — Double Each Value',
  p5: 'P5 — Count Values Above Five',
};

const mockAnalyticsStudents: Student[] = [
  {
    id: 'mock-student-1',
    name: 'Alex Chen',
    studentId: 'S001',
    section: 'Section A',
    avatar: '👨‍💻',
    syncRate: 85,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    progress: { arrays: 90, loops: 85, grids: 75 },
  },
  {
    id: 'mock-student-2',
    name: 'Sarah Kim',
    studentId: 'S002',
    section: 'Section B',
    avatar: '👩‍💼',
    syncRate: 45,
    createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    progress: { arrays: 50, loops: 35, grids: 30 },
  },
  {
    id: 'mock-student-3',
    name: 'Marcus Johnson',
    studentId: 'S003',
    section: 'Section A',
    avatar: '👨‍🎓',
    syncRate: 58,
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    progress: { arrays: 70, loops: 55, grids: 45 },
  },
  {
    id: 'mock-student-4',
    name: 'Emma Rodriguez',
    studentId: 'S004',
    section: 'Section C',
    avatar: '👩‍🦰',
    syncRate: 91,
    createdAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
    progress: { arrays: 95, loops: 92, grids: 88 },
  },
  {
    id: 'mock-student-5',
    name: 'David Park',
    studentId: 'S005',
    section: 'Section B',
    avatar: '👨‍🏫',
    syncRate: 64,
    createdAt: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString(),
    progress: { arrays: 75, loops: 60, grids: 55 },
  },
  {
    id: 'mock-student-6',
    name: 'Lisa Thompson',
    studentId: 'S006',
    section: 'Section C',
    avatar: '👩‍💻',
    syncRate: 79,
    createdAt: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000).toISOString(),
    progress: { arrays: 85, loops: 80, grids: 72 },
  },
];

export function Analytics() {
  const [students, setStudents] = useState<Student[]>(mockAnalyticsStudents);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [pretestResults, setPretestResults] = useState<PretestStudentResult[]>([]);
  const [pretestLoading, setPretestLoading] = useState(true);
  const [pretestError, setPretestError] = useState<string | null>(null);
  const [expandedStudent, setExpandedStudent] = useState<string | null>(null);

  const isAvatarUrl = (value: string) => value.startsWith('http') || value.startsWith('data:');

  const coerceJsonArray = (value: unknown): any[] => {
    if (Array.isArray(value)) return value;
    if (!value) return [];
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
      } catch (error) {
        console.warn('Failed to parse json array:', error);
        return [];
      }
    }
    return [];
  };

  const dedupeBadges = (value: unknown) => {
    const rawBadges = coerceJsonArray(value)
      .filter((badge) => typeof badge === 'string') as string[];
    const seen = new Set<string>();
    const result: string[] = [];
    for (const badge of rawBadges) {
      const normalized = badge.trim();
      if (!normalized || seen.has(normalized)) continue;
      seen.add(normalized);
      result.push(normalized);
    }
    return result;
  };

  const dedupeAchievements = (value: unknown) => {
    const rawAchievements = coerceJsonArray(value)
      .filter((achievement) => achievement && typeof achievement === 'object') as { name?: string; type?: string }[];
    const seen = new Set<string>();
    const result: { name?: string; type?: string }[] = [];
    for (const achievement of rawAchievements) {
      const name = `${achievement.name || ''}`.trim().toLowerCase();
      const type = `${achievement.type || ''}`.trim().toLowerCase();
      const key = `${name}::${type}`;
      if (!name || seen.has(key)) continue;
      seen.add(key);
      result.push(achievement);
    }
    return result;
  };

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoadError(null);
        setLoading(true);
        // Use mock students for analytics
        setStudents(mockAnalyticsStudents);
        setLoadError(null);
      } catch (error) {
        console.error('Error fetching students:', error);
        // Use mock data as fallback on error
        setStudents(mockAnalyticsStudents);
        setLoadError(null);
      } finally {
        setLoading(false);
      }
    };

    const fetchPretestResults = async () => {
      try {
        setPretestLoading(true);
        setPretestError(null);

        const [profilesRes, responsesRes] = await Promise.all([
          supabase
            .from('profiles')
            .select('id, full_name, student_id, section, pretest_completed')
            .eq('role', 'student')
            .order('full_name'),
          supabase
            .from('pretest_responses')
            .select('user_id, question_id, response, avg_flight_time_ms, avg_dwell_time_ms, time_to_first_key_ms, total_time_ms, paste_count, paste_char_count, typed_char_count, is_correct, raw_events')
            .order('sequence_number'),
        ]);

        if (profilesRes.error) throw profilesRes.error;

        const responsesByUser: Record<string, any[]> = {};
        for (const row of responsesRes.data ?? []) {
          if (!responsesByUser[row.user_id]) responsesByUser[row.user_id] = [];
          responsesByUser[row.user_id].push(row);
        }

        const avg = (arr: number[]) => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

        const results: PretestStudentResult[] = (profilesRes.data ?? []).map(p => {
          const rows = responsesByUser[p.id] ?? [];
          return {
            userId: p.id,
            fullName: p.full_name || 'Unknown',
            studentId: p.student_id || '—',
            section: p.section || '—',
            completed: p.pretest_completed ?? false,
            avgFlightTimeMs: avg(rows.map((r: any) => r.avg_flight_time_ms ?? 0)),
            avgDwellTimeMs: avg(rows.map((r: any) => r.avg_dwell_time_ms ?? 0)),
            avgTimeToFirstKeyMs: avg(rows.map((r: any) => r.time_to_first_key_ms ?? 0)),
            avgTotalTimeMs: avg(rows.map((r: any) => r.total_time_ms ?? 0)),
            totalPasteCount: rows.reduce((s: number, r: any) => s + (r.paste_count ?? 0), 0),
            responses: rows.map((r: any) => ({
              questionId: r.question_id,
              response: r.response ?? '',
              totalTimeMs: r.total_time_ms ?? 0,
              timeToFirstKeyMs: r.time_to_first_key_ms ?? 0,
              avgFlightTimeMs: r.avg_flight_time_ms ?? 0,
              avgDwellTimeMs: r.avg_dwell_time_ms ?? 0,
              pasteCount: r.paste_count ?? 0,
              pasteCharCount: r.paste_char_count ?? 0,
              typedCharCount: r.typed_char_count ?? 0,
              isCorrect: r.is_correct ?? false,
              rawEvents: Array.isArray(r.raw_events) ? r.raw_events : [],
            })),
          };
        });

        setPretestResults(results);
      } catch (err: any) {
        setPretestError(err?.message || 'Failed to load pretest results');
      } finally {
        setPretestLoading(false);
      }
    };

    fetchStudents();
    fetchPretestResults();
  }, []);
  
  // Calculate at-risk students (sync rate < 60)
  const atRiskStudents = students.filter(s => s.syncRate < 60);

  // Generate class heatmap data
  const sections = Array.from(new Set(students.map(s => s.section)));
  const heatmapData = sections.map(section => {
    const sectionStudents = students.filter(s => s.section === section);
    const avgMastery = sectionStudents.length > 0
      ? sectionStudents.reduce((sum, s) => sum + s.syncRate, 0) / sectionStudents.length
      : 0;
    return { section, avgMastery, count: sectionStudents.length };
  });

  const behaviorLogs = students.flatMap((student) => {
    const logs: any[] = [];
    
    // Add registration log
    logs.push({
      id: `${student.id}-registered`,
      student: student.name,
      event: 'Registered account',
      timestamp: student.createdAt || new Date().toISOString(),
      severity: 'low'
    });
    
    // Assign behaviors based on sync rate
    if (student.syncRate >= 85) {
      logs.push({
        id: `${student.id}-behavior-active`,
        student: student.name,
        event: 'Active Thinking',
        timestamp: new Date(new Date(student.createdAt || new Date()).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        severity: 'low'
      });
    } else if (student.syncRate >= 70) {
      logs.push({
        id: `${student.id}-behavior-productive`,
        student: student.name,
        event: 'Productive Failure',
        timestamp: new Date(new Date(student.createdAt || new Date()).getTime() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        severity: 'low'
      });
    } else if (student.syncRate >= 60) {
      logs.push({
        id: `${student.id}-behavior-tinkering`,
        student: student.name,
        event: 'Tinkering',
        timestamp: new Date(new Date(student.createdAt || new Date()).getTime() + 4 * 24 * 60 * 60 * 1000).toISOString(),
        severity: 'low'
      });
    } else if (student.syncRate >= 50) {
      logs.unshift({
        id: `${student.id}-behavior-gaming`,
        student: student.name,
        event: 'Gaming the System',
        timestamp: new Date(new Date(student.createdAt || new Date()).getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        severity: 'medium'
      });
    } else {
      logs.unshift({
        id: `${student.id}-behavior-spinning`,
        student: student.name,
        event: 'Wheel Spinning',
        timestamp: new Date(new Date(student.createdAt || new Date()).getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        severity: 'high'
      });
    }
    
    return logs;
  });

  const getColorForMastery = (mastery: number) => {
    if (mastery >= 75) return 'bg-primary';
    if (mastery >= 50) return 'bg-amber-500';
    return 'bg-destructive';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-destructive';
      case 'medium': return 'text-amber-500';
      default: return 'text-primary';
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors">
      <Navigation />

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold mb-2 flex items-center gap-3">
            <Activity className="w-7 h-7 text-primary" />
            Analytics & Alerts
          </h1>
          <p className="text-sm text-muted-foreground">Monitor student performance and system flags</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* At-Risk Students */}
          <div className="border rounded-lg p-6 bg-card border-border transition-colors">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              At-Risk Students
            </h2>

            <div className="space-y-3">
              {loading && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Loading students...</p>
                </div>
              )}

              {!loading && loadError && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>{loadError}</p>
                </div>
              )}

              {!loading && !loadError && atRiskStudents.map(student => (
                <div
                  key={student.id}
                  className="border rounded-lg p-4 bg-muted/40 border-border hover:border-destructive/50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl bg-muted overflow-hidden">
                        {isAvatarUrl(student.avatar) ? (
                          <img
                            src={student.avatar}
                            alt={`${student.name} avatar`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span>{student.avatar}</span>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{student.name}</p>
                        <p className="text-xs text-muted-foreground" style={{ fontFamily: 'var(--font-mono)' }}>
                          {student.studentId} • {student.section}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-destructive" style={{ fontFamily: 'var(--font-mono)' }}>
                        {student.syncRate}%
                      </p>
                      <p className="text-xs text-muted-foreground">Sync Rate</p>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-border">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <TrendingDown className="w-3 h-3 text-destructive" />
                      <span>Struggling with: 2D Grids ({student.progress.grids}%)</span>
                    </div>
                  </div>
                </div>
              ))}

              {!loading && !loadError && atRiskStudents.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No at-risk students detected</p>
                </div>
              )}
            </div>
          </div>

          {/* Class Heatmap */}
          <div className="border rounded-lg p-6 bg-card border-border transition-colors">
            <h2 className="text-lg font-semibold mb-4">Class Heatmap</h2>
            <p className="text-sm mb-6 text-muted-foreground">Average mastery distribution by section</p>

            <div className="space-y-4">
              {!loading && !loadError && heatmapData.map(section => (
                <div key={section.section}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm" style={{ fontFamily: 'var(--font-mono)' }}>
                      {section.section}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {section.count} student{section.count !== 1 ? 's' : ''}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-10 gap-1 mb-2">
                    {Array.from({ length: 10 }).map((_, idx) => {
                      const threshold = (idx + 1) * 10;
                      const opacity = section.avgMastery >= threshold ? 1 : 0.2;
                      return (
                        <div
                          key={idx}
                          className={`aspect-square rounded ${getColorForMastery(section.avgMastery)}`}
                          style={{ opacity }}
                        />
                      );
                    })}
                  </div>

                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">0%</span>
                    <span className="text-primary" style={{ fontFamily: 'var(--font-mono)' }}>
                      Avg: {section.avgMastery.toFixed(0)}%
                    </span>
                    <span className="text-muted-foreground">100%</span>
                  </div>
                </div>
              ))}

              {!loading && !loadError && heatmapData.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No section data available</p>
                </div>
              )}
            </div>

            {/* Legend */}
            <div className="mt-6 pt-6 border-t border-border">
              <p className="text-xs mb-3 text-muted-foreground">Legend:</p>
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-primary" />
                  <span className="text-muted-foreground">High (75%+)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-amber-500" />
                  <span className="text-muted-foreground">Medium (50-74%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-destructive" />
                  <span className="text-muted-foreground">Low (&lt;50%)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Behavior Logs */}
          <div className="lg:col-span-2 border rounded-lg p-6 bg-card border-border transition-colors">
            <h2 className="text-lg font-semibold mb-4">Behavior Logs</h2>
            <p className="text-sm mb-6 text-muted-foreground">Recent system flags and notable events</p>

            <div className="border rounded-lg overflow-hidden bg-muted/40 border-border transition-colors">
              <div className="max-h-96 overflow-y-auto">
                {behaviorLogs
                  .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                  .map((log, idx) => (
                  <div
                    key={log.id}
                    className={`p-4 border-b last:border-b-0 hover:bg-muted transition-colors ${
                      idx % 2 === 0 ? 'bg-muted/30 border-border' : 'bg-muted/50 border-border'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium">{log.student}</span>
                          <span className="text-xs text-muted-foreground">•</span>
                          <span className={`text-sm ${getSeverityColor(log.severity)}`}>
                            {log.event}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground" style={{ fontFamily: 'var(--font-mono)' }}>
                          {log.timestamp}
                        </p>
                      </div>
                      <div className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        log.severity === 'high' 
                          ? 'bg-destructive/20 text-destructive'
                          : log.severity === 'medium'
                          ? 'bg-amber-500/20 text-amber-600'
                          : 'bg-primary/20 text-primary'
                      }`}>
                        {log.severity}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* Pretest Results */}
          <div className="lg:col-span-2 border rounded-lg bg-card border-border transition-colors overflow-hidden">

            {/* Section header */}
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <ClipboardList className="w-5 h-5 text-primary" />
                  Pretest Results
                </h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Baseline coding assessment — keystroke dynamics, paste detection, and correctness per student
                </p>
              </div>
              {!pretestLoading && !pretestError && (
                <div className="text-right shrink-0 ml-4">
                  <p className="text-2xl font-semibold text-primary" style={{ fontFamily: 'var(--font-mono)' }}>
                    {pretestResults.filter(r => r.completed).length}
                    <span className="text-base text-muted-foreground">/{pretestResults.length}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">completed</p>
                </div>
              )}
            </div>

            {/* Summary stat bar */}
            {!pretestLoading && !pretestError && pretestResults.some(r => r.completed) && (() => {
              const done = pretestResults.filter(r => r.completed);
              const classAvgFlight = done.reduce((s, r) => s + r.avgFlightTimeMs, 0) / done.length;
              const classAvgDwell  = done.reduce((s, r) => s + r.avgDwellTimeMs,  0) / done.length;
              const classAvgTime   = done.reduce((s, r) => s + r.avgTotalTimeMs,  0) / done.length;
              const pasteStudents  = done.filter(r => r.totalPasteCount > 0).length;
              return (
                <div className="grid grid-cols-4 divide-x divide-border border-b border-border">
                  {[
                    { icon: <Keyboard className="w-4 h-4" />, label: 'Class Avg Flight', value: `${classAvgFlight.toFixed(0)} ms` },
                    { icon: <Keyboard className="w-4 h-4" />, label: 'Class Avg Dwell',  value: `${classAvgDwell.toFixed(0)} ms` },
                    { icon: <Clock className="w-4 h-4" />,    label: 'Avg Time / Problem', value: `${(classAvgTime / 1000).toFixed(1)} s` },
                    { icon: <ClipboardCopy className="w-4 h-4" />, label: 'Students w/ Paste', value: `${pasteStudents}`, warn: pasteStudents > 0 },
                  ].map((stat, i) => (
                    <div key={i} className="px-5 py-3 flex items-center gap-3">
                      <span className={stat.warn ? 'text-amber-500' : 'text-muted-foreground'}>{stat.icon}</span>
                      <div>
                        <p className={`text-base font-semibold ${stat.warn ? 'text-amber-500' : ''}`} style={{ fontFamily: 'var(--font-mono)' }}>{stat.value}</p>
                        <p className="text-xs text-muted-foreground">{stat.label}</p>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}

            {/* States */}
            {pretestLoading && (
              <p className="text-sm text-muted-foreground py-10 text-center">Loading pretest data...</p>
            )}
            {!pretestLoading && pretestError && (
              <p className="text-sm text-destructive py-10 text-center">{pretestError}</p>
            )}
            {!pretestLoading && !pretestError && pretestResults.length === 0 && (
              <p className="text-sm text-muted-foreground py-10 text-center">No students found</p>
            )}

            {/* Student list */}
            {!pretestLoading && !pretestError && pretestResults.length > 0 && (
              <div>
                {/* Table column headers */}
                <div className="hidden md:grid grid-cols-[minmax(0,2fr)_1fr_90px_90px_90px_90px_80px] text-xs font-medium text-muted-foreground bg-muted/50 px-5 py-2 border-b border-border" style={{ fontFamily: 'var(--font-mono)' }}>
                  <span>Student</span>
                  <span>Section</span>
                  <span>Status</span>
                  <span>Avg Flight</span>
                  <span>Avg Dwell</span>
                  <span>Avg Latency</span>
                  <span>Paste</span>
                </div>

                {pretestResults.map(result => {
                  const isExpanded = expandedStudent === result.userId;
                  const passCount = result.responses.filter(r => r.isCorrect).length;
                  const hasPaste = result.totalPasteCount > 0;

                  return (
                    <div key={result.userId} className="border-b last:border-b-0 border-border">
                      {/* Summary row */}
                      <div
                        className={`flex md:grid md:grid-cols-[minmax(0,2fr)_1fr_90px_90px_90px_90px_80px] items-center gap-2 px-5 py-3 hover:bg-muted/30 transition-colors ${result.completed ? 'cursor-pointer' : 'cursor-default'}`}
                        onClick={() => result.completed && setExpandedStudent(isExpanded ? null : result.userId)}
                      >
                        {/* Name */}
                        <div className="flex items-center gap-2 min-w-0">
                          {result.completed
                            ? (isExpanded ? <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" /> : <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />)
                            : <div className="w-3.5 h-3.5 shrink-0" />
                          }
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{result.fullName}</p>
                            <p className="text-xs text-muted-foreground" style={{ fontFamily: 'var(--font-mono)' }}>{result.studentId}</p>
                          </div>
                          {hasPaste && (
                            <span title={`${result.totalPasteCount} paste event(s)`} className="ml-1 shrink-0">
                              <ClipboardCopy className="w-3.5 h-3.5 text-amber-500" />
                            </span>
                          )}
                        </div>

                        {/* Section */}
                        <span className="text-xs text-muted-foreground hidden md:block">{result.section}</span>

                        {/* Status */}
                        <span className={`text-xs font-medium hidden md:flex items-center gap-1 ${result.completed ? 'text-primary' : 'text-amber-500'}`}>
                          {result.completed ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                          {result.completed ? `${passCount}/${result.responses.length} pass` : 'Pending'}
                        </span>

                        {/* Keystroke metrics */}
                        {(['avgFlightTimeMs', 'avgDwellTimeMs', 'avgTimeToFirstKeyMs'] as const).map(key => (
                          <span key={key} className="text-xs hidden md:block" style={{ fontFamily: 'var(--font-mono)' }}>
                            {result.completed ? `${result[key].toFixed(0)} ms` : '—'}
                          </span>
                        ))}

                        {/* Paste indicator */}
                        <span className={`text-xs hidden md:block font-medium ${hasPaste ? 'text-amber-500' : 'text-muted-foreground'}`} style={{ fontFamily: 'var(--font-mono)' }}>
                          {result.completed ? result.totalPasteCount : '—'}
                        </span>
                      </div>

                      {/* Expanded: per-problem breakdown */}
                      {isExpanded && result.responses.length > 0 && (
                        <div className="bg-muted/20 border-t border-border divide-y divide-border/60">
                          {result.responses.map((r, i) => {
                            const totalChars = r.typedCharCount + r.pasteCharCount;
                            const pasteRatio = totalChars > 0 ? r.pasteCharCount / totalChars : 0;
                            const likelyCopied = r.pasteCount > 0 && pasteRatio > 0.5;

                            return (
                              <div key={r.questionId} className="px-8 py-4">
                                {/* Problem header */}
                                <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                                  <span className="text-xs font-semibold text-muted-foreground" style={{ fontFamily: 'var(--font-mono)' }}>
                                    {PROBLEM_LABELS[r.questionId] ?? r.questionId}
                                  </span>
                                  <div className="flex items-center gap-2 flex-wrap">
                                    {/* Correctness badge */}
                                    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${r.isCorrect ? 'bg-green-500/15 text-green-600' : 'bg-destructive/15 text-destructive'}`}>
                                      {r.isCorrect ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                      {r.isCorrect ? 'Passed' : 'Did not pass'}
                                    </span>
                                    {/* Paste badge */}
                                    {r.pasteCount > 0 && (
                                      <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${likelyCopied ? 'bg-amber-500/20 text-amber-600' : 'bg-amber-500/10 text-amber-500'}`}>
                                        <ClipboardCopy className="w-3 h-3" />
                                        {likelyCopied ? 'Likely copy-pasted' : `${r.pasteCount} paste`}
                                      </span>
                                    )}
                                    {/* Timing pills */}
                                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground" style={{ fontFamily: 'var(--font-mono)' }}>
                                      <Clock className="w-3 h-3" />{(r.totalTimeMs / 1000).toFixed(1)}s
                                    </span>
                                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground" style={{ fontFamily: 'var(--font-mono)' }}>
                                      <Keyboard className="w-3 h-3" />flight {r.avgFlightTimeMs.toFixed(0)}ms · dwell {r.avgDwellTimeMs.toFixed(0)}ms · latency {r.timeToFirstKeyMs.toFixed(0)}ms
                                    </span>
                                  </div>
                                </div>

                                {/* Code submitted */}
                                <pre className="bg-muted rounded p-3 text-xs overflow-x-auto whitespace-pre-wrap break-words text-foreground" style={{ fontFamily: 'var(--font-mono)', maxHeight: '160px', overflowY: 'auto' }}>
                                  {r.response.trim() || <span className="italic text-muted-foreground">no code submitted</span>}
                                </pre>

                                {/* Char breakdown */}
                                {(r.typedCharCount > 0 || r.pasteCharCount > 0) && (
                                  <div className="flex gap-4 mt-2 text-xs text-muted-foreground" style={{ fontFamily: 'var(--font-mono)' }}>
                                    <span>typed: {r.typedCharCount} chars</span>
                                    <span className={r.pasteCharCount > 0 ? 'text-amber-500' : ''}>pasted: {r.pasteCharCount} chars</span>
                                    {totalChars > 0 && <span>paste ratio: {(pasteRatio * 100).toFixed(0)}%</span>}
                                  </div>
                                )}

                                {/* Detailed event timeline */}
                                {r.rawEvents.length > 0 && (() => {
                                  const segments = buildTimeline(r.rawEvents);
                                  return (
                                    <div className="mt-4">
                                      <p className="text-xs font-semibold text-muted-foreground mb-2" style={{ fontFamily: 'var(--font-mono)' }}>
                                        Session Timeline
                                      </p>
                                      <div className="bg-muted/60 rounded border border-border overflow-y-auto" style={{ maxHeight: '260px' }}>
                                        {segments.map((seg, si) => {
                                          if (seg.kind === 'burst') {
                                            const dur = ((seg.endT - seg.startT) / 1000).toFixed(1);
                                            const edits = seg.backspaces + seg.deletes;
                                            return (
                                              <div key={si} className="flex gap-3 px-3 py-1.5 border-b border-border/50 last:border-0 items-baseline hover:bg-muted/80 transition-colors">
                                                <span className="text-xs text-muted-foreground shrink-0 w-20" style={{ fontFamily: 'var(--font-mono)' }}>
                                                  {fmtTs(seg.startT)}
                                                </span>
                                                <span className="text-xs font-medium text-foreground">Typing burst</span>
                                                <span className="text-xs text-muted-foreground ml-auto" style={{ fontFamily: 'var(--font-mono)' }}>
                                                  {seg.keys - edits} chars · {edits > 0 ? `${seg.backspaces}× ⌫  ${seg.deletes > 0 ? `${seg.deletes}× Del · ` : ''}` : ''}{dur}s
                                                </span>
                                              </div>
                                            );
                                          }
                                          // Structural event
                                          const label = EVENT_LABEL[seg.type] ?? seg.type;
                                          const isWarning = seg.type === 'paste' || (seg.type === 'run_result' && !seg.meta?.startsWith('PASS'));
                                          const isSuccess = seg.type === 'run_result' && seg.meta?.startsWith('PASS');
                                          return (
                                            <div key={si} className={`flex gap-3 px-3 py-1.5 border-b border-border/50 last:border-0 items-baseline hover:bg-muted/80 transition-colors ${isWarning ? 'bg-amber-500/5' : isSuccess ? 'bg-green-500/5' : ''}`}>
                                              <span className="text-xs text-muted-foreground shrink-0 w-20" style={{ fontFamily: 'var(--font-mono)' }}>
                                                {fmtTs(seg.t)}
                                              </span>
                                              <span className={`text-xs font-medium ${isWarning ? 'text-amber-500' : isSuccess ? 'text-green-600' : 'text-foreground'}`}>
                                                {label}
                                              </span>
                                              {seg.meta && (
                                                <span className={`text-xs ml-auto ${isWarning ? 'text-amber-400' : isSuccess ? 'text-green-500' : 'text-muted-foreground'}`} style={{ fontFamily: 'var(--font-mono)' }}>
                                                  {seg.meta}
                                                </span>
                                              )}
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  );
                                })()}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
