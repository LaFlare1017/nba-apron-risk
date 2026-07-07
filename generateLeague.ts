import type { ContractType, Player, Position, Season, Team } from '../types';
import { SEASONS } from '../types';
import { slugify } from '../utils/formatters';

// Deterministic PRNG (mulberry32) so "Reset to default" always reproduces the same league.
function mulberry32(seed: number) {
  let a = seed;
  return function rng() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(rng: () => number, arr: T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}

function randInt(rng: () => number, min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}

const FIRST_NAMES = [
  'Marcus', 'Jalen', 'Devon', 'Tyrese', 'Andre', 'Malik', 'Xavier', 'Cameron', 'Isaiah', 'Darius',
  'Jaylen', 'Terrence', 'Elijah', 'Dominic', 'Nasir', 'Quentin', 'Rashad', 'Trevon', 'Amir', 'Kellan',
  'Bryce', 'Corey', 'Deshawn', 'Emmanuel', 'Jaxon', 'Keon', 'Landon', 'Micah', 'Noel', 'Orlando',
  'Preston', 'Rico', 'Sean', 'Tobias', 'Vaughn', 'Wesley', 'Zaire', 'Aaron', 'Brandt', 'Chase',
];

const LAST_NAMES = [
  'Whitfield', 'Okafor', 'Brantley', 'Calloway', 'Deveraux', 'Ellison', 'Fontaine', 'Grier', 'Holloway', 'Iverson',
  'Jamison', 'Kessler', 'Lindqvist', 'Marsalis', 'Nkemdirim', 'Osei', 'Pruitt', 'Quintero', 'Renfro', 'Sablan',
  'Tarver', 'Ubaka', 'Vance', 'Winslow', 'Yaro', 'Zeigler', 'Ashby', 'Boateng', 'Chastain', 'Dubois',
  'Ekwueme', 'Farrow', 'Gantt', 'Hargrove', 'Isaacson', 'Jeter', 'Kimbrough', 'Larsen', 'Mbeki', 'Norwood',
];

const POSITIONS: Position[] = ['PG', 'SG', 'SF', 'PF', 'C'];

interface TeamSeed {
  id: string;
  name: string;
  city: string;
  abbreviation: string;
  spendTier: 1 | 2 | 3 | 4 | 5; // 5 = highest spenders / apron-pressured
}

export const TEAM_SEEDS: TeamSeed[] = [
  { id: 'hawks', name: 'Hawks', city: 'Atlanta', abbreviation: 'ATL', spendTier: 2 },
  { id: 'celtics', name: 'Celtics', city: 'Boston', abbreviation: 'BOS', spendTier: 5 },
  { id: 'nets', name: 'Nets', city: 'Brooklyn', abbreviation: 'BKN', spendTier: 1 },
  { id: 'hornets', name: 'Hornets', city: 'Charlotte', abbreviation: 'CHA', spendTier: 1 },
  { id: 'bulls', name: 'Bulls', city: 'Chicago', abbreviation: 'CHI', spendTier: 2 },
  { id: 'cavaliers', name: 'Cavaliers', city: 'Cleveland', abbreviation: 'CLE', spendTier: 4 },
  { id: 'mavericks', name: 'Mavericks', city: 'Dallas', abbreviation: 'DAL', spendTier: 4 },
  { id: 'nuggets', name: 'Nuggets', city: 'Denver', abbreviation: 'DEN', spendTier: 4 },
  { id: 'pistons', name: 'Pistons', city: 'Detroit', abbreviation: 'DET', spendTier: 2 },
  { id: 'warriors', name: 'Warriors', city: 'Golden State', abbreviation: 'GSW', spendTier: 5 },
  { id: 'rockets', name: 'Rockets', city: 'Houston', abbreviation: 'HOU', spendTier: 3 },
  { id: 'pacers', name: 'Pacers', city: 'Indiana', abbreviation: 'IND', spendTier: 3 },
  { id: 'clippers', name: 'Clippers', city: 'LA', abbreviation: 'LAC', spendTier: 4 },
  { id: 'lakers', name: 'Lakers', city: 'Los Angeles', abbreviation: 'LAL', spendTier: 5 },
  { id: 'grizzlies', name: 'Grizzlies', city: 'Memphis', abbreviation: 'MEM', spendTier: 3 },
  { id: 'heat', name: 'Heat', city: 'Miami', abbreviation: 'MIA', spendTier: 3 },
  { id: 'bucks', name: 'Bucks', city: 'Milwaukee', abbreviation: 'MIL', spendTier: 4 },
  { id: 'timberwolves', name: 'Timberwolves', city: 'Minnesota', abbreviation: 'MIN', spendTier: 4 },
  { id: 'pelicans', name: 'Pelicans', city: 'New Orleans', abbreviation: 'NOP', spendTier: 2 },
  { id: 'knicks', name: 'Knicks', city: 'New York', abbreviation: 'NYK', spendTier: 5 },
  { id: 'thunder', name: 'Thunder', city: 'Oklahoma City', abbreviation: 'OKC', spendTier: 5 },
  { id: 'magic', name: 'Magic', city: 'Orlando', abbreviation: 'ORL', spendTier: 3 },
  { id: 'sixers', name: '76ers', city: 'Philadelphia', abbreviation: 'PHI', spendTier: 3 },
  { id: 'suns', name: 'Suns', city: 'Phoenix', abbreviation: 'PHX', spendTier: 5 },
  { id: 'blazers', name: 'Trail Blazers', city: 'Portland', abbreviation: 'POR', spendTier: 1 },
  { id: 'kings', name: 'Kings', city: 'Sacramento', abbreviation: 'SAC', spendTier: 2 },
  { id: 'spurs', name: 'Spurs', city: 'San Antonio', abbreviation: 'SAS', spendTier: 2 },
  { id: 'raptors', name: 'Raptors', city: 'Toronto', abbreviation: 'TOR', spendTier: 2 },
  { id: 'jazz', name: 'Jazz', city: 'Utah', abbreviation: 'UTA', spendTier: 1 },
  { id: 'wizards', name: 'Wizards', city: 'Washington', abbreviation: 'WAS', spendTier: 1 },
];

type Role = 'max' | 'near-max' | 'starter' | 'rotation' | 'bench' | 'rookie';

interface RoleTier {
  role: Role;
  count: number;
}

// Relative share of team payroll each role slot commands; used to distribute
// a team's target payroll (below) across its individual player salaries.
const ROLE_WEIGHT: Record<Role, number> = {
  max: 10,
  'near-max': 6,
  starter: 3,
  rotation: 1.3,
  bench: 0.5,
  rookie: 0.4,
};

const ROLE_RAISE: Record<Role, number> = {
  max: 0.08,
  'near-max': 0.08,
  starter: 0.05,
  rotation: 0.05,
  bench: 0.03,
  rookie: 0.10,
};

// Target total 2026-27 payroll band per spend tier, calibrated so only the
// highest-spending teams sit near/over the $221.7M second apron.
const TIER_PAYROLL_RANGE: Record<number, [number, number]> = {
  5: [216_000_000, 236_000_000],
  4: [196_000_000, 216_000_000],
  3: [172_000_000, 196_000_000],
  2: [148_000_000, 172_000_000],
  1: [122_000_000, 148_000_000],
};

function rolesForTier(spendTier: number): RoleTier[] {
  return [
    { role: 'max', count: spendTier >= 4 ? 2 : 1 },
    { role: 'near-max', count: spendTier >= 3 ? 2 : 1 },
    { role: 'starter', count: 2 },
    { role: 'rotation', count: 3 },
    { role: 'bench', count: 4 },
    { role: 'rookie', count: 2 },
  ];
}

function contractShapeForRole(rng: () => number, role: Role): { years: number; contractType: ContractType } {
  switch (role) {
    case 'max':
      return { years: 4, contractType: 'guaranteed' };
    case 'near-max':
      return { years: randInt(rng, 3, 4), contractType: 'guaranteed' };
    case 'starter':
      return { years: randInt(rng, 2, 4), contractType: 'guaranteed' };
    case 'rotation':
      return { years: randInt(rng, 1, 3), contractType: rng() > 0.7 ? 'team_option' : 'guaranteed' };
    case 'bench':
      return { years: randInt(rng, 1, 2), contractType: rng() > 0.6 ? 'non_guaranteed' : 'guaranteed' };
    case 'rookie':
      return { years: 4, contractType: 'guaranteed' };
  }
}

function buildPlayer(rng: () => number, role: Role, year1: number, usedNames: Set<string>): Player {
  let name = '';
  do {
    name = `${pick(rng, FIRST_NAMES)} ${pick(rng, LAST_NAMES)}`;
  } while (usedNames.has(name));
  usedNames.add(name);

  const { years, contractType } = contractShapeForRole(rng, role);
  const raise = ROLE_RAISE[role];
  const isRookie = role === 'rookie';
  const age = isRookie ? randInt(rng, 19, 22) : role === 'max' || role === 'near-max' ? randInt(rng, 24, 34) : randInt(rng, 21, 33);

  const salary: Partial<Record<Season, number>> = {};
  let current = Math.round(year1);
  for (let i = 0; i < SEASONS.length; i++) {
    if (i < years) {
      salary[SEASONS[i]] = current;
      current = Math.round(current * (1 + raise));
    }
  }

  const yearsOfService = isRookie ? 0 : Math.max(0, age - 22);
  const extensionEligible = years <= 2 && (role === 'max' || role === 'near-max' || role === 'starter');

  return {
    id: `${slugify(name)}_${1000 + randInt(rng, 0, 8999)}`,
    name,
    position: pick(rng, POSITIONS),
    age,
    salary,
    contractType,
    yearsRemaining: years,
    tradeKicker: role === 'max' || role === 'near-max' ? randInt(rng, 0, 15) : 0,
    noTradeClause: (role === 'max') && yearsOfService >= 8 && rng() > 0.5,
    birdRights: yearsOfService >= 3 && rng() > 0.3,
    rookieScale: isRookie,
    extensionEligible,
    notes: extensionEligible ? 'Extension-eligible this offseason' : '',
  };
}

export function generateLeague(seed = 2026): Team[] {
  const rng = mulberry32(seed);
  const usedNames = new Set<string>();

  return TEAM_SEEDS.map((seedTeam) => {
    const roles = rolesForTier(seedTeam.spendTier);
    const [minTarget, maxTarget] = TIER_PAYROLL_RANGE[seedTeam.spendTier];
    const targetPayroll = minTarget + rng() * (maxTarget - minTarget);
    const totalWeight = roles.reduce((sum, r) => sum + r.count * ROLE_WEIGHT[r.role], 0);
    const perUnit = targetPayroll / totalWeight;

    const players: Player[] = [];
    for (const roleTier of roles) {
      for (let i = 0; i < roleTier.count; i++) {
        const jitter = 0.88 + rng() * 0.24; // +/-12% variance so salaries aren't identical
        const year1 = Math.round((ROLE_WEIGHT[roleTier.role] * perUnit * jitter) / 10_000) * 10_000;
        players.push(buildPlayer(rng, roleTier.role, year1, usedNames));
      }
    }

    const payroll: Partial<Record<Season, number>> = {};
    for (const season of SEASONS) {
      payroll[season] = players.reduce((sum, p) => sum + (p.salary[season] ?? 0), 0);
    }

    const team: Team = {
      id: seedTeam.id,
      name: seedTeam.name,
      city: seedTeam.city,
      abbreviation: seedTeam.abbreviation,
      payroll,
      players,
      deadCap: {},
      draftPicks: [],
    };
    return team;
  });
}
