import { useEffect, useMemo, useRef, useState } from 'react';
import type { ContractType, Player, Position, Season } from '../types';
import { SEASONS } from '../types';
import { useRosterStore } from '../stores/rosterStore';
import { fieldInput, modalCore, modalShell, pillButtonDanger, pillButtonPrimary, pillButtonSecondary } from '../styles/tokens';

interface Props {
  mode: 'add' | 'edit';
  teamId: string;
  player: Player | null;
  onClose: () => void;
}

const POSITIONS: Position[] = ['PG', 'SG', 'SF', 'PF', 'C'];
const CONTRACT_TYPES: ContractType[] = ['guaranteed', 'player_option', 'team_option', 'non_guaranteed', 'two_way'];

function emptyPlayer(): Omit<Player, 'id'> {
  return {
    name: '',
    position: 'SF',
    age: 24,
    salary: { '2026-27': 2_000_000 },
    contractType: 'guaranteed',
    yearsRemaining: 1,
    tradeKicker: 0,
    noTradeClause: false,
    birdRights: false,
    rookieScale: false,
    extensionEligible: false,
    notes: '',
  };
}

export function PlayerModal({ mode, teamId, player, onClose }: Props) {
  const addPlayer = useRosterStore((s) => s.addPlayer);
  const editPlayer = useRosterStore((s) => s.editPlayer);
  const removePlayer = useRosterStore((s) => s.removePlayer);
  const teams = useRosterStore((s) => s.teams);
  const allPlayers = useMemo(() => teams.flatMap((t) => t.players), [teams]);

  const [form, setForm] = useState<Omit<Player, 'id'>>(player ?? emptyPlayer());
  const [cloneFrom, setCloneFrom] = useState('');
  const firstFieldRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    firstFieldRef.current?.focus();
    const previouslyFocused = document.activeElement as HTMLElement | null;
    return () => previouslyFocused?.focus();
  }, []);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab' && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll<HTMLElement>(
          'button, input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  function updateSalary(season: Season, value: number) {
    setForm((f) => ({ ...f, salary: { ...f.salary, [season]: value } }));
  }

  function handleClone(playerId: string) {
    setCloneFrom(playerId);
    const source = allPlayers.find((p) => p.id === playerId);
    if (source) {
      const { id: _id, ...rest } = source;
      setForm(rest);
    }
  }

  function handleSave() {
    if (!form.name.trim()) return;
    if (mode === 'add') {
      const id = `${form.name.toLowerCase().replace(/[^a-z0-9]+/g, '_')}_${Date.now().toString(36)}`;
      addPlayer({ id, ...form }, teamId);
    } else if (player) {
      editPlayer(player.id, form);
    }
    onClose();
  }

  function handleDelete() {
    if (player) removePlayer(player.id, teamId);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div ref={modalRef} role="dialog" aria-modal="true" aria-label={mode === 'add' ? 'Add player' : 'Edit player'} className={`${modalShell} max-w-md animate-fade-up`}>
        <div className={modalCore}>
          <h2 className="mb-4 text-lg font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
            {mode === 'add' ? 'Add Player' : `Edit ${player?.name}`}
          </h2>

          <div className="flex flex-col gap-3">
            {mode === 'add' && (
              <label className="text-sm text-slate-500 dark:text-slate-400">
                Clone from existing
                <select className={`${fieldInput} mt-1`} value={cloneFrom} onChange={(e) => handleClone(e.target.value)}>
                  <option value="">— none —</option>
                  {allPlayers.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </label>
            )}

            <label className="text-sm text-slate-500 dark:text-slate-400">
              Name
              <input
                ref={firstFieldRef}
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className={`${fieldInput} mt-1`}
              />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="text-sm text-slate-500 dark:text-slate-400">
                Position
                <select
                  value={form.position}
                  onChange={(e) => setForm((f) => ({ ...f, position: e.target.value as Position }))}
                  className={`${fieldInput} mt-1`}
                >
                  {POSITIONS.map((pos) => <option key={pos} value={pos}>{pos}</option>)}
                </select>
              </label>
              <label className="text-sm text-slate-500 dark:text-slate-400">
                Age
                <input
                  type="number"
                  value={form.age}
                  onChange={(e) => setForm((f) => ({ ...f, age: Number(e.target.value) }))}
                  className={`${fieldInput} mt-1`}
                />
              </label>
            </div>

            <fieldset>
              <legend className="text-sm text-slate-500 dark:text-slate-400">Salary by season</legend>
              <div className="mt-1 grid grid-cols-2 gap-2">
                {SEASONS.map((season) => (
                  <label key={season} className="text-xs text-slate-400 dark:text-slate-500">
                    {season}
                    <input
                      type="number"
                      value={form.salary[season] ?? ''}
                      onChange={(e) => updateSalary(season, Number(e.target.value))}
                      className={`${fieldInput} mt-0.5`}
                    />
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend className="text-sm text-slate-500 dark:text-slate-400">Contract type</legend>
              <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1.5">
                {CONTRACT_TYPES.map((type) => (
                  <label key={type} className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                    <input
                      type="radio"
                      name="contractType"
                      checked={form.contractType === type}
                      onChange={() => setForm((f) => ({ ...f, contractType: type }))}
                    />
                    {type.replace('_', ' ')}
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="grid grid-cols-2 gap-3">
              <label className="text-sm text-slate-500 dark:text-slate-400">
                Years remaining
                <input
                  type="number"
                  min={0}
                  value={form.yearsRemaining}
                  onChange={(e) => setForm((f) => ({ ...f, yearsRemaining: Number(e.target.value) }))}
                  className={`${fieldInput} mt-1`}
                />
              </label>
              <label className="text-sm text-slate-500 dark:text-slate-400">
                Trade kicker %
                <input
                  type="number"
                  min={0}
                  max={15}
                  value={form.tradeKicker}
                  onChange={(e) => setForm((f) => ({ ...f, tradeKicker: Number(e.target.value) }))}
                  className={`${fieldInput} mt-1`}
                />
              </label>
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-slate-600 dark:text-slate-300">
              <label className="flex items-center gap-1.5">
                <input
                  type="checkbox"
                  checked={form.noTradeClause}
                  onChange={(e) => setForm((f) => ({ ...f, noTradeClause: e.target.checked }))}
                />
                No-trade clause
              </label>
              <label className="flex items-center gap-1.5">
                <input
                  type="checkbox"
                  checked={form.rookieScale}
                  onChange={(e) => setForm((f) => ({ ...f, rookieScale: e.target.checked }))}
                />
                Rookie scale
              </label>
            </div>

            <label className="text-sm text-slate-500 dark:text-slate-400">
              Notes
              <textarea
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                rows={2}
                className={`${fieldInput} mt-1`}
              />
            </label>
          </div>

          <div className="mt-5 flex justify-between gap-2">
            <div>
              {mode === 'edit' && (
                <button onClick={handleDelete} className={pillButtonDanger}>
                  Delete Player
                </button>
              )}
            </div>
            <div className="flex gap-2">
              <button onClick={onClose} className={pillButtonSecondary}>
                Cancel
              </button>
              <button onClick={handleSave} className={pillButtonPrimary}>
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
