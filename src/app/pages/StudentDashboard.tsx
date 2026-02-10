import { useAuth } from '../context/AuthContext';
import { Navigation } from '../components/Navigation';
import { Progress } from '../components/ui/progress';
import { Trophy, Key, Activity } from 'lucide-react';

export function StudentDashboard() {
  const { user } = useAuth();

  if (!user) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-[#0F172A]">
      <Navigation />

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Profile */}
          <div className="bg-[#1E293B] border border-[#334155] rounded-lg p-6">
            <h2 className="text-lg font-semibold text-[#F1F5F9] mb-6 flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#10B981]" />
              Operative Profile
            </h2>

            <div className="flex flex-col items-center">
              <div className="w-24 h-24 bg-[#334155] rounded-full flex items-center justify-center text-5xl mb-4">
                {user.avatar}
              </div>
              <h3 className="text-xl font-semibold text-[#F1F5F9] mb-1">{user.name}</h3>
              <p className="text-sm text-[#94A3B8] mb-1" style={{ fontFamily: 'var(--font-mono)' }}>
                {user.studentId}
              </p>
              <p className="text-sm text-[#3B82F6] mb-6" style={{ fontFamily: 'var(--font-mono)' }}>
                {user.section}
              </p>

              {/* Sync Rate */}
              <div className="w-full bg-[#0F172A] rounded-lg p-4 border border-[#334155]">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-[#94A3B8]">Sync Rate</span>
                  <span className="text-sm font-semibold text-[#10B981]" style={{ fontFamily: 'var(--font-mono)' }}>
                    {user.syncRate}%
                  </span>
                </div>
                <div className="h-3 bg-[#1E293B] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#10B981] to-[#059669] transition-all duration-500"
                    style={{ width: `${user.syncRate}%` }}
                  />
                </div>
                <p className="text-xs text-[#64748B] mt-2">Overall mastery indicator</p>
              </div>
            </div>
          </div>

          {/* Center Column - Mastery Progress */}
          <div className="bg-[#1E293B] border border-[#334155] rounded-lg p-6">
            <h2 className="text-lg font-semibold text-[#F1F5F9] mb-6 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-[#10B981]" />
              Current Progress
            </h2>

            <div className="space-y-6">
              {/* Arrays */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-[#F1F5F9]" style={{ fontFamily: 'var(--font-mono)' }}>
                    Arrays
                  </span>
                  <span className="text-sm font-semibold text-[#10B981]" style={{ fontFamily: 'var(--font-mono)' }}>
                    {user.progress.arrays}%
                  </span>
                </div>
                <Progress value={user.progress.arrays} className="h-3" />
                <p className="text-xs text-[#64748B] mt-1">Data structure fundamentals</p>
              </div>

              {/* Loops */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-[#F1F5F9]" style={{ fontFamily: 'var(--font-mono)' }}>
                    Loops
                  </span>
                  <span className="text-sm font-semibold text-[#10B981]" style={{ fontFamily: 'var(--font-mono)' }}>
                    {user.progress.loops}%
                  </span>
                </div>
                <Progress value={user.progress.loops} className="h-3" />
                <p className="text-xs text-[#64748B] mt-1">Iteration patterns</p>
              </div>

              {/* 2D Grids */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-[#F1F5F9]" style={{ fontFamily: 'var(--font-mono)' }}>
                    2D Grids
                  </span>
                  <span className="text-sm font-semibold text-[#10B981]" style={{ fontFamily: 'var(--font-mono)' }}>
                    {user.progress.grids}%
                  </span>
                </div>
                <Progress value={user.progress.grids} className="h-3" />
                <p className="text-xs text-[#64748B] mt-1">Multi-dimensional arrays</p>
              </div>

              {/* Next Objective */}
              <div className="mt-8 bg-[#10B981]/10 border border-[#10B981]/30 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-[#10B981] mb-2">Next Objective</h3>
                <p className="text-sm text-[#F1F5F9]">Complete 2D Grid Challenge #3</p>
                <p className="text-xs text-[#94A3B8] mt-1">Navigate the Terminal District maze</p>
              </div>
            </div>
          </div>

          {/* Right Column - Badges/Inventory */}
          <div className="bg-[#1E293B] border border-[#334155] rounded-lg p-6">
            <h2 className="text-lg font-semibold text-[#F1F5F9] mb-6 flex items-center gap-2">
              <Key className="w-5 h-5 text-[#10B981]" />
              Inventory
            </h2>

            <div className="space-y-4">
              <p className="text-sm text-[#94A3B8]">Source Keys Collected:</p>

              <div className="grid grid-cols-3 gap-4">
                {/* Source Key 1 */}
                <div
                  className={`aspect-square rounded-lg border-2 flex items-center justify-center ${
                    user.badges.includes('source-key-1')
                      ? 'bg-[#10B981]/20 border-[#10B981]'
                      : 'bg-[#0F172A] border-[#334155]'
                  }`}
                >
                  {user.badges.includes('source-key-1') ? (
                    <Key className="w-8 h-8 text-[#10B981]" />
                  ) : (
                    <div className="text-2xl text-[#334155]">🔒</div>
                  )}
                </div>

                {/* Source Key 2 */}
                <div
                  className={`aspect-square rounded-lg border-2 flex items-center justify-center ${
                    user.badges.includes('source-key-2')
                      ? 'bg-[#3B82F6]/20 border-[#3B82F6]'
                      : 'bg-[#0F172A] border-[#334155]'
                  }`}
                >
                  {user.badges.includes('source-key-2') ? (
                    <Key className="w-8 h-8 text-[#3B82F6]" />
                  ) : (
                    <div className="text-2xl text-[#334155]">🔒</div>
                  )}
                </div>

                {/* Source Key 3 */}
                <div
                  className={`aspect-square rounded-lg border-2 flex items-center justify-center ${
                    user.badges.includes('source-key-3')
                      ? 'bg-[#F59E0B]/20 border-[#F59E0B]'
                      : 'bg-[#0F172A] border-[#334155]'
                  }`}
                >
                  {user.badges.includes('source-key-3') ? (
                    <Key className="w-8 h-8 text-[#F59E0B]" />
                  ) : (
                    <div className="text-2xl text-[#334155]">🔒</div>
                  )}
                </div>
              </div>

              <div className="mt-6 space-y-2">
                {user.badges.map((badge: string, idx: number) => (
                  <div
                    key={badge}
                    className="bg-[#0F172A] border border-[#334155] rounded p-3 flex items-center gap-3"
                  >
                    <Key className="w-4 h-4 text-[#10B981]" />
                    <div>
                      <p className="text-sm text-[#F1F5F9]" style={{ fontFamily: 'var(--font-mono)' }}>
                        {badge.replace('-', ' ').toUpperCase()}
                      </p>
                      <p className="text-xs text-[#64748B]">Achievement unlocked</p>
                    </div>
                  </div>
                ))}
                {user.badges.length === 0 && (
                  <p className="text-sm text-[#64748B] text-center py-4">No keys collected yet</p>
                )}
              </div>
              {/* Update User Info Display */}
              <h3 className="text-xl font-semibold text-[#F1F5F9] mb-1">
                {user.full_name || user.email} {/* Use full_name from profile */}
              </h3>
              <p className="text-sm text-[#94A3B8] mb-1" style={{ fontFamily: 'var(--font-mono)' }}>
                {user.student_id} {/* Update property name */}
              </p>
              <p className="text-sm text-[#3B82F6] mb-6" style={{ fontFamily: 'var(--font-mono)' }}>
                {user.section}
              </p>

              {/* Sync Rate - Ensure your DB has this column or provide a default */}
              <span className="text-sm font-semibold text-[#10B981]">
                {user.sync_rate || 100}%
              </span>

              {/* Progress & Badges */}
              {/* Since you haven't built the 'progress' table fetching yet in AuthContext, 
                  you might want to fetch it here inside a useEffect or mock it for now until 
                  you build the progress API. */}
              
              {/* Stats */}
              <div className="mt-6 pt-6 border-t border-[#334155]">
                <h3 className="text-sm font-semibold text-[#F1F5F9] mb-3">Session Stats</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#94A3B8]">Challenges Completed:</span>
                    <span className="text-[#10B981]" style={{ fontFamily: 'var(--font-mono)' }}>
                      {user.badges.length * 5}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#94A3B8]">Last Active:</span>
                    <span className="text-[#3B82F6]" style={{ fontFamily: 'var(--font-mono)' }}>
                      Today
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#94A3B8]">Status:</span>
                    <span className="text-[#10B981]" style={{ fontFamily: 'var(--font-mono)' }}>
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
