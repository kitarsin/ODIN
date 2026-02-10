import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface User {
  id: string;
  name: string;
  studentId: string;
  role: 'student' | 'admin';
  section: string;
}

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (user: Partial<User>) => void;
  user: User | null;
}

export function UserModal({ isOpen, onClose, onSave, user }: UserModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    studentId: '',
    section: '',
    role: 'student' as 'student' | 'admin'
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        studentId: user.studentId,
        section: user.section,
        role: user.role
      });
    } else {
      setFormData({
        name: '',
        studentId: '',
        section: '',
        role: 'student'
      });
    }
  }, [user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#1E293B] border-[#334155] text-[#F1F5F9] sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl text-[#F1F5F9]">
            {user ? 'Edit User' : 'Add New User'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-[#F1F5F9]">
              Full Name
            </Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter full name"
              className="bg-[#0F172A] border-[#334155] text-[#F1F5F9]"
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
              value={formData.studentId}
              onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
              placeholder="Enter student ID"
              className="bg-[#0F172A] border-[#334155] text-[#F1F5F9]"
              style={{ fontFamily: 'var(--font-mono)' }}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="section" className="text-[#F1F5F9]">
              Section
            </Label>
            <Input
              id="section"
              type="text"
              value={formData.section}
              onChange={(e) => setFormData({ ...formData, section: e.target.value })}
              placeholder="e.g., CS-301A"
              className="bg-[#0F172A] border-[#334155] text-[#F1F5F9]"
              style={{ fontFamily: 'var(--font-mono)' }}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role" className="text-[#F1F5F9]">
              Role
            </Label>
            <select
              id="role"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as 'student' | 'admin' })}
              className="w-full px-3 py-2 bg-[#0F172A] border border-[#334155] rounded-md text-[#F1F5F9] text-sm"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              <option value="student">Student</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="border-[#334155] text-[#94A3B8] hover:bg-[#334155]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-[#10B981] hover:bg-[#059669] text-[#0F172A]"
            >
              Save to Database
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
