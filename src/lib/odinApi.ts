import { supabase } from './supabaseClient';

const API_URL = import.meta.env.VITE_ODIN_API_URL || 'http://localhost:5000';

async function getAuthHeaders() {
  const { data: { session } } = await supabase.auth.getSession();
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${session?.access_token}`
  };
}

export interface KeystrokeData {
  averageFlightTimeMs: number;
  averageDwellTimeMs: number;
  initialLatencyMs: number;
  totalTimeSeconds: number;
}

export interface SubmissionRequest {
  playerId: string;
  sessionId: string;
  puzzleId: string;
  skillType: string;
  sourceCode: string;
  keystrokeData: KeystrokeData;
  hintUsageCount: number;
}

export interface SubmissionResponse {
  submissionId: string;
  isCorrect: boolean;
  diagnosticCategory: string;
  diagnosticMessage: string;
  behaviorState: string;
  helplessnessScore: number;
  masteryProbability: number;
  isMastered: boolean;
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

export async function submitCode(request: SubmissionRequest): Promise<SubmissionResponse> {
  const response = await fetch(`${API_URL}/api/submission`, {
    method: 'POST',
    headers: await getAuthHeaders(),
    body: JSON.stringify(request)
  });
  if (!response.ok) throw new Error(`API error: ${response.status}`);
  return response.json();
}

export async function startSession(playerId: string, dungeonLevel: number, puzzleId: string) {
  const response = await fetch(`${API_URL}/api/session`, {
    method: 'POST',
    headers: await getAuthHeaders(),
    body: JSON.stringify({ playerId, dungeonLevel, puzzleId })
  });
  return response.json();
}
