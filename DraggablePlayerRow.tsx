import { useDraggable } from '@dnd-kit/core';
import type { Player, Season } from '../types';
import { useRosterStore } from '../stores/rosterStore';
import { formatMoney } from '../utils/formatters';

interface Props {
  player: Player;
  teamId: string;
  season: Season;
  otherTeamId: string | null;
  side: 'A' | 'B';
  onEdit: (player: Player) => void;
}

const CONTRACT_BADGE: Record<string, string> = {
  guaranteed: 'bg-black/5 text-slate-500 dark:bg-white/10 dark:text-slate-400',
  player_option: 'bg-risk-moderate/15 text-risk-moderate',
  team_option: 'bg-violet-500/15 text-violet-500',
  non_guaranteed: 'bg-risk-high/15 text-risk-high',
  two_way: 'bg-teal-500/15 text-teal-500',
};

export function DraggablePlayerRow({ player, teamId, season, otherTeamId, side, onEdit }: Props) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: player.id,
    data: { teamId },
  });
  const removePlayer = useRosterStore((s) => s.removePlayer);
  const movePlayer = useRosterStore((s) => s.movePlayer);
  const toggleProposedPlayer = useRosterStore((s) => s.toggleProposedPlayer);
  const proposed = useRosterStore((s) => (side === 'A' ? s.proposedFromA : s.proposedFromB));
  const isProposed = proposed.includes(player.id);

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`, zIndex: 10 }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 rounded-2xl bg-black/[0.025] p-2 text-sm ring-1 ring-black/5 transition-shadow duration-300 dark:bg-white/[0.03] dark:ring-white/10 ${isDragging ? 'opacity-50 shadow-xl' : ''}`}
    >
      <input
        type="checkbox"
        checked={isProposed}
        onChange={() => toggleProposedPlayer(side, player.id)}
        aria-label={`Select ${player.name} for trade`}
      />
      <button
        {...listeners}
        {...attributes}
        aria-label={`Drag handle for ${player.name}`}
        className="cursor-grab touch-none px-1 text-slate-400 transition-colors hover:text-slate-600 active:cursor-grabbing dark:hover:text-slate-200"
      >
        ≡
      </button>
      <button className="flex-1 truncate text-left text-slate-800 hover:underline dark:text-slate-100" onClick={() => onEdit(player)}>
        {player.name}
      </button>
      <span className="shrink-0 rounded-full bg-black/5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-500 dark:bg-white/10 dark:text-slate-400">
        {player.position}
      </span>
      <span className="w-16 shrink-0 text-right font-semibold text-slate-700 dark:text-slate-200">
        {formatMoney(player.salary[season] ?? 0)}
      </span>
      <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${CONTRACT_BADGE[player.contractType]}`}>
        {player.contractType.replace('_', ' ')}
      </span>
      {otherTeamId && (
        <button
          onClick={() => movePlayer(player.id, teamId, otherTeamId)}
          aria-label={`Move ${player.name} to the other team`}
          title="Move to other team (keyboard alternative to drag-and-drop)"
          className="shrink-0 rounded-full px-2 py-0.5 text-xs font-medium text-risk-moderate transition-all duration-300 hover:-translate-y-0.5 hover:bg-risk-moderate/10"
        >
          Move →
        </button>
      )}
      <button
        onClick={() => removePlayer(player.id, teamId)}
        aria-label={`Remove ${player.name}`}
        className="shrink-0 rounded-full px-2 py-0.5 text-xs font-medium text-risk-over transition-all duration-300 hover:-translate-y-0.5 hover:bg-risk-over/10"
      >
        Remove
      </button>
    </div>
  );
}
