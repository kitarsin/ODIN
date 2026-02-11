import { AlertCircle, Activity, RefreshCw, Eye, Key, Circle } from 'lucide-react';

interface Student {
  id: string;
  name: string;
  currentMission: string;
  status: 'online' | 'offline' | 'stuck';
  errorRate: number;
  compilations: number;
}

interface AnalyticsPoint {
  time: string;
  errors: number;
}

export function CommandCenter({
  students = [],
  analyticsData = [],
}: {
  students?: Student[];
  analyticsData?: AnalyticsPoint[];
}) {
  const totalStudents = students.length;
  const onlineStudents = students.filter(s => s.status === 'online').length;
  const stuckStudents = students.filter(s => s.status === 'stuck').length;
  const onlinePercent = totalStudents > 0 ? (onlineStudents / totalStudents) * 100 : 0;
  const stuckPercent = totalStudents > 0 ? (stuckStudents / totalStudents) * 100 : 0;

  return (
    <div className="h-full bg-background text-foreground overflow-auto p-4 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-[#00E676]" style={{ fontFamily: 'Orbitron, sans-serif' }}>
            COMMAND CENTER
          </h1>
          <p className="text-muted-foreground code-font">// MISSION_CONTROL_DASHBOARD</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-4 gap-4">
          <div className="p-6 rounded-lg backdrop-blur-md bg-card/60 border border-border/50 shadow-[0_0_20px_rgba(41,121,255,0.1)]">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-xs text-muted-foreground code-font uppercase mb-1">Total Agents</p>
                <p className="text-3xl font-bold text-[#2979FF]">{totalStudents}</p>
              </div>
              <Activity className="w-8 h-8 text-[#2979FF]/50" />
            </div>
            <div className="h-1 bg-secondary rounded-full overflow-hidden">
              <div className="h-full w-full bg-gradient-to-r from-[#2979FF] to-[#00E676]" />
            </div>
          </div>

          <div className="p-6 rounded-lg backdrop-blur-md bg-card/60 border border-border/50 shadow-[0_0_20px_rgba(0,230,118,0.1)]">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-xs text-muted-foreground code-font uppercase mb-1">Online</p>
                <p className="text-3xl font-bold text-[#00E676]">{onlineStudents}</p>
              </div>
              <Circle className="w-8 h-8 text-[#00E676] fill-[#00E676]" />
            </div>
            <div className="h-1 bg-secondary rounded-full overflow-hidden">
              <div className="h-full bg-[#00E676]" style={{ width: `${onlinePercent}%` }} />
            </div>
          </div>

          <div className="p-6 rounded-lg backdrop-blur-md bg-card/60 border border-[#FF5252]/50 shadow-[0_0_20px_rgba(255,82,82,0.1)] animate-pulse">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-xs text-muted-foreground code-font uppercase mb-1">Wheel Spinning</p>
                <p className="text-3xl font-bold text-[#FF5252]">{stuckStudents}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-[#FF5252]" />
            </div>
            <div className="h-1 bg-secondary rounded-full overflow-hidden">
              <div className="h-full bg-[#FF5252] animate-pulse" style={{ width: `${stuckPercent}%` }} />
            </div>
          </div>

          <div className="p-6 rounded-lg backdrop-blur-md bg-card/60 border border-border/50 shadow-[0_0_20px_rgba(255,171,0,0.1)]">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-xs text-muted-foreground code-font uppercase mb-1">Avg Error Rate</p>
                <p className="text-3xl font-bold text-[#FFAB00]">23%</p>
              </div>
              <RefreshCw className="w-8 h-8 text-[#FFAB00]/50" />
            </div>
            <div className="h-1 bg-secondary rounded-full overflow-hidden">
              <div className="h-full w-[23%] bg-[#FFAB00]" />
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-3 gap-6">
          {/* Live Class Status - Takes 2 columns */}
          <div className="col-span-2 backdrop-blur-md bg-card/60 border border-border/50 rounded-lg p-6 shadow-[0_0_20px_rgba(41,121,255,0.05)]">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-semibold mb-1" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                  LIVE CLASS STATUS
                </h3>
                <p className="text-xs text-muted-foreground code-font">// REAL_TIME_MONITORING</p>
              </div>
              <div className="flex items-center gap-2 text-xs code-font text-[#00E676]">
                <div className="w-2 h-2 bg-[#00E676] rounded-full animate-pulse" />
                LIVE
              </div>
            </div>

            {/* Student Cards Grid */}
            <div className="grid grid-cols-2 gap-4">
              {students.length === 0 ? (
                <div className="col-span-2 rounded-lg border border-dashed border-border/60 bg-secondary/10 p-6 text-center text-sm text-muted-foreground">
                  No active agents yet.
                </div>
              ) : (
                students.map((student) => (
                  <div
                    key={student.id}
                    className={`
                      p-4 rounded-lg backdrop-blur-sm border transition-all
                      ${student.status === 'stuck' 
                        ? 'bg-[#FF5252]/10 border-[#FF5252] animate-pulse shadow-[0_0_20px_rgba(255,82,82,0.3)]' 
                        : student.status === 'online'
                        ? 'bg-secondary/50 border-[#00E676]/30 hover:border-[#00E676]'
                        : 'bg-secondary/30 border-border/50 opacity-60'
                      }
                    `}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <div className={`w-2 h-2 rounded-full ${
                            student.status === 'online' ? 'bg-[#00E676]' :
                            student.status === 'stuck' ? 'bg-[#FF5252] animate-pulse' :
                            'bg-muted-foreground'
                          }`} />
                          <span className="font-semibold truncate">{student.name}</span>
                        </div>
                        <p className="text-xs text-muted-foreground code-font truncate">
                          {student.id}
                        </p>
                      </div>
                      {student.status === 'stuck' && (
                        <AlertCircle className="w-5 h-5 text-[#FF5252] shrink-0 animate-pulse" />
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Mission:</span>
                        <span className="code-font text-[#2979FF]">{student.currentMission}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Error Rate:</span>
                        <span className={`code-font font-semibold ${
                          student.errorRate > 40 ? 'text-[#FF5252]' :
                          student.errorRate > 20 ? 'text-[#FFAB00]' :
                          'text-[#00E676]'
                        }`}>
                          {student.errorRate}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Compiles:</span>
                        <span className="code-font">{student.compilations}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Analytics Monitor */}
          <div className="backdrop-blur-md bg-card/60 border border-border/50 rounded-lg p-6 shadow-[0_0_20px_rgba(0,230,118,0.05)]">
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-1" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                ANALYTICS MONITOR
              </h3>
              <p className="text-xs text-muted-foreground code-font">// ERROR_FREQUENCY</p>
            </div>

            {/* Simple Line Chart */}
            <div className="relative h-48 mb-4">
              {/* Grid Lines */}
              <div className="absolute inset-0 flex flex-col justify-between">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div key={i} className="border-t border-[#2979FF]/10" />
                ))}
              </div>

              {analyticsData.length === 0 ? (
                <div className="relative z-10 flex h-full items-center justify-center text-sm text-muted-foreground">
                  No analytics data yet.
                </div>
              ) : (
                <svg className="w-full h-full" viewBox="0 0 400 200" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#00E676" />
                      <stop offset="100%" stopColor="#2979FF" />
                    </linearGradient>
                    <filter id="glow">
                      <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                      <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                  </defs>
                  <polyline
                    fill="none"
                    stroke="url(#lineGradient)"
                    strokeWidth="3"
                    filter="url(#glow)"
                    points={analyticsData.map((d, i) => {
                      const maxIndex = Math.max(analyticsData.length - 1, 1);
                      return `${(i / maxIndex) * 400},${200 - (d.errors / 40) * 200}`;
                    }).join(' ')}
                  />
                  {/* Data points */}
                  {analyticsData.map((d, i) => {
                    const maxIndex = Math.max(analyticsData.length - 1, 1);
                    return (
                      <circle
                        key={i}
                        cx={(i / maxIndex) * 400}
                        cy={200 - (d.errors / 40) * 200}
                        r="4"
                        fill="#00E676"
                        className="drop-shadow-[0_0_6px_rgba(0,230,118,0.8)]"
                      />
                    );
                  })}
                </svg>
              )}
            </div>

            {/* X-axis labels */}
            <div className="flex justify-between text-xs text-muted-foreground code-font mb-6">
              <span>{analyticsData[0]?.time ?? '--:--'}</span>
              <span>{analyticsData[analyticsData.length - 1]?.time ?? '--:--'}</span>
            </div>

            {/* Stats */}
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 rounded-lg bg-secondary/30 border border-border/50">
                <span className="text-xs text-muted-foreground code-font">PEAK_ERRORS</span>
                <span className="font-bold text-[#FF5252]">35</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-secondary/30 border border-border/50">
                <span className="text-xs text-muted-foreground code-font">AVG_ERRORS</span>
                <span className="font-bold text-[#FFAB00]">23</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-secondary/30 border border-border/50">
                <span className="text-xs text-muted-foreground code-font">TREND</span>
                <span className="font-bold text-[#00E676]">↑ +12%</span>
              </div>
            </div>
          </div>
        </div>

        {/* User Management Table */}
        <div className="backdrop-blur-md bg-card/60 border border-border/50 rounded-lg overflow-hidden shadow-[0_0_20px_rgba(41,121,255,0.05)]">
          <div className="p-6 border-b border-border/50">
            <h3 className="text-xl font-semibold mb-1" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
              USER MANAGEMENT
            </h3>
            <p className="text-xs text-muted-foreground code-font">// AGENT_DATABASE</p>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50 bg-secondary/30">
                  <th className="px-6 py-3 text-left text-xs code-font uppercase tracking-wider text-muted-foreground">
                    User ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs code-font uppercase tracking-wider text-muted-foreground">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs code-font uppercase tracking-wider text-muted-foreground">
                    Current Mission
                  </th>
                  <th className="px-6 py-3 text-left text-xs code-font uppercase tracking-wider text-muted-foreground">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs code-font uppercase tracking-wider text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {students.length === 0 ? (
                  <tr className="bg-secondary/10">
                    <td colSpan={5} className="px-6 py-8 text-center text-sm text-muted-foreground">
                      No agents to display.
                    </td>
                  </tr>
                ) : (
                  students.map((student, index) => (
                    <tr
                      key={student.id}
                      className={`
                        transition-colors hover:bg-secondary/30
                        ${index % 2 === 0 ? 'bg-secondary/10' : 'bg-transparent'}
                      `}
                    >
                      <td className="px-6 py-4 code-font text-sm text-[#2979FF]">
                        {student.id}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {student.name}
                      </td>
                      <td className="px-6 py-4 code-font text-sm text-muted-foreground">
                        {student.currentMission}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${
                            student.status === 'online' ? 'bg-[#00E676]' :
                            student.status === 'stuck' ? 'bg-[#FF5252]' :
                            'bg-muted-foreground'
                          }`} />
                          <span className={`text-xs code-font uppercase ${
                            student.status === 'online' ? 'text-[#00E676]' :
                            student.status === 'stuck' ? 'text-[#FF5252]' :
                            'text-muted-foreground'
                          }`}>
                            {student.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button className="p-2 rounded hover:bg-[#2979FF]/20 transition-colors group">
                            <Eye className="w-4 h-4 text-muted-foreground group-hover:text-[#2979FF]" />
                          </button>
                          <button className="p-2 rounded hover:bg-[#FFAB00]/20 transition-colors group">
                            <Key className="w-4 h-4 text-muted-foreground group-hover:text-[#FFAB00]" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}