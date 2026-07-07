// Shared class-name tokens implementing the high-end-visual-design skill:
// pill CTAs, hairline glass inputs, and eyebrow badges reused across the app
// so every surface reads as one consistent premium system.

export const pillButtonPrimary =
  'group inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_1px_0_rgba(255,255,255,0.08)_inset,0_16px_28px_-14px_rgba(15,15,20,0.55)] transition-all duration-500 ease-spring hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0 dark:bg-white dark:text-slate-900';

export const pillButtonSecondary =
  'inline-flex items-center justify-center gap-2 rounded-full border border-black/10 bg-white/70 px-4 py-2 text-sm font-medium text-slate-700 backdrop-blur-sm transition-all duration-500 ease-spring hover:-translate-y-0.5 hover:border-black/20 active:translate-y-0 active:scale-[0.98] dark:border-white/10 dark:bg-white/[0.06] dark:text-slate-200 dark:hover:border-white/25';

export const pillButtonDanger =
  'inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-risk-over transition-all duration-500 ease-spring hover:-translate-y-0.5 hover:bg-risk-over/10 active:translate-y-0 active:scale-[0.98]';

export const iconOrb =
  'flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-black/[0.06] transition-transform duration-500 ease-spring group-hover:translate-x-0.5 group-hover:-translate-y-px dark:bg-white/15';

export const eyebrowBadge =
  'inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em]';

export const inputPill =
  'rounded-full border border-black/10 bg-white/70 px-3.5 py-1.5 text-sm text-slate-700 backdrop-blur-sm transition-colors focus:border-slate-400 focus:outline-none dark:border-white/10 dark:bg-white/[0.06] dark:text-slate-200 dark:focus:border-white/30';

// Denser rounded-xl variant for form fields inside modals (pills read oddly
// in a tight label/input grid).
export const fieldInput =
  'w-full rounded-xl border border-black/10 bg-black/[0.02] px-2.5 py-1.5 text-sm text-slate-800 transition-colors focus:border-slate-400 focus:outline-none dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-100 dark:focus:border-white/30';

export const modalShell =
  'w-full max-h-[90vh] overflow-y-auto rounded-[1.75rem] bg-black/[0.03] p-1.5 ring-1 ring-black/5 dark:bg-white/[0.04] dark:ring-white/10';

export const modalCore =
  'rounded-[calc(1.75rem-0.375rem)] bg-white p-5 dark:bg-[#0c0d12]';

export const glassShell =
  'rounded-[1.75rem] bg-black/[0.03] p-1.5 ring-1 ring-black/5 dark:bg-white/[0.04] dark:ring-white/10';

export const glassCore =
  'rounded-[calc(1.75rem-0.375rem)] bg-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.6),0_20px_40px_-28px_rgba(15,15,20,0.25)] dark:bg-[#0c0d12] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.06),0_20px_40px_-28px_rgba(0,0,0,0.7)]';
