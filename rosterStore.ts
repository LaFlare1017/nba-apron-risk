import { create } from 'zustand';
import type { CapData, Extension, HistoryEntry, Player, RosterState, Season, Team } from '../types';
import { SEASONS } from '../types';
import { capData as initialCapData } from '../data/capData';
import { buildInitialTeams, buildInitialExtensions } from '../data/teams';
import { createHistoryEntry, pushHistory } from '../utils/historyManager';

const STORAGE_KEY = 'nba-apron-risk-state';
const APP_VERSION = '1.0.0';

export type SortBy = 'payroll-desc' | 'payroll-asc' | 'name-asc' | 'distance-asc';
export type RiskFilterValue = 'ALL' | 'OVER' | 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';

export interface Toast {
  id: string;
  message: string;
  canUndo: boolean;
}

function snapshotTeams(teams: Team[], ids: string[]): Team[] {
  return teams
    .filter((t) => ids.includes(t.id))
    .map((t) => structuredClone(t));
}

function recalcPayroll(team: Team): Team {
  const payroll: Partial<Record<Season, number>> = {};
  for (const season of SEASONS) {
    payroll[season] = team.players.reduce((sum, p) => sum + (p.salary[season] ?? 0), 0)
      + (team.deadCap[season] ?? 0);
  }
  return { ...team, payroll };
}

function buildDefaultState() {
  const teams = buildInitialTeams();
  const extensions = buildInitialExtensions(teams);
  return { teams, extensions };
}

type PersistedPayload = RosterState & { historyIndex: number };

function loadPersisted(): { teams: Team[]; capData: CapData[]; extensions: Extension[]; customPlayers: Player[]; history: HistoryEntry[]; historyIndex: number } | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedPayload;
    if (!parsed || !Array.isArray(parsed.teams) || parsed.teams.length === 0) return null;
    const history = parsed.history ?? [];
    return {
      teams: parsed.teams,
      capData: parsed.capData?.length ? parsed.capData : initialCapData,
      extensions: parsed.extensions ?? [],
      customPlayers: parsed.customPlayers ?? [],
      history,
      historyIndex: typeof parsed.historyIndex === 'number' ? parsed.historyIndex : history.length - 1,
    };
  } catch {
    return null;
  }
}

function persist(state: Pick<RosterStore, 'teams' | 'capData' | 'extensions' | 'customPlayers' | 'history' | 'historyIndex'>) {
  try {
    const payload: PersistedPayload = {
      version: APP_VERSION,
      timestamp: new Date().toISOString(),
      teams: state.teams,
      capData: state.capData,
      extensions: state.extensions,
      customPlayers: state.customPlayers,
      history: state.history,
      historyIndex: state.historyIndex,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    return { ok: true as const };
  } catch (err) {
    return { ok: false as const, error: err instanceof Error ? err.message : 'Unknown storage error' };
  }
}

export interface RosterStore {
  teams: Team[];
  capData: CapData[];
  extensions: Extension[];
  customPlayers: Player[];
  lastUpdated: string;

  selectedSeason: Season;
  riskFilter: RiskFilterValue;
  sortBy: SortBy;
  searchQuery: string;
  editMode: boolean;
  selectedTeamA: string | null;
  selectedTeamB: string | null;
  detailTeam: string | null;
  proposedFromA: string[];
  proposedFromB: string[];

  history: HistoryEntry[];
  historyIndex: number;

  toasts: Toast[];
  storageWarning: string | null;

  setSeason: (season: Season) => void;
  setRiskFilter: (filter: RiskFilterValue) => void;
  setSortBy: (sort: SortBy) => void;
  setSearchQuery: (query: string) => void;
  toggleEditMode: () => void;
  selectTeamA: (teamId: string | null) => void;
  selectTeamB: (teamId: string | null) => void;
  openDetail: (teamId: string) => void;
  closeDetail: () => void;

  toggleProposedPlayer: (side: 'A' | 'B', playerId: string) => void;
  clearProposal: () => void;
  confirmTrade: () => void;

  movePlayer: (playerId: string, fromTeamId: string, toTeamId: string) => void;
  addPlayer: (player: Player, teamId: string) => void;
  removePlayer: (playerId: string, teamId: string) => void;
  editPlayer: (playerId: string, updates: Partial<Player>) => void;

  undo: () => void;
  redo: () => void;

  dismissToast: (id: string) => void;
  dismissStorageWarning: () => void;

  exportState: () => string;
  importState: (json: string) => { ok: boolean; error?: string };
  resetToDefault: () => void;
  persistNow: () => void;
}

function addToastEntry(toasts: Toast[], message: string, canUndo = true): Toast[] {
  const toast: Toast = { id: `toast_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`, message, canUndo };
  return [...toasts.slice(-3), toast];
}

export const useRosterStore = create<RosterStore>((set, get) => {
  const persisted = loadPersisted();
  const defaults = buildDefaultState();

  return {
    teams: persisted?.teams ?? defaults.teams,
    capData: persisted?.capData ?? initialCapData,
    extensions: persisted?.extensions ?? defaults.extensions,
    customPlayers: persisted?.customPlayers ?? [],
    lastUpdated: new Date().toISOString(),

    selectedSeason: '2026-27',
    riskFilter: 'ALL',
    sortBy: 'payroll-desc',
    searchQuery: '',
    editMode: false,
    selectedTeamA: null,
    selectedTeamB: null,
    detailTeam: null,
    proposedFromA: [],
    proposedFromB: [],

    history: persisted?.history ?? [],
    historyIndex: persisted?.historyIndex ?? -1,

    toasts: [],
    storageWarning: null,

    setSeason: (season) => set({ selectedSeason: season }),
    setRiskFilter: (filter) => set({ riskFilter: filter }),
    setSortBy: (sort) => set({ sortBy: sort }),
    setSearchQuery: (query) => set({ searchQuery: query }),
    toggleEditMode: () => set((s) => ({ editMode: !s.editMode })),
    selectTeamA: (teamId) => set({ selectedTeamA: teamId, proposedFromA: [] }),
    selectTeamB: (teamId) => set({ selectedTeamB: teamId, proposedFromB: [] }),
    openDetail: (teamId) => set({ detailTeam: teamId }),
    closeDetail: () => set({ detailTeam: null }),

    toggleProposedPlayer: (side, playerId) => set((s) => {
      const key = side === 'A' ? 'proposedFromA' : 'proposedFromB';
      const current = s[key];
      const next = current.includes(playerId) ? current.filter((id) => id !== playerId) : [...current, playerId];
      return { [key]: next } as Partial<RosterStore>;
    }),
    clearProposal: () => set({ proposedFromA: [], proposedFromB: [] }),

    confirmTrade: () => {
      const s = get();
      const { selectedTeamA, selectedTeamB, proposedFromA, proposedFromB } = s;
      if (!selectedTeamA || !selectedTeamB) return;
      const teamA = s.teams.find((t) => t.id === selectedTeamA);
      const teamB = s.teams.find((t) => t.id === selectedTeamB);
      if (!teamA || !teamB) return;

      const before = snapshotTeams(s.teams, [selectedTeamA, selectedTeamB]);
      const movingA = teamA.players.filter((p) => proposedFromA.includes(p.id));
      const movingB = teamB.players.filter((p) => proposedFromB.includes(p.id));

      const newTeamA = recalcPayroll({
        ...teamA,
        players: [...teamA.players.filter((p) => !proposedFromA.includes(p.id)), ...movingB],
      });
      const newTeamB = recalcPayroll({
        ...teamB,
        players: [...teamB.players.filter((p) => !proposedFromB.includes(p.id)), ...movingA],
      });

      const teams = s.teams.map((t) => (t.id === selectedTeamA ? newTeamA : t.id === selectedTeamB ? newTeamB : t));
      const after = snapshotTeams(teams, [selectedTeamA, selectedTeamB]);
      const names = [...movingA, ...movingB].map((p) => p.name).join(', ') || 'players';
      const entry = createHistoryEntry('move_player', `Traded ${names} between ${teamA.name} and ${teamB.name}`, [selectedTeamA, selectedTeamB], before, after);
      const { history, historyIndex } = pushHistory(s.history, s.historyIndex, entry);

      set({ teams, history, historyIndex, proposedFromA: [], proposedFromB: [], toasts: addToastEntry(s.toasts, entry.description) });
      get().persistNow();
    },

    movePlayer: (playerId, fromTeamId, toTeamId) => {
      if (fromTeamId === toTeamId) return;
      const s = get();
      const fromTeam = s.teams.find((t) => t.id === fromTeamId);
      const toTeam = s.teams.find((t) => t.id === toTeamId);
      const player = fromTeam?.players.find((p) => p.id === playerId);
      if (!fromTeam || !toTeam || !player) return;

      const before = snapshotTeams(s.teams, [fromTeamId, toTeamId]);
      const newFromTeam = recalcPayroll({ ...fromTeam, players: fromTeam.players.filter((p) => p.id !== playerId) });
      const newToTeam = recalcPayroll({ ...toTeam, players: [...toTeam.players, player] });
      const teams = s.teams.map((t) => (t.id === fromTeamId ? newFromTeam : t.id === toTeamId ? newToTeam : t));
      const after = snapshotTeams(teams, [fromTeamId, toTeamId]);
      const entry = createHistoryEntry('move_player', `Moved ${player.name} from ${fromTeam.name} to ${toTeam.name}`, [fromTeamId, toTeamId], before, after);
      const { history, historyIndex } = pushHistory(s.history, s.historyIndex, entry);

      set({ teams, history, historyIndex, toasts: addToastEntry(s.toasts, entry.description) });
      get().persistNow();
    },

    addPlayer: (player, teamId) => {
      const s = get();
      const team = s.teams.find((t) => t.id === teamId);
      if (!team) return;
      const before = snapshotTeams(s.teams, [teamId]);
      const newTeam = recalcPayroll({ ...team, players: [...team.players, player] });
      const teams = s.teams.map((t) => (t.id === teamId ? newTeam : t));
      const after = snapshotTeams(teams, [teamId]);
      const entry = createHistoryEntry('add_player', `Added ${player.name} to ${team.name}`, [teamId], before, after);
      const { history, historyIndex } = pushHistory(s.history, s.historyIndex, entry);
      set({ teams, history, historyIndex, toasts: addToastEntry(s.toasts, entry.description) });
      get().persistNow();
    },

    removePlayer: (playerId, teamId) => {
      const s = get();
      const team = s.teams.find((t) => t.id === teamId);
      const player = team?.players.find((p) => p.id === playerId);
      if (!team || !player) return;
      const before = snapshotTeams(s.teams, [teamId]);
      const newTeam = recalcPayroll({ ...team, players: team.players.filter((p) => p.id !== playerId) });
      const teams = s.teams.map((t) => (t.id === teamId ? newTeam : t));
      const after = snapshotTeams(teams, [teamId]);
      const entry = createHistoryEntry('remove_player', `Removed ${player.name} from ${team.name}`, [teamId], before, after);
      const { history, historyIndex } = pushHistory(s.history, s.historyIndex, entry);
      set({ teams, history, historyIndex, toasts: addToastEntry(s.toasts, entry.description) });
      get().persistNow();
    },

    editPlayer: (playerId, updates) => {
      const s = get();
      const team = s.teams.find((t) => t.players.some((p) => p.id === playerId));
      const player = team?.players.find((p) => p.id === playerId);
      if (!team || !player) return;
      const before = snapshotTeams(s.teams, [team.id]);
      const updatedPlayer = { ...player, ...updates };
      const newTeam = recalcPayroll({ ...team, players: team.players.map((p) => (p.id === playerId ? updatedPlayer : p)) });
      const teams = s.teams.map((t) => (t.id === team.id ? newTeam : t));
      const after = snapshotTeams(teams, [team.id]);
      const entry = createHistoryEntry('edit_player', `Edited ${updatedPlayer.name}'s contract`, [team.id], before, after);
      const { history, historyIndex } = pushHistory(s.history, s.historyIndex, entry);
      set({ teams, history, historyIndex, toasts: addToastEntry(s.toasts, entry.description) });
      get().persistNow();
    },

    undo: () => {
      const s = get();
      if (s.historyIndex < 0) return;
      const entry = s.history[s.historyIndex];
      const teams = s.teams.map((t) => entry.affectedTeamIds.includes(t.id) ? entry.before.find((bt) => bt.id === t.id) ?? t : t);
      set({ teams, historyIndex: s.historyIndex - 1, toasts: addToastEntry(s.toasts, `Undid: ${entry.description}`, false) });
      get().persistNow();
    },

    redo: () => {
      const s = get();
      if (s.historyIndex + 1 >= s.history.length) return;
      const entry = s.history[s.historyIndex + 1];
      const teams = s.teams.map((t) => entry.affectedTeamIds.includes(t.id) ? entry.after.find((at) => at.id === t.id) ?? t : t);
      set({ teams, historyIndex: s.historyIndex + 1, toasts: addToastEntry(s.toasts, `Redid: ${entry.description}`, false) });
      get().persistNow();
    },

    dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
    dismissStorageWarning: () => set({ storageWarning: null }),

    exportState: () => {
      const s = get();
      const payload: RosterState = {
        version: APP_VERSION,
        timestamp: new Date().toISOString(),
        teams: s.teams,
        capData: s.capData,
        extensions: s.extensions,
        customPlayers: s.customPlayers,
        history: s.history,
      };
      return JSON.stringify(payload, null, 2);
    },

    importState: (json) => {
      try {
        const parsed = JSON.parse(json) as RosterState;
        if (!parsed || !Array.isArray(parsed.teams) || !Array.isArray(parsed.capData)) {
          throw new Error('Missing required fields (teams, capData)');
        }
        for (const team of parsed.teams) {
          if (typeof team.id !== 'string' || !Array.isArray(team.players)) {
            throw new Error(`Invalid team entry: ${JSON.stringify(team).slice(0, 60)}`);
          }
        }
        set({
          teams: parsed.teams,
          capData: parsed.capData,
          extensions: parsed.extensions ?? [],
          customPlayers: parsed.customPlayers ?? [],
          history: [],
          historyIndex: -1,
          lastUpdated: new Date().toISOString(),
          toasts: addToastEntry(get().toasts, 'Roster state imported successfully', false),
        });
        get().persistNow();
        return { ok: true };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Invalid JSON';
        set((s) => ({ toasts: addToastEntry(s.toasts, `Import failed: ${message}`, false) }));
        return { ok: false, error: message };
      }
    },

    resetToDefault: () => {
      const { teams, extensions } = buildDefaultState();
      set({
        teams,
        capData: initialCapData,
        extensions,
        customPlayers: [],
        history: [],
        historyIndex: -1,
        selectedTeamA: null,
        selectedTeamB: null,
        detailTeam: null,
        proposedFromA: [],
        proposedFromB: [],
        lastUpdated: new Date().toISOString(),
        toasts: addToastEntry(get().toasts, 'Reset to default Spotrac data', false),
      });
      get().persistNow();
    },

    persistNow: () => {
      const s = get();
      const result = persist(s);
      if (!result.ok) {
        set({ storageWarning: `localStorage save failed (${result.error}). Export your data to avoid losing changes.` });
      }
    },
  };
});
