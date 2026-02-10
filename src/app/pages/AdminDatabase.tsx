import { useState } from 'react';
import { Navigation } from '../components/Navigation';
import { Search, UserPlus, Pencil, Trash2, Database } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Checkbox } from '../components/ui/checkbox';
import { mockUsers } from '../context/AuthContext';
import { UserModal } from '../components/UserModal';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSection, setFilterSection] = useState('all');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const sections = ['all', ...Array.from(new Set(users.map(u => u.section)))];

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.studentId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSection = filterSection === 'all' || user.section === filterSection;
    return matchesSearch && matchesSection;
  });

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

  const handleDelete = (userId: string) => {
    if (confirm('Are you sure you want to delete this user?')) {
      setUsers(users.filter(u => u.id !== userId));
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
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
    <div className="min-h-screen bg-[#0F172A]">
      <Navigation />

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-[#F1F5F9] mb-2 flex items-center gap-3">
            <Database className="w-7 h-7 text-[#10B981]" />
            Student Database
          </h1>
          <p className="text-sm text-[#94A3B8]">Manage user accounts and access permissions</p>
        </div>

        {/* Toolbar */}
        <div className="bg-[#1E293B] border border-[#334155] rounded-lg p-4 mb-6">
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
              <Input
                type="text"
                placeholder="Search by name or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-[#0F172A] border-[#334155] text-[#F1F5F9]"
              />
            </div>

            {/* Filter by Section */}
            <select
              value={filterSection}
              onChange={(e) => setFilterSection(e.target.value)}
              className="px-4 py-2 bg-[#0F172A] border border-[#334155] rounded-md text-[#F1F5F9] text-sm"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              {sections.map(section => (
                <option key={section} value={section}>
                  {section === 'all' ? 'All Sections' : section}
                </option>
              ))}
            </select>

            {/* Add User Button */}
            <Button
              onClick={() => {
                setEditingUser(null);
                setIsModalOpen(true);
              }}
              className="bg-[#10B981] hover:bg-[#059669] text-[#0F172A]"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Add New User
            </Button>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-[#1E293B] border border-[#334155] rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#334155] bg-[#0F172A]">
                  <th className="px-4 py-3 text-left">
                    <Checkbox
                      checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">
                    Avatar
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">
                    Student ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">
                    Section
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">
                    Last Login
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user, idx) => (
                  <tr
                    key={user.id}
                    className={`border-b border-[#334155] hover:bg-[#0F172A]/50 transition-colors ${
                      idx % 2 === 0 ? 'bg-[#1E293B]' : 'bg-[#1E293B]/50'
                    }`}
                  >
                    <td className="px-4 py-3">
                      <Checkbox
                        checked={selectedUsers.includes(user.id)}
                        onCheckedChange={(checked) => handleSelectUser(user.id, checked as boolean)}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="w-10 h-10 bg-[#334155] rounded-full flex items-center justify-center text-xl">
                        {user.avatar}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-[#F1F5F9]">{user.name}</td>
                    <td className="px-4 py-3 text-sm text-[#3B82F6]" style={{ fontFamily: 'var(--font-mono)' }}>
                      {user.studentId}
                    </td>
                    <td className="px-4 py-3 text-sm text-[#94A3B8]" style={{ fontFamily: 'var(--font-mono)' }}>
                      {user.section}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.status === 'active'
                            ? 'bg-[#10B981]/20 text-[#10B981]'
                            : 'bg-[#64748B]/20 text-[#64748B]'
                        }`}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-[#94A3B8]" style={{ fontFamily: 'var(--font-mono)' }}>
                      {formatDate(user.lastLogin)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => handleEdit(user)}
                          variant="ghost"
                          size="sm"
                          className="text-[#3B82F6] hover:text-[#2563EB] hover:bg-[#3B82F6]/10"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => handleDelete(user.id)}
                          variant="ghost"
                          size="sm"
                          className="text-[#EF4444] hover:text-[#DC2626] hover:bg-[#EF4444]/10"
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
          <div className="px-4 py-3 border-t border-[#334155] bg-[#0F172A] flex items-center justify-between">
            <div className="text-sm text-[#94A3B8]">
              Showing {filteredUsers.length} of {users.length} users
              {selectedUsers.length > 0 && (
                <span className="ml-4 text-[#10B981]">
                  {selectedUsers.length} selected
                </span>
              )}
            </div>
            <div className="text-xs text-[#64748B]" style={{ fontFamily: 'var(--font-mono)' }}>
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