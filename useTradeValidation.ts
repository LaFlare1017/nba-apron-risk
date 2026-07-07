import { useMemo } from 'react';
import { useRosterStore } from '../stores/rosterStore';
import { validateTrade } from '../utils/cbaRules';

export function useTradeValidation() {
  const teams = useRosterStore((s) => s.teams);
  const capData = useRosterStore((s) => s.capData);
  const selectedSeason = useRosterStore((s) => s.selectedSeason);
  const selectedTeamA = useRosterStore((s) => s.selectedTeamA);
  const selectedTeamB = useRosterStore((s) => s.selectedTeamB);
  const proposedFromA = useRosterStore((s) => s.proposedFromA);
  const proposedFromB = useRosterStore((s) => s.proposedFromB);

  return useMemo(() => {
    const teamA = teams.find((t) => t.id === selectedTeamA);
    const teamB = teams.find((t) => t.id === selectedTeamB);
    if (!teamA || !teamB) return null;
    const playersFromA = teamA.players.filter((p) => proposedFromA.includes(p.id));
    const playersFromB = teamB.players.filter((p) => proposedFromB.includes(p.id));
    if (playersFromA.length === 0 && playersFromB.length === 0) return null;
    return validateTrade(teamA, teamB, playersFromA, playersFromB, selectedSeason, capData);
  }, [teams, capData, selectedSeason, selectedTeamA, selectedTeamB, proposedFromA, proposedFromB]);
}
