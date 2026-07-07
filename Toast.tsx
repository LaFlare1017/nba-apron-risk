import { useRosterStore } from '../stores/rosterStore';

export function ToastContainer() {
  const toasts = useRosterStore((s) => s.toasts);
  const dismissToast = useRosterStore((s) => s.dismissToast);
  const undo = useRosterStore((s) => s.undo);

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-full max-w-sm"
      role="status"
      aria-live="polite"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="animate-fade-up flex items-center justify-between gap-3 rounded-2xl border border-black/5 bg-white/90 px-4 py-3 shadow-[0_20px_40px_-16px_rgba(15,15,20,0.35)] backdrop-blur-xl dark:border-white/10 dark:bg-[#0c0d12]/90"
        >
          <span className="text-sm text-slate-700 dark:text-slate-200">{toast.message}</span>
          <div className="flex items-center gap-3 shrink-0">
            {toast.canUndo && (
              <button
                onClick={() => {
                  undo();
                  dismissToast(toast.id);
                }}
                className="text-sm font-semibold text-risk-moderate transition-colors hover:underline"
              >
                Undo
              </button>
            )}
            <button
              onClick={() => dismissToast(toast.id)}
              aria-label="Dismiss notification"
              className="flex h-6 w-6 items-center justify-center rounded-full text-slate-400 transition-all duration-300 hover:-translate-y-0.5 hover:bg-black/5 hover:text-slate-600 dark:hover:bg-white/10 dark:hover:text-slate-200"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
