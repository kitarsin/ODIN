import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Terminal } from 'lucide-react';
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
  const { register } = useAuth();
  const [email, setEmail] = useState('');
  const navigate = useNavigate();
  const { isGameMode } = useTheme();

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
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

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
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={isGameMode ? 'ENTER_NAME' : 'Enter your full name'}
                className={getInputClass()}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className={textColorClass}>
                {isGameMode ? 'EMAIL_ADDRESS' : 'Email Address'}
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={isGameMode ? 'ENTER_EMAIL' : 'Enter your email'}
                className={getInputClass()}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="studentId" className={textColorClass}>
                {isGameMode ? 'STUDENT_ID' : 'Student ID'}
              </Label>
              <Input
                id="studentId"
                type="text"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder={isGameMode ? 'ENTER_ID' : 'Enter your student ID'}
                className={getInputClass()}
                style={{ fontFamily: 'var(--font-mono)' }}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="section" className={textColorClass}>
                {isGameMode ? 'CLASS_SECTION' : 'Class Section'}
              </Label>
              <Input
                id="section"
                type="text"
                value={section}
                onChange={(e) => setSection(e.target.value)}
                placeholder={isGameMode ? 'E_G_CS_301A' : 'e.g., CS-301A'}
                className={getInputClass()}
                style={{ fontFamily: 'var(--font-mono)' }}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className={textColorClass}>
                {isGameMode ? 'PASSWORD' : 'Password'}
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isGameMode ? '········' : 'Choose a strong password'}
                className={getInputClass()}
                required
              />
            </div>

            {error && (
              <div className={`border rounded p-3 text-sm transition-all ${isGameMode ? 'bg-[#ff6b6b]/10 border-[#ff6b6b] text-[#ff6b6b] border-2' : 'bg-destructive/10 border-destructive/50 text-destructive'}`} style={isGameMode ? { fontFamily: 'var(--font-pixel)', fontSize: '10px' } : {}}>
                {isGameMode ? '! ERROR: ' + error : error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className={`w-full font-semibold transition-all ${isGameMode ? 'bg-[#00ff41] hover:bg-[#00cc33] text-[#1a1a2e] border-2 border-[#00ff41] shadow-[0_0_15px_rgba(0,255,65,0.5)]' : 'bg-primary hover:bg-primary/90 text-primary-foreground'}`}
              style={isGameMode ? { fontFamily: 'var(--font-pixel)', fontSize: '12px' } : {}}
            >
              {loading ? (isGameMode ? 'CREATING...' : 'Creating Account...') : (isGameMode ? '> REGISTER_' : 'Create Account')}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className={`text-sm ${secondaryTextClass}`} style={isGameMode ? { fontFamily: 'var(--font-pixel)', fontSize: '8px' } : {}}>
              {isGameMode ? 'ALREADY_EXIST?' : 'Already have an account?'}{' '}
              <Link to="/login" className={`font-medium ${isGameMode ? 'text-[#ffe66d] hover:text-[#ffd700]' : 'text-primary hover:text-primary/80'}`}>
                {isGameMode ? 'LOGIN' : 'Sign In'}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
