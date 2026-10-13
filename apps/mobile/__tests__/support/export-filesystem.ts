// Native bridge double backed by real temporary filesystem I/O. Never used by the app.
import * as fs from 'node:fs';
import { join, basename } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
export const faults = { write: false, remove: false, move: '' as '' | 'before' | 'after' };
export const Paths = { cache: '' };
const location = (parts: (string | { uri: string })[]) => pathToFileURL(join(...parts.map(p => {
  const value = typeof p === 'string' ? p : p.uri;
  return value.startsWith('file:') ? fileURLToPath(value) : value;
}))).href;
export class File {
  uri: string;
  constructor(...parts: (string | { uri: string })[]) { this.uri = location(parts); }
  get name() { return basename(fileURLToPath(this.uri)); }
  get exists() { return fs.existsSync(fileURLToPath(this.uri)); }
  get size() { return fs.statSync(fileURLToPath(this.uri)).size; }
  get modificationTime() { return fs.statSync(fileURLToPath(this.uri)).mtimeMs; }
  create() { fs.closeSync(fs.openSync(fileURLToPath(this.uri), 'wx')); }
  write(value: string) { if (faults.write) throw new Error('disk full'); fs.writeFileSync(fileURLToPath(this.uri), value, 'utf8'); }
  async move(file: File) {
    if (faults.move === 'before') throw new Error('move unavailable');
    fs.renameSync(fileURLToPath(this.uri), fileURLToPath(file.uri)); this.uri = file.uri;
    if (faults.move === 'after') throw new Error('lost move response');
  }
  delete() { if (faults.remove) throw new Error('unavailable'); fs.unlinkSync(fileURLToPath(this.uri)); }
}
export class Directory {
  uri: string;
  constructor(...parts: (string | { uri: string })[]) { this.uri = location(parts); }
  get exists() { return fs.existsSync(fileURLToPath(this.uri)); }
  create() { fs.mkdirSync(fileURLToPath(this.uri), { recursive: true }); }
  list() { return fs.readdirSync(fileURLToPath(this.uri), { withFileTypes: true }).map(p => p.isDirectory() ? new Directory(this, p.name) : new File(this, p.name)); }
}
