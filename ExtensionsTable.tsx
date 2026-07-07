import type { Team } from '../types';
import { useRosterStore } from '../stores/rosterStore';
import { formatMoney } from '../utils/formatters';

const LIKELIHOOD_STYLE: Record<string, string> = {
  certain: 'text-risk-over font-semibold',
  likely: 'text-risk-high font-semibold',
  possible: 'text-risk-moderate',
  speculative: 'text-slate-400',
};

export function ExtensionsTable({ team }: { team: Team }) {
  const extensions = useRosterStore((s) => s.extensions).filter((e) => e.teamId === team.id);

  if (extensions.length === 0) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">No pending extensions.</p>;
  }

  return (
    <div className="overflow-hidden rounded-2xl bg-black/[0.03] ring-1 ring-black/5 dark:bg-white/[0.04] dark:ring-white/10">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400 dark:text-slate-500">
            <th className="px-3 pt-3 pb-1.5 font-bold">Player</th>
            <th className="px-3 pt-3 pb-1.5 font-bold">Start</th>
            <th className="px-3 pt-3 pb-1.5 font-bold">Est. Salary</th>
            <th className="px-3 pt-3 pb-1.5 font-bold">Urgency</th>
          </tr>
        </thead>
        <tbody>
          {extensions.map((ext) => {
            const player = team.players.find((p) => p.id === ext.playerId);
            return (
              <tr key={ext.id} className="border-t border-black/5 dark:border-white/10">
                <td className="px-3 py-2 text-slate-800 dark:text-slate-100">{player?.name ?? ext.playerId}</td>
                <td className="px-3 py-2 text-slate-500 dark:text-slate-400">{ext.startYear}</td>
                <td className="px-3 py-2 text-slate-500 dark:text-slate-400">{formatMoney(ext.year1Amount)}</td>
                <td className={`px-3 py-2 capitalize ${LIKELIHOOD_STYLE[ext.likelihood]}`}>{ext.likelihood}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
