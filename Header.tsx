import { useRef, useState } from 'react';
import { useRosterStore } from '../stores/rosterStore';
import { pillButtonSecondary } from '../styles/tokens';

export function Header({ onImportClick }: { onImportClick: () => void }) {
  const lastUpdated = useRosterStore((s) => s.lastUpdated);
  const exportState = useRosterStore((s) => s.exportState);
  const resetToDefault = useRosterStore((s) => s.resetToDefault);
  const [confirmingReset, setConfirmingReset] = useState(false);
  const resetTimer = useRef<number | null>(null);

  const handleExport = () => {
    const json = exportState();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `roster-state-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    if (!confirmingReset) {
      setConfirmingReset(true);
      resetTimer.current = window.setTimeout(() => setConfirmingReset(false), 4000);
      return;
    }
    if (resetTimer.current) clearTimeout(resetTimer.current);
    setConfirmingReset(false);
    resetToDefault();
  };

  return (
    <header className="sticky top-0 z-30 border-b border-black/5 bg-white/70 backdrop-blur-xl dark:border-white/10 dark:bg-black/40">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
        <div>
          <span className="inline-flex items-center rounded-full bg-black/5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500 dark:bg-white/10 dark:text-slate-400">
            Live Cap Model · 2026-30
          </span>
          <h1 className="mt-2 text-xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-2xl">
            NBA Second Apron Risk Dashboard
          </h1>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Last updated {new Date(lastUpdated).toLocaleString()}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={onImportClick} className={pillButtonSecondary}>
            Import
          </button>
          <button onClick={handleExport} className={pillButtonSecondary}>
            Export
          </button>
          <button
            onClick={handleReset}
            className={`inline-flex items-center justify-center gap-2 rounded-full border px-4 py-2 text-sm font-medium backdrop-blur-sm transition-all duration-500 ease-spring hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] ${
              confirmingReset
                ? 'border-risk-over/40 bg-risk-over/10 text-risk-over'
                : 'border-black/10 bg-white/70 text-slate-700 hover:border-black/20 dark:border-white/10 dark:bg-white/[0.06] dark:text-slate-200 dark:hover:border-white/25'
            }`}
          >
            {confirmingReset ? 'Click again to confirm' : 'Reset'}
          </button>
        </div>
      </div>
    </header>
  );
}
