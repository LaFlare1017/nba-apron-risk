import { useEffect } from 'react';
import { useRosterStore } from '../stores/rosterStore';

const AUTOSAVE_INTERVAL_MS = 30_000;

export function useAutoSave() {
  const persistNow = useRosterStore((s) => s.persistNow);
  useEffect(() => {
    const id = setInterval(persistNow, AUTOSAVE_INTERVAL_MS);
    return () => clearInterval(id);
  }, [persistNow]);
}
