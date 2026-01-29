import { Trophy, Flame, Bell, Lock, CheckCircle2, Star } from 'lucide-react';

interface Level {
  id: number;
  title: string;
  description: string;
  isUnlocked: boolean;
  isCompleted: boolean;
  xpReward: number;
}

interface LeaderboardEntry {
  rank: number;
  name: string;
  xp: number;
  level: number;
}

const mockLevels: Level[] = [
  { id: 1, title: 'Array Basics', description: 'Learn array declaration and initialization', isUnlocked: true, isCompleted: true, xpReward: 100 },
  { id: 2, title: 'Index Logic', description: 'Master array indexing and access', isUnlocked: true, isCompleted: true, xpReward: 150 },
  { id: 3, title: 'Loop Fundamentals', description: 'Traverse arrays with for loops', isUnlocked: true, isCompleted: false, xpReward: 200 },
  { id: 4, title: 'Advanced Loops', description: 'While loops and nested iterations', isUnlocked: true, isCompleted: false, xpReward: 250 },
  { id: 5, title: 'Array Methods', description: 'Built-in array manipulation methods', isUnlocked: false, isCompleted: false, xpReward: 300 },
  { id: 6, title: '2D Arrays', description: 'Multi-dimensional array operations', isUnlocked: false, isCompleted: false, xpReward: 350 },
];

const mockLeaderboard: LeaderboardEntry[] = [
  { rank: 1, name: 'Alex_Chen', xp: 2450, level: 12 },
  { rank: 2, name: 'Sarah_K', xp: 2180, level: 11 },
  { rank: 3, name: 'DevMaster99', xp: 1920, level: 10 },
  { rank: 4, name: 'You', xp: 1650, level: 8 },
  { rank: 5, name: 'CodeNinja', xp: 1430, level: 8 },
];

interface DashboardProps {
  onSelectLevel: (levelId: number) => void;
}

export function Dashboard({ onSelectLevel }: DashboardProps) {
  const userXP = 1650;
  const userLevel = 8;
  const streakDays = 7;
  const badges = 12;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top Navigation */}
      <nav className="h-16 border-b border-border backdrop-blur-md bg-card/80 sticky top-0 z-50">
        <div className="h-full px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#2979FF] to-[#00E676] flex items-center justify-center">
                <span className="text-xl font-bold">O</span>
              </div>
              <div>
                <h1 className="text-xl font-semibold tracking-tight">ODIN</h1>
                <p className="text-xs text-muted-foreground">Operator Diagnostic Navigator</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            {/* XP Level */}
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary/50 border border-[#2979FF]/30">
              <Trophy className="w-5 h-5 text-[#2979FF]" />
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">Level</span>
                <span className="font-semibold">{userLevel}</span>
              </div>
              <div className="w-px h-8 bg-border mx-2" />
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">XP</span>
                <span className="font-semibold text-[#2979FF]">{userXP}</span>
              </div>
            </div>

            {/* Streak Counter */}
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary/50 border border-[#FFAB00]/30">
              <Flame className="w-5 h-5 text-[#FFAB00]" />
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">Streak</span>
                <span className="font-semibold text-[#FFAB00]">{streakDays} days</span>
              </div>
            </div>

            {/* Badges Notification */}
            <button className="relative p-2 rounded-lg hover:bg-secondary/50 transition-colors group">
              <Bell className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#00E676] text-black text-xs font-semibold rounded-full flex items-center justify-center">
                {badges}
              </span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Level Map */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-5xl mx-auto">
            <div className="mb-8">
              <h2 className="text-3xl font-semibold mb-2 bg-gradient-to-r from-[#2979FF] to-[#00E676] bg-clip-text text-transparent">
                Mission Control
              </h2>
              <p className="text-muted-foreground">Select a level to begin your training</p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {mockLevels.map((level) => (
                <button
                  key={level.id}
                  onClick={() => level.isUnlocked && onSelectLevel(level.id)}
                  disabled={!level.isUnlocked}
                  className={`
                    relative p-6 rounded-xl backdrop-blur-md transition-all duration-300
                    ${level.isUnlocked 
                      ? 'bg-card/60 border border-border hover:border-[#2979FF] hover:shadow-lg hover:shadow-[#2979FF]/20 cursor-pointer' 
                      : 'bg-card/30 border border-border/50 cursor-not-allowed opacity-50'
                    }
                    ${level.isCompleted ? 'border-[#00E676]/50' : ''}
                  `}
                >
                  {/* Glow effect for unlocked levels */}
                  {level.isUnlocked && !level.isCompleted && (
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#2979FF]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}

                  <div className="relative flex items-start justify-between">
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-semibold text-[#2979FF] px-2 py-1 bg-[#2979FF]/10 rounded">
                          LVL {level.id}
                        </span>
                        {level.isCompleted && (
                          <CheckCircle2 className="w-5 h-5 text-[#00E676]" />
                        )}
                      </div>
                      <h3 className="text-lg font-semibold mb-1">{level.title}</h3>
                      <p className="text-sm text-muted-foreground mb-3">{level.description}</p>
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-[#FFAB00]" />
                        <span className="text-xs text-[#FFAB00]">+{level.xpReward} XP</span>
                      </div>
                    </div>

                    {!level.isUnlocked && (
                      <Lock className="w-6 h-6 text-muted-foreground" />
                    )}
                  </div>

                  {/* Progress bar for unlocked levels */}
                  {level.isUnlocked && !level.isCompleted && (
                    <div className="mt-4 h-1 bg-secondary rounded-full overflow-hidden">
                      <div className="h-full w-0 bg-gradient-to-r from-[#2979FF] to-[#00E676]" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Leaderboard Sidebar */}
        <div className="w-80 border-l border-border backdrop-blur-md bg-card/40 p-6 overflow-y-auto">
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-1">Leaderboard</h3>
            <p className="text-sm text-muted-foreground">Top Classmates</p>
          </div>

          <div className="space-y-3">
            {mockLeaderboard.map((entry) => (
              <div
                key={entry.rank}
                className={`
                  p-4 rounded-lg backdrop-blur-sm transition-all
                  ${entry.name === 'You' 
                    ? 'bg-[#2979FF]/10 border-2 border-[#2979FF]/50' 
                    : 'bg-secondary/50 border border-border hover:border-[#00E676]/30'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  {/* Rank Badge */}
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                    ${entry.rank === 1 ? 'bg-[#FFAB00]/20 text-[#FFAB00]' : 
                      entry.rank === 2 ? 'bg-muted/50 text-muted-foreground' :
                      entry.rank === 3 ? 'bg-[#CD7F32]/20 text-[#CD7F32]' :
                      'bg-secondary text-muted-foreground'}
                  `}>
                    {entry.rank}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="font-semibold truncate">{entry.name}</div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>Lvl {entry.level}</span>
                      <span>•</span>
                      <span className="text-[#2979FF]">{entry.xp} XP</span>
                    </div>
                  </div>

                  {entry.rank <= 3 && (
                    <Trophy className={`
                      w-4 h-4
                      ${entry.rank === 1 ? 'text-[#FFAB00]' : 
                        entry.rank === 2 ? 'text-muted-foreground' :
                        'text-[#CD7F32]'}
                    `} />
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Stats Summary */}
          <div className="mt-6 p-4 rounded-lg bg-secondary/50 border border-border">
            <h4 className="text-sm font-semibold mb-3">Your Progress</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Completed</span>
                <span className="font-semibold text-[#00E676]">2/6 Levels</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total XP</span>
                <span className="font-semibold text-[#2979FF]">{userXP}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Next Level</span>
                <span className="font-semibold">350 XP</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
