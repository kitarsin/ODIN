import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import logo64 from '../../img/brand/odin-logo-transparent-64.png';
import logo128 from '../../img/brand/odin-logo-transparent-128.png';
import logo256 from '../../img/brand/odin-logo-transparent-256.png';
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
  const [showPassword, setShowPassword] = useState(false);
  const { login, user, loading: authLoading } = useAuth();
  const { isGameMode } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const queryEmail = useMemo(() => new URLSearchParams(location.search).get('email') || '', [location.search]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
    } catch (err: any) {
      const message = (err?.message || '').toLowerCase();
      if (message.includes('invalid login credentials')) {
        setError('Email or password is incorrect.');
      } else {
        setError(err?.message || 'Unable to sign in. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (queryEmail && !email) {
      setEmail(queryEmail);
    }
  }, [queryEmail, email]);

  useEffect(() => {
    if (user && !authLoading) {
      navigate('/dashboard');
    }
  }, [user, authLoading, navigate]);

  const isSubmitting = loading || authLoading;
  const canSubmit = email.trim().length > 0 && password.trim().length > 0;

  const getBgClass = () => {
    if (isGameMode) {
      return 'bg-[#1a1a2e] bg-[linear-gradient(0deg,transparent_24%,rgba(0,255,65,.05)_25%,rgba(0,255,65,.05)_26%,transparent_27%,transparent_74%,rgba(0,255,65,.05)_75%,rgba(0,255,65,.05)_76%,transparent_77%,transparent),linear-gradient(90deg,transparent_24%,rgba(0,255,65,.05)_25%,rgba(0,255,65,.05)_26%,transparent_27%,transparent_74%,rgba(0,255,65,.05)_75%,rgba(0,255,65,.05)_76%,transparent_77%,transparent)] bg-[size:50px_50px]';
    }
    return 'bg-background';
  };

  const getCardBg = () => {
    if (isGameMode) return 'bg-[#16213e]';
    return 'bg-card';
  };

  const getCardBorder = () => {
    if (isGameMode) return 'border-[#00ff41]';
    return 'border-border';
  };

  const getTextColor = () => {
    if (isGameMode) return 'text-[#00ff41]';
    return 'text-foreground';
  };

  const getSecondaryText = () => {
    if (isGameMode) return 'text-[#4ecdc4]';
    return 'text-muted-foreground';
  };

  const getInputBg = () => {
    if (isGameMode) return 'bg-[#1a1a2e]';
    return 'bg-background';
  };

  const getInputBorder = () => {
    if (isGameMode) return 'border-[#00ff41]';
    return 'border-border';
  };

  const getInputText = () => {
    if (isGameMode) return 'text-[#00ff41]';
    return 'text-foreground';
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 transition-all ${getBgClass()}`}>
      {/* Theme Toggle - Top Right */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md">
        <div className={`border p-8 shadow-2xl transition-all ${
          isGameMode
            ? 'bg-[#16213e] border-[#00ff41] shadow-[0_0_30px_rgba(0,255,65,0.3)] border-4'
            : `${getCardBg()} border-2 ${getCardBorder()} rounded-lg`
        }`}>
          {/* Logo & Title */}
          <div className="flex flex-col items-center mb-8">
            <div className={`w-16 h-16 rounded-lg flex items-center justify-center mb-4 relative transition-all ${
              isGameMode
                ? 'shadow-[0_0_20px_rgba(0,255,65,0.6)] animate-pulse'
                : 'shadow-[0_0_18px_rgba(39,228,208,0.35)]'
            }`}>
              <img
                src={logo128}
                srcSet={`${logo64} 64w, ${logo128} 128w, ${logo256} 256w`}
                sizes="64px"
                alt="ODIN"
                className="w-12 h-12"
                style={{ imageRendering: 'pixelated' }}
              />
            </div>
            <h1 
              className={`text-2xl font-semibold mb-1 transition-all ${getTextColor()}`}
              style={isGameMode ? { fontFamily: 'var(--font-pixel)', fontSize: '20px' } : { fontFamily: 'var(--font-mono)' }}
            >
              {isGameMode ? '> ODIN SYSTEM' : 'ODIN Portal Access'}
            </h1>
            <p className={`text-sm ${getSecondaryText()}`}
               style={isGameMode ? { fontFamily: 'var(--font-pixel)', fontSize: '8px' } : {}}>
              {isGameMode ? 'PRESS START' : 'Initialize your session'}
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className={getTextColor()}>
                {isGameMode ? 'EMAIL_ADDRESS' : 'Email Address'}
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  if (error) setError('');
                }}
                onInput={(event) => {
                  setEmail((event.target as HTMLInputElement).value);
                }}
                placeholder={isGameMode ? 'ENTER_EMAIL' : 'Enter your email'}
                autoComplete="email"
                autoFocus
                className={`transition-all ${
                  isGameMode
                    ? 'bg-[#1a1a2e] border-[#00ff41] text-[#00ff41] border-2 placeholder:text-[#0f3460] focus:shadow-[0_0_10px_rgba(0,255,65,0.5)]'
                    : `${getInputBg()} border ${getInputBorder()} ${getInputText()} placeholder:text-muted-foreground`
                }`}
                style={isGameMode ? { fontFamily: 'var(--font-mono)' } : { fontFamily: 'var(--font-mono)' }}
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className={getTextColor()}
                     style={isGameMode ? { fontFamily: 'var(--font-pixel)', fontSize: '10px' } : {}}>
                {isGameMode ? 'PASSWORD' : 'Password'}
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    if (error) setError('');
                  }}
                  onInput={(event) => {
                    setPassword((event.target as HTMLInputElement).value);
                  }}
                  placeholder={isGameMode ? '********' : 'Enter your password'}
                  autoComplete="current-password"
                  className={`pr-10 transition-all ${
                    isGameMode
                      ? 'bg-[#1a1a2e] border-[#00ff41] text-[#00ff41] border-2 placeholder:text-[#0f3460] focus:shadow-[0_0_10px_rgba(0,255,65,0.5)]'
                      : `${getInputBg()} border ${getInputBorder()} ${getInputText()} placeholder:text-muted-foreground`
                  }`}
                  disabled={isSubmitting}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className={`border rounded p-3 text-sm transition-all ${
                isGameMode
                  ? 'bg-[#ff6b6b]/10 border-[#ff6b6b] text-[#ff6b6b] border-2'
                  : 'bg-destructive/10 border-destructive/50 text-destructive'
              }`}
                   style={isGameMode ? { fontFamily: 'var(--font-pixel)', fontSize: '10px' } : {}}
                   role="alert"
                   aria-live="polite">
                {isGameMode ? '! ERROR: ' + error : error}
              </div>
            )}

            <Button
              type="submit"
              disabled={isSubmitting || !canSubmit}
              className={`w-full font-semibold transition-all ${
                isGameMode
                  ? 'bg-[#00ff41] hover:bg-[#00cc33] text-[#1a1a2e] border-2 border-[#00ff41] shadow-[0_0_15px_rgba(0,255,65,0.5)]'
                    : 'bg-primary hover:bg-primary/90 text-primary-foreground'
              }`}
              style={isGameMode ? { fontFamily: 'var(--font-pixel)', fontSize: '12px' } : {}}
            >
              {isSubmitting ? (isGameMode ? 'LOADING...' : 'Initializing...') : (isGameMode ? '> START_' : 'Initialize Session')}
            </Button>
          </form>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className={`text-sm ${getSecondaryText()}`}
               style={isGameMode ? { fontFamily: 'var(--font-pixel)', fontSize: '8px' } : {}}>
              {isGameMode ? 'NEW USER?' : 'Need access?'}{' '}
              <Link to={`/register${email ? `?email=${encodeURIComponent(email)}` : ''}`} className={`font-medium ${
                isGameMode ? 'text-[#ffe66d] hover:text-[#ffd700]' : 
                'text-primary hover:text-primary/80'
              }`}>
                {isGameMode ? 'REGISTER' : 'Register New Account'}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}