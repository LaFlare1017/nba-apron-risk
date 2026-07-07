import { useEffect, useRef, useState } from 'react';
import { useRosterStore } from '../stores/rosterStore';
import { SEASONS } from '../types';
import { YearBlock } from './YearBlock';
import { ExtensionsTable } from './ExtensionsTable';
import { TradeCandidates } from './TradeCandidates';
import { useApronRisk } from '../hooks/useApronRisk';
import { RISK_LABELS } from '../utils/capCalculations';

export function DetailPanel() {
  const detailTeam = useRosterStore((s) => s.detailTeam);
  const teams = useRosterStore((s) => s.teams);
  const selectedSeason = useRosterStore((s) => s.selectedSeason);
  const closeDetail = useRosterStore((s) => s.closeDetail);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [entered, setEntered] = useState(false);

  const team = teams.find((t) => t.id === detailTeam) ?? null;
  const { riskLevel } = useApronRisk(team ?? teams[0], selectedSeason);

  useEffect(() => {
    if (!team) {
      setEntered(false);
      return;
    }
    closeButtonRef.current?.focus();
    const raf = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(raf);
  }, [team]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') closeDetail();
    }
    if (team) {
      document.addEventListener('keydown', handleKey);
      return () => document.removeEventListener('keydown', handleKey);
    }
  }, [team, closeDetail]);

  if (!team) return null;

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <button
        aria-label="Close panel backdrop"
        className={`absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity duration-500 ease-spring ${entered ? 'opacity-100' : 'opacity-0'}`}
        onClick={closeDetail}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={`${team.name} details`}
        className={`relative flex h-full w-full max-w-[480px] flex-col overflow-y-auto border-l border-black/5 bg-white/90 p-5 shadow-2xl backdrop-blur-xl transition-transform duration-500 ease-spring dark:border-white/10 dark:bg-[#0a0b0f]/90 ${
          entered ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="mb-5 flex items-start justify-between">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">{team.city}</div>
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">{team.name}</h2>
            <span className="mt-1 inline-block text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">{RISK_LABELS[riskLevel]} risk</span>
          </div>
          <button
            ref={closeButtonRef}
            onClick={closeDetail}
            aria-label="Close detail panel"
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition-all duration-500 ease-spring hover:-translate-y-0.5 hover:bg-black/5 hover:text-slate-600 dark:hover:bg-white/10 dark:hover:text-slate-200"
          >
            ✕
          </button>
        </div>

        <section className="mb-6">
          <h3 className="mb-2.5 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">
            4-Year Cap Projection
          </h3>
          <div className="flex flex-col gap-2">
            {SEASONS.map((season) => (
              <YearBlock key={season} team={team} season={season} />
            ))}
          </div>
        </section>

        <section className="mb-6">
          <h3 className="mb-2.5 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">
            Projected Extensions
          </h3>
          <ExtensionsTable team={team} />
        </section>

        <section>
          <h3 className="mb-2.5 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">
            Trade Candidates
          </h3>
          <TradeCandidates team={team} />
        </section>
      </div>
    </div>
  );
}
