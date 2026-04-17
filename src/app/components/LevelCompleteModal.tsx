import { Trophy, Star, ChevronRight, Award } from 'lucide-react';

interface LevelCompleteModalProps {
  level: number;
  xpEarned: number;
  onNextLevel: () => void;
  onBackToDashboard: () => void;
}

export function LevelCompleteModal({ 
  level, 
  xpEarned, 
  onNextLevel, 
  onBackToDashboard 
}: LevelCompleteModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <div className="relative max-w-md w-full">
        {/* Celebration Card */}
        <div className="relative rounded-xl backdrop-blur-xl bg-card/90 border-2 border-[#00E676] shadow-2xl shadow-[#00E676]/30 overflow-hidden">
          {/* Animated green glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#00E676]/30 via-transparent to-[#2979FF]/20 pointer-events-none" />
          
          <div className="relative p-8 text-center">
            {/* Celebration Icon */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#00E676] to-[#2979FF] flex items-center justify-center animate-bounce">
                  <Trophy className="w-12 h-12 text-white" />
                </div>
                {/* Floating particles effect */}
                <div className="absolute -top-2 -right-2 w-8 h-8">
                  <Star className="w-6 h-6 text-[#FFAB00] animate-pulse" />
                </div>
                <div className="absolute -bottom-2 -left-2 w-8 h-8">
                  <Star className="w-6 h-6 text-[#00E676] animate-pulse" style={{ animationDelay: '0.3s' }} />
                </div>
              </div>
            </div>

            {/* Title */}
            <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-[#00E676] to-[#2979FF] bg-clip-text text-transparent">
              Level Complete!
            </h2>
            <p className="text-muted-foreground mb-6">
              Level {level}: Loop Fundamentals
            </p>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 rounded-lg bg-[#00E676]/10 border border-[#00E676]/30">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Star className="w-5 h-5 text-[#FFAB00]" />
                  <span className="text-2xl font-bold text-[#00E676]">+{xpEarned}</span>
                </div>
                <p className="text-xs text-muted-foreground">XP Earned</p>
              </div>

              <div className="p-4 rounded-lg bg-[#2979FF]/10 border border-[#2979FF]/30">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Award className="w-5 h-5 text-[#2979FF]" />
                  <span className="text-2xl font-bold text-[#2979FF]">S</span>
                </div>
                <p className="text-xs text-muted-foreground">Rank</p>
              </div>
            </div>

            {/* Achievement Badge */}
            <div className="mb-6 p-4 rounded-lg bg-secondary/50 border border-border">
              <div className="flex items-center justify-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FFAB00] to-[#FF5252] flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <p className="font-semibold">New Badge Unlocked!</p>
                  <p className="text-xs text-[#FFAB00]">Loop Master</p>
                </div>
              </div>
            </div>

            {/* Performance Summary */}
            <div className="mb-6 p-4 rounded-lg bg-secondary/30 border border-border text-left">
              <h4 className="text-sm font-semibold mb-3">Performance Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Time Taken</span>
                  <span className="font-semibold text-[#00E676]">4:32</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Compilations</span>
                  <span className="font-semibold">3</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Hints Used</span>
                  <span className="font-semibold">0</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={onBackToDashboard}
                className="flex-1 px-4 py-3 rounded-lg bg-secondary border border-border hover:bg-secondary/80 transition-colors font-semibold"
              >
                Dashboard
              </button>
              <button
                onClick={onNextLevel}
                className="flex-1 px-4 py-3 rounded-lg bg-gradient-to-r from-[#2979FF] to-[#00E676] hover:shadow-lg hover:shadow-[#2979FF]/30 transition-all font-semibold flex items-center justify-center gap-2"
              >
                Next Level
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
