import React, { createContext, useContext, useState, ReactNode } from 'react';

interface User {
  id: string;
  name: string;
  studentId: string;
  role: 'student' | 'admin';
  section: string;
  avatar: string;
  syncRate: number;
  progress: {
    arrays: number;
    loops: number;
    grids: number;
  };
  badges: string[];
  lastLogin: string;
  status: 'active' | 'inactive';
}

interface AuthContextType {
  user: User | null;
  login: (studentId: string, password: string) => Promise<boolean>;
  register: (name: string, studentId: string, password: string, section: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users database
const mockUsers: User[] = [
  {
    id: '1',
    name: 'Alex Chen',
    studentId: 'STU001',
    role: 'student',
    section: 'CS-301A',
    avatar: '👨‍💻',
    syncRate: 87,
    progress: { arrays: 92, loops: 78, grids: 65 },
    badges: ['source-key-1', 'source-key-2'],
    lastLogin: '2026-02-10T08:30:00',
    status: 'active'
  },
  {
    id: '2',
    name: 'Admin User',
    studentId: 'ADMIN',
    role: 'admin',
    section: 'Faculty',
    avatar: '👔',
    syncRate: 100,
    progress: { arrays: 100, loops: 100, grids: 100 },
    badges: ['admin-key'],
    lastLogin: '2026-02-10T09:00:00',
    status: 'active'
  },
  {
    id: '3',
    name: 'Sarah Martinez',
    studentId: 'STU002',
    role: 'student',
    section: 'CS-301A',
    avatar: '👩‍💻',
    syncRate: 65,
    progress: { arrays: 85, loops: 62, grids: 48 },
    badges: ['source-key-1'],
    lastLogin: '2026-02-09T14:20:00',
    status: 'active'
  },
  {
    id: '4',
    name: 'Jordan Lee',
    studentId: 'STU003',
    role: 'student',
    section: 'CS-301B',
    avatar: '🧑‍💻',
    syncRate: 42,
    progress: { arrays: 55, loops: 38, grids: 33 },
    badges: [],
    lastLogin: '2026-02-08T16:45:00',
    status: 'active'
  }
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = async (studentId: string, password: string): Promise<boolean> => {
    // Mock authentication - in production, this would call an API
    const foundUser = mockUsers.find(u => u.studentId === studentId);
    if (foundUser && password) { // Accept any non-empty password for demo
      setUser(foundUser);
      return true;
    }
    return false;
  };

  const register = async (name: string, studentId: string, password: string, section: string): Promise<boolean> => {
    // Mock registration
    if (name && studentId && password && section) {
      const newUser: User = {
        id: Date.now().toString(),
        name,
        studentId,
        role: 'student',
        section,
        avatar: '🧑‍🎓',
        syncRate: 50,
        progress: { arrays: 0, loops: 0, grids: 0 },
        badges: [],
        lastLogin: new Date().toISOString(),
        status: 'active'
      };
      mockUsers.push(newUser);
      setUser(newUser);
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Export mock users for admin panel
export { mockUsers };
