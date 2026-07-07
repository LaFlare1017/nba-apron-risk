import { useMemo } from 'react';
import { useRosterStore } from '../stores/rosterStore';
import { TeamCard } from './TeamCard';
import { getApronDistance, getProjectedPayroll, getRiskLevel } from '../utils/capCalculations';

export function TeamGrid() {
  const teams = useRosterStore((s) => s.teams);
  const capData = useRosterStore((s) => s.capData);
  const selectedSeason = useRosterStore((s) => s.selectedSeason);
  const riskFilter = useRosterStore((s) => s.riskFilter);
  const sortBy = useRosterStore((s) => s.sortBy);
  const searchQuery = useRosterStore((s) => s.searchQuery);

  const visibleTeams = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    let filtered = teams.filter((team) => {
      if (riskFilter !== 'ALL' && getRiskLevel(team, selectedSeason, capData) !== riskFilter) return false;
      if (!query) return true;
      const teamMatch = `${team.city} ${team.name}`.toLowerCase().includes(query);
      const playerMatch = team.players.some((p) => p.name.toLowerCase().includes(query));
      return teamMatch || playerMatch;
    });

    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'payroll-desc':
          return getProjectedPayroll(b, selectedSeason) - getProjectedPayroll(a, selectedSeason);
        case 'payroll-asc':
          return getProjectedPayroll(a, selectedSeason) - getProjectedPayroll(b, selectedSeason);
        case 'distance-asc':
          return getApronDistance(b, selectedSeason, capData) - getApronDistance(a, selectedSeason, capData);
        case 'name-asc':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    return filtered;
  }, [teams, capData, selectedSeason, riskFilter, sortBy, searchQuery]);

  if (visibleTeams.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center text-slate-500 dark:text-slate-400 sm:px-6">
        No teams match your filters.
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-7xl grid-cols-1 gap-3 px-4 py-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-3 xl:grid-cols-4">
      {visibleTeams.map((team, index) => (
        <TeamCard key={team.id} team={team} index={index} />
      ))}
    </div>
  );
}
