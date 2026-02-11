import { useState, useEffect } from 'react';
import { Navigation } from '../components/Navigation';
import { Search, UserPlus, Pencil, Trash2, Database } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Checkbox } from '../components/ui/checkbox';
import { UserModal } from '../components/UserModal';
import { supabase } from '../../lib/supabaseClient'; // Import client

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
}

export function AdminDatabase() {
  const [users, setUsers] = useState<User[]>([]); // Initialize empty
  const [_loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSection, setFilterSection] = useState('all');
  const [roleFilter, setRoleFilter] = useState<'all' | 'student' | 'admin'>('all');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const sections = ['all', ...Array.from(new Set(users.map(u => u.section)))];

  const isAvatarUrl = (value: string) => value.startsWith('http') || value.startsWith('data:');

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
      const formattedUsers = data.map((u: any) => ({
        id: u.id,
        name: u.full_name,
        studentId: u.student_id,
        role: u.role,
        section: u.section,
        avatar: u.avatar_url || '🧑‍🎓',
        syncRate: u.sync_rate || 0,
        lastLogin: u.created_at, // or a real last_login column if you added it
        status: 'active' as const
      }));

      setUsers(formattedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
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
        status: 'active'
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