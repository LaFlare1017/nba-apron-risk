import { useDroppable } from '@dnd-kit/core';
import type { Player } from '../types';
import { useRosterStore } from '../stores/rosterStore';
import { usePayroll } from '../hooks/usePayroll';
import { useApronRisk } from '../hooks/useApronRisk';
import { DraggablePlayerRow } from './DraggablePlayerRow';
import { formatMoney, formatSignedMoney } from '../utils/formatters';
import { RISK_LABELS } from '../utils/capCalculations';
import { inputPill, pillButtonSecondary } from '../styles/tokens';

interface Props {
  side: 'A' | 'B';
  teamId: string | null;
  otherTeamId: string | null;
  onSelectTeam: (teamId: string | null) => void;
  onEditPlayer: (player: Player, teamId: string) => void;
  onAddPlayer: (teamId: string) => void;
}

export function RosterPanel({ side, teamId, otherTeamId, onSelectTeam, onEditPlayer, onAddPlayer }: Props) {
  const teams = useRosterStore((s) => s.teams);
  const selectedSeason = useRosterStore((s) => s.selectedSeason);
  const { setNodeRef, isOver } = useDroppable({ id: teamId ?? `empty-${side}`, disabled: !teamId });
  const team = teams.find((t) => t.id === teamId) ?? null;
  const payrollInfo = usePayroll(team ?? teams[0], selectedSeason);
  const riskInfo = useApronRisk(team ?? teams[0], selectedSeason);

  return (
    <div className="flex min-w-0 flex-1 flex-col rounded-[1.75rem] bg-black/[0.03] p-1.5 ring-1 ring-black/5 dark:bg-white/[0.04] dark:ring-white/10">
      <div className="flex min-h-0 flex-1 flex-col rounded-[calc(1.75rem-0.375rem)] bg-white p-3.5 dark:bg-[#0c0d12]">
        <label className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400">
          Team {side}
          <select
            className={`${inputPill} flex-1`}
            value={teamId ?? ''}
            onChange={(e) => onSelectTeam(e.target.value || null)}
          >
            <option value="">Select team...</option>
            {teams.map((t) => (
              <option key={t.id} value={t.id} disabled={t.id === otherTeamId}>
                {t.city} {t.name}
              </option>
            ))}
          </select>
        </label>

        {team ? (
          <>
            <div className="mb-2 flex items-center justify-between text-xs text-slate-400 dark:text-slate-500">
              <span>{formatMoney(payrollInfo.payroll)} payroll</span>
              <span>{formatSignedMoney(riskInfo.distance)} · {RISK_LABELS[riskInfo.riskLevel]}</span>
            </div>
            <div
              ref={setNodeRef}
              className={`flex min-h-[120px] flex-1 flex-col gap-1.5 overflow-y-auto rounded-2xl border-2 border-dashed p-1.5 transition-colors duration-300 ${
                isOver ? 'border-risk-low/50 bg-risk-low/5' : 'border-transparent'
              }`}
            >
              {team.players.map((player) => (
                <DraggablePlayerRow
                  key={player.id}
                  player={player}
                  teamId={team.id}
                  season={selectedSeason}
                  otherTeamId={otherTeamId}
                  side={side}
                  onEdit={(p) => onEditPlayer(p, team.id)}
                />
              ))}
              {team.players.length === 0 && (
                <p className="p-2 text-center text-xs text-slate-400">Drop a player here</p>
              )}
            </div>
            <button
              onClick={() => onAddPlayer(team.id)}
              className={`${pillButtonSecondary} mt-3 w-full`}
            >
              + Add Player
            </button>
          </>
        ) : (
          <p className="flex-1 py-8 text-center text-sm text-slate-400">Select a team to view its roster.</p>
        )}
      </div>
    </div>
  );
}
