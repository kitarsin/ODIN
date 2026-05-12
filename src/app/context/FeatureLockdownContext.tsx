import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from './AuthContext';

// ─── Feature keys ────────────────────────────────────────────────────────────
export const LOCKABLE_FEATURES = [
  { key: 'dashboard', label: 'Dashboard', icon: 'Home' },
  { key: 'game', label: 'Game', icon: 'Gamepad2' },
  { key: 'wiki', label: 'Wiki', icon: 'Book' },
  { key: 'profile', label: 'Profile', icon: 'User' },
  { key: 'account-settings', label: 'Account Settings', icon: 'Settings' },
  { key: 'test-bench', label: 'Test Bench', icon: 'FlaskConical' },
  { key: 'posttest', label: 'Post Test', icon: 'ClipboardList' },
] as const;

export type FeatureKey = (typeof LOCKABLE_FEATURES)[number]['key'];

// ─── Rule shape ──────────────────────────────────────────────────────────────
export interface LockdownRule {
  id: string;
  feature_key: FeatureKey;
  is_active: boolean;
  scope: 'all' | 'section' | 'student';
  scope_value: string | null;
  message: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export type NewLockdownRule = Pick<LockdownRule, 'feature_key' | 'scope' | 'scope_value' | 'message'>;

// ─── Context value ───────────────────────────────────────────────────────────
interface FeatureLockdownContextValue {
  rules: LockdownRule[];
  loading: boolean;
  /** Returns the blocking message (or '') if the feature is locked for the current user, else null. */
  isFeatureLocked: (featureKey: string) => { locked: boolean; message: string };
  addRule: (rule: NewLockdownRule) => Promise<void>;
  updateRule: (id: string, updates: Partial<Pick<LockdownRule, 'is_active' | 'message' | 'scope' | 'scope_value' | 'feature_key'>>) => Promise<void>;
  deleteRule: (id: string) => Promise<void>;
  refreshRules: () => Promise<void>;
}

const FeatureLockdownContext = createContext<FeatureLockdownContextValue | null>(null);

// ─── Provider ────────────────────────────────────────────────────────────────
export function FeatureLockdownProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [rules, setRules] = useState<LockdownRule[]>([]);
  const [loading, setLoading] = useState(true);
  const hasFetched = useRef(false);

  // Fetch all rules (active + inactive for admins, only active for students)
  const fetchRules = useCallback(async () => {
    try {
      setLoading(true);
      let query = supabase.from('feature_lockdowns').select('*').order('created_at', { ascending: false });

      // Students only need to see active rules
      if (user?.role !== 'admin') {
        query = query.eq('is_active', true);
      }

      const { data, error } = await query;
      if (error) {
        console.error('Error fetching lockdown rules:', error);
        setRules([]);
        return;
      }

      setRules((data || []) as LockdownRule[]);
    } catch (err) {
      console.error('Error fetching lockdown rules:', err);
      setRules([]);
    } finally {
      setLoading(false);
    }
  }, [user?.role]);

  useEffect(() => {
    if (user && !hasFetched.current) {
      hasFetched.current = true;
      fetchRules();
    }
    if (!user) {
      hasFetched.current = false;
      setRules([]);
      setLoading(false);
    }
  }, [user, fetchRules]);

  // Check whether a feature is locked for the current user
  const isFeatureLocked = useCallback(
    (featureKey: string): { locked: boolean; message: string } => {
      // Admins are never locked out
      if (!user || user.role === 'admin') {
        return { locked: false, message: '' };
      }

      // Find the first active rule that blocks this user for this feature
      const blockingRule = rules.find((rule) => {
        if (rule.feature_key !== featureKey || !rule.is_active) return false;

        switch (rule.scope) {
          case 'all':
            return true;
          case 'section':
            return rule.scope_value === user.section;
          case 'student':
            return rule.scope_value === user.id;
          default:
            return false;
        }
      });

      if (blockingRule) {
        return {
          locked: true,
          message: blockingRule.message || 'This feature is currently unavailable.',
        };
      }

      return { locked: false, message: '' };
    },
    [user, rules],
  );

  // CRUD — only admins should call these, but we trust the caller + RLS
  const addRule = useCallback(
    async (rule: NewLockdownRule) => {
      const { error } = await supabase.from('feature_lockdowns').insert([
        {
          feature_key: rule.feature_key,
          scope: rule.scope,
          scope_value: rule.scope_value || null,
          message: rule.message || null,
          is_active: true,
          created_by: user?.id ?? null,
        },
      ]);
      if (error) throw error;
      await fetchRules();
    },
    [user?.id, fetchRules],
  );

  const updateRule = useCallback(
    async (id: string, updates: Partial<Pick<LockdownRule, 'is_active' | 'message' | 'scope' | 'scope_value' | 'feature_key'>>) => {
      const { error } = await supabase
        .from('feature_lockdowns')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
      await fetchRules();
    },
    [fetchRules],
  );

  const deleteRule = useCallback(
    async (id: string) => {
      const { error } = await supabase.from('feature_lockdowns').delete().eq('id', id);
      if (error) throw error;
      await fetchRules();
    },
    [fetchRules],
  );

  const refreshRules = useCallback(async () => {
    await fetchRules();
  }, [fetchRules]);

  return (
    <FeatureLockdownContext.Provider
      value={{ rules, loading, isFeatureLocked, addRule, updateRule, deleteRule, refreshRules }}
    >
      {children}
    </FeatureLockdownContext.Provider>
  );
}

export function useFeatureLockdown() {
  const ctx = useContext(FeatureLockdownContext);
  if (!ctx) {
    throw new Error('useFeatureLockdown must be used within a FeatureLockdownProvider');
  }
  return ctx;
}
