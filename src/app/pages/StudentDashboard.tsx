import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigation } from '../components/Navigation';
import { Progress } from '../components/ui/progress';
import { Trophy, Key, Activity, Zap, Target, Brain, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { getRankInfo } from '../utils/rank';
import { calculateSyncRateFromMastery } from '../utils/achievementCatalog';
import { getPlayerProfile, getPlayerSessions, buildPuzzleTitleMap } from '../../lib/odinApi';

interface MasteryState {
  topic: string;
  masteryPercentage: number;
  isMastered: boolean;
  attemptCount: number;
}

interface OdinProfile {
  currentLevel: number;
  experiencePoints: number;
  helplessnessScore: number;
  totalSubmissions: number;
  masteryStates: MasteryState[];
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

// Group skill topics into the three broad categories shown on the dashboard
const MASTERY_GROUPS = [
  { label: 'Library Maze', subtitle: '1D Arrays', skills: ['ArrayInitialization', 'ArrayAccess'] },
  { label: 'Fast Food Maze', subtitle: 'Loops & Iteration', skills: ['ArrayIteration', 'ArrayOperations'] },
  { label: 'Billiards Hall', subtitle: '2D Arrays', skills: ['MultidimensionalArrays', 'JaggedArrays'] },
];

function groupMastery(masteryStates: MasteryState[], skills: string[]) {
  const states = skills.map(s => masteryStates.find(m => m.topic === s)).filter(Boolean) as MasteryState[];
  if (states.length === 0) return 0;
  return Math.round(states.reduce((sum, s) => sum + s.masteryPercentage, 0) / states.length);
}

function helplessnessColor(score: number) {
  if (score < 30) return 'text-green-500';
  if (score < 70) return 'text-amber-500';
  return 'text-red-500';
}

function formatDuration(startedAt: string, endedAt: string | null) {
  if (!endedAt) return 'Active';
  const ms = new Date(endedAt).getTime() - new Date(startedAt).getTime();
  const mins = Math.floor(ms / 60000);
  return mins < 1 ? '<1m' : `${mins}m`;
}

const LEVEL_LABELS: Record<number, string> = {
  0: 'Tutorial',
  1: 'Library Maze',
  2: 'Fast Food Maze',
  3: 'Billiards Hall',
};

export function StudentDashboard() {
  const { user } = useAuth();
  const isAvatarUrl = (value: string) => value.startsWith('http') || value.startsWith('data:');

  const [odinProfile, setOdinProfile] = useState<OdinProfile | null>(null);
  const [sessions, setSessions] = useState<GameSession[]>([]);
  const [puzzleTitles, setPuzzleTitles] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    Promise.all([
      getPlayerProfile(user.id),
      getPlayerSessions(user.id, 5),
      buildPuzzleTitleMap(),
    ])
      .then(([profile, recentSessions, titleMap]) => {
        setOdinProfile(profile);
        setSessions(recentSessions);
        setPuzzleTitles(titleMap);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user?.id]);

  if (!user) return <div>Loading...</div>;

  // Derive sync rate from real BKT mastery; fall back to achievement-based rate while loading
  const computedSyncRate = odinProfile?.masteryStates?.length
    ? calculateSyncRateFromMastery(odinProfile.masteryStates)
    : user.syncRate;
  const rankInfo = getRankInfo(computedSyncRate);
  const hasGameData = !loading && odinProfile !== null;

  const masteryStates = odinProfile?.masteryStates ?? [];

  // Next objective: first incomplete session's puzzle, or fallback to current level label
  const nextSession = sessions.find(s => !s.isCompleted);
  const nextObjectiveTitle = nextSession
    ? puzzleTitles.get(nextSession.puzzleId) ?? 'Unknown Puzzle'
    : null;
  const nextObjectiveLevel = nextSession
    ? LEVEL_LABELS[nextSession.dungeonLevel] ?? `Level ${nextSession.dungeonLevel}`
    : LEVEL_LABELS[odinProfile?.currentLevel ?? 0] ?? `Level ${odinProfile?.currentLevel ?? 0}`;

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors">
      <Navigation />

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Left Column: Operative Profile ─────────────────────────── */}
          <div className="border rounded-lg p-6 bg-card border-border transition-colors">
            <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Operative Profile
            </h2>

            <div className="flex flex-col items-center">
              <div className="w-24 h-24 rounded-full overflow-hidden flex items-center justify-center mb-4 bg-muted">
                {isAvatarUrl(user.avatar) ? (
                  <img src={user.avatar} alt="Profile avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-5xl">{user.avatar}</span>
                )}
              </div>
              <h3 className="text-xl font-semibold mb-1">{user.name}</h3>
              <p className="text-sm mb-1 text-muted-foreground" style={{ fontFamily: 'var(--font-mono)' }}>
                {user.studentId}
              </p>
              <p className="text-sm mb-2 text-secondary" style={{ fontFamily: 'var(--font-mono)' }}>
                {user.section}
              </p>
              <span className="text-xs font-semibold text-primary bg-primary/10 border border-primary/20 rounded px-2 py-0.5 mb-6">
                {rankInfo.rank}
              </span>

              {/* Sync Rate */}
              <div className="w-full rounded-lg p-4 border bg-muted/40 border-border transition-colors mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground">Sync Rate</span>
                  {loading ? (
                    <div className="h-4 w-10 bg-muted animate-pulse rounded" />
                  ) : (
                    <span className="text-sm font-semibold text-primary" style={{ fontFamily: 'var(--font-mono)' }}>
                      {computedSyncRate}%
                    </span>
                  )}
                </div>
                <div className="h-3 rounded-full overflow-hidden bg-muted">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-500"
                    style={{ width: `${loading ? user.syncRate : computedSyncRate}%` }}
                  />
                </div>
                <p className="text-xs mt-2 text-muted-foreground">
                  {hasGameData && odinProfile!.masteryStates?.length ? 'Based on BKT skill mastery' : 'Based on achievements unlocked'}
                </p>
              </div>

              {/* Live game stats */}
              <div className="w-full grid grid-cols-2 gap-3">
                <div className="border rounded-lg p-3 text-center bg-muted/40 border-border">
                  <Zap className="w-4 h-4 text-yellow-500 mx-auto mb-1" />
                  {loading ? (
                    <div className="h-5 w-12 bg-muted animate-pulse rounded mx-auto" />
                  ) : (
                    <p className="text-lg font-semibold text-yellow-500" style={{ fontFamily: 'var(--font-mono)' }}>
                      {odinProfile?.experiencePoints ?? 0}
                    </p>
                  )}
                  <p className="text-[10px] text-muted-foreground">XP</p>
                </div>
                <div className="border rounded-lg p-3 text-center bg-muted/40 border-border">
                  <Target className="w-4 h-4 text-primary mx-auto mb-1" />
                  {loading ? (
                    <div className="h-5 w-12 bg-muted animate-pulse rounded mx-auto" />
                  ) : (
                    <p className="text-lg font-semibold text-primary" style={{ fontFamily: 'var(--font-mono)' }}>
                      {odinProfile?.currentLevel ?? 0}
                    </p>
                  )}
                  <p className="text-[10px] text-muted-foreground">Dungeon Lvl</p>
                </div>
                <div className="border rounded-lg p-3 text-center bg-muted/40 border-border">
                  <Brain className="w-4 h-4 text-secondary mx-auto mb-1" />
                  {loading ? (
                    <div className="h-5 w-12 bg-muted animate-pulse rounded mx-auto" />
                  ) : (
                    <p className="text-lg font-semibold text-secondary" style={{ fontFamily: 'var(--font-mono)' }}>
                      {odinProfile?.totalSubmissions ?? 0}
                    </p>
                  )}
                  <p className="text-[10px] text-muted-foreground">Submissions</p>
                </div>
                <div className="border rounded-lg p-3 text-center bg-muted/40 border-border">
                  <AlertTriangle className={`w-4 h-4 mx-auto mb-1 ${hasGameData ? helplessnessColor(odinProfile!.helplessnessScore) : 'text-muted-foreground'}`} />
                  {loading ? (
                    <div className="h-5 w-12 bg-muted animate-pulse rounded mx-auto" />
                  ) : hasGameData ? (
                    <p className={`text-lg font-semibold ${helplessnessColor(odinProfile!.helplessnessScore)}`} style={{ fontFamily: 'var(--font-mono)' }}>
                      {odinProfile!.helplessnessScore.toFixed(0)}
                    </p>
                  ) : (
                    <p className="text-lg font-semibold text-muted-foreground" style={{ fontFamily: 'var(--font-mono)' }}>—</p>
                  )}
                  <p className="text-[10px] text-muted-foreground">Helplessness</p>
                </div>
              </div>
            </div>
          </div>

          {/* ── Center Column: Mastery Progress ────────────────────────── */}
          <div className="border rounded-lg p-6 bg-card border-border transition-colors">
            <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-primary" />
              Current Progress
            </h2>

            <div className="space-y-6">
              {MASTERY_GROUPS.map(group => {
                const pct = loading ? 0 : groupMastery(masteryStates, group.skills);
                const allMastered = !loading && group.skills.every(
                  s => masteryStates.find(m => m.topic === s)?.isMastered
                );
                return (
                  <div key={group.label}>
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm" style={{ fontFamily: 'var(--font-mono)' }}>
                          {group.label}
                        </span>
                        {allMastered && <CheckCircle className="w-3.5 h-3.5 text-green-500" />}
                      </div>
                      {loading ? (
                        <div className="h-4 w-10 bg-muted animate-pulse rounded" />
                      ) : (
                        <span className="text-sm font-semibold text-primary" style={{ fontFamily: 'var(--font-mono)' }}>
                          {pct}%
                        </span>
                      )}
                    </div>
                    <Progress value={loading ? 0 : pct} className="h-3" />
                    <p className="text-xs mt-1 text-muted-foreground">{group.subtitle}</p>
                  </div>
                );
              })}

              {/* Next Objective — driven by real session data */}
              <div className="mt-8 border rounded-lg p-4 bg-primary/10 border-primary/30 transition-colors">
                <h3 className="text-sm font-semibold text-primary mb-2">Next Objective</h3>
                {loading ? (
                  <div className="space-y-1">
                    <div className="h-4 w-40 bg-muted/60 animate-pulse rounded" />
                    <div className="h-3 w-28 bg-muted/40 animate-pulse rounded" />
                  </div>
                ) : nextObjectiveTitle ? (
                  <>
                    <p className="text-sm">{nextObjectiveTitle}</p>
                    <p className="text-xs mt-1 text-muted-foreground">{nextObjectiveLevel}</p>
                  </>
                ) : (
                  <>
                    <p className="text-sm">Enter the {nextObjectiveLevel}</p>
                    <p className="text-xs mt-1 text-muted-foreground">Continue your dungeon run</p>
                  </>
                )}
              </div>

              {/* Recent Sessions */}
              {!loading && sessions.length > 0 && (
                <div className="mt-2 space-y-1">
                  <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-2">Recent Sessions</p>
                  {sessions.map(session => (
                    <div key={session.id} className="flex items-center gap-2 text-xs p-2 rounded bg-muted/40 border border-border">
                      <span className="text-primary font-mono shrink-0">LVL {session.dungeonLevel}</span>
                      <span className="flex-1 truncate text-foreground">
                        {puzzleTitles.get(session.puzzleId) ?? session.puzzleId}
                      </span>
                      <div className="flex items-center gap-1 text-muted-foreground shrink-0">
                        <Clock className="w-3 h-3" />
                        {formatDuration(session.startedAt, session.endedAt)}
                      </div>
                      {session.isCompleted
                        ? <CheckCircle className="w-3.5 h-3.5 text-green-500 shrink-0" />
                        : <span className="text-amber-500 shrink-0">•</span>
                      }
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── Right Column: Inventory ─────────────────────────────────── */}
          <div className="border rounded-lg p-6 bg-card border-border transition-colors">
            <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <Key className="w-5 h-5 text-primary" />
              Inventory
            </h2>

            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Source Keys Collected:</p>

              <div className="grid grid-cols-3 gap-4">
                {[
                  { key: 'source-key-1', color: 'primary', bg: 'bg-primary/20 border-primary', icon: 'text-primary' },
                  { key: 'source-key-2', color: 'secondary', bg: 'bg-secondary/20 border-secondary', icon: 'text-secondary' },
                  { key: 'source-key-3', color: 'amber', bg: 'bg-amber-500/20 border-amber-500', icon: 'text-amber-500' },
                ].map(({ key, bg, icon }) => (
                  <div
                    key={key}
                    className={`aspect-square rounded-lg border-2 flex items-center justify-center ${
                      user.badges.includes(key) ? bg : 'bg-muted/40 border-border'
                    }`}
                  >
                    {user.badges.includes(key) ? (
                      <Key className={`w-8 h-8 ${icon}`} />
                    ) : (
                      <div className="text-2xl text-muted-foreground">🔒</div>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-2 space-y-2">
                {user.badges.map((badge: string) => (
                  <div
                    key={badge}
                    className="border rounded p-3 flex items-center gap-3 bg-muted/40 border-border transition-colors"
                  >
                    <Key className="w-4 h-4 text-primary" />
                    <div>
                      <p className="text-sm" style={{ fontFamily: 'var(--font-mono)' }}>
                        {badge.replace(/-/g, ' ').toUpperCase()}
                      </p>
                      <p className="text-xs text-muted-foreground">Achievement unlocked</p>
                    </div>
                  </div>
                ))}
                {user.badges.length === 0 && (
                  <p className="text-sm text-center py-4 text-muted-foreground">No keys collected yet</p>
                )}
              </div>

              {/* Session Stats */}
              <div className="mt-4 pt-4 border-t border-border">
                <h3 className="text-sm font-semibold mb-3">Session Stats</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Completed Sessions:</span>
                    {loading ? (
                      <div className="h-4 w-8 bg-muted animate-pulse rounded" />
                    ) : (
                      <span className="text-primary" style={{ fontFamily: 'var(--font-mono)' }}>
                        {sessions.filter(s => s.isCompleted).length}
                      </span>
                    )}
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Submissions:</span>
                    {loading ? (
                      <div className="h-4 w-8 bg-muted animate-pulse rounded" />
                    ) : (
                      <span className="text-secondary" style={{ fontFamily: 'var(--font-mono)' }}>
                        {odinProfile?.totalSubmissions ?? 0}
                      </span>
                    )}
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <span className="text-primary" style={{ fontFamily: 'var(--font-mono)' }}>
                      {user.status.toUpperCase()}
                    </span>
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
