import { Navigation } from '../components/Navigation';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Calendar, Award } from 'lucide-react';
import { Progress } from '../components/ui/progress';
import { getRankInfo } from '../utils/rank';

export function Profile() {
  const { user } = useAuth();

  const rankInfo = getRankInfo(user?.syncRate ?? 0);

  const isAvatarUrl = (value: string) => value.startsWith('http') || value.startsWith('data:');

  if (!user) return null;

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
                  <img
                    src={user.avatar}
                    alt="Profile avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-6xl">{user.avatar}</span>
                )}
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-semibold mb-1">
                    {user.name}
                </h2>
                <p className="text-lg mb-4 text-secondary" style={{ fontFamily: 'var(--font-mono)' }}>
                  {user.studentId}
                </p>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Section:</span>
                    <span className="text-foreground" style={{ fontFamily: 'var(--font-mono)' }}>
                      {user.section}
                    </span>
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

          {/* Overall Progress */}
          <div className="border rounded-lg p-6 bg-card border-border transition-colors">
            <h3 className="text-lg font-semibold mb-6">Overall Progress</h3>
            
            <div className="mb-6">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm">Overall Sync Rate</span>
                <span className="text-2xl font-semibold text-primary" style={{ fontFamily: 'var(--font-mono)' }}>
                  {user.syncRate}%
                </span>
              </div>
              <div className="h-4 rounded-full overflow-hidden bg-muted transition-colors">
                <div
                  className="h-full bg-gradient-to-r from-primary to-primary/80"
                  style={{ width: `${user.syncRate}%` }}
                />
              </div>
            </div>

            <div className="grid gap-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm">Arrays Mastery</span>
                  <span className="text-sm font-semibold text-primary" style={{ fontFamily: 'var(--font-mono)' }}>
                    {user.progress.arrays}%
                  </span>
                </div>
                <Progress value={user.progress.arrays} className="h-2" />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm">Loops Mastery</span>
                  <span className="text-sm font-semibold text-primary" style={{ fontFamily: 'var(--font-mono)' }}>
                    {user.progress.loops}%
                  </span>
                </div>
                <Progress value={user.progress.loops} className="h-2" />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm">2D Grids Mastery</span>
                  <span className="text-sm font-semibold text-primary" style={{ fontFamily: 'var(--font-mono)' }}>
                    {user.progress.grids}%
                  </span>
                </div>
                <Progress value={user.progress.grids} className="h-2" />
              </div>
            </div>
          </div>

          {/* Achievements */}
          <div className="border rounded-lg p-6 bg-card border-border transition-colors">
            <h3 className="text-lg font-semibold mb-6">Achievements</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {user.badges.map((badge: string) => (
                <div
                  key={badge}
                  className="bg-primary/10 border border-primary/30 rounded-lg p-4 text-center"
                >
                  <div className="text-3xl mb-2">🏆</div>
                  <p className="text-xs text-primary font-semibold" style={{ fontFamily: 'var(--font-mono)' }}>
                    {badge.replace('-', ' ').toUpperCase()}
                  </p>
                </div>
              ))}
              
              {Array.from({ length: Math.max(0, 6 - user.badges.length) }).map((_, idx) => (
                <div
                  key={`locked-${idx}`}
                  className="border rounded-lg p-4 text-center opacity-50 bg-muted/40 border-border transition-colors"
                >
                  <div className="text-3xl mb-2">🔒</div>
                  <p className="text-xs text-muted-foreground">Locked</p>
                </div>
              ))}
            </div>
          </div>

          {/* Statistics */}
          <div className="border rounded-lg p-6 bg-card border-border transition-colors">
            <h3 className="text-lg font-semibold mb-6">Statistics</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="border rounded-lg p-4 text-center bg-muted/40 border-border transition-colors">
                <p className="text-2xl font-semibold text-primary" style={{ fontFamily: 'var(--font-mono)' }}>
                  {user.badges.length * 5}
                </p>
                <p className="text-xs mt-1 text-muted-foreground">Challenges Completed</p>
              </div>
              
              <div className="border rounded-lg p-4 text-center bg-muted/40 border-border transition-colors">
                <p className="text-2xl font-semibold text-secondary" style={{ fontFamily: 'var(--font-mono)' }}>
                  {user.badges.length * 12}
                </p>
                <p className="text-xs mt-1 text-muted-foreground">Hours Played</p>
              </div>
              
              <div className="border rounded-lg p-4 text-center bg-muted/40 border-border transition-colors">
                <p className="text-2xl font-semibold text-amber-500" style={{ fontFamily: 'var(--font-mono)' }}>
                  {user.badges.length}
                </p>
                <p className="text-xs mt-1 text-muted-foreground">Keys Collected</p>
              </div>
              
              <div className="border rounded-lg p-4 text-center bg-muted/40 border-border transition-colors">
                <p className="text-2xl font-semibold text-pink-500" style={{ fontFamily: 'var(--font-mono)' }}>
                  {rankInfo.rank}
                </p>
                <p className="text-xs mt-1 text-muted-foreground">Rank</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
