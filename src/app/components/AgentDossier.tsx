import { useState } from 'react';
import { Upload, Trophy, Zap, Flame, Lock, Bell, AlertTriangle, Trash2 } from 'lucide-react';

export function AgentDossier() {
  const [showDangerZone, setShowDangerZone] = useState(false);
  const [notifications, setNotifications] = useState({
    hints: true,
    achievements: true,
    levelComplete: true,
    dailyReminder: false
  });

  const userStats = {
    level: 8,
    currentXP: 1650,
    nextLevelXP: 2000,
    totalCompiles: 247,
    accuracyRate: 76,
    longestStreak: 14,
    badges: 12
  };

  const progressPercentage = (userStats.currentXP / userStats.nextLevelXP) * 100;

  return (
    <div className="h-full bg-background text-foreground overflow-auto p-4 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-[#2979FF]" style={{ fontFamily: 'Orbitron, sans-serif' }}>
            AGENT DOSSIER
          </h1>
          <p className="text-muted-foreground code-font">// PERSONAL_PROFILE_DATABASE</p>
        </div>

        {/* Profile Header Card */}
        <div className="backdrop-blur-md bg-card/60 border border-border/50 rounded-lg p-8 shadow-[0_0_30px_rgba(41,121,255,0.1)]">
          <div className="flex items-start gap-8">
            {/* Avatar with Progress Ring */}
            <div className="relative shrink-0">
              <svg className="w-48 h-48 -rotate-90" viewBox="0 0 200 200">
                {/* Background Circle */}
                <circle
                  cx="100"
                  cy="100"
                  r="90"
                  fill="none"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="8"
                />
                {/* Progress Circle */}
                <circle
                  cx="100"
                  cy="100"
                  r="90"
                  fill="none"
                  stroke="url(#progressGradient)"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 90}`}
                  strokeDashoffset={`${2 * Math.PI * 90 * (1 - progressPercentage / 100)}`}
                  className="transition-all duration-500"
                  filter="url(#glow)"
                />
                <defs>
                  <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#2979FF" />
                    <stop offset="100%" stopColor="#00E676" />
                  </linearGradient>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>
              </svg>

              {/* Avatar Image Placeholder */}
              <div className="absolute inset-0 m-4 rounded-full bg-gradient-to-br from-[#2979FF] to-[#00E676] flex items-center justify-center overflow-hidden">
                <div className="w-full h-full bg-secondary flex items-center justify-center text-6xl font-bold text-[#2979FF]">
                  A
                </div>
              </div>

              {/* Upload Button */}
              <button className="absolute bottom-2 right-2 w-12 h-12 rounded-full bg-[#2979FF] hover:bg-[#00E676] transition-colors flex items-center justify-center shadow-[0_0_20px_rgba(41,121,255,0.5)] group">
                <Upload className="w-5 h-5 text-white" />
              </button>

              {/* Level Badge */}
              <div className="absolute -top-2 -right-2 w-16 h-16 rounded-full bg-gradient-to-br from-[#FFAB00] to-[#FF5252] flex items-center justify-center shadow-[0_0_20px_rgba(255,171,0,0.5)] border-4 border-background">
                <div className="text-center">
                  <div className="text-xs font-semibold" style={{ fontFamily: 'Rajdhani, sans-serif' }}>LVL</div>
                  <div className="text-xl font-bold">{userStats.level}</div>
                </div>
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <div className="mb-6">
                <h2 className="text-3xl font-bold mb-2" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                  AGENT_ALPHA
                </h2>
                <p className="text-sm text-muted-foreground code-font mb-1">USER_ID: USR_004</p>
                <p className="text-sm text-muted-foreground">Member since January 2026</p>
              </div>

              {/* XP Progress */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground code-font">EXPERIENCE_POINTS</span>
                  <span className="text-sm code-font">
                    <span className="text-[#2979FF] font-bold">{userStats.currentXP}</span>
                    <span className="text-muted-foreground"> / {userStats.nextLevelXP} XP</span>
                  </span>
                </div>
                <div className="h-3 bg-secondary rounded-full overflow-hidden border border-border/50">
                  <div 
                    className="h-full bg-gradient-to-r from-[#2979FF] to-[#00E676] transition-all duration-500 shadow-[0_0_10px_rgba(0,230,118,0.5)]"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1 code-font">
                  {userStats.nextLevelXP - userStats.currentXP} XP to next level
                </p>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-[#2979FF]/10 border border-[#2979FF]/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Trophy className="w-5 h-5 text-[#FFAB00]" />
                    <span className="text-xs text-muted-foreground code-font">BADGES</span>
                  </div>
                  <p className="text-2xl font-bold text-[#FFAB00]">{userStats.badges}</p>
                </div>

                <div className="p-4 rounded-lg bg-[#00E676]/10 border border-[#00E676]/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-5 h-5 text-[#00E676]" />
                    <span className="text-xs text-muted-foreground code-font">RANK</span>
                  </div>
                  <p className="text-2xl font-bold text-[#00E676]">#4</p>
                </div>

                <div className="p-4 rounded-lg bg-[#FF5252]/10 border border-[#FF5252]/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Flame className="w-5 h-5 text-[#FF5252]" />
                    <span className="text-xs text-muted-foreground code-font">STREAK</span>
                  </div>
                  <p className="text-2xl font-bold text-[#FF5252]">7d</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Panel */}
        <div className="backdrop-blur-md bg-card/60 border border-border/50 rounded-lg p-8 shadow-[0_0_30px_rgba(0,230,118,0.05)]">
          <h3 className="text-2xl font-semibold mb-6" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
            COMBAT STATISTICS
          </h3>

          <div className="grid grid-cols-3 gap-6">
            {/* Total Compiles */}
            <div className="text-center p-6 rounded-lg bg-secondary/30 border border-border/50">
              <div className="mb-3">
                <div className="w-16 h-16 mx-auto rounded-full bg-[#2979FF]/20 flex items-center justify-center">
                  <Zap className="w-8 h-8 text-[#2979FF]" />
                </div>
              </div>
              <p className="text-4xl font-bold mb-2 text-[#2979FF]">{userStats.totalCompiles}</p>
              <p className="text-sm text-muted-foreground code-font uppercase">Total Compiles</p>
              <div className="mt-3 text-xs text-[#00E676] code-font">↑ +23 this week</div>
            </div>

            {/* Accuracy Rate */}
            <div className="text-center p-6 rounded-lg bg-secondary/30 border border-border/50">
              <div className="mb-3">
                <div className="w-16 h-16 mx-auto rounded-full bg-[#00E676]/20 flex items-center justify-center">
                  <Trophy className="w-8 h-8 text-[#00E676]" />
                </div>
              </div>
              <p className="text-4xl font-bold mb-2 text-[#00E676]">{userStats.accuracyRate}%</p>
              <p className="text-sm text-muted-foreground code-font uppercase">Accuracy Rate</p>
              <div className="mt-3 h-2 bg-secondary rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#00E676]"
                  style={{ width: `${userStats.accuracyRate}%` }}
                />
              </div>
            </div>

            {/* Longest Streak */}
            <div className="text-center p-6 rounded-lg bg-secondary/30 border border-border/50">
              <div className="mb-3">
                <div className="w-16 h-16 mx-auto rounded-full bg-[#FFAB00]/20 flex items-center justify-center">
                  <Flame className="w-8 h-8 text-[#FFAB00]" />
                </div>
              </div>
              <p className="text-4xl font-bold mb-2 text-[#FFAB00]">{userStats.longestStreak}</p>
              <p className="text-sm text-muted-foreground code-font uppercase">Longest Streak</p>
              <div className="mt-3 text-xs text-muted-foreground code-font">days consecutive</div>
            </div>
          </div>
        </div>

        {/* Settings Section */}
        <div className="backdrop-blur-md bg-card/60 border border-border/50 rounded-lg overflow-hidden shadow-[0_0_30px_rgba(41,121,255,0.05)]">
          <div className="p-6 border-b border-border/50">
            <h3 className="text-2xl font-semibold" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
              SYSTEM CONFIGURATION
            </h3>
          </div>

          <div className="p-6 space-y-6">
            {/* Change Password */}
            <div>
              <h4 className="text-sm font-semibold mb-4 flex items-center gap-2 code-font uppercase text-muted-foreground">
                <Lock className="w-4 h-4" />
                Security Credentials
              </h4>
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-muted-foreground code-font mb-2 block">
                    CURRENT_PASSWORD
                  </label>
                  <input
                    type="password"
                    className="w-full bg-secondary/50 border-b-2 border-border focus:border-[#2979FF] px-4 py-3 code-font text-foreground focus:outline-none transition-colors rounded-t"
                    placeholder="••••••••"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground code-font mb-2 block">
                    NEW_PASSWORD
                  </label>
                  <input
                    type="password"
                    className="w-full bg-secondary/50 border-b-2 border-border focus:border-[#2979FF] px-4 py-3 code-font text-foreground focus:outline-none transition-colors rounded-t"
                    placeholder="••••••••"
                  />
                </div>
                <button className="px-6 py-3 bg-[#2979FF] hover:bg-[#00E676] transition-colors rounded font-semibold code-font uppercase text-sm shadow-[0_0_20px_rgba(41,121,255,0.3)]">
                  Update Password
                </button>
              </div>
            </div>

            {/* Notification Settings */}
            <div className="pt-6 border-t border-border/50">
              <h4 className="text-sm font-semibold mb-4 flex items-center gap-2 code-font uppercase text-muted-foreground">
                <Bell className="w-4 h-4" />
                Notification Protocol
              </h4>
              <div className="space-y-3">
                {Object.entries(notifications).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border/50">
                    <span className="text-sm code-font">
                      {key.replace(/([A-Z])/g, '_$1').toUpperCase()}
                    </span>
                    <button
                      onClick={() => setNotifications(prev => ({ ...prev, [key]: !value }))}
                      className={`
                        relative w-14 h-7 rounded-full transition-all
                        ${value ? 'bg-[#00E676] shadow-[0_0_10px_rgba(0,230,118,0.5)]' : 'bg-secondary border border-border'}
                      `}
                    >
                      <div className={`
                        absolute top-1 w-5 h-5 rounded-full bg-white transition-all
                        ${value ? 'left-8' : 'left-1'}
                      `} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Danger Zone */}
            <div className="pt-6 border-t-2 border-[#FF5252]/30">
              <button
                onClick={() => setShowDangerZone(!showDangerZone)}
                className="w-full text-left"
              >
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2 code-font uppercase text-[#FF5252]">
                  <AlertTriangle className="w-4 h-4" />
                  Danger Zone
                </h4>
              </button>
              
              {showDangerZone && (
                <div className="mt-4 p-6 rounded-lg bg-[#FF5252]/10 border-2 border-[#FF5252] relative overflow-hidden">
                  {/* Hazard Stripes */}
                  <div className="absolute inset-0 opacity-10 pointer-events-none"
                    style={{
                      backgroundImage: 'repeating-linear-gradient(45deg, #FF5252 0, #FF5252 10px, transparent 10px, transparent 20px)'
                    }}
                  />
                  
                  <div className="relative">
                    <p className="text-sm text-muted-foreground mb-4">
                      Once you delete your account, there is no going back. This action cannot be undone.
                    </p>
                    <button className="px-6 py-3 bg-[#FF5252] hover:bg-[#FF5252]/80 transition-colors rounded font-semibold flex items-center gap-2 shadow-[0_0_20px_rgba(255,82,82,0.3)]">
                      <Trash2 className="w-4 h-4" />
                      Delete Account
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}