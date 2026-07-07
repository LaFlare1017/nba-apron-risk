import { generateLeague } from './generateLeague';
import { generateExtensions } from './extensions';
import type { Extension, Team } from '../types';

export const INITIAL_SEED = 2026;

export function buildInitialTeams(): Team[] {
  return generateLeague(INITIAL_SEED);
}

export function buildInitialExtensions(teams: Team[]): Extension[] {
  return generateExtensions(teams, 4242);
}
