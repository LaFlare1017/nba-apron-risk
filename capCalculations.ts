import type { CapData, Player, RiskLevel, Season, Team } from '../types';

export function getCapDataForSeason(capData: CapData[], season: Season): CapData {
  const found = capData.find((c) => c.season === season);
  if (!found) throw new Error(`No cap data for season ${season}`);
  return found;
}

export function getProjectedPayroll(team: Team, season: Season): number {
  return team.players.reduce((sum, player) => sum + (player.salary[season] ?? 0), 0)
    + (team.deadCap[season] ?? 0);
}

export function getApronDistance(team: Team, season: Season, capData: CapData[]): number {
  const cap = getCapDataForSeason(capData, season);
  return getProjectedPayroll(team, season) - cap.secondApron;
}

export function getPercentOfApron(team: Team, season: Season, capData: CapData[]): number {
  const cap = getCapDataForSeason(capData, season);
  return getProjectedPayroll(team, season) / cap.secondApron;
}

/**
 * Risk buckets: OVER already exceeds 2nd apron; CRITICAL within $5M below it;
 * HIGH within $15M; MODERATE within $30M; LOW is everything else.
 */
export function getRiskLevel(team: Team, season: Season, capData: CapData[]): RiskLevel {
  const distance = getApronDistance(team, season, capData);
  if (distance >= 0) return 'OVER';
  if (distance >= -5_000_000) return 'CRITICAL';
  if (distance >= -15_000_000) return 'HIGH';
  if (distance >= -30_000_000) return 'MODERATE';
  return 'LOW';
}

export const RISK_ORDER: RiskLevel[] = ['OVER', 'CRITICAL', 'HIGH', 'MODERATE', 'LOW'];

export const RISK_LABELS: Record<RiskLevel, string> = {
  OVER: 'Over Apron',
  CRITICAL: 'Critical',
  HIGH: 'High',
  MODERATE: 'Moderate',
  LOW: 'Low',
};

export function getPlayerSalary(player: Player, season: Season): number {
  return player.salary[season] ?? 0;
}

export function isSecondApronTeam(team: Team, season: Season, capData: CapData[]): boolean {
  return getProjectedPayroll(team, season) >= getCapDataForSeason(capData, season).secondApron;
}

export function isFirstApronTeam(team: Team, season: Season, capData: CapData[]): boolean {
  const cap = getCapDataForSeason(capData, season);
  const payroll = getProjectedPayroll(team, season);
  return payroll >= cap.firstApron && payroll < cap.secondApron;
}
