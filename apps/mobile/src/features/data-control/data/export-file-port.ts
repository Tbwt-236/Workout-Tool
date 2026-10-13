import type { WorkoutLocale } from '../../../i18n/workout-copy';

export interface ExportFiles {
  cleanup(): Promise<void>;
  isSharingAvailable(): Promise<boolean>;
  write(document: string): Promise<string>;
  share(uri: string, locale: WorkoutLocale): Promise<void>;
  // Remove only when never handed to the system; otherwise release active-file protection.
  release(uri: string, remove: boolean): Promise<void>;
}
