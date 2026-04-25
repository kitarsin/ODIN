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

export async function getPlayerProfile(userId: string) {
  const res = await fetch(`${API_URL}/api/player/${userId}`, {
    headers: await getAuthHeaders(),
  });
  if (!res.ok) throw new Error(`Failed to load profile: ${res.status}`);
  return res.json();
}
