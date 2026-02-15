import { X, Check, AlertTriangle, Lightbulb } from 'lucide-react';
import { useState, useEffect } from 'react';

export type AchievementStatus = 'success' | 'failure';

export interface AchievementData {
  status: AchievementStatus;
  badgeName: string;
  badgeEmoji: string;
  title: string;
  description: string;
  // For success
  successMessage?: string;
  // For failure/diagnostic
  diagnosticTitle?: string;
  diagnosticMessage?: string;
  suggestions?: string[];
}

interface AchievementModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: AchievementData;
}

export function AchievementModal({ isOpen, onClose, data }: AchievementModalProps) {
  const [animateIn, setAnimateIn] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setAnimateIn(true);
      const timer = setTimeout(() => {
        setAnimateIn(false);
        const closeTimer = setTimeout(onClose, 4000);
        return () => clearTimeout(closeTimer);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isSuccess = data.status === 'success';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-auto">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={`relative max-w-md w-full mx-4 rounded-2xl border backdrop-blur-md transition-all duration-500 transform ${
          animateIn
            ? 'scale-100 opacity-100'
            : 'scale-95 opacity-0'
        } ${
          isSuccess
            ? 'bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500/50 shadow-2xl shadow-green-500/20'
            : 'bg-gradient-to-br from-amber-500/20 to-orange-500/20 border-amber-500/50 shadow-2xl shadow-amber-500/20'
        }`}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="p-8 text-center">
          {/* Badge Icon with Animation */}
          <div
            className={`inline-flex items-center justify-center w-24 h-24 rounded-full mb-6 transition-all duration-500 ${
              animateIn ? 'scale-100' : 'scale-0'
            } ${
              isSuccess
                ? 'bg-green-500/20 ring-2 ring-green-500/50'
                : 'bg-amber-500/20 ring-2 ring-amber-500/50'
            }`}
          >
            {isSuccess ? (
              <div className="text-6xl animate-bounce">{data.badgeEmoji}</div>
            ) : (
              <div className="flex items-center justify-center">
                <div className="text-5xl mr-2">{data.badgeEmoji}</div>
                <AlertTriangle className="w-8 h-8 text-amber-500 absolute bottom-1 right-1" />
              </div>
            )}
          </div>

          {/* Title */}
          <h2
            className={`text-2xl font-bold mb-2 ${
              isSuccess ? 'text-green-400' : 'text-amber-400'
            }`}
          >
            {isSuccess ? '🎉 Achievement Unlocked!' : '⚠️ Time to Debug'}
          </h2>

          {/* Badge Name */}
          <p className="text-lg font-semibold text-foreground mb-4">
            {data.badgeName}
          </p>

          {/* Success Content */}
          {isSuccess && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                {data.description}
              </p>
              {data.successMessage && (
                <div className="mt-4 p-3 rounded-lg bg-green-500/10 border border-green-500/30">
                  <div className="flex items-center gap-2 justify-center text-green-400 text-sm font-semibold">
                    <Check className="w-4 h-4" />
                    {data.successMessage}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Failure/Diagnostic Content */}
          {!isSuccess && (
            <div className="space-y-4 text-left">
              <p className="text-sm text-muted-foreground text-center">
                {data.description}
              </p>

              {data.diagnosticTitle && (
                <div className="mt-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
                  <p className="text-sm font-semibold text-amber-400 mb-2">
                    Diagnosis: {data.diagnosticTitle}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {data.diagnosticMessage}
                  </p>
                </div>
              )}

              {data.suggestions && data.suggestions.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-foreground flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-amber-400" />
                    Odin's Suggestions:
                  </p>
                  <ul className="space-y-1">
                    {data.suggestions.map((suggestion, idx) => (
                      <li
                        key={idx}
                        className="text-xs text-muted-foreground bg-muted/30 rounded p-2 pl-3 border-l-2 border-amber-500/50"
                      >
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Footer Message */}
          <div className="mt-6 text-xs text-muted-foreground">
            {isSuccess ? 'Achievement added to your profile' : 'Try again with these tips'}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-1 bg-muted/40 rounded-b-2xl overflow-hidden">
          <div
            className={`h-full transition-all duration-[3500ms] ease-linear ${
              isSuccess ? 'bg-green-500' : 'bg-amber-500'
            }`}
            style={{ animation: isOpen ? 'progress 3.5s linear' : 'none' }}
          />
        </div>
      </div>

      <style>{`
        @keyframes progress {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </div>
  );
}
