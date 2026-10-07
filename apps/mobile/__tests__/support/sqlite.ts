import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { DatabaseSync as Database } from 'node:sqlite';
import type { SqliteConnection, SqliteParameters } from '../../src/features/workouts/data/sqlite-connection.ts';

// Node's real SQLite engine, not a SQL parser mock. Native Expo acceptance is separate.
const { DatabaseSync } = process.getBuiltinModule('node:sqlite');

export function sqliteFixture() {
  const directory = mkdtempSync(join(tmpdir(), 'fitquest-sqlite-'));
  const path = join(directory, 'synthetic.db');
  const connections = new Set<Database>();
  function open() {
    const raw = new DatabaseSync(path, { enableForeignKeyConstraints: false });
    connections.add(raw);
    const connection: SqliteConnection = {
      async execAsync(sql) { raw.exec(sql); },
      async runAsync(sql, params) {
        const result = raw.prepare(sql).run(...params);
        return { lastInsertRowId: Number(result.lastInsertRowid), changes: Number(result.changes) };
      },
      async getAllAsync<T>(sql: string, params: SqliteParameters = []): Promise<T[]> {
        // Copy across Jest's VM boundary; native arrays/rows have a different prototype.
        return Array.from(raw.prepare(sql).all(...params), row => ({ ...row })) as T[];
      },
      async closeAsync() { if (connections.delete(raw)) raw.close(); },
    };
    return { raw, connection };
  }
  return { open, dispose() {
    for (const raw of connections) raw.close();
    connections.clear();
    rmSync(directory, { recursive: true, force: true });
  } };
}

export function deferred() {
  let resolve!: () => void;
  const promise = new Promise<void>(done => { resolve = done; });
  return { promise, resolve };
}
