import { useState } from 'react';
import { Link } from 'react-router-dom';
import logo64 from '../../img/brand/odin-logo-transparent-64.png';
import logo128 from '../../img/brand/odin-logo-transparent-128.png';
import logo256 from '../../img/brand/odin-logo-transparent-256.png';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';

export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { resetPasswordForEmail } = useAuth();
  const { isGameMode } = useTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      await resetPasswordForEmail(email);
      setMessage('Check your email for the password reset link.');
    } catch (err: any) {
      setError(err?.message || 'Failed to send reset email. Please try again.');
    }
    setLoading(false);
  };

  const isSubmitting = loading;
  const canSubmit = email.trim().length > 0;

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
              {isGameMode ? '> RESET_PASSWORD' : 'Password Reset'}
            </h1>
            <p className={`text-sm ${getSecondaryText()}`}
               style={isGameMode ? { fontFamily: 'var(--font-pixel)', fontSize: '8px' } : {}}>
              {isGameMode ? 'ENTER_CREDENTIALS' : 'Enter your email to receive a reset link'}
            </p>
          </div>

          {/* Form */}
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
                  if (message) setMessage('');
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

            {message && (
              <div className={`border rounded p-3 text-sm transition-all ${
                isGameMode
                  ? 'bg-[#00ff41]/10 border-[#00ff41] text-[#00ff41] border-2'
                  : 'bg-green-500/10 border-green-500/50 text-green-600'
              }`}
                   style={isGameMode ? { fontFamily: 'var(--font-pixel)', fontSize: '10px' } : {}}
                   role="alert"
                   aria-live="polite">
                {isGameMode ? '> SUCCESS: ' + message : message}
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
              {isSubmitting ? (isGameMode ? 'SENDING...' : 'Sending Link...') : (isGameMode ? '> SEND_LINK_' : 'Send Reset Link')}
            </Button>
          </form>

          {/* Links */}
          <div className="mt-6 text-center">
            <p className={`text-sm ${getSecondaryText()}`}
               style={isGameMode ? { fontFamily: 'var(--font-pixel)', fontSize: '8px' } : {}}>
              <Link to="/login" className={`font-medium ${
                isGameMode ? 'text-[#ffe66d] hover:text-[#ffd700]' : 
                'text-primary hover:text-primary/80'
              }`}>
                {isGameMode ? '< BACK_TO_LOGIN' : 'Return to Login'}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
