import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigation } from '../components/Navigation';
import { Progress } from '../components/ui/progress';
import { Trophy, Activity, Zap, Target, Brain, CheckCircle, Clock } from 'lucide-react';
import { getRankInfo } from '../utils/rank';
import { calculateSyncRateFromMastery } from '../utils/achievementCatalog';
import { getPlayerProfile, getPlayerSessions, buildPuzzleTitleMap } from '../../lib/odinApi';

interface MasteryState {
  dungeonLevel: number;
  masteryPercentage: number;
  isMastered: boolean;
  attemptCount: number;
}

interface OdinProfile {
  currentLevel: number;
  experiencePoints: number;
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

const DUNGEON_LEVELS = [0, 1, 2, 3];

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
  const [avatarLoaded, setAvatarLoaded] = useState(false);

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
  const currentLevel = odinProfile?.currentLevel ?? 0;
  const nextObjectiveLevel = nextSession
    ? LEVEL_LABELS[nextSession.dungeonLevel] ?? `Level ${nextSession.dungeonLevel}`
    : LEVEL_LABELS[currentLevel] ?? `Level ${currentLevel}`;

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors">
      <Navigation />

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* ── Left Column: Operative Profile ─────────────────────────── */}
          <div className="border rounded-lg p-6 bg-card border-border transition-colors">
            <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Operative Profile
            </h2>

            <div className="flex flex-col items-center">
              <div className="w-24 h-24 rounded-full overflow-hidden flex items-center justify-center mb-4 bg-muted relative">
                {isAvatarUrl(user.avatar) ? (
                  <>
                    {!avatarLoaded && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                      </div>
                    )}
                    <img
                      src={user.avatar}
                      alt="Profile avatar"
                      className={`w-full h-full object-cover transition-opacity duration-300 ${avatarLoaded ? 'opacity-100' : 'opacity-0'}`}
                      onLoad={() => setAvatarLoaded(true)}
                      onError={() => setAvatarLoaded(false)}
                    />
                  </>
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
                  {hasGameData && odinProfile!.masteryStates?.length ? 'Based on BKT level mastery' : 'Based on achievements unlocked'}
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
                      {currentLevel}
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
              {DUNGEON_LEVELS.map(level => {
                const state = masteryStates.find(m => m.dungeonLevel === level);
                const pct = loading ? 0 : (state?.masteryPercentage ?? 0);
                const isMastered = !loading && (state?.isMastered ?? false);
                return (
                  <div key={level}>
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm" style={{ fontFamily: 'var(--font-mono)' }}>
                          {LEVEL_LABELS[level]}
                        </span>
                        {isMastered && <CheckCircle className="w-3.5 h-3.5 text-green-500" />}
                      </div>
                      {loading ? (
                        <div className="h-4 w-10 bg-muted animate-pulse rounded" />
                      ) : (
                        <span className="text-sm font-semibold text-primary" style={{ fontFamily: 'var(--font-mono)' }}>
                          {state ? `${pct}%` : '—'}
                        </span>
                      )}
                    </div>
                    <Progress value={loading ? 0 : pct} className="h-3" />
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

        </div>
      </div>
    </div>
  );
}
