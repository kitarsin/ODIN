import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';

interface FeatureLockedScreenProps {
  featureName?: string;
  message?: string;
}

export function FeatureLockedScreen({ featureName, message }: FeatureLockedScreenProps) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-4">
      <div className="relative max-w-lg w-full">
        {/* Ambient glow behind the card */}
        <div
          className="absolute -inset-4 rounded-3xl opacity-40 blur-2xl pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(255,82,82,0.35) 0%, transparent 70%)',
          }}
        />

        <div className="relative rounded-xl backdrop-blur-xl bg-card/90 border-2 border-[#FF5252] shadow-2xl shadow-[#FF5252]/20 overflow-hidden">
          {/* Animated gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#FF5252]/20 via-transparent to-[#FF5252]/5 pointer-events-none" />

          <div className="relative p-8 text-center">
            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                {/* Pulse ring */}
                <div className="absolute inset-0 w-20 h-20 rounded-full bg-[#FF5252]/20 animate-ping" style={{ animationDuration: '2s' }} />
                <div className="relative w-20 h-20 rounded-full bg-[#FF5252]/20 flex items-center justify-center border border-[#FF5252]/40">
                  <ShieldAlert className="w-10 h-10 text-[#FF5252]" />
                </div>
              </div>
            </div>

            {/* Title */}
            <h2
              className="text-2xl font-bold mb-2 text-[#FF5252]"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              FEATURE LOCKED
            </h2>

            {featureName && (
              <p className="text-sm text-muted-foreground mb-4" style={{ fontFamily: 'var(--font-mono)' }}>
                {featureName.toUpperCase()} MODULE
              </p>
            )}

            {/* Message */}
            <div className="mb-6 p-4 rounded-lg bg-[#FF5252]/10 border border-[#FF5252]/30">
              <p className="text-sm leading-relaxed">
                {message || 'This feature has been temporarily disabled by your instructor.'}
              </p>
            </div>

            {/* Info */}
            <p className="text-xs text-muted-foreground mb-6">
              If you believe this is an error, please contact your instructor or admin.
            </p>

            {/* Action */}
            <Button
              onClick={() => navigate('/dashboard')}
              className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Return to Dashboard
            </Button>
          </div>

          {/* Bottom accent stripe */}
          <div className="h-1 bg-gradient-to-r from-[#FF5252] via-[#FFAB00] to-[#FF5252]" />
        </div>
      </div>
    </div>
  );
}
