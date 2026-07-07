import type { RiskLevel, Season, Team } from '../types';
import { useRosterStore } from '../stores/rosterStore';
import { getApronDistance, getCapDataForSeason, getProjectedPayroll, getRiskLevel, RISK_LABELS } from '../utils/capCalculations';
import { formatMoney, formatSignedMoney } from '../utils/formatters';

const RISK_BAR_COLOR: Record<RiskLevel, string> = {
  OVER: 'bg-risk-over',
  CRITICAL: 'bg-risk-critical',
  HIGH: 'bg-risk-high',
  MODERATE: 'bg-risk-moderate',
  LOW: 'bg-risk-low',
};

export function YearBlock({ team, season }: { team: Team; season: Season }) {
  const capData = useRosterStore((s) => s.capData);
  const cap = getCapDataForSeason(capData, season);
  const payroll = getProjectedPayroll(team, season);
  const distance = getApronDistance(team, season, capData);
  const risk = getRiskLevel(team, season, capData);
  const chartMax = cap.secondApron * 1.3;
  const barPercent = Math.min(100, (payroll / chartMax) * 100);
  const apronMarkerPercent = (cap.secondApron / chartMax) * 100;

  return (
    <div className="rounded-2xl bg-black/[0.03] p-3 ring-1 ring-black/5 dark:bg-white/[0.04] dark:ring-white/10">
      <div className="mb-1.5 flex items-center justify-between text-sm">
        <span className="font-bold text-slate-800 dark:text-slate-100">{season}</span>
        <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-slate-400 dark:text-slate-500">{RISK_LABELS[risk]}</span>
      </div>
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-black/5 dark:bg-white/10">
        <div className={`h-full rounded-full transition-[width] duration-700 ease-spring ${RISK_BAR_COLOR[risk]}`} style={{ width: `${barPercent}%` }} />
        <div
          className="absolute inset-y-0 w-px bg-slate-400/70 dark:bg-slate-400/50"
          style={{ left: `${apronMarkerPercent}%` }}
          title="Second apron line"
        />
      </div>
      <div className="mt-1.5 flex justify-between text-xs text-slate-400 dark:text-slate-500">
        <span>{formatMoney(payroll)} payroll</span>
        <span>{formatSignedMoney(distance)} vs. 2nd apron ({formatMoney(cap.secondApron)})</span>
      </div>
    </div>
  );
}
