import { useMemo } from 'react';
import { useRosterStore } from '../stores/rosterStore';
import { getRiskLevel, RISK_LABELS, RISK_ORDER } from '../utils/capCalculations';
import type { RiskLevel } from '../types';
import { GlassCard } from './ui/GlassCard';

const RISK_TEXT: Record<RiskLevel, string> = {
  OVER: 'text-risk-over',
  CRITICAL: 'text-risk-critical',
  HIGH: 'text-risk-high',
  MODERATE: 'text-risk-moderate',
  LOW: 'text-risk-low',
};

const RISK_DOT: Record<RiskLevel, string> = {
  OVER: 'bg-risk-over',
  CRITICAL: 'bg-risk-critical',
  HIGH: 'bg-risk-high',
  MODERATE: 'bg-risk-moderate',
  LOW: 'bg-risk-low',
};

export function StatsBar() {
  const teams = useRosterStore((s) => s.teams);
  const capData = useRosterStore((s) => s.capData);
  const selectedSeason = useRosterStore((s) => s.selectedSeason);

  const counts = useMemo(() => {
    const tally: Record<RiskLevel, number> = { OVER: 0, CRITICAL: 0, HIGH: 0, MODERATE: 0, LOW: 0 };
    for (const team of teams) {
      tally[getRiskLevel(team, selectedSeason, capData)]++;
    }
    return tally;
  }, [teams, capData, selectedSeason]);

  return (
    <div className="mx-auto grid max-w-7xl grid-cols-2 gap-3 px-4 py-4 sm:grid-cols-5 sm:px-6">
      {RISK_ORDER.map((risk, i) => (
        <GlassCard
          key={risk}
          className="animate-fade-up"
          innerClassName="px-4 py-3.5"
          style={{ animationDelay: `${i * 60}ms` }}
        >
          <div className={`text-3xl font-extrabold tracking-tight ${RISK_TEXT[risk]}`}>{counts[risk]}</div>
          <div className="mt-1 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
            <span className={`h-1.5 w-1.5 rounded-full ${RISK_DOT[risk]}`} />
            {RISK_LABELS[risk]}
          </div>
        </GlassCard>
      ))}
    </div>
  );
}
