import type { Player, Season, Team, TradeCandidate } from '../types';

function inferDifficulty(player: Player): TradeCandidate['difficulty'] {
  if (player.noTradeClause) return 'hard';
  const salary = Object.values(player.salary)[0] ?? 0;
  if (salary >= 30_000_000) return 'hard';
  if (salary >= 12_000_000) return 'moderate';
  return 'easy';
}

function rationaleFor(player: Player, difficulty: TradeCandidate['difficulty']): string {
  if (player.yearsRemaining <= 1) return `Expiring contract — clean salary-cap relief for the acquiring team`;
  if (difficulty === 'easy') return `Movable role-player salary, low commitment beyond this season`;
  if (difficulty === 'moderate') return `Solid rotation value; contract length may require sweeteners`;
  return `Star-level salary and term — likely requires a package plus draft compensation`;
}

/**
 * Suggests players on OTHER teams that could plausibly be traded for by `forTeam`,
 * ranked by how well their salary fits into an apron-conscious trade.
 */
export function getTradeCandidates(
  forTeam: Team,
  allTeams: Team[],
  season: Season,
  limit = 8,
): TradeCandidate[] {
  const candidates: TradeCandidate[] = [];

  for (const team of allTeams) {
    if (team.id === forTeam.id) continue;
    for (const player of team.players) {
      const salary = player.salary[season];
      if (salary === undefined) continue;
      const difficulty = inferDifficulty(player);
      candidates.push({
        player,
        teamId: team.id,
        difficulty,
        reason: rationaleFor(player, difficulty),
      });
    }
  }

  const difficultyWeight: Record<TradeCandidate['difficulty'], number> = { easy: 0, moderate: 1, hard: 2 };
  candidates.sort((a, b) => {
    const w = difficultyWeight[a.difficulty] - difficultyWeight[b.difficulty];
    if (w !== 0) return w;
    return a.player.yearsRemaining - b.player.yearsRemaining;
  });

  return candidates.slice(0, limit);
}
