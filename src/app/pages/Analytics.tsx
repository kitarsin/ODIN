import { Navigation } from '../components/Navigation';
import { AlertTriangle, Activity, TrendingDown } from 'lucide-react';

export function Analytics() {
  // TODO: Fetch students from Supabase
  const students: any[] = [];
  
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
              {atRiskStudents.map(student => (
                <div
                  key={student.id}
                  className="border rounded-lg p-4 bg-muted/40 border-border hover:border-destructive/50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl bg-muted">
                        {student.avatar}
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

              {atRiskStudents.length === 0 && (
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
              {heatmapData.map(section => (
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
                {behaviorLogs.map((log, idx) => (
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
