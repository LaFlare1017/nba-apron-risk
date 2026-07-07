import { useEffect, useRef, useState } from 'react';
import { useRosterStore } from '../stores/rosterStore';
import { modalCore, modalShell } from '../styles/tokens';

export function ImportModal({ onClose }: { onClose: () => void }) {
  const importState = useRosterStore((s) => s.importState);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeButtonRef.current?.focus();
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  function handleFile(file: File) {
    setError(null);
    const reader = new FileReader();
    reader.onload = () => {
      const result = importState(String(reader.result));
      if (result.ok) {
        onClose();
      } else {
        setError(result.error ?? 'Invalid JSON file');
      }
    };
    reader.onerror = () => setError('Could not read file');
    reader.readAsText(file);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div role="dialog" aria-modal="true" aria-label="Import roster state" className={`${modalShell} max-w-sm animate-fade-up`}>
        <div className={modalCore}>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-slate-50">Import Roster State</h2>
            <button
              ref={closeButtonRef}
              onClick={onClose}
              aria-label="Close"
              className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition-all duration-500 ease-spring hover:-translate-y-0.5 hover:bg-black/5 hover:text-slate-600 dark:hover:bg-white/10 dark:hover:text-slate-200"
            >
              ✕
            </button>
          </div>
          <p className="mb-3 text-sm text-slate-500 dark:text-slate-400">
            Choose a previously exported <code className="rounded bg-black/5 px-1 py-0.5 dark:bg-white/10">roster-state-*.json</code> file.
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
            className="w-full text-sm text-slate-600 dark:text-slate-300"
          />
          {error && (
            <p role="alert" className="mt-3 rounded-2xl bg-risk-over/10 px-3 py-2 text-sm text-risk-over">
              Import failed: {error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
