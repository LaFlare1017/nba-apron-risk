import { useRosterStore } from '../stores/rosterStore';
import { useTradeValidation } from '../hooks/useTradeValidation';
import { pillButtonPrimary, pillButtonSecondary } from '../styles/tokens';

export function TradeValidationPanel() {
  const selectedTeamA = useRosterStore((s) => s.selectedTeamA);
  const selectedTeamB = useRosterStore((s) => s.selectedTeamB);
  const proposedFromA = useRosterStore((s) => s.proposedFromA);
  const proposedFromB = useRosterStore((s) => s.proposedFromB);
  const confirmTrade = useRosterStore((s) => s.confirmTrade);
  const clearProposal = useRosterStore((s) => s.clearProposal);
  const result = useTradeValidation();

  if (!selectedTeamA || !selectedTeamB) return null;

  const hasProposal = proposedFromA.length > 0 || proposedFromB.length > 0;

  return (
    <div className="mt-4 rounded-[1.75rem] bg-black/[0.03] p-1.5 ring-1 ring-black/5 dark:bg-white/[0.04] dark:ring-white/10">
      <div className="rounded-[calc(1.75rem-0.375rem)] bg-white p-4 dark:bg-[#0c0d12]">
        <h3 className="mb-3 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">
          Trade Validation
        </h3>
        {!hasProposal || !result ? (
          <p className="text-sm text-slate-400 dark:text-slate-500">
            Check players in each roster panel to propose a trade.
          </p>
        ) : (
          <>
            <ul className="mb-4 flex flex-col gap-2 text-sm">
              {result.checks.map((check) => (
                <li key={check.label} className="flex items-start gap-2">
                  <span className={check.passed ? 'text-risk-low' : 'text-risk-over'}>
                    {check.passed ? '✓' : '✗'}
                  </span>
                  <span className="text-slate-700 dark:text-slate-200">
                    <span className="font-semibold">{check.label}:</span> {check.detail}
                  </span>
                </li>
              ))}
            </ul>
            <div className="flex gap-2">
              <button
                onClick={confirmTrade}
                disabled={!result.isValid}
                className={`${pillButtonPrimary} disabled:bg-slate-200 disabled:text-slate-400 dark:disabled:bg-white/10 dark:disabled:text-slate-500`}
              >
                Confirm Trade
              </button>
              <button onClick={clearProposal} className={pillButtonSecondary}>
                Reset
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
