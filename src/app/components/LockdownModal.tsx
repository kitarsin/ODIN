import { useState, useEffect } from 'react';
import { ShieldAlert, Clock } from 'lucide-react';

interface LockdownModalProps {
  onClose: () => void;
}

export function LockdownModal({ onClose }: LockdownModalProps) {
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      onClose();
    }
  }, [countdown, onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative max-w-lg w-full">
        {/* Red Border Modal */}
        <div className="relative rounded-xl backdrop-blur-xl bg-card/90 border-2 border-[#FF5252] shadow-2xl shadow-[#FF5252]/30 overflow-hidden">
          {/* Animated red glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#FF5252]/30 via-transparent to-[#FF5252]/10 animate-pulse pointer-events-none" />
          
          <div className="relative p-8 text-center">
            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-full bg-[#FF5252]/20 flex items-center justify-center animate-pulse">
                <ShieldAlert className="w-10 h-10 text-[#FF5252]" />
              </div>
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold mb-3 text-[#FF5252]">
              System Cooldown
            </h2>

            {/* Warning Message */}
            <p className="text-lg mb-6 leading-relaxed">
              You are guessing too fast. 
              <br />
              <span className="text-[#FFAB00] font-semibold">Read the code.</span>
            </p>

            {/* Countdown Timer */}
            <div className="mb-6">
              <div className="inline-flex items-center gap-3 px-6 py-4 rounded-xl bg-secondary/50 border border-[#FF5252]/50">
                <Clock className="w-6 h-6 text-[#FF5252]" />
                <div className="text-left">
                  <div className="text-xs text-muted-foreground mb-1">Lockout Time Remaining</div>
                  <div className="text-3xl font-bold text-[#FF5252] tabular-nums">
                    {countdown}s
                  </div>
                </div>
              </div>
            </div>

            {/* Info */}
            <div className="p-4 rounded-lg bg-[#FF5252]/10 border border-[#FF5252]/30">
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">Anti-Gaming Protection:</strong> Too many rapid compilation attempts detected. 
                Take this time to carefully review your code and logic.
              </p>
            </div>

            {/* Progress Bar */}
            <div className="mt-6 h-2 bg-secondary rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[#FF5252] to-[#FFAB00] transition-all duration-1000 ease-linear"
                style={{ width: `${((10 - countdown) / 10) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
