import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Shield, Terminal } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { ThemeToggle } from '../components/ThemeToggle';

export function Register() {
  const [name, setName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');
  const [section, setSection] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { register, user, loading: authLoading } = useAuth();
  const [email, setEmail] = useState('');
  const navigate = useNavigate();
  const { isGameMode } = useTheme();
  const location = useLocation();
  const queryEmail = useMemo(() => new URLSearchParams(location.search).get('email') || '', [location.search]);

  const getInputClass = () => {
    if (isGameMode) {
      return 'bg-[#1a1a2e] border-[#00ff41] text-[#00ff41] border-2 placeholder:text-[#0f3460]';
    }
    return 'bg-background border-border text-foreground placeholder:text-muted-foreground';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register(email, password, name, studentId, section);
      // Registration successful - auth state will handle redirect
      // Clear form to show clean state
      setName('');
      setEmail('');
      setStudentId('');
      setSection('');
      setPassword('');
    } catch (err: any) {
      const message = (err?.message || '').toLowerCase();
      if (message.includes('email not confirmed')) {
        setError('Please confirm your email, then sign in.');
      } else if (message.includes('already registered')) {
        setError('This email is already registered. Please sign in instead.');
      } else if (message.includes('password')) {
        setError('Password must be at least 6 characters.');
      } else {
        setError(err.message || 'Registration failed. Please try again.');
      }
      setLoading(false);
      return;
    }
    setLoading(false);
  };

  useEffect(() => {
    if (queryEmail && !email) {
      setEmail(queryEmail);
    }
  }, [queryEmail, email]);

  useEffect(() => {
    // Redirect only when: user is authenticated AND loading is complete AND error is not set
    if (user && !authLoading && !loading && !error) {
      // Use replace to prevent back button going to register
      navigate('/dashboard', { replace: true });
    }
  }, [user, authLoading, loading, error, navigate]);

  const isSubmitting = loading || authLoading;
  const canSubmit =
    name.trim().length > 0 &&
    studentId.trim().length > 0 &&
    section.trim().length > 0 &&
    email.trim().length > 0 &&
    password.trim().length > 0;

  const bgClass = isGameMode ? 'bg-[#1a1a2e]' : 'bg-background';

  const cardBgClass = isGameMode ? 'bg-[#16213e]' : 'bg-card';
  const cardBorderClass = isGameMode ? 'border-[#00ff41]' : 'border-border';
  const textColorClass = isGameMode ? 'text-[#00ff41]' : 'text-foreground';
  const secondaryTextClass = isGameMode ? 'text-[#4ecdc4]' : 'text-muted-foreground';

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 transition-all ${bgClass}`}>
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md">
        <div className={`border p-8 shadow-2xl transition-all ${isGameMode ? `bg-[#16213e] border-[#00ff41] shadow-[0_0_30px_rgba(0,255,65,0.3)] border-4 rounded` : `${cardBgClass} border-2 ${cardBorderClass} rounded-lg`}`}>
          <div className="flex flex-col items-center mb-8">
            <div className={`w-16 h-16 rounded-lg flex items-center justify-center mb-4 relative ${isGameMode ? 'bg-[#00ff41] shadow-[0_0_20px_rgba(0,255,65,0.6)]' : 'bg-primary'}`}>
              <Shield className={`w-10 h-10 ${isGameMode ? 'text-[#0F172A]' : 'text-primary-foreground'}`} strokeWidth={2.5} />
              <Terminal className={`w-6 h-6 ${isGameMode ? 'text-[#0F172A]' : 'text-primary-foreground'} absolute bottom-2 right-2`} />
            </div>
            <h1 className={`text-2xl font-semibold mb-1 ${textColorClass}`} style={isGameMode ? { fontFamily: 'var(--font-pixel)', fontSize: '20px' } : { fontFamily: 'var(--font-mono)' }}>
              {isGameMode ? '> CREATE_PROFILE' : 'Register New Account'}
            </h1>
            <p className={`text-sm ${secondaryTextClass}`} style={isGameMode ? { fontFamily: 'var(--font-pixel)', fontSize: '8px' } : {}}>
              {isGameMode ? 'ENTER_DETAILS' : 'Join the ODIN system'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name" className={textColorClass}>
                {isGameMode ? 'FULL_NAME' : 'Full Name'}
              </Label>
              <Input
                id="name"
                name="name"
                type="text"
                value={name}
                onChange={(event) => {
                  setName(event.target.value);
                  if (error) setError('');
                }}
                onInput={(event) => {
                  setName((event.target as HTMLInputElement).value);
                }}
                placeholder={isGameMode ? 'ENTER_NAME' : 'Enter your full name'}
                autoComplete="name"
                className={getInputClass()}
                style={{ fontFamily: 'var(--font-mono)' }}
                autoFocus
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className={textColorClass}>
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
                className={getInputClass()}
                style={{ fontFamily: 'var(--font-mono)' }}
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="studentId" className={textColorClass}>
                {isGameMode ? 'STUDENT_ID' : 'Student ID'}
              </Label>
              <Input
                id="studentId"
                name="studentId"
                type="text"
                value={studentId}
                onChange={(event) => {
                  setStudentId(event.target.value);
                  if (error) setError('');
                }}
                onInput={(event) => {
                  setStudentId((event.target as HTMLInputElement).value);
                }}
                placeholder={isGameMode ? 'ENTER_ID' : 'Enter your student ID'}
                className={getInputClass()}
                style={{ fontFamily: 'var(--font-mono)' }}
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="section" className={textColorClass}>
                {isGameMode ? 'CLASS_SECTION' : 'Class Section'}
              </Label>
              <Input
                id="section"
                name="section"
                type="text"
                value={section}
                onChange={(event) => {
                  setSection(event.target.value);
                  if (error) setError('');
                }}
                onInput={(event) => {
                  setSection((event.target as HTMLInputElement).value);
                }}
                placeholder={isGameMode ? 'E_G_CS_301A' : 'e.g., CS-301A'}
                autoComplete="organization"
                className={getInputClass()}
                style={{ fontFamily: 'var(--font-mono)' }}
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className={textColorClass}>
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
                  placeholder={isGameMode ? '········' : 'Choose a strong password'}
                  autoComplete="new-password"
                  className={`${getInputClass()} pr-10`}
                  style={{ fontFamily: 'var(--font-mono)' }}
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
              <div className={`border rounded p-3 text-sm transition-all ${isGameMode ? 'bg-[#ff6b6b]/10 border-[#ff6b6b] text-[#ff6b6b] border-2' : 'bg-destructive/10 border-destructive/50 text-destructive'}`} style={isGameMode ? { fontFamily: 'var(--font-pixel)', fontSize: '10px' } : {}}>
                {isGameMode ? '! ERROR: ' + error : error}
              </div>
            )}

            <Button
              type="submit"
              disabled={isSubmitting || !canSubmit}
              className={`w-full font-semibold transition-all ${isGameMode ? 'bg-[#00ff41] hover:bg-[#00cc33] text-[#1a1a2e] border-2 border-[#00ff41] shadow-[0_0_15px_rgba(0,255,65,0.5)]' : 'bg-primary hover:bg-primary/90 text-primary-foreground'}`}
              style={isGameMode ? { fontFamily: 'var(--font-pixel)', fontSize: '12px' } : {}}
            >
              {isSubmitting ? (isGameMode ? 'CREATING...' : 'Creating Account...') : (isGameMode ? '> REGISTER_' : 'Create Account')}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className={`text-sm ${secondaryTextClass}`} style={isGameMode ? { fontFamily: 'var(--font-pixel)', fontSize: '8px' } : {}}>
              {isGameMode ? 'ALREADY_EXIST?' : 'Already have an account?'}{' '}
              <Link to={`/login${email ? `?email=${encodeURIComponent(email)}` : ''}`} className={`font-medium ${isGameMode ? 'text-[#ffe66d] hover:text-[#ffd700]' : 'text-primary hover:text-primary/80'}`}>
                {isGameMode ? 'LOGIN' : 'Sign In'}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
