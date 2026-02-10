import { Navigation } from '../components/Navigation';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Calendar, Award } from 'lucide-react';
import { Progress } from '../components/ui/progress';

export function Profile() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#0F172A]">
      <Navigation />

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-[#F1F5F9] mb-2 flex items-center gap-3">
            <User className="w-7 h-7 text-[#10B981]" />
            Profile
          </h1>
          <p className="text-sm text-[#94A3B8]">Your account information and statistics</p>
        </div>

        <div className="grid gap-6">
          {/* Profile Card */}
          <div className="bg-[#1E293B] border border-[#334155] rounded-lg p-8">
            <div className="flex items-start gap-6">
              <div className="w-24 h-24 bg-[#334155] rounded-full flex items-center justify-center text-6xl">
                {user.avatar}
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-semibold text-[#F1F5F9] mb-1">{user.name}</h2>
                <p className="text-lg text-[#3B82F6] mb-4" style={{ fontFamily: 'var(--font-mono)' }}>
                  {user.studentId}
                </p>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-[#94A3B8]" />
                    <span className="text-[#94A3B8]">Section:</span>
                    <span className="text-[#F1F5F9]" style={{ fontFamily: 'var(--font-mono)' }}>
                      {user.section}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-[#94A3B8]" />
                    <span className="text-[#94A3B8]">Last Login:</span>
                    <span className="text-[#F1F5F9]">Today</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Award className="w-4 h-4 text-[#94A3B8]" />
                    <span className="text-[#94A3B8]">Role:</span>
                    <span className="text-[#10B981] capitalize">{user.role}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                    <span className="text-[#94A3B8]">Status:</span>
                    <span className="text-[#10B981] capitalize">{user.status}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Overall Progress */}
          <div className="bg-[#1E293B] border border-[#334155] rounded-lg p-6">
            <h3 className="text-lg font-semibold text-[#F1F5F9] mb-6">Overall Progress</h3>
            
            <div className="mb-6">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm text-[#F1F5F9]">Overall Sync Rate</span>
                <span className="text-2xl font-semibold text-[#10B981]" style={{ fontFamily: 'var(--font-mono)' }}>
                  {user.syncRate}%
                </span>
              </div>
              <div className="h-4 bg-[#0F172A] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#10B981] to-[#059669]"
                  style={{ width: `${user.syncRate}%` }}
                />
              </div>
            </div>

            <div className="grid gap-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-[#F1F5F9]">Arrays Mastery</span>
                  <span className="text-sm font-semibold text-[#10B981]" style={{ fontFamily: 'var(--font-mono)' }}>
                    {user.progress.arrays}%
                  </span>
                </div>
                <Progress value={user.progress.arrays} className="h-2" />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-[#F1F5F9]">Loops Mastery</span>
                  <span className="text-sm font-semibold text-[#10B981]" style={{ fontFamily: 'var(--font-mono)' }}>
                    {user.progress.loops}%
                  </span>
                </div>
                <Progress value={user.progress.loops} className="h-2" />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-[#F1F5F9]">2D Grids Mastery</span>
                  <span className="text-sm font-semibold text-[#10B981]" style={{ fontFamily: 'var(--font-mono)' }}>
                    {user.progress.grids}%
                  </span>
                </div>
                <Progress value={user.progress.grids} className="h-2" />
              </div>
            </div>
          </div>

          {/* Achievements */}
          <div className="bg-[#1E293B] border border-[#334155] rounded-lg p-6">
            <h3 className="text-lg font-semibold text-[#F1F5F9] mb-6">Achievements</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {user.badges.map((badge, idx) => (
                <div
                  key={badge}
                  className="bg-[#10B981]/10 border border-[#10B981]/30 rounded-lg p-4 text-center"
                >
                  <div className="text-3xl mb-2">🏆</div>
                  <p className="text-xs text-[#10B981] font-semibold" style={{ fontFamily: 'var(--font-mono)' }}>
                    {badge.replace('-', ' ').toUpperCase()}
                  </p>
                </div>
              ))}
              
              {Array.from({ length: Math.max(0, 6 - user.badges.length) }).map((_, idx) => (
                <div
                  key={`locked-${idx}`}
                  className="bg-[#0F172A] border border-[#334155] rounded-lg p-4 text-center opacity-50"
                >
                  <div className="text-3xl mb-2">🔒</div>
                  <p className="text-xs text-[#64748B]">Locked</p>
                </div>
              ))}
            </div>
          </div>

          {/* Statistics */}
          <div className="bg-[#1E293B] border border-[#334155] rounded-lg p-6">
            <h3 className="text-lg font-semibold text-[#F1F5F9] mb-6">Statistics</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-[#0F172A] border border-[#334155] rounded-lg p-4 text-center">
                <p className="text-2xl font-semibold text-[#10B981]" style={{ fontFamily: 'var(--font-mono)' }}>
                  {user.badges.length * 5}
                </p>
                <p className="text-xs text-[#94A3B8] mt-1">Challenges Completed</p>
              </div>
              
              <div className="bg-[#0F172A] border border-[#334155] rounded-lg p-4 text-center">
                <p className="text-2xl font-semibold text-[#3B82F6]" style={{ fontFamily: 'var(--font-mono)' }}>
                  {user.badges.length * 12}
                </p>
                <p className="text-xs text-[#94A3B8] mt-1">Hours Played</p>
              </div>
              
              <div className="bg-[#0F172A] border border-[#334155] rounded-lg p-4 text-center">
                <p className="text-2xl font-semibold text-[#F59E0B]" style={{ fontFamily: 'var(--font-mono)' }}>
                  {user.badges.length}
                </p>
                <p className="text-xs text-[#94A3B8] mt-1">Keys Collected</p>
              </div>
              
              <div className="bg-[#0F172A] border border-[#334155] rounded-lg p-4 text-center">
                <p className="text-2xl font-semibold text-[#EC4899]" style={{ fontFamily: 'var(--font-mono)' }}>
                  #{user.id}
                </p>
                <p className="text-xs text-[#94A3B8] mt-1">Rank</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
