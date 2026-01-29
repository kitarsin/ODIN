import { Lightbulb, X } from 'lucide-react';

interface HintCardProps {
  hint: string;
  onClose: () => void;
}

export function HintCard({ hint, onClose }: HintCardProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative max-w-md w-full">
        {/* Glassmorphism Card with Yellow Border */}
        <div className="relative rounded-xl backdrop-blur-xl bg-card/80 border-2 border-[#FFAB00] shadow-2xl shadow-[#FFAB00]/20 overflow-hidden">
          {/* Glow effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#FFAB00]/20 to-transparent pointer-events-none" />
          
          <div className="relative p-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-[#FFAB00]/20 flex items-center justify-center">
                  <Lightbulb className="w-6 h-6 text-[#FFAB00]" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Scaffolded Hint</h3>
                  <p className="text-xs text-[#FFAB00]">From ODIN Assistant</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1 rounded-lg hover:bg-secondary/50 transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {/* Hint Content */}
            <div className="p-4 rounded-lg bg-[#FFAB00]/10 border border-[#FFAB00]/30">
              <p className="text-sm leading-relaxed">{hint}</p>
            </div>

            {/* Footer */}
            <div className="mt-4 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                💡 This hint won't affect your XP
              </span>
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-[#FFAB00] text-black font-semibold hover:bg-[#FFAB00]/90 transition-colors"
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
