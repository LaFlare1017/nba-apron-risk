import type { CapData, CBACheckResult, Player, Season, Team, TradeValidationResult } from '../types';
import { formatMoney } from './formatters';
import { getProjectedPayroll, isSecondApronTeam } from './capCalculations';

function playerTradeValue(player: Player, season: Season): number {
  const base = player.salary[season] ?? 0;
  return base * (1 + player.tradeKicker / 100);
}

function sumTradeValue(players: Player[], season: Season): number {
  return players.reduce((sum, p) => sum + playerTradeValue(p, season), 0);
}

/**
 * Checks salary-matching rules for one side of a trade: `outgoing` are the
 * players the team is sending away, `incoming` are the players it receives.
 */
function checkSalaryMatching(
  teamLabel: string,
  team: Team,
  outgoing: Player[],
  incoming: Player[],
  season: Season,
  capData: CapData[],
): CBACheckResult {
  const outgoingValue = sumTradeValue(outgoing, season);
  const incomingValue = sumTradeValue(incoming, season);
  const overApron = isSecondApronTeam(team, season, capData);

  if (outgoingValue === 0 && incomingValue === 0) {
    return { label: `${teamLabel} salary matching`, passed: true, detail: 'No players selected' };
  }

  const limit = overApron ? outgoingValue : outgoingValue * 1.25 + 100_000;
  const passed = incomingValue <= limit;
  const label = `${teamLabel} salary matching (${overApron ? '100% — second apron' : '125% + $100K'})`;

  if (passed) {
    return { label, passed, detail: `Sending ${formatMoney(outgoingValue)}, receiving ${formatMoney(incomingValue)} ✓` };
  }
  const shortfall = incomingValue - limit;
  return { label, passed, detail: `Needs ${formatMoney(shortfall)} more outgoing salary` };
}

function checkAggregation(
  teamLabel: string,
  team: Team,
  outgoing: Player[],
  incoming: Player[],
  season: Season,
  capData: CapData[],
): CBACheckResult {
  const overApron = isSecondApronTeam(team, season, capData);
  const label = `${teamLabel} trade aggregation`;
  if (!overApron) {
    return { label, passed: true, detail: 'Below second apron — aggregation allowed' };
  }
  const aggregating = outgoing.length > 1 && incoming.length >= 1;
  if (aggregating) {
    return { label, passed: false, detail: 'Second apron team cannot aggregate multiple outgoing salaries' };
  }
  return { label, passed: true, detail: 'Second apron team — single-for-single, no aggregation used' };
}

function checkApronImpact(
  teamLabel: string,
  team: Team,
  outgoing: Player[],
  incoming: Player[],
  season: Season,
  capData: CapData[],
): CBACheckResult {
  const cap = capData.find((c) => c.season === season)!;
  const currentPayroll = getProjectedPayroll(team, season);
  const projectedPayroll = currentPayroll
    - sumTradeValue(outgoing, season)
    + sumTradeValue(incoming, season);
  const wasOver = currentPayroll >= cap.secondApron;
  const willBeOver = projectedPayroll >= cap.secondApron;
  const label = `${teamLabel} apron impact`;
  if (willBeOver && !wasOver) {
    return { label, passed: false, detail: `Trade would push team over the second apron (${formatMoney(projectedPayroll)})` };
  }
  return { label, passed: true, detail: `Stays ${willBeOver ? 'over' : 'under'} second apron (${formatMoney(projectedPayroll)})` };
}

function checkNoTradeClauses(teamLabel: string, outgoing: Player[]): CBACheckResult {
  const withNtc = outgoing.filter((p) => p.noTradeClause);
  const label = `${teamLabel} no-trade clauses`;
  if (withNtc.length === 0) {
    return { label, passed: true, detail: 'No players with a no-trade clause' };
  }
  return {
    label,
    passed: true,
    detail: `${withNtc.map((p) => p.name).join(', ')} must consent to waive NTC`,
  };
}

export function validateTrade(
  teamA: Team,
  teamB: Team,
  playersFromA: Player[],
  playersFromB: Player[],
  season: Season,
  capData: CapData[],
): TradeValidationResult {
  const checks: CBACheckResult[] = [
    checkSalaryMatching('Team A', teamA, playersFromA, playersFromB, season, capData),
    checkSalaryMatching('Team B', teamB, playersFromB, playersFromA, season, capData),
    checkAggregation('Team A', teamA, playersFromA, playersFromB, season, capData),
    checkAggregation('Team B', teamB, playersFromB, playersFromA, season, capData),
    checkApronImpact('Team A', teamA, playersFromA, playersFromB, season, capData),
    checkApronImpact('Team B', teamB, playersFromB, playersFromA, season, capData),
    checkNoTradeClauses('Team A', playersFromA),
    checkNoTradeClauses('Team B', playersFromB),
  ];

  return {
    teamAId: teamA.id,
    teamBId: teamB.id,
    checks,
    isValid: checks.every((c) => c.passed),
  };
}
