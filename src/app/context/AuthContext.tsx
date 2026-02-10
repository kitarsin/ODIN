import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();

  useEffect(() => {
    // Check active session on load
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) fetchProfile(session.user);
      else setLoading(false);
    });

    // Listen for changes (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) fetchProfile(session.user);
      else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
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

  const login = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    navigate("/dashboard"); 
  };

  const register = async (email, password, name, studentId, section) => {
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
    navigate("/");
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);