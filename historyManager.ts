import type { HistoryAction, HistoryEntry, Team } from '../types';

export const MAX_HISTORY_ENTRIES = 100;

export function createHistoryEntry(
  action: HistoryAction,
  description: string,
  affectedTeamIds: string[],
  before: Team[],
  after: Team[],
): HistoryEntry {
  return {
    id: `hist_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    timestamp: new Date().toISOString(),
    action,
    description,
    affectedTeamIds,
    before,
    after,
  };
}

/**
 * Appends a new entry, truncating any redo tail, and trims to MAX_HISTORY_ENTRIES (FIFO).
 */
export function pushHistory(
  history: HistoryEntry[],
  historyIndex: number,
  entry: HistoryEntry,
): { history: HistoryEntry[]; historyIndex: number } {
  const truncated = history.slice(0, historyIndex + 1);
  truncated.push(entry);
  const overflow = truncated.length - MAX_HISTORY_ENTRIES;
  const trimmed = overflow > 0 ? truncated.slice(overflow) : truncated;
  return { history: trimmed, historyIndex: trimmed.length - 1 };
}
