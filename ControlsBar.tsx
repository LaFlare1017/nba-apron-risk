import { useState } from 'react';
import { useRosterStore, type RiskFilterValue, type SortBy } from '../stores/rosterStore';
import { SEASONS } from '../types';
import { RISK_LABELS, RISK_ORDER } from '../utils/capCalculations';
import { inputPill, pillButtonPrimary, pillButtonSecondary } from '../styles/tokens';

export function ControlsBar() {
  const selectedSeason = useRosterStore((s) => s.selectedSeason);
  const setSeason = useRosterStore((s) => s.setSeason);
  const riskFilter = useRosterStore((s) => s.riskFilter);
  const setRiskFilter = useRosterStore((s) => s.setRiskFilter);
  const sortBy = useRosterStore((s) => s.sortBy);
  const setSortBy = useRosterStore((s) => s.setSortBy);
  const searchQuery = useRosterStore((s) => s.searchQuery);
  const setSearchQuery = useRosterStore((s) => s.setSearchQuery);
  const editMode = useRosterStore((s) => s.editMode);
  const toggleEditMode = useRosterStore((s) => s.toggleEditMode);

  const [localSearch, setLocalSearch] = useState(searchQuery);

  function handleSearchChange(value: string) {
    setLocalSearch(value);
    window.clearTimeout((handleSearchChange as unknown as { t?: number }).t);
    (handleSearchChange as unknown as { t?: number }).t = window.setTimeout(() => setSearchQuery(value), 300);
  }

  return (
    <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-2 px-4 py-3 sm:px-6">
      <label className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
        Season
        <select className={inputPill} value={selectedSeason} onChange={(e) => setSeason(e.target.value as typeof selectedSeason)}>
          {SEASONS.map((season) => (
            <option key={season} value={season}>{season}</option>
          ))}
        </select>
      </label>

      <label className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
        Risk
        <select className={inputPill} value={riskFilter} onChange={(e) => setRiskFilter(e.target.value as RiskFilterValue)}>
          <option value="ALL">All</option>
          {RISK_ORDER.map((risk) => (
            <option key={risk} value={risk}>{RISK_LABELS[risk]}</option>
          ))}
        </select>
      </label>

      <label className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
        Sort
        <select className={inputPill} value={sortBy} onChange={(e) => setSortBy(e.target.value as SortBy)}>
          <option value="payroll-desc">Payroll (High to Low)</option>
          <option value="payroll-asc">Payroll (Low to High)</option>
          <option value="distance-asc">Closest to Apron</option>
          <option value="name-asc">Team Name</option>
        </select>
      </label>

      <input
        type="search"
        placeholder="Search teams or players..."
        value={localSearch}
        onChange={(e) => handleSearchChange(e.target.value)}
        className={`${inputPill} min-w-[200px] flex-1`}
        aria-label="Search teams or players"
      />

      <button
        onClick={toggleEditMode}
        aria-pressed={editMode}
        className={editMode ? pillButtonPrimary : pillButtonSecondary}
      >
        {editMode ? 'Exit Edit Mode' : 'Edit Mode'}
      </button>
    </div>
  );
}
