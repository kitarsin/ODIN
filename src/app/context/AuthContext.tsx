import { createContext, useContext, useEffect, useRef, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { calculateSyncRate } from '../utils/achievementCatalog';

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
  pretestCompleted: boolean;
  // Add these defaults so your dashboard doesn't crash if they are missing
  progress: { arrays: number; loops: number; grids: number };
  badges: string[];
  achievements: Achievement[];
};

export type PretestResponse = {
  questionId: string;
  sequenceNumber: number;
  response: string;
  timeToFirstKeyMs: number;
  totalTimeMs: number;
  avgFlightTimeMs: number;
  avgDwellTimeMs: number;
  pasteCount: number;
  pasteCharCount: number;
  typedCharCount: number;
  isCorrect: boolean;
  /** Full timestamped event log for this problem */
  events: object[];
};

type Achievement = {
  id: string;
  name: string;
  emoji: string;
  description: string;
  unlockedAt: string;
  type: 'success' | 'diagnosis';
};

const coerceJsonArray = (value: unknown): any[] => {
  if (Array.isArray(value)) return value;
  if (!value) return [];
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.warn('Failed to parse json array:', error);
      return [];
    }
  }
  return [];
};

const normalizeAchievementKey = (achievement: Pick<Achievement, 'name' | 'type'>) => {
  return `${achievement.name}`.trim().toLowerCase() + '::' + achievement.type;
};

const dedupeAchievements = (achievements: Achievement[]) => {
  const seen = new Set<string>();
  const result: Achievement[] = [];
  for (const achievement of achievements) {
    const key = normalizeAchievementKey(achievement);
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(achievement);
  }
  return result;
};

const dedupeBadges = (badges: string[]) => {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const badge of badges) {
    const normalized = badge.trim();
    if (!normalized || seen.has(normalized)) continue;
    seen.add(normalized);
    result.push(normalized);
  }
  return result;
};

const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes of tab inactivity before session check
const LAST_HIDDEN_KEY = 'odin_tab_hidden_at';

const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Ref keeps the auth state change handler from capturing a stale user value
  const userRef = useRef<User | null>(null);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

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
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: string, session: any) => {
      // Use ref so this handler always sees the latest user value, not a stale closure
      if (event === 'SIGNED_IN' && !userRef.current) {
        setLoading(true);
        fetchProfile(session.user);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setLoading(false);
      }
      // Ignore TOKEN_REFRESHED and other events — they don't need a full reload
    });

    return () => subscription?.unsubscribe();
  }, []);

  // Persist session across tab switches; only invalidate after ample inactivity
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        localStorage.setItem(LAST_HIDDEN_KEY, Date.now().toString());
      } else if (document.visibilityState === 'visible') {
        const stored = localStorage.getItem(LAST_HIDDEN_KEY);
        if (stored && (Date.now() - parseInt(stored)) > SESSION_TIMEOUT_MS) {
          // Ample time has passed — verify the Supabase session is still alive
          supabase.auth.getSession().then(({ data: { session } }: any) => {
            if (!session) {
              setUser(null);
              setLoading(false);
            }
            // Session still valid: keep the existing user state untouched
          });
          localStorage.removeItem(LAST_HIDDEN_KEY);
        }
        // Tab returned quickly — do nothing, keep the current session as-is
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
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
          pretestCompleted: false,
          progress: { arrays: 0, loops: 0, grids: 0 },
          badges: [],
          achievements: []
        });
        setLoading(false);
        return;
      }

      if (data) {
        const rawSyncRate = Number(data.sync_rate);
        const achievementsData = dedupeAchievements(coerceJsonArray(data.achievements));
        const badgesData = dedupeBadges(coerceJsonArray((data as any).badges));
        const derivedBadges = achievementsData
          .map((achievement: any) => achievement?.name)
          .filter((name: unknown): name is string => typeof name === 'string' && name.length > 0);
        const finalBadges = badgesData.length > 0 ? badgesData : dedupeBadges(derivedBadges);
        const syncRate = calculateSyncRate(achievementsData, finalBadges);

        if (Number.isFinite(rawSyncRate) && rawSyncRate !== syncRate) {
          await supabase
            .from('profiles')
            .update({ sync_rate: syncRate })
            .eq('id', authUser.id);
        }
        
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
          pretestCompleted: data.pretest_completed ?? false,
          progress: { arrays: 0, loops: 0, grids: 0 },
          badges: finalBadges,
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

  // Send password reset email
  const resetPasswordForEmail = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    });
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
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await fetchProfile(session.user);
      } else {
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
      throw error;
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
            sync_rate: 0,
            role: 'student',
            avatar_url: '🧑‍🎓',
            achievements: []
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
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  const completePretest = async (responses: PretestResponse[]) => {
    if (!user) throw new Error('No user logged in');

    const rows = responses.map(r => ({
      user_id: user.id,
      question_id: r.questionId,
      sequence_number: r.sequenceNumber,
      response: r.response,
      time_to_first_key_ms: r.timeToFirstKeyMs,
      total_time_ms: r.totalTimeMs,
      avg_flight_time_ms: r.avgFlightTimeMs,
      avg_dwell_time_ms: r.avgDwellTimeMs,
      paste_count: r.pasteCount,
      paste_char_count: r.pasteCharCount,
      typed_char_count: r.typedCharCount,
      is_correct: r.isCorrect,
      raw_events: r.events,
    }));

    const { error: insertError } = await supabase.from('pretest_responses').insert(rows);
    if (insertError) throw insertError;

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ pretest_completed: true })
      .eq('id', user.id);
    if (updateError) throw updateError;

    setUser({ ...user, pretestCompleted: true });
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

      const existingAchievements = dedupeAchievements(user.achievements || []);
      const achievementKey = normalizeAchievementKey(newAchievement);
      const alreadyUnlocked = existingAchievements.some(
        (achievement) => normalizeAchievementKey(achievement) === achievementKey
      );

      if (alreadyUnlocked) {
        return;
      }

      const updatedAchievements = [...existingAchievements, newAchievement];
      const updatedBadges = dedupeBadges([...(user.badges || []), achievement.name]);
      const syncRate = calculateSyncRate(updatedAchievements, updatedBadges);
      
      // Update database
      const { error } = await supabase
        .from('profiles')
        .update({ achievements: updatedAchievements, badges: updatedBadges, sync_rate: syncRate })
        .eq('id', user.id);

      if (error) {
        console.error('Error saving achievement:', error);
        return;
      }

      // Update local state
      setUser({
        ...user,
        achievements: updatedAchievements,
        badges: updatedBadges,
        syncRate,
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
    <AuthContext.Provider value={{ user, login, register, logout, loading, updatePassword, resetPasswordForEmail, updateProfileAvatar, addAchievement, completePretest }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
