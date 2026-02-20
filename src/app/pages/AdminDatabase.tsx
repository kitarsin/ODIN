import { useState, useEffect } from 'react';
import { Navigation } from '../components/Navigation';
import { Search, UserPlus, Pencil, Trash2, Database } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Checkbox } from '../components/ui/checkbox';
import { UserModal } from '../components/UserModal';
import { supabase } from '../../lib/supabaseClient'; // Import client
import { calculateSyncRate } from '../utils/achievementCatalog';

interface User {
  id: string;
  name: string;
  studentId: string;
  role: 'student' | 'admin';
  section: string;
  avatar: string;
  syncRate: number;
  lastLogin: string;
  status: 'active' | 'inactive';
  achievements: Achievement[];
  badges: string[];
}

type Achievement = {
  id: string;
  name: string;
  emoji?: string;
  description?: string;
  unlockedAt?: string;
  type?: 'success' | 'diagnosis';
};

const mockStudents: User[] = [
  {
    id: 'mock-student-1',
    name: 'Alex Chen',
    studentId: 'S001',
    role: 'student',
    section: 'Section A',
    avatar: '👨‍💻',
    syncRate: 85,
    lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    status: 'active',
    achievements: [
      { id: 'ach-1', name: 'Array Master', emoji: '🎯', description: 'Mastered array operations', unlockedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), type: 'success' },
      { id: 'ach-2', name: 'Loop Expert', emoji: '🔄', description: 'Completed all loop challenges', unlockedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), type: 'success' },
      { id: 'ach-3', name: 'Syntax Ninja', emoji: '⚡', description: '0 compilation errors', unlockedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), type: 'success' },
      { id: 'ach-4', name: 'Debug Detective', emoji: '🔍', description: 'Successfully debugged 10 issues', unlockedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), type: 'diagnosis' },
    ],
    badges: ['Week Warrior', 'Early Bird', 'Consistency Champion'],
  },
  {
    id: 'mock-student-2',
    name: 'Sarah Kim',
    studentId: 'S002',
    role: 'student',
    section: 'Section B',
    avatar: '👩‍💼',
    syncRate: 72,
    lastLogin: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    status: 'active',
    achievements: [
      { id: 'ach-5', name: 'Array Master', emoji: '🎯', description: 'Mastered array operations', unlockedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(), type: 'success' },
      { id: 'ach-6', name: 'Loop Expert', emoji: '🔄', description: 'Completed all loop challenges', unlockedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), type: 'success' },
      { id: 'ach-7', name: 'Rising Star', emoji: '⭐', description: 'Reached 1000 XP', unlockedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), type: 'success' },
    ],
    badges: ['Quick Learner', 'Problem Solver'],
  },
  {
    id: 'mock-student-3',
    name: 'Marcus Johnson',
    studentId: 'S003',
    role: 'student',
    section: 'Section A',
    avatar: '👨‍🎓',
    syncRate: 58,
    lastLogin: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    status: 'active',
    achievements: [
      { id: 'ach-8', name: 'First Steps', emoji: '🚀', description: 'Completed first level', unlockedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), type: 'success' },
      { id: 'ach-9', name: 'Index Logic', emoji: '📍', description: 'Mastered array indexing', unlockedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(), type: 'success' },
    ],
    badges: ['Newcomer'],
  },
  {
    id: 'mock-student-4',
    name: 'Emma Rodriguez',
    studentId: 'S004',
    role: 'student',
    section: 'Section C',
    avatar: '👩‍🦰',
    syncRate: 91,
    lastLogin: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    status: 'active',
    achievements: [
      { id: 'ach-10', name: 'Array Master', emoji: '🎯', description: 'Mastered array operations', unlockedAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(), type: 'success' },
      { id: 'ach-11', name: 'Loop Expert', emoji: '🔄', description: 'Completed all loop challenges', unlockedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), type: 'success' },
      { id: 'ach-12', name: 'Syntax Ninja', emoji: '⚡', description: '0 compilation errors', unlockedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), type: 'success' },
      { id: 'ach-13', name: 'Debug Detective', emoji: '🔍', description: 'Successfully debugged 10 issues', unlockedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), type: 'diagnosis' },
      { id: 'ach-14', name: 'Rising Star', emoji: '⭐', description: 'Reached 1000 XP', unlockedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), type: 'success' },
    ],
    badges: ['Week Warrior', 'Consistency Champion', 'Perfect Submissions', 'Speed Demon'],
  },
  {
    id: 'mock-student-5',
    name: 'David Park',
    studentId: 'S005',
    role: 'student',
    section: 'Section B',
    avatar: '👨‍🏫',
    syncRate: 64,
    lastLogin: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    status: 'active',
    achievements: [
      { id: 'ach-15', name: 'Array Master', emoji: '🎯', description: 'Mastered array operations', unlockedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), type: 'success' },
      { id: 'ach-16', name: 'Loop Expert', emoji: '🔄', description: 'Completed all loop challenges', unlockedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), type: 'success' },
    ],
    badges: ['Consistent', 'Team Player'],
  },
  {
    id: 'mock-student-6',
    name: 'Lisa Thompson',
    studentId: 'S006',
    role: 'student',
    section: 'Section C',
    avatar: '👩‍💻',
    syncRate: 79,
    lastLogin: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    status: 'active',
    achievements: [
      { id: 'ach-17', name: 'Array Master', emoji: '🎯', description: 'Mastered array operations', unlockedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(), type: 'success' },
      { id: 'ach-18', name: 'Loop Expert', emoji: '🔄', description: 'Completed all loop challenges', unlockedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), type: 'success' },
      { id: 'ach-19', name: 'Syntax Ninja', emoji: '⚡', description: '0 compilation errors', unlockedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), type: 'success' },
      { id: 'ach-20', name: 'Rising Star', emoji: '⭐', description: 'Reached 1000 XP', unlockedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), type: 'success' },
    ],
    badges: ['Week Warrior', 'Quick Learner'],
  },
];

export function AdminDatabase() {
  const [users, setUsers] = useState<User[]>(mockStudents); // Initialize with mock students
  const [_loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSection, setFilterSection] = useState('all');
  const [roleFilter, setRoleFilter] = useState<'all' | 'student' | 'admin'>('all');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [maintenanceStatus, setMaintenanceStatus] = useState<'idle' | 'running' | 'done' | 'error'>('idle');
  const [maintenanceMessage, setMaintenanceMessage] = useState('');

  const sections = ['all', ...Array.from(new Set(users.map(u => u.section)))];

  const isAvatarUrl = (value: string) => value.startsWith('http') || value.startsWith('data:');

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

  const dedupeBadges = (value: unknown) => {
    const rawBadges = coerceJsonArray(value)
      .filter((badge) => typeof badge === 'string') as string[];
    const seen = new Set<string>();
    const result: string[] = [];
    for (const badge of rawBadges) {
      const normalized = badge.trim();
      if (!normalized || seen.has(normalized)) continue;
      seen.add(normalized);
      result.push(normalized);
    }
    return result;
  };

  const normalizeAchievementKey = (achievement: Achievement) => {
    const name = `${achievement.name || ''}`.trim().toLowerCase();
    const type = `${achievement.type || ''}`.trim().toLowerCase();
    return `${name}::${type}`;
  };

  const dedupeAchievements = (value: unknown) => {
    const rawAchievements = coerceJsonArray(value)
      .filter((achievement) => achievement && typeof achievement === 'object') as Achievement[];
    const seen = new Set<string>();
    const result: Achievement[] = [];

    for (const achievement of rawAchievements) {
      const key = normalizeAchievementKey(achievement);
      if (!key || seen.has(key)) continue;
      seen.add(key);
      result.push(achievement);
    }

    return result;
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.studentId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSection = filterSection === 'all' || user.section === filterSection;
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesSection && matchesRole;
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      // Fetch from your 'profiles' table
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Map DB fields to your UI 'User' type if they differ
      // e.g. DB has 'full_name', UI expects 'name'
      const formattedUsers = data.map((u: any) => {
        const achievements = dedupeAchievements(u.achievements);
        const badges = dedupeBadges(u.badges);
        const syncRate = calculateSyncRate(achievements, badges);

        return {
        id: u.id,
        name: u.full_name,
        studentId: u.student_id,
        role: u.role,
        section: u.section,
        avatar: u.avatar_url || '🧑‍🎓',
          syncRate,
        lastLogin: u.created_at, // or a real last_login column if you added it
        status: 'active' as const,
        achievements,
        badges
      };
    });

      // Use mock students as fallback if no real users found
      if (formattedUsers.length > 0) {
        setUsers(formattedUsers);
      } else {
        setUsers(mockStudents);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      // Use mock students as fallback on error
      setUsers(mockStudents);
    } finally {
      setLoading(false);
    }
  };

  const handleDedupBadges = async () => {
    if (!confirm('De-duplicate badges for all profiles? This will update stored data.')) {
      return;
    }

    try {
      setMaintenanceStatus('running');
      setMaintenanceMessage('Scanning profiles...');

      const { data, error } = await supabase
        .from('profiles')
        .select('id, badges');

      if (error) throw error;

      let updatedCount = 0;
      const rows = data || [];

      for (const row of rows) {
        const dedupedBadges = dedupeBadges((row as any).badges);
        const originalBadges = coerceJsonArray((row as any).badges);
        const originalCount = originalBadges.length;

        if (dedupedBadges.length !== originalCount) {
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ badges: dedupedBadges })
            .eq('id', (row as any).id);

          if (updateError) {
            throw updateError;
          }
          updatedCount += 1;
        }
      }

      setMaintenanceStatus('done');
      setMaintenanceMessage(`Badges de-duplicated for ${updatedCount} profile(s).`);
      await fetchUsers();
    } catch (error) {
      console.error('Error de-duplicating badges:', error);
      setMaintenanceStatus('error');
      setMaintenanceMessage('Unable to de-duplicate badges. Check console for details.');
    }
  };

  const handleDedupAchievements = async () => {
    if (!confirm('De-duplicate achievements for all profiles? This will update stored data.')) {
      return;
    }

    try {
      setMaintenanceStatus('running');
      setMaintenanceMessage('Scanning profiles...');

      const { data, error } = await supabase
        .from('profiles')
        .select('id, achievements');

      if (error) throw error;

      let updatedCount = 0;
      const rows = data || [];

      for (const row of rows) {
        const dedupedAchievements = dedupeAchievements((row as any).achievements);
        const originalAchievements = coerceJsonArray((row as any).achievements);
        const originalCount = originalAchievements.length;

        if (dedupedAchievements.length !== originalCount) {
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ achievements: dedupedAchievements })
            .eq('id', (row as any).id);

          if (updateError) {
            throw updateError;
          }
          updatedCount += 1;
        }
      }

      setMaintenanceStatus('done');
      setMaintenanceMessage(`Achievements de-duplicated for ${updatedCount} profile(s).`);
      await fetchUsers();
    } catch (error) {
      console.error('Error de-duplicating achievements:', error);
      setMaintenanceStatus('error');
      setMaintenanceMessage('Unable to de-duplicate achievements. Check console for details.');
    }
  };

  const handleSelectAll = (checked: boolean | 'indeterminate') => {
    if (checked === true) {
      setSelectedUsers(filteredUsers.map(u => u.id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleSelectUser = (userId: string, checked: boolean | 'indeterminate') => {
    if (checked === true) {
      setSelectedUsers([...selectedUsers, userId]);
    } else {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  // Update Delete Logic
  const handleDelete = async (userId: string) => {
    if (confirm('Are you sure?')) {
      // Delete from Supabase (Requires RLS policy allowing delete)
      const { error } = await supabase.from('profiles').delete().eq('id', userId);
      
      if (!error) {
        setUsers(users.filter(u => u.id !== userId));
      } else {
        alert('Error deleting user');
      }
    }
  };

  const handleSaveUser = (userData: Partial<User>) => {
    if (editingUser) {
      // Update existing user
      setUsers(users.map(u => u.id === editingUser.id ? { ...u, ...userData } : u));
    } else {
      // Add new user
      const newUser: User = {
        id: Date.now().toString(),
        name: userData.name || '',
        studentId: userData.studentId || '',
        role: userData.role || 'student',
        section: userData.section || '',
        avatar: '🧑‍🎓',
        syncRate: 50,
        lastLogin: new Date().toISOString(),
        status: 'active',
        achievements: [],
        badges: []
      };
      setUsers([...users, newUser]);
    }
    setIsModalOpen(false);
    setEditingUser(null);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const studentUsers = users.filter(user => user.role === 'student');
  const totalAchievements = studentUsers.reduce(
    (sum, student) => sum + (student.achievements?.length || 0),
    0
  );
  const averageSyncRate = studentUsers.length
    ? Math.round(studentUsers.reduce((sum, student) => sum + (student.syncRate || 0), 0) / studentUsers.length)
    : 0;
  const topAchievers = [...studentUsers]
    .sort((a, b) => (b.achievements?.length || 0) - (a.achievements?.length || 0))
    .slice(0, 5);
  const recentAchievements = studentUsers
    .flatMap(student =>
      (student.achievements || []).map(achievement => ({
        studentId: student.id,
        studentName: student.name,
        studentSection: student.section,
        studentAvatar: student.avatar,
        achievement
      }))
    )
    .sort((a, b) => {
      const aTime = a.achievement.unlockedAt ? new Date(a.achievement.unlockedAt).getTime() : 0;
      const bTime = b.achievement.unlockedAt ? new Date(b.achievement.unlockedAt).getTime() : 0;
      return bTime - aTime;
    })
    .slice(0, 6);

  const handleResetSyncRate = async (student: User) => {
    const hasProgress = (student.achievements?.length || 0) > 0 || (student.badges?.length || 0) > 0;
    const confirmationMessage = hasProgress
      ? 'This student has achievements or badges. Reset sync rate to 0 anyway?'
      : 'Reset sync rate to 0 for this student?';

    if (!confirm(confirmationMessage)) {
      return;
    }

    const { error } = await supabase
      .from('profiles')
      .update({ sync_rate: 0 })
      .eq('id', student.id);

    if (error) {
      alert('Unable to reset sync rate.');
      return;
    }

    setUsers((current) =>
      current.map((user) =>
        user.id === student.id
          ? { ...user, syncRate: 0 }
          : user
      )
    );
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors">
      <Navigation />

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold mb-2 flex items-center gap-3">
            <Database className="w-7 h-7 text-primary" />
            Student Database
          </h1>
          <p className="text-sm text-muted-foreground">Manage user accounts and access permissions</p>
        </div>

        {/* Student Stats & Achievements */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="border rounded-lg p-6 bg-card border-border transition-colors">
            <h2 className="text-sm font-semibold mb-3 text-muted-foreground">Student Count</h2>
            <p className="text-3xl font-semibold" style={{ fontFamily: 'var(--font-mono)' }}>
              {studentUsers.length}
            </p>
            <p className="text-xs text-muted-foreground mt-2">Active student profiles</p>
          </div>
          <div className="border rounded-lg p-6 bg-card border-border transition-colors">
            <h2 className="text-sm font-semibold mb-3 text-muted-foreground">Total Achievements</h2>
            <p className="text-3xl font-semibold" style={{ fontFamily: 'var(--font-mono)' }}>
              {totalAchievements}
            </p>
            <p className="text-xs text-muted-foreground mt-2">Unlocked across all students</p>
          </div>
          <div className="border rounded-lg p-6 bg-card border-border transition-colors">
            <h2 className="text-sm font-semibold mb-3 text-muted-foreground">Average Sync Rate</h2>
            <p className="text-3xl font-semibold text-primary" style={{ fontFamily: 'var(--font-mono)' }}>
              {averageSyncRate}%
            </p>
            <p className="text-xs text-muted-foreground mt-2">Overall mastery signal</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="border rounded-lg p-6 bg-card border-border transition-colors">
            <h2 className="text-lg font-semibold mb-4">Top Achievers</h2>
            <div className="space-y-3">
              {topAchievers.map(student => (
                <div
                  key={student.id}
                  className="flex items-center justify-between border rounded-lg p-3 bg-muted/40 border-border"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl bg-muted overflow-hidden">
                      {isAvatarUrl(student.avatar) ? (
                        <img
                          src={student.avatar}
                          alt={`${student.name} avatar`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span>{student.avatar}</span>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{student.name}</p>
                      <p className="text-xs text-muted-foreground" style={{ fontFamily: 'var(--font-mono)' }}>
                        {student.studentId} • {student.section}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-primary" style={{ fontFamily: 'var(--font-mono)' }}>
                      {student.achievements?.length || 0}
                    </p>
                    <p className="text-xs text-muted-foreground">Achievements</p>
                  </div>
                </div>
              ))}
              {topAchievers.length === 0 && (
                <p className="text-sm text-muted-foreground">No achievements recorded yet.</p>
              )}
            </div>
          </div>

          <div className="border rounded-lg p-6 bg-card border-border transition-colors">
            <h2 className="text-lg font-semibold mb-4">Recent Achievements</h2>
            <div className="space-y-3">
              {recentAchievements.map(item => (
                <div
                  key={`${item.studentId}-${item.achievement.id}`}
                  className="flex items-center justify-between border rounded-lg p-3 bg-muted/40 border-border"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl bg-muted overflow-hidden">
                      {isAvatarUrl(item.studentAvatar) ? (
                        <img
                          src={item.studentAvatar}
                          alt={`${item.studentName} avatar`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span>{item.studentAvatar}</span>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {(item.achievement.emoji || '🏅') + ' '}
                        {item.achievement.name || 'Achievement'}
                      </p>
                      <p className="text-xs text-muted-foreground" style={{ fontFamily: 'var(--font-mono)' }}>
                        {item.studentName} • {item.studentSection}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground" style={{ fontFamily: 'var(--font-mono)' }}>
                      {item.achievement.unlockedAt ? formatDate(item.achievement.unlockedAt) : 'Unlogged'}
                    </p>
                  </div>
                </div>
              ))}
              {recentAchievements.length === 0 && (
                <p className="text-sm text-muted-foreground">No recent achievement activity.</p>
              )}
            </div>
          </div>
        </div>

        {/* Maintenance */}
        <div className="border rounded-lg p-6 bg-card border-border transition-colors mb-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold mb-1">Maintenance Utilities</h2>
              <p className="text-sm text-muted-foreground">
                One-time admin actions to fix legacy data issues.
              </p>
            </div>
            <Button
              onClick={handleDedupBadges}
              disabled={maintenanceStatus === 'running'}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {maintenanceStatus === 'running' ? 'Running...' : 'De-dup Badges'}
            </Button>
            <Button
              onClick={handleDedupAchievements}
              disabled={maintenanceStatus === 'running'}
              className="bg-secondary hover:bg-secondary/90 text-secondary-foreground"
            >
              {maintenanceStatus === 'running' ? 'Running...' : 'De-dup Achievements'}
            </Button>
          </div>
          {maintenanceMessage && (
            <div
              className={`mt-4 text-sm ${
                maintenanceStatus === 'error' ? 'text-destructive' : 'text-muted-foreground'
              }`}
            >
              {maintenanceMessage}
            </div>
          )}
        </div>

        {/* Toolbar */}
        <div className="border rounded-lg p-4 mb-6 bg-card border-border transition-colors">
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by name or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border bg-background border-border text-foreground transition-colors"
              />
            </div>

            {/* Filter by Section */}
            <select
              value={filterSection}
              onChange={(e) => setFilterSection(e.target.value)}
              className="px-4 py-2 border rounded-md text-sm bg-background border-border text-foreground transition-colors"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              {sections.map(section => (
                <option key={section} value={section}>
                  {section === 'all' ? 'All Sections' : section}
                </option>
              ))}
            </select>

            {/* Filter by Role */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as 'all' | 'student' | 'admin')}
              className="px-4 py-2 border rounded-md text-sm bg-background border-border text-foreground transition-colors"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              <option value="all">All Roles</option>
              <option value="student">Students</option>
              <option value="admin">Admins</option>
            </select>

            {/* Add User Button */}
            <Button
              onClick={() => {
                setEditingUser(null);
                setIsModalOpen(true);
              }}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Add New User
            </Button>
          </div>
        </div>

        {/* Data Table */}
        <div className="border rounded-lg overflow-hidden bg-card border-border transition-colors">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/40 transition-colors">
                  <th className="px-4 py-3 text-left">
                    <Checkbox
                      checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Avatar
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Student ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Section
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Last Login
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user, idx) => (
                  <tr
                    key={user.id}
                    className={`border-b border-border hover:bg-muted transition-colors ${
                      idx % 2 === 0 ? 'bg-card' : 'bg-muted/20'
                    }`}
                  >
                    <td className="px-4 py-3">
                      <Checkbox
                        checked={selectedUsers.includes(user.id)}
                        onCheckedChange={(checked) => handleSelectUser(user.id, checked as boolean)}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl bg-muted overflow-hidden">
                        {isAvatarUrl(user.avatar) ? (
                          <img
                            src={user.avatar}
                            alt={`${user.name} avatar`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span>{user.avatar}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">{user.name}</td>
                    <td className="px-4 py-3 text-sm text-secondary" style={{ fontFamily: 'var(--font-mono)' }}>
                      {user.studentId}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground" style={{ fontFamily: 'var(--font-mono)' }}>
                      {user.section}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.status === 'active'
                            ? 'bg-primary/20 text-primary'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground" style={{ fontFamily: 'var(--font-mono)' }}>
                      {formatDate(user.lastLogin)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => handleEdit(user)}
                          variant="ghost"
                          size="sm"
                          className="text-secondary hover:text-secondary hover:bg-secondary/10 transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        {user.role === 'student' && (
                          <Button
                            onClick={() => handleResetSyncRate(user)}
                            variant="ghost"
                            size="sm"
                            className="text-primary hover:text-primary hover:bg-primary/10 transition-colors"
                          >
                            Reset Sync
                          </Button>
                        )}
                        <Button
                          onClick={() => handleDelete(user.id)}
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-border bg-muted/40 flex items-center justify-between transition-colors">
            <div className="text-sm text-muted-foreground">
              Showing {filteredUsers.length} of {users.length} users
              {selectedUsers.length > 0 && (
                <span className="ml-4 text-primary">
                  {selectedUsers.length} selected
                </span>
              )}
            </div>
            <div className="text-xs text-muted-foreground" style={{ fontFamily: 'var(--font-mono)' }}>
              Last updated: {new Date().toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* User Modal */}
      <UserModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingUser(null);
        }}
        onSave={handleSaveUser}
        user={editingUser}
      />
    </div>
  );
}