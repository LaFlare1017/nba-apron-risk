import type { CapData } from '../types';

// Base 2026-27 figures per NBA's official announcement; later seasons projected
// using the league's own guidance (+5.5% for 2027-28, +10% for 2028-29 / 2029-30).
export const capData: CapData[] = [
  {
    season: '2026-27',
    salaryCap: 154_600_000,
    luxuryTax: 187_900_000,
    firstApron: 209_000_000,
    secondApron: 221_700_000,
    minSalary: 1_270_000,
    maxSalary: {
      0: 41_040_000,
      7: 46_920_000,
      10: 54_040_000,
    },
  },
  {
    season: '2027-28',
    salaryCap: 163_100_000,
    luxuryTax: 198_200_000,
    firstApron: 220_500_000,
    secondApron: 233_900_000,
    minSalary: 1_340_000,
    maxSalary: {
      0: 43_300_000,
      7: 49_500_000,
      10: 57_010_000,
    },
  },
  {
    season: '2028-29',
    salaryCap: 179_400_000,
    luxuryTax: 217_900_000,
    firstApron: 242_500_000,
    secondApron: 257_300_000,
    minSalary: 1_470_000,
    maxSalary: {
      0: 47_630_000,
      7: 54_450_000,
      10: 62_710_000,
    },
  },
  {
    season: '2029-30',
    salaryCap: 197_300_000,
    luxuryTax: 239_700_000,
    firstApron: 266_700_000,
    secondApron: 283_000_000,
    minSalary: 1_620_000,
    maxSalary: {
      0: 52_390_000,
      7: 59_900_000,
      10: 68_980_000,
    },
  },
];
