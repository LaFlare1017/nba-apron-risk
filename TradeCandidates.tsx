import { useMemo } from 'react';
import type { Team } from '../types';
import { useRosterStore } from '../stores/rosterStore';
import { getTradeCandidates } from '../utils/tradeCandidates';
import { formatMoney } from '../utils/formatters';

const DIFFICULTY_STYLE: Record<string, string> = {
  easy: 'bg-risk-low/10 text-risk-low',
  moderate: 'bg-risk-high/10 text-risk-high',
  hard: 'bg-risk-over/10 text-risk-over',
};

export function TradeCandidates({ team }: { team: Team }) {
  const teams = useRosterStore((s) => s.teams);
  const selectedSeason = useRosterStore((s) => s.selectedSeason);
  const candidates = useMemo(() => getTradeCandidates(team, teams, selectedSeason), [team, teams, selectedSeason]);

  if (candidates.length === 0) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">No trade candidates available.</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      {candidates.map((candidate) => {
        const fromTeam = teams.find((t) => t.id === candidate.teamId);
        return (
          <div
            key={candidate.player.id}
            className="rounded-2xl bg-black/[0.03] p-3 ring-1 ring-black/5 transition-all duration-500 ease-spring hover:-translate-y-0.5 dark:bg-white/[0.04] dark:ring-white/10"
          >
            <div className="flex items-center justify-between gap-2">
              <div>
                <span className="font-semibold text-slate-800 dark:text-slate-100">{candidate.player.name}</span>
                <span className="ml-1.5 text-xs text-slate-400 dark:text-slate-500">
                  {candidate.player.position} · {fromTeam?.name}
                </span>
              </div>
              <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] ${DIFFICULTY_STYLE[candidate.difficulty]}`}>
                {candidate.difficulty}
              </span>
            </div>
            <div className="mt-1 flex items-center justify-between text-xs text-slate-400 dark:text-slate-500">
              <span>{formatMoney(candidate.player.salary[selectedSeason] ?? 0)} · {candidate.player.yearsRemaining} yr(s) left</span>
            </div>
            <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-300">{candidate.reason}</p>
          </div>
        );
      })}
    </div>
  );
}
