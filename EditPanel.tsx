import { useState } from 'react';
import { DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { useRosterStore } from '../stores/rosterStore';
import { RosterPanel } from './RosterPanel';
import { TradeValidationPanel } from './TradeValidationPanel';
import { PlayerModal } from './PlayerModal';
import type { Player } from '../types';

export function EditPanel() {
  const editMode = useRosterStore((s) => s.editMode);
  const selectedTeamA = useRosterStore((s) => s.selectedTeamA);
  const selectedTeamB = useRosterStore((s) => s.selectedTeamB);
  const selectTeamA = useRosterStore((s) => s.selectTeamA);
  const selectTeamB = useRosterStore((s) => s.selectTeamB);
  const movePlayer = useRosterStore((s) => s.movePlayer);

  const [modalState, setModalState] = useState<
    { mode: 'add'; teamId: string } | { mode: 'edit'; teamId: string; player: Player } | null
  >(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor),
  );

  if (!editMode) return null;

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;
    const fromTeamId = active.data.current?.teamId as string | undefined;
    const toTeamId = String(over.id);
    if (!fromTeamId || toTeamId.startsWith('empty-') || fromTeamId === toTeamId) return;
    movePlayer(String(active.id), fromTeamId, toTeamId);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <div className="mb-4 border-t border-black/5 pt-6 dark:border-white/10">
        <span className="inline-flex items-center rounded-full bg-black/5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500 dark:bg-white/10 dark:text-slate-400">
          Edit Mode
        </span>
        <h2 className="mt-2 text-lg font-extrabold tracking-tight text-slate-900 dark:text-slate-50">Roster Editor</h2>
      </div>
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div className="flex flex-col gap-4 md:flex-row">
          <RosterPanel
            side="A"
            teamId={selectedTeamA}
            otherTeamId={selectedTeamB}
            onSelectTeam={selectTeamA}
            onEditPlayer={(player, teamId) => setModalState({ mode: 'edit', teamId, player })}
            onAddPlayer={(teamId) => setModalState({ mode: 'add', teamId })}
          />
          <RosterPanel
            side="B"
            teamId={selectedTeamB}
            otherTeamId={selectedTeamA}
            onSelectTeam={selectTeamB}
            onEditPlayer={(player, teamId) => setModalState({ mode: 'edit', teamId, player })}
            onAddPlayer={(teamId) => setModalState({ mode: 'add', teamId })}
          />
        </div>
      </DndContext>

      <TradeValidationPanel />

      {modalState && (
        <PlayerModal
          mode={modalState.mode}
          teamId={modalState.teamId}
          player={modalState.mode === 'edit' ? modalState.player : null}
          onClose={() => setModalState(null)}
        />
      )}
    </div>
  );
}
