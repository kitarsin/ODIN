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
      <DialogContent className="bg-card border-border text-foreground sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl text-foreground">
            {user ? 'Edit User' : 'Add New User'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-foreground">
              Full Name
            </Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter full name"
              className="bg-background border-border text-foreground placeholder:text-muted-foreground"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="studentId" className="text-foreground">
              Student ID
            </Label>
            <Input
              id="studentId"
              type="text"
              value={formData.studentId}
              onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
              placeholder="Enter student ID"
              className="bg-background border-border text-foreground placeholder:text-muted-foreground"
              style={{ fontFamily: 'var(--font-mono)' }}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="section" className="text-foreground">
              Section
            </Label>
            <Input
              id="section"
              type="text"
              value={formData.section}
              onChange={(e) => setFormData({ ...formData, section: e.target.value })}
              placeholder="e.g., CS-301A"
              className="bg-background border-border text-foreground placeholder:text-muted-foreground"
              style={{ fontFamily: 'var(--font-mono)' }}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role" className="text-foreground">
              Role
            </Label>
            <select
              id="role"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as 'student' | 'admin' })}
              className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground text-sm"
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
              className="border-border text-muted-foreground hover:bg-muted"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Save to Database
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
