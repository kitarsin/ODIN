export interface AchievementDetail {
  name: string;
  emoji: string;
  description: string;
}

export const ACHIEVEMENT_DETAILS: Record<string, AchievementDetail> = {
  'First Victory':  { name: 'First Victory',  emoji: '⚔️', description: 'Solved your first puzzle correctly.' },
  'Array Master':   { name: 'Array Master',   emoji: '📦', description: 'Mastered all 1D array skills.' },
  'Loop Expert':    { name: 'Loop Expert',    emoji: '🔄', description: 'Mastered all loop & iteration skills.' },
  '2D Grid Expert': { name: '2D Grid Expert', emoji: '🧙', description: 'Mastered all 2D array skills.' },
  'Bug Slayer':     { name: 'Bug Slayer',     emoji: '🐛', description: 'Achieved mastery across every skill category.' },
};

export function getAchievementDetail(name: string): AchievementDetail {
  return ACHIEVEMENT_DETAILS[name] ?? { name, emoji: '🏆', description: 'Achievement unlocked.' };
}

// Derives overall sync rate from BKT mastery states returned by the ODIN API.
// Returns 0 if there are no mastery records yet (player hasn't played).
export function calculateSyncRateFromMastery(masteryStates: { masteryPercentage: number }[]): number {
  if (!masteryStates || masteryStates.length === 0) return 0;
  const avg = masteryStates.reduce((sum, m) => sum + m.masteryPercentage, 0) / masteryStates.length;
  return Math.round(Math.min(100, Math.max(0, avg)));
}

export const ACHIEVEMENT_CATALOG = [
  'First Victory',
  'Array Master',
  'Loop Expert',
  'Bug Slayer',
  '2D Grid Expert'
];

type AchievementLike = {
  name?: string | null;
};

const normalizeName = (value: string | null | undefined) => {
  return (value || '').trim().toLowerCase();
};

export const calculateSyncRate = (
  achievements: AchievementLike[] = [],
  badges: string[] = []
) => {
  const catalogSize = ACHIEVEMENT_CATALOG.length;
  if (catalogSize === 0) return 0;

  const unlockedNames = new Set<string>();

  for (const achievement of achievements) {
    const normalized = normalizeName(achievement?.name || '');
    if (normalized) unlockedNames.add(normalized);
  }

  for (const badge of badges) {
    const normalized = normalizeName(badge || '');
    if (normalized) unlockedNames.add(normalized);
  }

  const unlockedCount = unlockedNames.size;
  if (unlockedCount === 0) return 0;

  const rawRate = Math.round((unlockedCount / catalogSize) * 100);
  return Math.min(100, Math.max(0, rawRate));
};
