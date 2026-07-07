import { useMemo } from 'react';
import type { Season, Team } from '../types';
import { useRosterStore } from '../stores/rosterStore';
import { getPercentOfApron, getProjectedPayroll } from '../utils/capCalculations';

export function usePayroll(team: Team, season: Season) {
  const capData = useRosterStore((s) => s.capData);
  return useMemo(() => ({
    payroll: getProjectedPayroll(team, season),
    percentOfApron: getPercentOfApron(team, season, capData),
  }), [team, season, capData]);
}
