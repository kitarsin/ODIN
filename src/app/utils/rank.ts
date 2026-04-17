type RankTier = {
  minScore: number;
  rank: string;
  level: string;
  tier: number;
};

const RANK_TIERS: RankTier[] = [
  { minScore: 90, rank: 'ARCHITECT', level: 'Elite', tier: 5 },
  { minScore: 75, rank: 'ENGINEER', level: 'Advanced', tier: 4 },
  { minScore: 60, rank: 'SCRIPTER', level: 'Intermediate', tier: 3 },
  { minScore: 40, rank: 'CODER', level: 'Basic', tier: 2 },
  { minScore: 0, rank: 'RECRUIT', level: 'Novice', tier: 1 }
];

export type RankInfo = {
  rank: string;
  level: string;
  score: number;
  tier: number;
};

const clampScore = (score: number) => {
  if (!Number.isFinite(score)) return 0;
  return Math.min(100, Math.max(0, score));
};

export const getRankInfo = (score: number): RankInfo => {
  const safeScore = clampScore(score);
  const tier = RANK_TIERS.find((entry) => safeScore >= entry.minScore) ?? RANK_TIERS[RANK_TIERS.length - 1];

  return {
    rank: tier.rank,
    level: tier.level,
    score: safeScore,
    tier: tier.tier
  };
};

export const getScoreFromXP = (xp: number, maxXP = 2000) => {
  if (!Number.isFinite(xp) || maxXP <= 0) return 0;
  return clampScore((xp / maxXP) * 100);
};

export const getXPFromScore = (score: number, maxXP = 2000) => {
  return Math.round((clampScore(score) / 100) * maxXP);
};

export const getLevelFromXP = (xp: number, levelSize = 250) => {
  const safeXP = Math.max(0, Math.floor(Number.isFinite(xp) ? xp : 0));
  const safeLevelSize = Math.max(1, Math.floor(levelSize));
  const level = Math.max(1, Math.floor(safeXP / safeLevelSize) + 1);
  const nextLevelXP = level * safeLevelSize;
  const currentLevelXP = safeXP - (level - 1) * safeLevelSize;
  const progressPercent = Math.min(100, Math.round((currentLevelXP / safeLevelSize) * 100));

  return {
    level,
    nextLevelXP,
    currentLevelXP,
    progressPercent
  };
};
