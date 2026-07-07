import type { Extension, Season, Team } from '../types';
import { SEASONS } from '../types';

const LIKELIHOODS: Extension['likelihood'][] = ['certain', 'likely', 'possible', 'speculative'];

function mulberry32(seed: number) {
  let a = seed;
  return function rng() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function generateExtensions(teams: Team[], seed = 4242): Extension[] {
  const rng = mulberry32(seed);
  const extensions: Extension[] = [];

  for (const team of teams) {
    for (const player of team.players) {
      if (!player.extensionEligible) continue;
      const lastSeasonWithSalary = SEASONS.filter((s) => player.salary[s] !== undefined).length;
      const startYear: Season = SEASONS[Math.min(lastSeasonWithSalary, SEASONS.length - 1)];
      const baseSalary = player.salary[SEASONS[0]] ?? 8_000_000;
      const year1Amount = Math.round(baseSalary * (1.1 + rng() * 0.3));
      extensions.push({
        id: `ext_${player.id}`,
        playerId: player.id,
        teamId: team.id,
        startYear,
        year1Amount,
        annualRaise: 0.08,
        years: 4 + Math.round(rng()),
        likelihood: LIKELIHOODS[Math.floor(rng() * LIKELIHOODS.length)],
        notes: `${player.name} extension window opens this offseason`,
      });
    }
  }

  return extensions;
}
