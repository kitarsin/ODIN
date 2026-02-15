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
  achievements: Achievement[];
};

type Achievement = {
  id: string;
  name: string;
  emoji: string;
  description: string;
  unlockedAt: string;
  type: 'success' | 'diagnosis';
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
      if (session) {
        setLoading(true);
        fetchProfile(session.user);
      } else {
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

      if (error) {
        console.error("Error fetching profile:", error);
        // If profile doesn't exist yet, create default user object
        setUser({
          id: authUser.id,
          email: authUser.email,
          name: 'User',
          studentId: '',
          section: '',
          role: 'student',
          avatar: '🧑‍🎓',
          syncRate: 0,
          status: 'active',
          progress: { arrays: 0, loops: 0, grids: 0 },
          badges: [],
          achievements: []
        });
        setLoading(false);
        return;
      }

      if (data) {
        const rawSyncRate = Number(data.sync_rate);
        const syncRate = Number.isFinite(rawSyncRate) ? rawSyncRate : 0;
        const achievementsData = data.achievements ? JSON.parse(data.achievements) : [];
        const badgesData = data.badges ? JSON.parse(data.badges) : [];
        
        setUser({
          id: authUser.id,
          email: authUser.email,
          name: data.full_name || 'User',
          studentId: data.student_id || '',
          section: data.section || '',
          role: data.role || 'student',
          avatar: data.avatar_url || '🧑‍🎓',
          syncRate,
          status: 'active',
          progress: { arrays: 0, loops: 0, grids: 0 },
          badges: badgesData,
          achievements: achievementsData
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
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        throw error;
      }
      // Wait for session to be established
      await new Promise(resolve => setTimeout(resolve, 300));
    } finally {
      // Don't set loading to false here - let onAuthStateChange handle it
      // This prevents race conditions
    }
  };

  const register = async (email: string, password: string, name: string, studentId: string, section: string) => {
    setLoading(true);
    try {
      // 1. Create Auth User
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) {
        throw error;
      }

      if (!data.user) {
        throw new Error('Failed to create user account');
      }

      // 2. Create Profile Entry using correct DB column names
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          { 
            id: data.user.id, 
            full_name: name,
            student_id: studentId,
            section: section,
            sync_rate: 100,
            role: 'student',
            avatar_url: '🧑‍🎓',
            badges: JSON.stringify([]),
            achievements: JSON.stringify([])
          }
        ]);
      
      if (profileError) {
        console.error('Profile creation error:', profileError);
        throw new Error('Failed to create user profile. Please try again.');
      }

      // 3. Sign in the newly created user
      if (!data.session) {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) {
          throw signInError;
        }
      }
      
      // Wait a brief moment for the auth state to update
      await new Promise(resolve => setTimeout(resolve, 500));
    } finally {
      // Don't set loading to false here - let onAuthStateChange handle it
      // This prevents race conditions
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  // Add a new achievement to the user's profile
  const addAchievement = async (achievement: Omit<Achievement, 'id'>) => {
    if (!user) {
      console.error('No user logged in');
      return;
    }

    try {
      const newAchievement: Achievement = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        ...achievement,
      };

      const updatedAchievements = [...(user.achievements || []), newAchievement];
      
      // Update database
      const { error } = await supabase
        .from('profiles')
        .update({ achievements: JSON.stringify(updatedAchievements) })
        .eq('id', user.id);

      if (error) {
        console.error('Error saving achievement:', error);
        return;
      }

      // Update local state
      setUser({
        ...user,
        achievements: updatedAchievements,
        badges: [...(user.badges || []), achievement.name],
      });
    } catch (error) {
      console.error('Error adding achievement:', error);
    }
  };

  // Show error screen if initialization failed
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground font-mono px-5 text-center">
        <h1 className="text-2xl text-destructive mb-2">⚠️ Initialization Error</h1>
        <p className="text-sm mb-5">{error}</p>
        <p className="text-xs text-muted-foreground mb-5">
          Check your browser console and Vercel environment variables.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-5 py-2 rounded bg-primary text-primary-foreground font-semibold text-sm"
        >
          Retry
        </button>
      </div>
    );
  }

  // Always render children - let router handle the UI based on auth state
  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, updatePassword, updateProfileAvatar, addAchievement }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);