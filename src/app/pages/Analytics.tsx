import { useEffect, useState } from 'react';
import { Navigation } from '../components/Navigation';
import { AlertTriangle, Activity, TrendingDown } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { calculateSyncRate } from '../utils/achievementCatalog';

type Student = {
  id: string;
  name: string;
  studentId: string;
  section: string;
  avatar: string;
  syncRate: number;
  createdAt?: string;
  progress: {
    arrays: number;
    loops: number;
    grids: number;
  };
};

const mockAnalyticsStudents: Student[] = [
  {
    id: 'mock-student-1',
    name: 'Alex Chen',
    studentId: 'S001',
    section: 'Section A',
    avatar: '👨‍💻',
    syncRate: 85,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    progress: { arrays: 90, loops: 85, grids: 75 },
  },
  {
    id: 'mock-student-2',
    name: 'Sarah Kim',
    studentId: 'S002',
    section: 'Section B',
    avatar: '👩‍💼',
    syncRate: 52,
    createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    progress: { arrays: 60, loops: 45, grids: 40 },
  },
  {
    id: 'mock-student-3',
    name: 'Marcus Johnson',
    studentId: 'S003',
    section: 'Section A',
    avatar: '👨‍🎓',
    syncRate: 58,
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    progress: { arrays: 70, loops: 55, grids: 45 },
  },
  {
    id: 'mock-student-4',
    name: 'Emma Rodriguez',
    studentId: 'S004',
    section: 'Section C',
    avatar: '👩‍🦰',
    syncRate: 91,
    createdAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
    progress: { arrays: 95, loops: 92, grids: 88 },
  },
  {
    id: 'mock-student-5',
    name: 'David Park',
    studentId: 'S005',
    section: 'Section B',
    avatar: '👨‍🏫',
    syncRate: 64,
    createdAt: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString(),
    progress: { arrays: 75, loops: 60, grids: 55 },
  },
  {
    id: 'mock-student-6',
    name: 'Lisa Thompson',
    studentId: 'S006',
    section: 'Section C',
    avatar: '👩‍💻',
    syncRate: 79,
    createdAt: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000).toISOString(),
    progress: { arrays: 85, loops: 80, grids: 72 },
  },
];

export function Analytics() {
  const [students, setStudents] = useState<Student[]>(mockAnalyticsStudents);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

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

  const dedupeAchievements = (value: unknown) => {
    const rawAchievements = coerceJsonArray(value)
      .filter((achievement) => achievement && typeof achievement === 'object') as { name?: string; type?: string }[];
    const seen = new Set<string>();
    const result: { name?: string; type?: string }[] = [];
    for (const achievement of rawAchievements) {
      const name = `${achievement.name || ''}`.trim().toLowerCase();
      const type = `${achievement.type || ''}`.trim().toLowerCase();
      const key = `${name}::${type}`;
      if (!name || seen.has(key)) continue;
      seen.add(key);
      result.push(achievement);
    }
    return result;
  };

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoadError(null);
        setLoading(true);
        // Only select users that are students (exclude admins and system/test accounts)
        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name, student_id, section, avatar_url, sync_rate, role, created_at, achievements, badges')
          .eq('role', 'student')
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Defensive client-side filter to remove any mock/test accounts
        const liveStudents = (data || []).filter((s: any) => {
          const sid = (s.student_id || '').toString().toLowerCase();
          const name = (s.full_name || '').toString().toLowerCase();
          // exclude obvious test/mock rows
          if (!sid) return false;
          if (sid.includes('mock') || name.includes('mock') || sid.includes('test')) return false;
          return true;
        });

        const formattedStudents = (liveStudents || []).map((student: any) => {
          const achievements = dedupeAchievements(student.achievements);
          const badges = dedupeBadges(student.badges);
          const syncRate = calculateSyncRate(achievements, badges);

          return {
            id: student.id,
            name: student.full_name,
            studentId: student.student_id,
            section: student.section,
            avatar: student.avatar_url || '🧑‍🎓',
            syncRate,
            createdAt: student.created_at,
            progress: {
              arrays: 0,
              loops: 0,
              grids: 0
            }
          };
        });

        // Use mock data as fallback if no real students found
        if (formattedStudents.length === 0) {
          setStudents(mockAnalyticsStudents);
          setLoadError(null);
        } else {
          setStudents(formattedStudents);
          setLoadError(null);
        }
      } catch (error) {
        console.error('Error fetching students:', error);
        // Use mock data as fallback on error
        setStudents(mockAnalyticsStudents);
        setLoadError(null);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);
  
  // Calculate at-risk students (sync rate < 60)
  const atRiskStudents = students.filter(s => s.syncRate < 60);

  // Generate class heatmap data
  const sections = Array.from(new Set(students.map(s => s.section)));
  const heatmapData = sections.map(section => {
    const sectionStudents = students.filter(s => s.section === section);
    const avgMastery = sectionStudents.length > 0
      ? sectionStudents.reduce((sum, s) => sum + s.syncRate, 0) / sectionStudents.length
      : 0;
    return { section, avgMastery, count: sectionStudents.length };
  });

  const behaviorLogs = students.flatMap((student) => {
    const logs: any[] = [];
    
    // Add registration log
    logs.push({
      id: `${student.id}-registered`,
      student: student.name,
      event: 'Registered account',
      timestamp: student.createdAt || new Date().toISOString(),
      severity: 'low'
    });
    
    // Add progress logs based on sync rate
    if (student.syncRate >= 85) {
      logs.push({
        id: `${student.id}-high-progress`,
        student: student.name,
        event: 'High Performance Achieved',
        timestamp: new Date(new Date(student.createdAt || new Date()).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        severity: 'low'
      });
    } else if (student.syncRate >= 70) {
      logs.push({
        id: `${student.id}-good-progress`,
        student: student.name,
        event: 'Good Progress Maintained',
        timestamp: new Date(new Date(student.createdAt || new Date()).getTime() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        severity: 'low'
      });
    } else if (student.syncRate < 60) {
      logs.unshift({
        id: `${student.id}-low-sync`,
        student: student.name,
        event: 'Low Sync Rate Alert',
        timestamp: new Date(new Date(student.createdAt || new Date()).getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        severity: 'medium'
      });
    }
    
    // Add achievement logs
    if (student.syncRate >= 80) {
      logs.push({
        id: `${student.id}-achievement`,
        student: student.name,
        event: 'Unlocked Achievement: Array Master',
        timestamp: new Date(new Date(student.createdAt || new Date()).getTime() + 10 * 24 * 60 * 60 * 1000).toISOString(),
        severity: 'low'
      });
    }
    
    return logs;
  });

  const getColorForMastery = (mastery: number) => {
    if (mastery >= 75) return 'bg-primary';
    if (mastery >= 50) return 'bg-amber-500';
    return 'bg-destructive';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-destructive';
      case 'medium': return 'text-amber-500';
      default: return 'text-primary';
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors">
      <Navigation />

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold mb-2 flex items-center gap-3">
            <Activity className="w-7 h-7 text-primary" />
            Analytics & Alerts
          </h1>
          <p className="text-sm text-muted-foreground">Monitor student performance and system flags</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* At-Risk Students */}
          <div className="border rounded-lg p-6 bg-card border-border transition-colors">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              At-Risk Students
            </h2>

            <div className="space-y-3">
              {loading && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Loading students...</p>
                </div>
              )}

              {!loading && loadError && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>{loadError}</p>
                </div>
              )}

              {!loading && !loadError && atRiskStudents.map(student => (
                <div
                  key={student.id}
                  className="border rounded-lg p-4 bg-muted/40 border-border hover:border-destructive/50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
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
                      <p className="text-lg font-semibold text-destructive" style={{ fontFamily: 'var(--font-mono)' }}>
                        {student.syncRate}%
                      </p>
                      <p className="text-xs text-muted-foreground">Sync Rate</p>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-border">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <TrendingDown className="w-3 h-3 text-destructive" />
                      <span>Struggling with: 2D Grids ({student.progress.grids}%)</span>
                    </div>
                  </div>
                </div>
              ))}

              {!loading && !loadError && atRiskStudents.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No at-risk students detected</p>
                </div>
              )}
            </div>
          </div>

          {/* Class Heatmap */}
          <div className="border rounded-lg p-6 bg-card border-border transition-colors">
            <h2 className="text-lg font-semibold mb-4">Class Heatmap</h2>
            <p className="text-sm mb-6 text-muted-foreground">Average mastery distribution by section</p>

            <div className="space-y-4">
              {!loading && !loadError && heatmapData.map(section => (
                <div key={section.section}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm" style={{ fontFamily: 'var(--font-mono)' }}>
                      {section.section}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {section.count} student{section.count !== 1 ? 's' : ''}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-10 gap-1 mb-2">
                    {Array.from({ length: 10 }).map((_, idx) => {
                      const threshold = (idx + 1) * 10;
                      const opacity = section.avgMastery >= threshold ? 1 : 0.2;
                      return (
                        <div
                          key={idx}
                          className={`aspect-square rounded ${getColorForMastery(section.avgMastery)}`}
                          style={{ opacity }}
                        />
                      );
                    })}
                  </div>

                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">0%</span>
                    <span className="text-primary" style={{ fontFamily: 'var(--font-mono)' }}>
                      Avg: {section.avgMastery.toFixed(0)}%
                    </span>
                    <span className="text-muted-foreground">100%</span>
                  </div>
                </div>
              ))}

              {!loading && !loadError && heatmapData.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No section data available</p>
                </div>
              )}
            </div>

            {/* Legend */}
            <div className="mt-6 pt-6 border-t border-border">
              <p className="text-xs mb-3 text-muted-foreground">Legend:</p>
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-primary" />
                  <span className="text-muted-foreground">High (75%+)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-amber-500" />
                  <span className="text-muted-foreground">Medium (50-74%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-destructive" />
                  <span className="text-muted-foreground">Low (&lt;50%)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Behavior Logs */}
          <div className="lg:col-span-2 border rounded-lg p-6 bg-card border-border transition-colors">
            <h2 className="text-lg font-semibold mb-4">Behavior Logs</h2>
            <p className="text-sm mb-6 text-muted-foreground">Recent system flags and notable events</p>

            <div className="border rounded-lg overflow-hidden bg-muted/40 border-border transition-colors">
              <div className="max-h-96 overflow-y-auto">
                {behaviorLogs
                  .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                  .map((log, idx) => (
                  <div
                    key={log.id}
                    className={`p-4 border-b last:border-b-0 hover:bg-muted transition-colors ${
                      idx % 2 === 0 ? 'bg-muted/30 border-border' : 'bg-muted/50 border-border'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium">{log.student}</span>
                          <span className="text-xs text-muted-foreground">•</span>
                          <span className={`text-sm ${getSeverityColor(log.severity)}`}>
                            {log.event}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground" style={{ fontFamily: 'var(--font-mono)' }}>
                          {log.timestamp}
                        </p>
                      </div>
                      <div className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        log.severity === 'high' 
                          ? 'bg-destructive/20 text-destructive'
                          : log.severity === 'medium'
                          ? 'bg-amber-500/20 text-amber-600'
                          : 'bg-primary/20 text-primary'
                      }`}>
                        {log.severity}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
