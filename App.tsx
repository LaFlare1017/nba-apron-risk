import { useEffect, useState } from 'react';
import { useRosterStore } from './stores/rosterStore';
import { useAutoSave } from './hooks/useLocalStorage';
import { Header } from './components/Header';
import { StatsBar } from './components/StatsBar';
import { ControlsBar } from './components/ControlsBar';
import { TeamGrid } from './components/TeamGrid';
import { DetailPanel } from './components/DetailPanel';
import { EditPanel } from './components/EditPanel';
import { ImportModal } from './components/ImportModal';
import { ToastContainer } from './components/Toast';

function App() {
  const undo = useRosterStore((s) => s.undo);
  const redo = useRosterStore((s) => s.redo);
  const storageWarning = useRosterStore((s) => s.storageWarning);
  const dismissStorageWarning = useRosterStore((s) => s.dismissStorageWarning);
  const exportState = useRosterStore((s) => s.exportState);
  const [importOpen, setImportOpen] = useState(false);

  useAutoSave();

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      const isMac = navigator.platform.toLowerCase().includes('mac');
      const mod = isMac ? e.metaKey : e.ctrlKey;
      if (!mod) return;
      if (e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if (e.key.toLowerCase() === 'y' || (e.key.toLowerCase() === 'z' && e.shiftKey)) {
        e.preventDefault();
        redo();
      }
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [undo, redo]);

  function handleClearStorage() {
    const json = exportState();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `roster-state-backup-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    localStorage.removeItem('nba-apron-risk-state');
    dismissStorageWarning();
  }

  return (
    <div className="min-h-dvh">
      <Header onImportClick={() => setImportOpen(true)} />

      {storageWarning && (
        <div className="mx-auto max-w-7xl px-4 pt-4 sm:px-6">
          <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-full border border-risk-critical/25 bg-risk-critical/10 px-5 py-2.5 text-sm text-amber-900 backdrop-blur-sm dark:text-amber-100">
            <span>{storageWarning}</span>
            <div className="flex gap-2">
              <button onClick={handleClearStorage} className="rounded-full border border-risk-critical/40 px-3 py-1 text-xs font-semibold transition-all duration-500 ease-spring hover:-translate-y-0.5">
                Export &amp; Clear Storage
              </button>
              <button onClick={dismissStorageWarning} className="rounded-full px-3 py-1 text-xs font-semibold transition-all duration-500 ease-spring hover:-translate-y-0.5">
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      <StatsBar />
      <ControlsBar />
      <TeamGrid />
      <EditPanel />
      <DetailPanel />
      {importOpen && <ImportModal onClose={() => setImportOpen(false)} />}
      <ToastContainer />
    </div>
  );
}

export default App;
