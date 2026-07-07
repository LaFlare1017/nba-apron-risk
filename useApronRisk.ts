import { useMemo } from 'react';
import type { Season, Team } from '../types';
import { useRosterStore } from '../stores/rosterStore';
import { getApronDistance, getRiskLevel } from '../utils/capCalculations';

export function useApronRisk(team: Team, season: Season) {
  const capData = useRosterStore((s) => s.capData);
  return useMemo(() => ({
    distance: getApronDistance(team, season, capData),
    riskLevel: getRiskLevel(team, season, capData),
  }), [team, season, capData]);
}
