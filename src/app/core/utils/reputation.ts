export interface ReputationLevel {
  name: string;
  min: number;
}

export const REPUTATION_LEVELS: ReputationLevel[] = [
  { name: 'Novato', min: 0 },
  { name: 'Explorador', min: 120 },
  { name: 'Fotógrafo', min: 350 },
  { name: 'Referente', min: 900 },
  { name: 'Maestro', min: 1800 },
];

export interface Reputation {
  score: number;
  level: string;
  nextLevel: string | null;
  progress: number;
  pointsToNext: number;
}

export function reputationScore(
  upvotes: number,
  photoCount: number,
  followerCount = 0,
): number {
  const safeUpvotes = Math.max(0, Math.round(upvotes));
  const safePhotos = Math.max(0, Math.round(photoCount));
  const safeFollowers = Math.max(0, Math.round(followerCount));
  return safeUpvotes + safePhotos * 10 + safeFollowers * 5;
}

export function calculateReputation(
  upvotes: number,
  photoCount: number,
  followerCount = 0,
): Reputation {
  const score = reputationScore(upvotes, photoCount, followerCount);
  let index = 0;
  for (let i = 0; i < REPUTATION_LEVELS.length; i += 1) {
    if (score >= REPUTATION_LEVELS[i].min) {
      index = i;
    }
  }
  const current = REPUTATION_LEVELS[index];
  const next = REPUTATION_LEVELS[index + 1] ?? null;
  const progress = next
    ? Math.min(100, Math.max(0, Math.round(((score - current.min) / (next.min - current.min)) * 100)))
    : 100;

  return {
    score,
    level: current.name,
    nextLevel: next?.name ?? null,
    progress,
    pointsToNext: next ? Math.max(0, next.min - score) : 0,
  };
}
