import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Shield, Terminal } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { ThemeToggle } from '../components/ThemeToggle';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { isGameMode } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      // Navigation is handled in AuthContext, or you can check user state here
    } catch (err: any) {
      setError('Invalid credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 transition-all ${
      isGameMode 
        ? 'bg-[#1a1a2e] bg-[linear-gradient(0deg,transparent_24%,rgba(0,255,65,.05)_25%,rgba(0,255,65,.05)_26%,transparent_27%,transparent_74%,rgba(0,255,65,.05)_75%,rgba(0,255,65,.05)_76%,transparent_77%,transparent),linear-gradient(90deg,transparent_24%,rgba(0,255,65,.05)_25%,rgba(0,255,65,.05)_26%,transparent_27%,transparent_74%,rgba(0,255,65,.05)_75%,rgba(0,255,65,.05)_76%,transparent_77%,transparent)] bg-[size:50px_50px]' 
        : 'bg-[#0F172A]'
    }`}>
      {/* Theme Toggle - Top Right */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md">
        <div className={`border p-8 shadow-2xl transition-all ${
          isGameMode
            ? 'bg-[#16213e] border-[#00ff41] shadow-[0_0_30px_rgba(0,255,65,0.3)] border-4'
            : 'bg-[#1E293B] border-[#334155] rounded-lg'
        }`}>
          {/* Logo & Title */}
          <div className="flex flex-col items-center mb-8">
            <div className={`w-16 h-16 rounded-lg flex items-center justify-center mb-4 relative transition-all ${
              isGameMode
                ? 'bg-[#00ff41] shadow-[0_0_20px_rgba(0,255,65,0.6)] animate-pulse'
                : 'bg-[#10B981]'
            }`}>
              <Shield className={`w-10 h-10 ${isGameMode ? 'text-[#1a1a2e]' : 'text-[#0F172A]'}`} strokeWidth={2.5} />
              <Terminal className={`w-6 h-6 absolute bottom-2 right-2 ${isGameMode ? 'text-[#1a1a2e]' : 'text-[#0F172A]'}`} />
            </div>
            <h1 
              className={`text-2xl font-semibold mb-1 transition-all ${
                isGameMode ? 'text-[#00ff41]' : 'text-[#F1F5F9]'
              }`}
              style={isGameMode ? { fontFamily: 'var(--font-pixel)', fontSize: '20px' } : { fontFamily: 'var(--font-mono)' }}
            >
              {isGameMode ? '> ODIN SYSTEM' : 'ODIN Portal Access'}
            </h1>
            <p className={`text-sm ${isGameMode ? 'text-[#4ecdc4]' : 'text-[#94A3B8]'}`}
               style={isGameMode ? { fontFamily: 'var(--font-pixel)', fontSize: '8px' } : {}}>
              {isGameMode ? 'PRESS START' : 'Initialize your session'}
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className={isGameMode ? 'text-[#00ff41]' : 'text-[#F1F5F9]'}>
                {isGameMode ? 'EMAIL_ADDRESS' : 'Email Address'}
              </Label>
              <Input
                id="email"
                type="email" // Change type to email
                value={email} // Bind to email state
                onChange={(e) => setEmail(e.target.value)}
                placeholder={isGameMode ? 'ENTER_EMAIL' : 'Enter your email'}
                className={`transition-all ${
                  isGameMode
                    ? 'bg-[#1a1a2e] border-[#00ff41] text-[#00ff41] border-2 placeholder:text-[#0f3460] focus:shadow-[0_0_10px_rgba(0,255,65,0.5)]'
                    : 'bg-[#0F172A] border-[#334155] text-[#F1F5F9] placeholder:text-[#64748B]'
                }`}
                style={isGameMode ? { fontFamily: 'var(--font-mono)' } : { fontFamily: 'var(--font-mono)' }}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className={isGameMode ? 'text-[#00ff41]' : 'text-[#F1F5F9]'}
                     style={isGameMode ? { fontFamily: 'var(--font-pixel)', fontSize: '10px' } : {}}>
                {isGameMode ? 'PASSWORD' : 'Password'}
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isGameMode ? '********' : 'Enter your password'}
                className={`transition-all ${
                  isGameMode
                    ? 'bg-[#1a1a2e] border-[#00ff41] text-[#00ff41] border-2 placeholder:text-[#0f3460] focus:shadow-[0_0_10px_rgba(0,255,65,0.5)]'
                    : 'bg-[#0F172A] border-[#334155] text-[#F1F5F9] placeholder:text-[#64748B]'
                }`}
                required
              />
            </div>

            {error && (
              <div className={`border rounded p-3 text-sm transition-all ${
                isGameMode
                  ? 'bg-[#ff6b6b]/10 border-[#ff6b6b] text-[#ff6b6b] border-2'
                  : 'bg-[#EF4444]/10 border-[#EF4444]/50 text-[#EF4444]'
              }`}
                   style={isGameMode ? { fontFamily: 'var(--font-pixel)', fontSize: '10px' } : {}}>
                {isGameMode ? '! ERROR: ' + error : error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className={`w-full font-semibold transition-all ${
                isGameMode
                  ? 'bg-[#00ff41] hover:bg-[#00cc33] text-[#1a1a2e] border-2 border-[#00ff41] shadow-[0_0_15px_rgba(0,255,65,0.5)]'
                  : 'bg-[#10B981] hover:bg-[#059669] text-[#0F172A]'
              }`}
              style={isGameMode ? { fontFamily: 'var(--font-pixel)', fontSize: '12px' } : {}}
            >
              {loading ? (isGameMode ? 'LOADING...' : 'Initializing...') : (isGameMode ? '> START_' : 'Initialize Session')}
            </Button>
          </form>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className={`text-sm ${isGameMode ? 'text-[#4ecdc4]' : 'text-[#94A3B8]'}`}
               style={isGameMode ? { fontFamily: 'var(--font-pixel)', fontSize: '8px' } : {}}>
              {isGameMode ? 'NEW USER?' : 'Need access?'}{' '}
              <Link to="/register" className={`font-medium ${isGameMode ? 'text-[#ffe66d] hover:text-[#ffd700]' : 'text-[#10B981] hover:text-[#059669]'}`}>
                {isGameMode ? 'REGISTER' : 'Register New Account'}
              </Link>
            </p>
          </div>

          {/* Demo Credentials */}
          <div className={`mt-6 pt-6 border-t ${isGameMode ? 'border-[#0f3460]' : 'border-[#334155]'}`}>
            <p className={`text-xs text-center mb-2 ${isGameMode ? 'text-[#4ecdc4]' : 'text-[#64748B]'}`}
               style={isGameMode ? { fontFamily: 'var(--font-pixel)', fontSize: '8px' } : {}}>
              {isGameMode ? 'DEMO ACCOUNTS:' : 'Demo Credentials:'}
            </p>
            <div className={`text-xs space-y-1 ${isGameMode ? 'text-[#4ecdc4]' : 'text-[#94A3B8]'}`}
                 style={{ fontFamily: 'var(--font-mono)' }}>
              <div className="flex justify-between">
                <span>{isGameMode ? 'PLAYER:' : 'Student:'}</span>
                <span className={isGameMode ? 'text-[#00ff41]' : 'text-[#10B981]'}>STU001 / any password</span>
              </div>
              <div className="flex justify-between">
                <span>{isGameMode ? 'ADMIN:' : 'Admin:'}</span>
                <span className={isGameMode ? 'text-[#ffe66d]' : 'text-[#3B82F6]'}>ADMIN / any password</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}