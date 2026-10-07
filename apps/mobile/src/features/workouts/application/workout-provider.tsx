import { createContext, useContext, useRef, useState, useSyncExternalStore, type ReactNode } from 'react';
import { initialWorkoutState, workoutReducer, type WorkoutAction, type WorkoutState } from './workout-reducer';
import { createWorkoutService } from './workout-service';
import type { WorkoutHistoryRepository, DeleteCompletedWorkoutResult } from '../data/workout-repository';
import type { WorkoutLocale } from '../../../i18n/workout-copy';
export interface SetFields { reps: string; weight: string; dirty: boolean; validationRequested?: boolean }
export interface EditorState {
  fields: Record<string, SetFields>;
  editing: { exerciseKey: string; setKey: string; reps: string; weight: string; validationRequested?: boolean } | null;
  name: { key: string | null; value: string; validationRequested?: boolean } | null;
}
const emptyEditor = (): EditorState => ({ fields: {}, editing: null, name: null });
function createStore(repository: WorkoutHistoryRepository, clock: () => string) {
  let state: WorkoutState = initialWorkoutState;
  let sequence = 0, completedAt = '';
  const listeners = new Set<() => void>();
  const nextKey = () => 'local-' + ++sequence;
  const transition = (action: WorkoutAction) => {
    state = workoutReducer(state, action);
    for (const listener of listeners) listener();
    return state;
  };
  const getState = () => state;
  const service = createWorkoutService({ state: { getState, transition }, repository,
    now: () => { completedAt = clock(); return completedAt; }, newAttemptId: nextKey });
  return { getState, transition, nextKey, service, getCompletedAt: () => completedAt,
    subscribe(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener); }; } };
}
function useController(repository: WorkoutHistoryRepository, clock: () => string) {
  const [store] = useState(() => createStore(repository, clock));
  const state = useSyncExternalStore(store.subscribe, store.getState, store.getState);
  const { transition, nextKey, service } = store;
  const [locale, setLocale] = useState<WorkoutLocale>('zh');
  const [editor, setEditor] = useState<EditorState>(emptyEditor);
  const [calendarDate, setCalendarDate] = useState(() => new Date(clock()));
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [revision, setRevision] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const deleteLock = useRef(false);
  return { state, transition, service, locale, setLocale, editor, setEditor, repository, nextKey,
    calendarDate, setCalendarDate, selectedDate, setSelectedDate, revision, deleting,
    async removeWorkout(id: number, confirmed: boolean): Promise<DeleteCompletedWorkoutResult> {
      if (confirmed !== true) return { ok: false, code: 'NotConfirmed' };
      if (deleteLock.current || store.getState().status === 'completing') return { ok: false, code: 'Busy' };
      deleteLock.current = true; setDeleting(true);
      try {
        const result = await repository.deleteCompletedWorkout(id, true);
        // Refresh without resetting the selected date or touching the ongoing draft.
        if (result.ok || result.code === 'NotFound') setRevision(value => value + 1);
        return result;
      } catch { return { ok: false, code: 'UnexpectedStorageError' }; }
      finally { deleteLock.current = false; setDeleting(false); }
    },
    start() {
      const before = store.getState();
      if (before.status === 'idle' || before.status === 'completed') {
        transition({ type: 'START', startedAt: clock() }); setEditor(emptyEditor());
      }
    },
    resetEditor() { setEditor(emptyEditor()); },
    async finish() {
      const result = await service.completeWorkout(true);
      if (result.ok) {
        setEditor(emptyEditor()); setRevision(value => value + 1);
        const date = new Date(store.getCompletedAt()); setCalendarDate(date);
        setSelectedDate([date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-'));
      }
      return result;
    },
  };
}
const Context = createContext<ReturnType<typeof useController> | null>(null);
export function WorkoutProvider({ children, repository, now = () => new Date().toISOString() }:
  { children: ReactNode; repository: WorkoutHistoryRepository; now?: () => string }) {
  // One stable state container and service per app lifecycle, across routes and language changes.
  const [dependencies] = useState(() => ({ repository, now }));
  const controller = useController(dependencies.repository, dependencies.now);
  return <Context.Provider value={controller}>{children}</Context.Provider>;
}
export function useWorkout() {
  const value = useContext(Context);
  if (!value) throw new Error('WorkoutProvider is required');
  return value;
}
