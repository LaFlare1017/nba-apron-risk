export type Season = '2026-27' | '2027-28' | '2028-29' | '2029-30';

export const SEASONS: Season[] = ['2026-27', '2027-28', '2028-29', '2029-30'];

export type Position = 'PG' | 'SG' | 'SF' | 'PF' | 'C';

export type ContractType =
  | 'guaranteed'
  | 'player_option'
  | 'team_option'
  | 'non_guaranteed'
  | 'two_way';

export type RiskLevel = 'OVER' | 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';

export interface DraftPick {
  id: string;
  year: string;
  round: 1 | 2;
  originalTeamId: string;
  protected: boolean;
  notes: string;
}

export interface Player {
  id: string;
  name: string;
  position: Position;
  age: number;
  salary: Partial<Record<Season, number>>;
  contractType: ContractType;
  yearsRemaining: number;
  tradeKicker: number;
  noTradeClause: boolean;
  birdRights: boolean;
  rookieScale: boolean;
  extensionEligible: boolean;
  notes: string;
}

export interface Team {
  id: string;
  name: string;
  city: string;
  abbreviation: string;
  payroll: Partial<Record<Season, number>>;
  players: Player[];
  deadCap: Partial<Record<Season, number>>;
  draftPicks: DraftPick[];
}

export interface CapData {
  season: Season;
  salaryCap: number;
  luxuryTax: number;
  firstApron: number;
  secondApron: number;
  minSalary: number;
  maxSalary: Record<number, number>;
}

export interface Extension {
  id: string;
  playerId: string;
  teamId: string;
  startYear: Season;
  year1Amount: number;
  annualRaise: number;
  years: number;
  likelihood: 'certain' | 'likely' | 'possible' | 'speculative';
  notes: string;
}

export type HistoryAction =
  | 'move_player'
  | 'add_player'
  | 'remove_player'
  | 'edit_player'
  | 'edit_team';

export interface HistoryEntry {
  id: string;
  timestamp: string;
  action: HistoryAction;
  description: string;
  affectedTeamIds: string[];
  before: Team[];
  after: Team[];
}

export interface RosterState {
  version: string;
  timestamp: string;
  teams: Team[];
  capData: CapData[];
  extensions: Extension[];
  customPlayers: Player[];
  history: HistoryEntry[];
}

export interface TradeCandidate {
  player: Player;
  teamId: string;
  difficulty: 'easy' | 'moderate' | 'hard';
  reason: string;
}

export interface CBACheckResult {
  label: string;
  passed: boolean;
  detail: string;
}

export interface TradeValidationResult {
  teamAId: string;
  teamBId: string;
  checks: CBACheckResult[];
  isValid: boolean;
}
