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
