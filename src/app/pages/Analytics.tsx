import { Navigation } from '../components/Navigation';
import { AlertTriangle, Activity, TrendingDown } from 'lucide-react';
import { mockUsers } from '../context/AuthContext';

export function Analytics() {
  const students = mockUsers.filter(u => u.role === 'student');
  
  // Calculate at-risk students (sync rate < 60)
  const atRiskStudents = students.filter(s => s.syncRate < 60);

  // Generate class heatmap data
  const sections = Array.from(new Set(students.map(s => s.section)));
  const heatmapData = sections.map(section => {
    const sectionStudents = students.filter(s => s.section === section);
    const avgMastery = sectionStudents.reduce((sum, s) => sum + s.syncRate, 0) / sectionStudents.length;
    return { section, avgMastery, count: sectionStudents.length };
  });

  // Mock behavior logs
  const behaviorLogs = [
    { id: 1, student: 'Jordan Lee', event: 'Wheel Spinning Detected', timestamp: '2026-02-10 09:15', severity: 'high' },
    { id: 2, student: 'Sarah Martinez', event: 'Low Activity Warning', timestamp: '2026-02-10 08:45', severity: 'medium' },
    { id: 3, student: 'Jordan Lee', event: 'Multiple Failed Attempts', timestamp: '2026-02-09 16:30', severity: 'high' },
    { id: 4, student: 'Alex Chen', event: 'Rapid Progress - Arrays Module', timestamp: '2026-02-09 14:20', severity: 'low' }
  ];

  const getColorForMastery = (mastery: number) => {
    if (mastery >= 75) return 'bg-[#10B981]';
    if (mastery >= 50) return 'bg-[#F59E0B]';
    return 'bg-[#EF4444]';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-[#EF4444]';
      case 'medium': return 'text-[#F59E0B]';
      default: return 'text-[#10B981]';
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A]">
      <Navigation />

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-[#F1F5F9] mb-2 flex items-center gap-3">
            <Activity className="w-7 h-7 text-[#10B981]" />
            Analytics & Alerts
          </h1>
          <p className="text-sm text-[#94A3B8]">Monitor student performance and system flags</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* At-Risk Students */}
          <div className="bg-[#1E293B] border border-[#334155] rounded-lg p-6">
            <h2 className="text-lg font-semibold text-[#F1F5F9] mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-[#EF4444]" />
              At-Risk Students
            </h2>

            <div className="space-y-3">
              {atRiskStudents.map(student => (
                <div
                  key={student.id}
                  className="bg-[#0F172A] border border-[#334155] rounded-lg p-4 hover:border-[#EF4444]/50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#334155] rounded-full flex items-center justify-center text-xl">
                        {student.avatar}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#F1F5F9]">{student.name}</p>
                        <p className="text-xs text-[#94A3B8]" style={{ fontFamily: 'var(--font-mono)' }}>
                          {student.studentId} • {student.section}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-[#EF4444]" style={{ fontFamily: 'var(--font-mono)' }}>
                        {student.syncRate}%
                      </p>
                      <p className="text-xs text-[#64748B]">Sync Rate</p>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-[#334155]">
                    <div className="flex items-center gap-2 text-xs text-[#94A3B8]">
                      <TrendingDown className="w-3 h-3 text-[#EF4444]" />
                      <span>Struggling with: 2D Grids ({student.progress.grids}%)</span>
                    </div>
                  </div>
                </div>
              ))}

              {atRiskStudents.length === 0 && (
                <div className="text-center py-8 text-[#64748B]">
                  <p>No at-risk students detected</p>
                </div>
              )}
            </div>
          </div>

          {/* Class Heatmap */}
          <div className="bg-[#1E293B] border border-[#334155] rounded-lg p-6">
            <h2 className="text-lg font-semibold text-[#F1F5F9] mb-4">Class Heatmap</h2>
            <p className="text-sm text-[#94A3B8] mb-6">Average mastery distribution by section</p>

            <div className="space-y-4">
              {heatmapData.map(section => (
                <div key={section.section}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-[#F1F5F9]" style={{ fontFamily: 'var(--font-mono)' }}>
                      {section.section}
                    </span>
                    <span className="text-xs text-[#94A3B8]">
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
                    <span className="text-[#64748B]">0%</span>
                    <span className="text-[#10B981]" style={{ fontFamily: 'var(--font-mono)' }}>
                      Avg: {section.avgMastery.toFixed(0)}%
                    </span>
                    <span className="text-[#64748B]">100%</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="mt-6 pt-6 border-t border-[#334155]">
              <p className="text-xs text-[#94A3B8] mb-3">Legend:</p>
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-[#10B981]" />
                  <span className="text-[#94A3B8]">High (75%+)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-[#F59E0B]" />
                  <span className="text-[#94A3B8]">Medium (50-74%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-[#EF4444]" />
                  <span className="text-[#94A3B8]">Low (&lt;50%)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Behavior Logs */}
          <div className="lg:col-span-2 bg-[#1E293B] border border-[#334155] rounded-lg p-6">
            <h2 className="text-lg font-semibold text-[#F1F5F9] mb-4">Behavior Logs</h2>
            <p className="text-sm text-[#94A3B8] mb-6">Recent system flags and notable events</p>

            <div className="bg-[#0F172A] border border-[#334155] rounded-lg overflow-hidden">
              <div className="max-h-96 overflow-y-auto">
                {behaviorLogs.map((log, idx) => (
                  <div
                    key={log.id}
                    className={`p-4 border-b border-[#334155] last:border-b-0 hover:bg-[#1E293B]/50 transition-colors ${
                      idx % 2 === 0 ? 'bg-[#0F172A]' : 'bg-[#0F172A]/50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-[#F1F5F9]">{log.student}</span>
                          <span className="text-xs text-[#64748B]">•</span>
                          <span className={`text-sm ${getSeverityColor(log.severity)}`}>
                            {log.event}
                          </span>
                        </div>
                        <p className="text-xs text-[#64748B]" style={{ fontFamily: 'var(--font-mono)' }}>
                          {log.timestamp}
                        </p>
                      </div>
                      <div className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        log.severity === 'high' 
                          ? 'bg-[#EF4444]/20 text-[#EF4444]'
                          : log.severity === 'medium'
                          ? 'bg-[#F59E0B]/20 text-[#F59E0B]'
                          : 'bg-[#10B981]/20 text-[#10B981]'
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
