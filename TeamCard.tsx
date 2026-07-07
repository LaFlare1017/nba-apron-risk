import { memo } from 'react';
import type { RiskLevel, Team } from '../types';
import { useRosterStore } from '../stores/rosterStore';
import { usePayroll } from '../hooks/usePayroll';
import { useApronRisk } from '../hooks/useApronRisk';
import { formatMoney, formatPercent, formatSignedMoney } from '../utils/formatters';
import { RISK_LABELS } from '../utils/capCalculations';
import { iconOrb } from '../styles/tokens';

const RISK_BAR_COLOR: Record<RiskLevel, string> = {
  OVER: 'bg-risk-over',
  CRITICAL: 'bg-risk-critical',
  HIGH: 'bg-risk-high',
  MODERATE: 'bg-risk-moderate',
  LOW: 'bg-risk-low',
};

const RISK_BADGE: Record<RiskLevel, string> = {
  OVER: 'bg-risk-over/15 text-risk-over',
  CRITICAL: 'bg-risk-critical/15 text-risk-critical',
  HIGH: 'bg-risk-high/15 text-risk-high',
  MODERATE: 'bg-risk-moderate/15 text-risk-moderate',
  LOW: 'bg-risk-low/15 text-risk-low',
};

export const TeamCard = memo(function TeamCard({ team, index = 0 }: { team: Team; index?: number }) {
  const selectedSeason = useRosterStore((s) => s.selectedSeason);
  const openDetail = useRosterStore((s) => s.openDetail);
  const { payroll, percentOfApron } = usePayroll(team, selectedSeason);
  const { distance, riskLevel } = useApronRisk(team, selectedSeason);

  return (
    <button
      onClick={() => openDetail(team.id)}
      className="group animate-fade-up rounded-[1.75rem] bg-black/[0.03] p-1.5 text-left ring-1 ring-black/5 transition-all duration-500 ease-spring hover:-translate-y-1 hover:ring-black/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 dark:bg-white/[0.04] dark:ring-white/10 dark:hover:ring-white/20 dark:focus-visible:outline-white"
      style={{ animationDelay: `${Math.min(index, 20) * 35}ms` }}
      aria-label={`${team.city} ${team.name}, ${RISK_LABELS[riskLevel]} risk, click for details`}
    >
      <div className="flex flex-col rounded-[calc(1.75rem-0.375rem)] bg-white p-4 shadow-[inset_0_1px_1px_rgba(255,255,255,0.6),0_16px_32px_-24px_rgba(15,15,20,0.25)] transition-shadow duration-500 ease-spring group-hover:shadow-[inset_0_1px_1px_rgba(255,255,255,0.6),0_24px_40px_-20px_rgba(15,15,20,0.3)] dark:bg-[#0c0d12] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.06),0_16px_32px_-24px_rgba(0,0,0,0.7)] dark:group-hover:shadow-[inset_0_1px_1px_rgba(255,255,255,0.08),0_24px_40px_-20px_rgba(0,0,0,0.8)]">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-400 dark:text-slate-500">{team.city}</div>
            <div className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-50">{team.name}</div>
          </div>
          <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] ${RISK_BADGE[riskLevel]}`}>
            {RISK_LABELS[riskLevel]}
          </span>
        </div>

        <div className="mt-3.5 grid grid-cols-2 gap-x-2 gap-y-1.5 text-sm">
          <div className="text-slate-400 dark:text-slate-500">Payroll</div>
          <div className="text-right font-semibold text-slate-900 dark:text-slate-100">{formatMoney(payroll)}</div>
          <div className="text-slate-400 dark:text-slate-500">Distance</div>
          <div className="text-right font-semibold text-slate-900 dark:text-slate-100">{formatSignedMoney(distance)}</div>
          <div className="text-slate-400 dark:text-slate-500">% of Apron</div>
          <div className="text-right font-semibold text-slate-900 dark:text-slate-100">{formatPercent(percentOfApron)}</div>
        </div>

        <div className="mt-3.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
          <div
            className={`h-full rounded-full transition-[width] duration-700 ease-spring ${RISK_BAR_COLOR[riskLevel]}`}
            style={{ width: `${Math.min(100, percentOfApron * 100)}%` }}
          />
        </div>

        <div className="mt-3.5 flex items-center justify-between text-xs text-slate-400 dark:text-slate-500">
          <span>{team.players.length} players</span>
          <span className="flex items-center gap-1 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
            Details
            <span className={iconOrb}>
              <span className="translate-x-px text-[10px]">→</span>
            </span>
          </span>
        </div>
      </div>
    </button>
  );
});
