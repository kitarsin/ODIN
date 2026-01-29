import { useState } from 'react';
import { Activity, Lock, User, AlertTriangle } from 'lucide-react';

interface AuthPortalProps {
  onLogin: (username: string) => void;
}

export function AuthPortal({ onLogin }: AuthPortalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('ACCESS_DENIED // ALL_FIELDS_REQUIRED');
      return;
    }

    if (password.length < 6) {
      setError('ACCESS_DENIED // INVALID_CREDENTIALS');
      return;
    }

    // Mock successful login
    onLogin(username);
  };

  return (
    <div className="w-full h-full bg-background flex overflow-hidden">
      {/* Left Side - Animated Logo */}
      <div className="flex-1 relative overflow-hidden bg-gradient-to-br from-background via-[#1a1a2e] to-background flex items-center justify-center">
        {/* Grid Background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `linear-gradient(#2979FF 1px, transparent 1px), linear-gradient(90deg, #2979FF 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }} />
        </div>

        {/* Animated Orb/Logo */}
        <div className="relative z-10 flex flex-col items-center">
          <div className="relative mb-8">
            {/* Outer Glow Rings */}
            <div className="absolute inset-0 animate-pulse">
              <div className="w-64 h-64 rounded-full border-2 border-[#2979FF]/30 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              <div className="w-80 h-80 rounded-full border border-[#00E676]/20 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" style={{ animationDelay: '0.5s' }} />
            </div>

            {/* Main Orb */}
            <div className="w-48 h-48 rounded-full bg-gradient-to-br from-[#2979FF] via-[#00E676] to-[#2979FF] flex items-center justify-center relative animate-pulse shadow-[0_0_80px_rgba(41,121,255,0.5)]">
              <div className="w-44 h-44 rounded-full bg-background flex items-center justify-center">
                <Activity className="w-20 h-20 text-[#00E676] animate-pulse" />
              </div>
              
              {/* Orbiting particles */}
              <div className="absolute inset-0">
                <div className="absolute w-3 h-3 bg-[#00E676] rounded-full top-0 left-1/2 -translate-x-1/2 shadow-[0_0_20px_rgba(0,230,118,0.8)]" 
                  style={{ animation: 'orbit 4s linear infinite' }} />
                <div className="absolute w-2 h-2 bg-[#2979FF] rounded-full top-1/2 right-0 -translate-y-1/2 shadow-[0_0_20px_rgba(41,121,255,0.8)]" 
                  style={{ animation: 'orbit 4s linear infinite', animationDelay: '1s' }} />
                <div className="absolute w-2 h-2 bg-[#FFAB00] rounded-full bottom-0 left-1/2 -translate-x-1/2 shadow-[0_0_20px_rgba(255,171,0,0.8)]" 
                  style={{ animation: 'orbit 4s linear infinite', animationDelay: '2s' }} />
              </div>
            </div>
          </div>

          {/* System Text */}
          <div className="text-center space-y-2">
            <h1 className="text-6xl font-bold tracking-wider text-[#00E676] mb-4" style={{ fontFamily: 'Orbitron, sans-serif' }}>
              ODIN
            </h1>
            <div className="code-font text-[#2979FF] space-y-1">
              <p className="text-lg">System Online // v1.0</p>
              <p className="text-sm text-muted-foreground">Operator Diagnostic Intelligent Navigator</p>
            </div>
            <div className="flex items-center justify-center gap-2 mt-4 text-xs text-[#00E676] code-font">
              <div className="w-2 h-2 bg-[#00E676] rounded-full animate-pulse" />
              <span>ALL_SYSTEMS_OPERATIONAL</span>
            </div>
          </div>
        </div>

        {/* Corner Decorations */}
        <div className="absolute top-0 left-0 w-32 h-32 border-l-2 border-t-2 border-[#2979FF]/30" />
        <div className="absolute bottom-0 right-0 w-32 h-32 border-r-2 border-b-2 border-[#00E676]/30" />
      </div>

      {/* Right Side - Auth Form */}
      <div className="w-[600px] relative flex items-center justify-center p-12 border-l border-border/30">
        {/* Glassmorphism Card */}
        <div className="w-full max-w-md relative">
          <div className="backdrop-blur-xl bg-card/60 border border-border/50 rounded-2xl p-8 shadow-[0_0_50px_rgba(41,121,255,0.1)]">
            {/* Header */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-2" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                {isLogin ? 'SYSTEM ACCESS' : 'REGISTER AGENT'}
              </h2>
              <p className="text-sm text-muted-foreground code-font">
                {isLogin ? '// ENTER_CREDENTIALS' : '// CREATE_NEW_PROFILE'}
              </p>
            </div>

            {/* Error Display */}
            {error && (
              <div className="mb-6 p-4 rounded-lg bg-[#FF5252]/10 border border-[#FF5252] flex items-start gap-3 animate-pulse">
                <AlertTriangle className="w-5 h-5 text-[#FF5252] shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-[#FF5252] text-sm">ACCESS DENIED</p>
                  <p className="text-xs text-[#FF5252]/80 code-font mt-1">{error}</p>
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Username Field */}
              <div>
                <label className="text-xs text-muted-foreground code-font mb-2 block uppercase tracking-wide">
                  User ID
                </label>
                <div className="relative">
                  <User className="absolute left-0 top-1/2 -translate-y-1/2 w-5 h-5 text-[#2979FF]" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-transparent border-b-2 border-border focus:border-[#2979FF] pl-8 pr-4 py-3 code-font text-foreground focus:outline-none transition-colors"
                    placeholder="enter_username"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label className="text-xs text-muted-foreground code-font mb-2 block uppercase tracking-wide">
                  Access Code
                </label>
                <div className="relative">
                  <Lock className="absolute left-0 top-1/2 -translate-y-1/2 w-5 h-5 text-[#2979FF]" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-transparent border-b-2 border-border focus:border-[#2979FF] pl-8 pr-4 py-3 code-font text-foreground focus:outline-none transition-colors"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-4 bg-gradient-to-r from-[#2979FF] to-[#00E676] hover:shadow-[0_0_30px_rgba(41,121,255,0.5)] transition-all font-bold text-lg tracking-wider uppercase relative overflow-hidden group"
                style={{ 
                  fontFamily: 'Rajdhani, sans-serif',
                  clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))'
                }}
              >
                <span className="relative z-10">{isLogin ? 'INITIATE ACCESS' : 'CREATE PROFILE'}</span>
                <div className="absolute inset-0 bg-gradient-to-r from-[#00E676] to-[#2979FF] opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </form>

            {/* Toggle Mode */}
            <div className="mt-6 text-center">
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                }}
                className="text-sm text-[#2979FF] hover:text-[#00E676] transition-colors code-font"
              >
                {isLogin ? '// CREATE_NEW_ACCOUNT' : '// RETURN_TO_LOGIN'}
              </button>
            </div>

            {/* Footer Info */}
            <div className="mt-8 pt-6 border-t border-border/30">
              <p className="text-xs text-muted-foreground code-font text-center">
                SECURED CONNECTION // 256-BIT ENCRYPTION
              </p>
            </div>
          </div>

          {/* Corner Accents */}
          <div className="absolute -top-2 -left-2 w-24 h-24 border-l-2 border-t-2 border-[#2979FF]/50 pointer-events-none" />
          <div className="absolute -bottom-2 -right-2 w-24 h-24 border-r-2 border-b-2 border-[#00E676]/50 pointer-events-none" />
        </div>
      </div>

      <style>{`
        @keyframes orbit {
          from {
            transform: rotate(0deg) translateX(96px) rotate(0deg);
          }
          to {
            transform: rotate(360deg) translateX(96px) rotate(-360deg);
          }
        }
      `}</style>
    </div>
  );
}
