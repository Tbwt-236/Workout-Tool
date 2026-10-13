import type { WorkoutHistoryRepository } from '../../workouts/data/workout-repository';
import type { ExportFiles } from '../data/export-file-port';
import type { WorkoutLocale } from '../../../i18n/workout-copy';
import { encodeExportDocument } from '../domain/export-document';

export type ExportPhase = 'idle' | 'preparing' | 'snapshotting' | 'writing' | 'sharing' | 'error';
export type ExportError = 'Busy' | 'Empty' | 'ReadFailed' | 'WriteFailed' | 'SharingUnavailable' | 'ShareFailed';
export interface ExportState { readonly phase: ExportPhase; readonly error?: ExportError }

type ExportResult = { readonly ok: true } | { readonly ok: false; readonly code: ExportError | 'Cancelled' };
export function createExportService({ repository, files, now = () => new Date().toISOString() }:
  { repository: WorkoutHistoryRepository; files: ExportFiles; now?: () => string }) {
  let state: ExportState = { phase: 'idle' };
  let current: { cancelled: boolean; handed: boolean } | null = null;
  const listeners = new Set<() => void>();
  const publish = (next: ExportState) => { state = next; for (const listener of listeners) listener(); };
  return {
    getState: () => state,
    subscribe(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener); }; },
    cancelPending() { if (current && !current.handed) current.cancelled = true; },
    async cleanup() { try { await files.cleanup(); } catch { /* Retry on next launch/export; never touch workouts. */ } },
    async start(locale: WorkoutLocale, waitFor: Promise<void> = Promise.resolve()): Promise<ExportResult> {
      if (current) return { ok: false, code: 'Busy' };
      const job = { cancelled: false, handed: false }; current = job;
      let uri: string | null = null, failure: ExportError = 'ReadFailed';
      const cancelled = (): ExportResult => ({ ok: false, code: 'Cancelled' });
      const fail = (code: ExportError): ExportResult => { publish({ phase: 'error', error: code }); return { ok: false, code }; };
      publish({ phase: 'preparing' });
      try {
        await waitFor;
        if (job.cancelled) return cancelled();
        publish({ phase: 'snapshotting' });
        const result = await repository.readExportSnapshot();
        if (job.cancelled) return cancelled();
        if (!result.ok) return fail(result.code === 'Busy' ? 'Busy' : 'ReadFailed');
        // The repository lock is released before encoding, filesystem and native UI.
        publish({ phase: 'preparing' });
        if (result.snapshot.workouts.length === 0) return fail('Empty');
        const document = encodeExportDocument(result.snapshot, now());
        failure = 'SharingUnavailable';
        if (!(await files.isSharingAvailable())) return fail('SharingUnavailable');
        if (job.cancelled) return cancelled();
        try { await files.cleanup(); } catch { /* Best effort, independently retryable. */ }
        if (job.cancelled) return cancelled();
        failure = 'WriteFailed'; publish({ phase: 'writing' });
        uri = await files.write(document);
        if (job.cancelled) return cancelled();
        failure = 'ShareFailed'; publish({ phase: 'sharing' });
        job.handed = true;
        await files.share(uri, locale);
        // void return is not a receipt. The UI simply becomes ready for another explicit action.
        return { ok: true };
      } catch { return job.cancelled ? cancelled() : fail(failure); }
      finally {
        if (uri) { try { await files.release(uri, !job.handed); } catch { /* Future scoped cleanup can retry. */ } }
        current = null;
        if (job.cancelled || state.phase !== 'error') publish({ phase: 'idle' });
      }
    },
  };
}
export type ExportService = ReturnType<typeof createExportService>;
