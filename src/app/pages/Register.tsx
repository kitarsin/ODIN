import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Terminal } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Pass the arguments in the order your AuthContext expects:
      // register(email, password, fullName, studentId, section)
      await register(email, password, name, studentId, section);
      // No need to navigate here, the AuthContext handles navigation or you can do it here
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-[#1E293B] border border-[#334155] rounded-lg p-8 shadow-2xl">
          {/* Logo & Title */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-[#10B981] rounded-lg flex items-center justify-center mb-4 relative">
              <Shield className="w-10 h-10 text-[#0F172A]" strokeWidth={2.5} />
              <Terminal className="w-6 h-6 text-[#0F172A] absolute bottom-2 right-2" />
            </div>
            <h1 className="text-2xl font-semibold text-[#F1F5F9] mb-1" style={{ fontFamily: 'var(--font-mono)' }}>
              Register New Account
            </h1>
            <p className="text-sm text-[#94A3B8]">Join the ODIN system</p>
          </div>

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-[#F1F5F9]">
                Full Name
              </Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                className="bg-[#0F172A] border-[#334155] text-[#F1F5F9] placeholder:text-[#64748B]"
                required
              />
            </div>

            {/* Add Email Input Field inside the form, maybe before Password */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[#F1F5F9]">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="bg-[#0F172A] border-[#334155] text-[#F1F5F9] placeholder:text-[#64748B]"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="studentId" className="text-[#F1F5F9]">
                Student ID
              </Label>
              <Input
                id="studentId"
                type="text"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder="Enter your student ID"
                className="bg-[#0F172A] border-[#334155] text-[#F1F5F9] placeholder:text-[#64748B]"
                style={{ fontFamily: 'var(--font-mono)' }}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="section" className="text-[#F1F5F9]">
                Class Section
              </Label>
              <Input
                id="section"
                type="text"
                value={section}
                onChange={(e) => setSection(e.target.value)}
                placeholder="e.g., CS-301A"
                className="bg-[#0F172A] border-[#334155] text-[#F1F5F9] placeholder:text-[#64748B]"
                style={{ fontFamily: 'var(--font-mono)' }}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-[#F1F5F9]">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password"
                className="bg-[#0F172A] border-[#334155] text-[#F1F5F9] placeholder:text-[#64748B]"
                required
              />
            </div>

            {error && (
              <div className="bg-[#EF4444]/10 border border-[#EF4444]/50 rounded p-3 text-sm text-[#EF4444]">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#10B981] hover:bg-[#059669] text-[#0F172A] font-semibold"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-[#94A3B8]">
              Already have an account?{' '}
              <Link to="/login" className="text-[#10B981] hover:text-[#059669] font-medium">
                Initialize Session
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
