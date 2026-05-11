import { Check, AlertTriangle, Lightbulb } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

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

const DISPLAY_DURATION = 4000; // ms the toast stays fully visible
const SLIDE_DURATION = 400;   // ms for slide in/out animation

export function AchievementModal({ isOpen, onClose, data }: AchievementModalProps) {
  const [phase, setPhase] = useState<'entering' | 'visible' | 'exiting' | 'hidden'>('hidden');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Start entering
      setPhase('entering');
      // After slide-in, switch to visible and start auto-dismiss timer
      timerRef.current = setTimeout(() => {
        setPhase('visible');
        timerRef.current = setTimeout(() => {
          setPhase('exiting');
          timerRef.current = setTimeout(() => {
            setPhase('hidden');
            onClose();
          }, SLIDE_DURATION);
        }, DISPLAY_DURATION);
      }, 50); // small delay to ensure CSS transition triggers
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!isOpen && phase === 'hidden') return null;

  const isSuccess = data.status === 'success';
  const isVisible = phase === 'entering' || phase === 'visible';

  return (
    <>
      {/* Steam-style toast — bottom-right corner, no backdrop, no blur */}
      <div
        className="fixed bottom-6 right-6 z-50 pointer-events-auto"
        style={{ maxWidth: '380px', width: '100%' }}
      >
        <div
          className={`rounded-xl border backdrop-blur-md overflow-hidden transition-all ${
            isSuccess
              ? 'bg-gradient-to-r from-green-500/15 to-emerald-500/10 border-green-500/40 shadow-lg shadow-green-500/10'
              : 'bg-gradient-to-r from-amber-500/15 to-orange-500/10 border-amber-500/40 shadow-lg shadow-amber-500/10'
          }`}
          style={{
            transform: isVisible ? 'translateX(0)' : 'translateX(calc(100% + 2rem))',
            opacity: isVisible ? 1 : 0,
            transition: `transform ${SLIDE_DURATION}ms cubic-bezier(0.22, 1, 0.36, 1), opacity ${SLIDE_DURATION}ms ease`,
          }}
        >
          <div className="flex items-center gap-3 p-4">
            {/* Badge Emoji */}
            <div
              className={`flex-shrink-0 flex items-center justify-center w-14 h-14 rounded-lg ${
                isSuccess
                  ? 'bg-green-500/20 ring-1 ring-green-500/40'
                  : 'bg-amber-500/20 ring-1 ring-amber-500/40'
              }`}
            >
              {isSuccess ? (
                <span className="text-3xl">{data.badgeEmoji}</span>
              ) : (
                <span className="relative text-2xl">
                  {data.badgeEmoji}
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500 absolute -bottom-1 -right-1" />
                </span>
              )}
            </div>

            {/* Text Content */}
            <div className="flex-1 min-w-0">
              <p
                className={`text-xs font-semibold uppercase tracking-wider mb-0.5 ${
                  isSuccess ? 'text-green-400' : 'text-amber-400'
                }`}
              >
                {isSuccess ? '🎉 Achievement Unlocked!' : '⚠️ Time to Debug'}
              </p>
              <p className="text-sm font-bold text-foreground truncate">
                {data.badgeName}
              </p>
              <p className="text-xs text-muted-foreground line-clamp-2">
                {data.description}
              </p>

              {/* Success message inline */}
              {isSuccess && data.successMessage && (
                <div className="flex items-center gap-1 mt-1 text-green-400">
                  <Check className="w-3 h-3 flex-shrink-0" />
                  <span className="text-xs">{data.successMessage}</span>
                </div>
              )}

              {/* Failure diagnostic inline */}
              {!isSuccess && data.diagnosticTitle && (
                <p className="text-xs text-amber-400 mt-1 truncate">
                  Diagnosis: {data.diagnosticTitle}
                </p>
              )}

              {/* Suggestions — show first one only in toast */}
              {!isSuccess && data.suggestions && data.suggestions.length > 0 && (
                <div className="flex items-center gap-1 mt-1 text-muted-foreground">
                  <Lightbulb className="w-3 h-3 text-amber-400 flex-shrink-0" />
                  <span className="text-xs truncate">{data.suggestions[0]}</span>
                </div>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="h-0.5 bg-muted/30">
            <div
              className={`h-full ${isSuccess ? 'bg-green-500' : 'bg-amber-500'}`}
              style={{
                width: phase === 'visible' || phase === 'exiting' ? '0%' : '100%',
                transition: phase === 'visible' || phase === 'exiting'
                  ? `width ${DISPLAY_DURATION}ms linear`
                  : 'none',
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
}
