import { Directory, File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import type { ExportFiles } from './export-file-port';

const lifetimeMs = 24 * 60 * 60 * 1000;
const managedName = /^export-\d+-\d+-[a-f0-9]+\.(?:json|partial)$/;
// One instance per provider: active files stay protected across sheet closures.
export function createNativeExportFiles(): ExportFiles {
  const active = new Set<string>();
  let sequence = 0;
  const directory = () => new Directory(Paths.cache, 'fitquest-exports');
  function controlled(uri: string): File {
    const file = new File(uri);
    if (!managedName.test(file.name) || new File(directory(), file.name).uri !== uri) throw new Error('Unowned export file');
    return file;
  }
  return {
    async cleanup() {
      const dir = directory();
      if (!dir.exists) return;
      const now = Date.now();
      for (const entry of dir.list()) {
        if (!(entry instanceof File) || !managedName.test(entry.name) || active.has(entry.uri)) continue;
        try {
          const file = controlled(entry.uri), modified = file.modificationTime;
          if (modified !== null && Number.isFinite(modified) && modified >= 0 && now - modified >= lifetimeMs) file.delete();
        } catch { /* Cache can disappear or remain unavailable; retry a later scoped sweep. */ }
      }
    },
    isSharingAvailable: () => Sharing.isAvailableAsync(),
    async write(document) {
      const dir = directory(); dir.create({ intermediates: true, idempotent: true });
      const name = `export-${Date.now()}-${++sequence}-${Math.floor(Math.random() * 0x100000000).toString(16)}`;
      const partial = new File(dir, name + '.partial'), complete = new File(dir, name + '.json');
      if (partial.exists || complete.exists) throw new Error('Export name collision');
      // move mutates partial.uri; keep immutable names for failure cleanup.
      const partialUri = partial.uri, completeUri = complete.uri;
      active.add(partialUri); active.add(completeUri);
      let created = false;
      try {
        partial.create(); created = true;
        partial.write(document, { encoding: 'utf8' });
        await partial.move(complete);
        if (!complete.exists || complete.size <= 0) throw new Error('Incomplete export');
        active.delete(partialUri);
        return completeUri;
      } catch (error) {
        if (created) for (const uri of [partialUri, completeUri]) {
          try { const file = controlled(uri); if (file.exists) file.delete(); } catch { /* Scoped cleanup retries. */ }
        }
        active.delete(partialUri); active.delete(completeUri);
        throw error;
      }
    },
    async share(uri, locale) {
      const file = controlled(uri);
      if (!active.has(uri) || !uri.endsWith('.json') || !file.exists || file.size <= 0) throw new Error('Export unavailable');
      await Sharing.shareAsync(uri, { mimeType: 'application/json', UTI: 'public.json',
        dialogTitle: locale === 'zh' ? '导出训练' : 'Export workouts' });
    },
    async release(uri, remove) {
      const file = controlled(uri);
      if (!active.has(uri)) throw new Error('Inactive export file');
      try { if (remove && file.exists) file.delete(); }
      finally { active.delete(uri); }
    },
  };
}
