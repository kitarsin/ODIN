import { useEffect, useState } from 'react';
import { Navigation } from '../components/Navigation';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Calendar, Award, Zap, Brain, Target, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { Progress } from '../components/ui/progress';
import { getRankInfo } from '../utils/rank';
import { calculateSyncRateFromMastery } from '../utils/achievementCatalog';
import { getPlayerProfile, getPlayerSessions, buildPuzzleTitleMap } from '../../lib/odinApi';

interface MasteryState {
  topic: string;
  masteryPercentage: number;
  probabilityMastery: number;
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

const SKILL_GROUPS = [
  { label: '1D Arrays', skills: ['ArrayInitialization', 'ArrayAccess'] },
  { label: 'Loops & Iteration', skills: ['ArrayIteration', 'ArrayOperations'] },
  { label: '2D Arrays', skills: ['MultidimensionalArrays', 'JaggedArrays'] },
];

function skillLabel(topic: string) {
  return topic.replace(/([A-Z])/g, ' $1').trim();
}

function helplessnessColor(score: number) {
  if (score < 30) return 'text-green-500';
  if (score < 70) return 'text-amber-500';
  return 'text-red-500';
}

function formatDuration(startedAt: string, endedAt: string | null) {
  if (!endedAt) return 'In Progress';
  const ms = new Date(endedAt).getTime() - new Date(startedAt).getTime();
  const mins = Math.floor(ms / 60000);
  const secs = Math.floor((ms % 60000) / 1000);
  return `${mins}m ${secs}s`;
}

export function Profile() {
  const { user } = useAuth();
  const isAvatarUrl = (value: string) => value.startsWith('http') || value.startsWith('data:');

  const [odinProfile, setOdinProfile] = useState<OdinProfile | null>(null);
  const [sessions, setSessions] = useState<GameSession[]>([]);
  const [puzzleTitles, setPuzzleTitles] = useState<Map<string, string>>(new Map());
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    setProfileLoading(true);
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
      .catch(() => setProfileError('Could not load game data'))
      .finally(() => setProfileLoading(false));
  }, [user?.id]);

  if (!user) return null;

  // Derive sync rate from real BKT mastery; fall back to achievement-based rate until data loads
  const computedSyncRate = odinProfile?.masteryStates?.length
    ? calculateSyncRateFromMastery(odinProfile.masteryStates)
    : user.syncRate;
  const rankInfo = getRankInfo(computedSyncRate);
  const hasGameData = !profileLoading && odinProfile !== null;

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors">
      <Navigation />

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold mb-2 flex items-center gap-3">
            <User className="w-7 h-7 text-primary" />
            Profile
          </h1>
          <p className="text-sm text-muted-foreground">Your account information and statistics</p>
        </div>

        <div className="grid gap-6">
          {/* Profile Card */}
          <div className="border rounded-lg p-8 bg-card border-border transition-colors">
            <div className="flex items-start gap-6">
              <div className="w-24 h-24 rounded-full overflow-hidden flex items-center justify-center bg-muted">
                {isAvatarUrl(user.avatar) ? (
                  <img src={user.avatar} alt="Profile avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-6xl">{user.avatar}</span>
                )}
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-semibold mb-1">{user.name}</h2>
                <p className="text-lg mb-4 text-secondary" style={{ fontFamily: 'var(--font-mono)' }}>
                  {user.studentId}
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Section:</span>
                    <span className="text-foreground" style={{ fontFamily: 'var(--font-mono)' }}>{user.section}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Last Login:</span>
                    <span className="text-foreground">Today</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Award className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Role:</span>
                    <span className="text-primary capitalize">{user.role}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="w-2 h-2 rounded-full bg-primary" />
                    <span className="text-muted-foreground">Status:</span>
                    <span className="text-primary capitalize">{user.status}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sync Rate */}
          {user.role === 'student' && (
            <div className="border rounded-lg p-6 bg-card border-border transition-colors">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold">Overall Sync Rate</h3>
                {profileLoading ? (
                  <div className="h-7 w-14 bg-muted animate-pulse rounded" />
                ) : (
                  <span className="text-2xl font-semibold text-primary" style={{ fontFamily: 'var(--font-mono)' }}>
                    {computedSyncRate}%
                  </span>
                )}
              </div>
              <div className="h-4 rounded-full overflow-hidden bg-muted">
                <div className="h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-500" style={{ width: `${profileLoading ? user.syncRate : computedSyncRate}%` }} />
              </div>
              <p className="text-xs mt-2 text-muted-foreground">
                {odinProfile?.masteryStates?.length ? 'Based on BKT skill mastery' : 'Based on achievements unlocked'}
              </p>
            </div>
          )}

          {/* Game Statistics — live from ODIN API */}
          {user.role === 'student' && (
            <div className="border rounded-lg p-6 bg-card border-border transition-colors">
              <h3 className="text-lg font-semibold mb-4">Game Statistics</h3>

              {profileError && (
                <div className="flex items-center gap-2 text-amber-500 text-sm mb-4 p-3 rounded border border-amber-500/30 bg-amber-500/5">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  Game data unavailable — stats may not reflect latest activity.
                </div>
              )}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="border rounded-lg p-4 text-center bg-muted/40 border-border">
                  <Zap className="w-5 h-5 text-yellow-500 mx-auto mb-1" />
                  {profileLoading ? (
                    <div className="h-7 w-16 bg-muted animate-pulse rounded mx-auto mb-1" />
                  ) : (
                    <p className="text-2xl font-semibold text-yellow-500" style={{ fontFamily: 'var(--font-mono)' }}>
                      {hasGameData ? odinProfile!.experiencePoints : '—'}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">XP</p>
                </div>

                <div className="border rounded-lg p-4 text-center bg-muted/40 border-border">
                  <Target className="w-5 h-5 text-primary mx-auto mb-1" />
                  {profileLoading ? (
                    <div className="h-7 w-16 bg-muted animate-pulse rounded mx-auto mb-1" />
                  ) : (
                    <p className="text-2xl font-semibold text-primary" style={{ fontFamily: 'var(--font-mono)' }}>
                      {hasGameData ? odinProfile!.currentLevel : '—'}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">Dungeon Level</p>
                </div>

                <div className="border rounded-lg p-4 text-center bg-muted/40 border-border">
                  <Brain className="w-5 h-5 text-secondary mx-auto mb-1" />
                  {profileLoading ? (
                    <div className="h-7 w-16 bg-muted animate-pulse rounded mx-auto mb-1" />
                  ) : (
                    <p className="text-2xl font-semibold text-secondary" style={{ fontFamily: 'var(--font-mono)' }}>
                      {hasGameData ? odinProfile!.totalSubmissions : '—'}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">Submissions</p>
                </div>

                <div className="border rounded-lg p-4 text-center bg-muted/40 border-border">
                  <AlertTriangle className={`w-5 h-5 mx-auto mb-1 ${hasGameData ? helplessnessColor(odinProfile!.helplessnessScore) : 'text-muted-foreground'}`} />
                  {profileLoading ? (
                    <div className="h-7 w-16 bg-muted animate-pulse rounded mx-auto mb-1" />
                  ) : hasGameData ? (
                    <p className={`text-2xl font-semibold ${helplessnessColor(odinProfile!.helplessnessScore)}`} style={{ fontFamily: 'var(--font-mono)' }}>
                      {odinProfile!.helplessnessScore.toFixed(1)}
                    </p>
                  ) : (
                    <p className="text-2xl font-semibold text-muted-foreground" style={{ fontFamily: 'var(--font-mono)' }}>—</p>
                  )}
                  <p className="text-xs text-muted-foreground">Helplessness</p>
                </div>
              </div>
            </div>
          )}

          {/* BKT Mastery Breakdown — replaces always-zero progress bars */}
          {user.role === 'student' && (
            <div className="border rounded-lg p-6 bg-card border-border transition-colors">
              <h3 className="text-lg font-semibold mb-6">Skill Mastery</h3>

              {profileLoading ? (
                <div className="space-y-6">
                  {SKILL_GROUPS.map(g => (
                    <div key={g.label}>
                      <div className="h-4 w-40 bg-muted animate-pulse rounded mb-3" />
                      <div className="space-y-3">
                        {g.skills.map(s => (
                          <div key={s} className="h-6 bg-muted animate-pulse rounded" />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-6">
                  {SKILL_GROUPS.map(group => {
                    const groupStates = group.skills.map(skill =>
                      odinProfile?.masteryStates?.find(m => m.topic === skill)
                    );
                    return (
                      <div key={group.label}>
                        <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-3">
                          {group.label}
                        </p>
                        <div className="space-y-3">
                          {group.skills.map((skill, i) => {
                            const state = groupStates[i];
                            const pct = state?.masteryPercentage ?? 0;
                            return (
                              <div key={skill}>
                                <div className="flex justify-between items-center mb-1">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm">{skillLabel(skill)}</span>
                                    {state?.isMastered && (
                                      <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                                    )}
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <span className="text-xs text-muted-foreground">
                                      {state?.attemptCount ?? 0} attempts
                                    </span>
                                    <span className="text-sm font-semibold text-primary" style={{ fontFamily: 'var(--font-mono)' }}>
                                      {pct}%
                                    </span>
                                  </div>
                                </div>
                                <Progress value={pct} className="h-2" />
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Recent Sessions */}
          {user.role === 'student' && (
            <div className="border rounded-lg p-6 bg-card border-border transition-colors">
              <h3 className="text-lg font-semibold mb-4">Recent Sessions</h3>

              {profileLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-12 bg-muted animate-pulse rounded" />
                  ))}
                </div>
              ) : sessions.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">
                  No sessions yet — start playing to see your history here.
                </p>
              ) : (
                <div className="space-y-2">
                  {sessions.map(session => (
                    <div key={session.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/40 border border-border text-sm">
                      <span className="text-xs font-semibold text-primary bg-primary/10 border border-primary/20 rounded px-2 py-0.5" style={{ fontFamily: 'var(--font-mono)' }}>
                        LVL {session.dungeonLevel}
                      </span>
                      <span className="flex-1 text-muted-foreground truncate" style={{ fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
                        {puzzleTitles.get(session.puzzleId) ?? session.puzzleId}
                      </span>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{formatDuration(session.startedAt, session.endedAt)}</span>
                      </div>
                      <span className="text-muted-foreground">{session.submissionCount} tries</span>
                      {session.isCompleted ? (
                        <span className="text-xs text-green-500 font-semibold">Done</span>
                      ) : (
                        <span className="text-xs text-amber-500 font-semibold">Open</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Achievements */}
          {user.role === 'student' && (
            <div className="border rounded-lg p-6 bg-card border-border transition-colors">
              <h3 className="text-lg font-semibold mb-6">Achievements</h3>

              {user.achievements && user.achievements.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {user.achievements.map((achievement) => (
                    <div
                      key={achievement.id}
                      className="group bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/30 rounded-lg p-4 text-center hover:border-primary/60 transition-all duration-300 cursor-pointer"
                    >
                      <div className="text-4xl mb-2 group-hover:scale-110 transition-transform">
                        {achievement.emoji}
                      </div>
                      <p className="text-xs text-primary font-semibold mb-2" style={{ fontFamily: 'var(--font-mono)' }}>
                        {achievement.name.replace('-', ' ').toUpperCase()}
                      </p>
                      <p className="text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                        {achievement.description}
                      </p>
                      <p className="text-[9px] text-muted-foreground/60 mt-2">
                        {new Date(achievement.unlockedAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-2">No achievements yet</p>
                  <p className="text-xs text-muted-foreground">Start coding and unlock your first achievement!</p>
                </div>
              )}

              {user.badges && user.badges.length > 0 && (
                <div className="mt-6 pt-6 border-t border-border">
                  <p className="text-xs text-muted-foreground mb-3">Legacy Badges</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {user.badges.map((badge: string) => (
                      <div key={badge} className="bg-primary/10 border border-primary/30 rounded-lg p-4 text-center">
                        <div className="text-3xl mb-2">🏆</div>
                        <p className="text-xs text-primary font-semibold" style={{ fontFamily: 'var(--font-mono)' }}>
                          {badge.replace('-', ' ').toUpperCase()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Statistics */}
          {user.role === 'student' && (
            <div className="border rounded-lg p-6 bg-card border-border transition-colors">
              <h3 className="text-lg font-semibold mb-6">Statistics</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="border rounded-lg p-4 text-center bg-muted/40 border-border">
                  <p className="text-2xl font-semibold text-primary" style={{ fontFamily: 'var(--font-mono)' }}>
                    {(user.achievements?.length || 0) + (user.badges?.length || 0)}
                  </p>
                  <p className="text-xs mt-1 text-muted-foreground">Total Achievements</p>
                </div>
                <div className="border rounded-lg p-4 text-center bg-muted/40 border-border">
                  <p className="text-2xl font-semibold text-secondary" style={{ fontFamily: 'var(--font-mono)' }}>
                    {sessions.filter(s => s.isCompleted).length || user.achievements?.filter(a => a.type === 'success').length || 0}
                  </p>
                  <p className="text-xs mt-1 text-muted-foreground">Victories</p>
                </div>
                <div className="border rounded-lg p-4 text-center bg-muted/40 border-border">
                  <p className="text-2xl font-semibold text-amber-500" style={{ fontFamily: 'var(--font-mono)' }}>
                    {user.achievements?.filter(a => a.type === 'diagnosis').length || 0}
                  </p>
                  <p className="text-xs mt-1 text-muted-foreground">Debug Sessions</p>
                </div>
                <div className="border rounded-lg p-4 text-center bg-muted/40 border-border">
                  <p className="text-2xl font-semibold text-pink-500" style={{ fontFamily: 'var(--font-mono)' }}>
                    {rankInfo.rank}
                  </p>
                  <p className="text-xs mt-1 text-muted-foreground">Current Rank</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
