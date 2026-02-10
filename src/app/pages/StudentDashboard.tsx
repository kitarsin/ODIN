import { useAuth } from '../context/AuthContext';
import { Navigation } from '../components/Navigation';
import { Progress } from '../components/ui/progress';
import { Trophy, Key, Activity } from 'lucide-react';

export function StudentDashboard() {
  const { user } = useAuth();

  if (!user) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors">
      <Navigation />

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Profile */}
          <div className="border rounded-lg p-6 bg-card border-border transition-colors">
            <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Operative Profile
            </h2>

            <div className="flex flex-col items-center">
              <div className="w-24 h-24 rounded-full flex items-center justify-center text-5xl mb-4 bg-muted">
                {user.avatar}
              </div>
              <h3 className="text-xl font-semibold mb-1">{user.name}</h3>
              <p className="text-sm mb-1 text-muted-foreground" style={{ fontFamily: 'var(--font-mono)' }}>
                {user.studentId}
              </p>
              <p className="text-sm mb-6 text-secondary" style={{ fontFamily: 'var(--font-mono)' }}>
                {user.section}
              </p>

              {/* Sync Rate */}
              <div className="w-full rounded-lg p-4 border bg-muted/40 border-border transition-colors">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground">Sync Rate</span>
                  <span className="text-sm font-semibold text-primary" style={{ fontFamily: 'var(--font-mono)' }}>
                    {user.syncRate}%
                  </span>
                </div>
                <div className="h-3 rounded-full overflow-hidden bg-muted">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-500"
                    style={{ width: `${user.syncRate}%` }}
                  />
                </div>
                <p className="text-xs mt-2 text-muted-foreground">Overall mastery indicator</p>
              </div>
            </div>
          </div>

          {/* Center Column - Mastery Progress */}
          <div className="border rounded-lg p-6 bg-card border-border transition-colors">
            <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-primary" />
              Current Progress
            </h2>

            <div className="space-y-6">
              {/* Arrays */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm" style={{ fontFamily: 'var(--font-mono)' }}>
                    Arrays
                  </span>
                  <span className="text-sm font-semibold text-primary" style={{ fontFamily: 'var(--font-mono)' }}>
                    {user.progress.arrays}%
                  </span>
                </div>
                <Progress value={user.progress.arrays} className="h-3" />
                <p className="text-xs mt-1 text-muted-foreground">Data structure fundamentals</p>
              </div>

              {/* Loops */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm" style={{ fontFamily: 'var(--font-mono)' }}>
                    Loops
                  </span>
                  <span className="text-sm font-semibold text-primary" style={{ fontFamily: 'var(--font-mono)' }}>
                    {user.progress.loops}%
                  </span>
                </div>
                <Progress value={user.progress.loops} className="h-3" />
                <p className="text-xs mt-1 text-muted-foreground">Iteration patterns</p>
              </div>

              {/* 2D Grids */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm" style={{ fontFamily: 'var(--font-mono)' }}>
                    2D Grids
                  </span>
                  <span className="text-sm font-semibold text-primary" style={{ fontFamily: 'var(--font-mono)' }}>
                    {user.progress.grids}%
                  </span>
                </div>
                <Progress value={user.progress.grids} className="h-3" />
                <p className="text-xs mt-1 text-muted-foreground">Multi-dimensional arrays</p>
              </div>

              {/* Next Objective */}
              <div className="mt-8 border rounded-lg p-4 bg-primary/10 border-primary/30 transition-colors">
                <h3 className="text-sm font-semibold text-primary mb-2">Next Objective</h3>
                <p className="text-sm">Complete 2D Grid Challenge #3</p>
                <p className="text-xs mt-1 text-muted-foreground">Navigate the Terminal District maze</p>
              </div>
            </div>
          </div>

          {/* Right Column - Badges/Inventory */}
          <div className="border rounded-lg p-6 bg-card border-border transition-colors">
            <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <Key className="w-5 h-5 text-primary" />
              Inventory
            </h2>

            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Source Keys Collected:</p>

              <div className="grid grid-cols-3 gap-4">
                {/* Source Key 1 */}
                <div
                  className={`aspect-square rounded-lg border-2 flex items-center justify-center ${
                    user.badges.includes('source-key-1')
                      ? 'bg-primary/20 border-primary'
                      : 'bg-muted/40 border-border'
                  }`}>
                  {user.badges.includes('source-key-1') ? (
                    <Key className="w-8 h-8 text-primary" />
                  ) : (
                    <div className="text-2xl text-muted-foreground">🔒</div>
                  )}
                </div>

                {/* Source Key 2 */}
                <div
                  className={`aspect-square rounded-lg border-2 flex items-center justify-center ${
                    user.badges.includes('source-key-2')
                      ? 'bg-secondary/20 border-secondary'
                      : 'bg-muted/40 border-border'
                  }`}>
                  {user.badges.includes('source-key-2') ? (
                    <Key className="w-8 h-8 text-secondary" />
                  ) : (
                    <div className="text-2xl text-muted-foreground">🔒</div>
                  )}
                </div>

                {/* Source Key 3 */}
                <div
                  className={`aspect-square rounded-lg border-2 flex items-center justify-center ${
                    user.badges.includes('source-key-3')
                      ? 'bg-amber-500/20 border-amber-500'
                      : 'bg-muted/40 border-border'
                  }`}>
                  {user.badges.includes('source-key-3') ? (
                    <Key className="w-8 h-8 text-amber-500" />
                  ) : (
                    <div className="text-2xl text-muted-foreground">🔒</div>
                  )}
                </div>
              </div>

              <div className="mt-6 space-y-2">
                {user.badges.map((badge: string) => (
                  <div
                    key={badge}
                    className="border rounded p-3 flex items-center gap-3 bg-muted/40 border-border transition-colors"
                  >
                    <Key className="w-4 h-4 text-primary" />
                    <div>
                      <p className="text-sm" style={{ fontFamily: 'var(--font-mono)' }}>
                        {badge.replace('-', ' ').toUpperCase()}
                      </p>
                      <p className="text-xs text-muted-foreground">Achievement unlocked</p>
                    </div>
                  </div>
                ))}
                {user.badges.length === 0 && (
                  <p className="text-sm text-center py-4 text-muted-foreground">No keys collected yet</p>
                )}
              </div>
              {/* Update User Info Display */}
              <h3 className="text-xl font-semibold mb-1">
                {user.full_name || user.email}
              </h3>
              <p className="text-sm mb-1 text-muted-foreground" style={{ fontFamily: 'var(--font-mono)' }}>
                {user.student_id}
              </p>
              <p className="text-sm mb-6 text-secondary" style={{ fontFamily: 'var(--font-mono)' }}>
                {user.section}
              </p>

              {/* Sync Rate - Ensure your DB has this column or provide a default */}
              <span className="text-sm font-semibold text-primary">
                {user.sync_rate || 100}%
              </span>

              {/* Progress & Badges */}
              {/* Since you haven't built the 'progress' table fetching yet in AuthContext, 
                  you might want to fetch it here inside a useEffect or mock it for now until 
                  you build the progress API. */}
              
              {/* Stats */}
              <div className="mt-6 pt-6 border-t border-border transition-colors">
                <h3 className="text-sm font-semibold mb-3">Session Stats</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Challenges Completed:</span>
                    <span className="text-primary" style={{ fontFamily: 'var(--font-mono)' }}>
                      {user.badges.length * 5}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Last Active:</span>
                    <span className="text-secondary" style={{ fontFamily: 'var(--font-mono)' }}>
                      Today
                    </span>
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
