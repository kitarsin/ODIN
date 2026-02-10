import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

// 1. Update the User Type to match what your UI components expect
type User = {
  id: string;
  email: string;
  name: string;        // UI expects 'name', DB has 'full_name'
  studentId: string;   // UI expects 'studentId', DB has 'student_id'
  role: string;
  section: string;
  avatar: string;
  syncRate: number;    // UI expects 'syncRate', DB has 'sync_rate'
  status: string;
  // Add these defaults so your dashboard doesn't crash if they are missing
  progress: { arrays: number; loops: number; grids: number }; 
  badges: string[];
};

const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check active session on load
    supabase.auth.getSession()
      .then(({ data: { session } }: any) => {
        if (session) {
          fetchProfile(session.user);
        } else {
          setLoading(false);
        }
      })
      .catch((err: any) => {
        console.error("Failed to get session:", err);
        setError("Failed to initialize authentication");
        setLoading(false);
      });

    // Listen for changes (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: string, session: any) => {
      if (session) fetchProfile(session.user);
      else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription?.unsubscribe();
  }, []);

  // 2. THE FIX: Map Database Fields (snake_case) to UI Fields (camelCase)
  const fetchProfile = async (authUser: any) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (error) throw error;

      if (data) {
        setUser({
          id: authUser.id,
          email: authUser.email,
          name: data.full_name,         // MAP THIS
          studentId: data.student_id,   // MAP THIS
          section: data.section,
          role: data.role || 'student',
          avatar: data.avatar_url || '🧑‍🎓',
          syncRate: data.sync_rate || 100, // MAP THIS
          status: 'active',
          // Mocking these for now until you create real tables for them
          progress: { arrays: 0, loops: 0, grids: 0 },
          badges: [] 
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  // Update password for current user
  const updatePassword = async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
  };

  // Update profile avatar for current user
  const updateProfileAvatar = async (avatarUrl: string) => {
    if (!user) throw new Error('No user logged in');
    const { error } = await supabase
      .from('profiles')
      .update({ avatar_url: avatarUrl })
      .eq('id', user.id);
    if (error) throw error;
    // Optionally update local state
    setUser({ ...user, avatar: avatarUrl });
  };

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    // navigation should be handled by the caller (page) to avoid router/provider ordering issues
  };

  const register = async (email: string, password: string, name: string, studentId: string, section: string) => {
    // 1. Create Auth User
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;

    if (data.user) {
      // 2. Create Profile Entry using correct DB column names
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          { 
            id: data.user.id, 
            full_name: name,       // Insert as full_name
            student_id: studentId, // Insert as student_id
            section: section,
            sync_rate: 100
          }
        ]);
      if (profileError) throw profileError;
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  // Show error screen if initialization failed
  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh',
        backgroundColor: '#0F172A',
        color: '#F1F5F9',
        fontFamily: 'monospace',
        padding: '20px',
        textAlign: 'center'
      }}>
        <h1 style={{ color: '#EF4444', fontSize: '24px', marginBottom: '10px' }}>⚠️ Initialization Error</h1>
        <p style={{ fontSize: '14px', marginBottom: '20px' }}>{error}</p>
        <p style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '20px' }}>
          Check your browser console and Vercel environment variables.
        </p>
        <button 
          onClick={() => window.location.reload()}
          style={{
            padding: '10px 20px',
            backgroundColor: '#10B981',
            color: '#0F172A',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontFamily: 'monospace',
            fontSize: '14px',
            fontWeight: 'bold'
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  // Always render children - let router handle the UI based on auth state
  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, updatePassword, updateProfileAvatar }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);