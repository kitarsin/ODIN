import { supabase } from './supabaseClient';

const API_URL = import.meta.env.VITE_ODIN_API_URL || 'http://localhost:5000';

async function getAuthHeaders(): Promise<HeadersInit> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) throw new Error('Not authenticated');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${session.access_token}`,
  };
}

// ── Types ──

export interface KeystrokeData {
  averageFlightTimeMs: number;
  averageDwellTimeMs: number;
  initialLatencyMs: number;
  totalTimeSeconds: number;
  pasteDetected?: boolean;
  rawEvents?: unknown[];
  inactivityDuration?: number;
  timeSinceLastSubmit?: number;
  errorLog?: { category: string; message: string }[];
  isFirstSubmission?: boolean;
  typingBurstCoverage?: number;
  selfCorrectionCount?: number;
  systemCheckCount?: number;
  postErrorInactivitySeconds?: number;
  keyDownCount?: number;
}

export interface SubmissionResponse {
  submissionId: string;
  isCorrect: boolean;
  diagnosticCategory: string;
  diagnosticMessage: string;
  compilerDiagnostics: { id: string; severity: string; message: string; line: number; column: number }[];
  behaviorState: string;
  helplessnessScore: number;
  helplessnessScoreDelta: number;
  masteryProbability: number;
  isMastered: boolean;
  isWarmUpPhase: boolean;
  interventionType: string;
  npcDialogue?: {
    npcName: string;
    dialogueText: string;
    technicalHint?: string;
    hintTier: number;
  };
  levelUnlocked: boolean;
  xpAwarded: number;
  newAchievements?: string[];
}

// ── API Calls ──

export async function createSession(userId: string, dungeonLevel: number, puzzleId: string) {
  const res = await fetch(`${API_URL}/api/session`, {
    method: 'POST',
    headers: await getAuthHeaders(),
    body: JSON.stringify({ userId, dungeonLevel, puzzleId }),
  });
  if (!res.ok) throw new Error(`Session creation failed: ${res.status}`);
  return res.json();
}

export async function submitCode(
  playerId: string,
  sessionId: string,
  puzzleId: string,
  skillType: string,
  sourceCode: string,
  keystrokeData: KeystrokeData,
  hintUsageCount: number,
): Promise<SubmissionResponse> {
  const res = await fetch(`${API_URL}/api/submission`, {
    method: 'POST',
    headers: await getAuthHeaders(),
    body: JSON.stringify({
      playerId,
      sessionId,
      puzzleId,
      skillType,
      sourceCode,
      keystrokeData,
      hintUsageCount,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Submission failed: ${res.status}`);
  }
  return res.json();
}

export async function getPuzzlesByLevel(level: number) {
  const res = await fetch(`${API_URL}/api/puzzle/level/${level}`, {
    headers: await getAuthHeaders(),
  });
  if (!res.ok) throw new Error(`Failed to load puzzles: ${res.status}`);
  return res.json();
}

// Fetches all puzzles across levels 0-3 and returns a Map<id, title> for display
export async function buildPuzzleTitleMap(): Promise<Map<string, string>> {
  const headers = await getAuthHeaders();
  const results = await Promise.all(
    [0, 1, 2, 3].map(level =>
      fetch(`${API_URL}/api/puzzle/level/${level}`, { headers })
        .then(r => r.ok ? r.json() : [])
        .catch(() => [])
    )
  );
  const map = new Map<string, string>();
  results.flat().forEach((p: { id: string; title: string }) => map.set(p.id, p.title));
  return map;
}

export async function getPlayerProfile(userId: string) {
  const res = await fetch(`${API_URL}/api/player/${userId}`, {
    headers: await getAuthHeaders(),
  });
  if (!res.ok) throw new Error(`Failed to load profile: ${res.status}`);
  return res.json();
}

export async function patchSessionEnd(sessionId: string): Promise<void> {
  const headers = await getAuthHeaders();
  await fetch(`${API_URL}/api/session/${sessionId}/end`, {
    method: 'PATCH',
    headers,
  });
}

export async function getPlayerSessions(userId: string, limit = 20) {
  const res = await fetch(`${API_URL}/api/session/player/${userId}?limit=${limit}`, {
    headers: await getAuthHeaders(),
  });
  if (!res.ok) throw new Error(`Failed to load sessions: ${res.status}`);
  return res.json();
}

export async function getPlayerHistory(userId: string, limit = 50) {
  const res = await fetch(`${API_URL}/api/player/${userId}/history?limit=${limit}`, {
    headers: await getAuthHeaders(),
  });
  if (!res.ok) throw new Error(`Failed to load history: ${res.status}`);
  return res.json();
}

export async function getSessionSubmissions(sessionId: string) {
  const res = await fetch(`${API_URL}/api/submission/session/${sessionId}`, {
    headers: await getAuthHeaders(),
  });
  if (!res.ok) throw new Error(`Failed to load submissions: ${res.status}`);
  return res.json();
}

export async function resetPlayerProgress(userId: string): Promise<void> {
  const res = await fetch(`${API_URL}/api/player/${userId}/reset`, {
    method: 'POST',
    headers: await getAuthHeaders(),
  });
  if (!res.ok) throw new Error(`Reset failed: ${res.status}`);
}

export async function getClassOverview() {
  const res = await fetch(`${API_URL}/api/instructor/overview`, {
    headers: await getAuthHeaders(),
  });
  if (!res.ok) throw new Error(`Failed to load overview: ${res.status}`);
  return res.json();
}

export async function getStudentList() {
  const res = await fetch(`${API_URL}/api/instructor/students`, {
    headers: await getAuthHeaders(),
  });
  if (!res.ok) throw new Error(`Failed to load students: ${res.status}`);
  return res.json();
}

export async function getMasteryHeatmap() {
  const res = await fetch(`${API_URL}/api/instructor/mastery-heatmap`, {
    headers: await getAuthHeaders(),
  });
  if (!res.ok) throw new Error(`Failed to load heatmap: ${res.status}`);
  return res.json();
}

export async function getCognitiveBottlenecks() {
  const res = await fetch(`${API_URL}/api/instructor/bottlenecks`, {
    headers: await getAuthHeaders(),
  });
  if (!res.ok) throw new Error(`Failed to load bottlenecks: ${res.status}`);
  return res.json();
}

export async function getRecentInterventions(limit = 50) {
  const res = await fetch(`${API_URL}/api/instructor/interventions?limit=${limit}`, {
    headers: await getAuthHeaders(),
  });
  if (!res.ok) throw new Error(`Failed to load interventions: ${res.status}`);
  return res.json();
}

export interface CompileResult {
  isCorrect: boolean;
  diagnosticCategory: string;
  diagnosticMessage: string;
  /** Actual stdout produced by the student's code */
  actualOutput: string | null;
  compilerDiagnostics: { id: string; severity: string; message: string; line: number; column: number }[];
}

export async function compilePretestCode(
  sourceCode: string,
  skillType: string,
  problemId: string,
): Promise<CompileResult> {
  const res = await fetch(`${API_URL}/api/pretest/compile`, {
    method: 'POST',
    headers: await getAuthHeaders(),
    body: JSON.stringify({ sourceCode, skillType, problemId }),
  });
  if (!res.ok) throw new Error(`Compile failed: ${res.status}`);
  return res.json();
}

export async function reevaluateData(jsonData: any) {
  const res = await fetch(`${API_URL}/api/submission/reevaluate`, {
    method: 'POST',
    headers: await getAuthHeaders(),
    body: JSON.stringify(jsonData),
  });
  if (!res.ok) throw new Error(`Reevaluation failed: ${res.status}`);
  return res.json();
}
