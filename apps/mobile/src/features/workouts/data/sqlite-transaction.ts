import type { SqliteConnection } from './sqlite-connection.ts';

// The caller owns this connection and excludes other operations until this settles.
export async function writeTransaction<T>(db: SqliteConnection, task: () => Promise<T>): Promise<T> {
  await db.execAsync('BEGIN IMMEDIATE');
  try {
    const value = await task();
    await db.execAsync('COMMIT');
    // Nothing that can fail (including connection cleanup) may follow a successful commit.
    return value;
  } catch (error) {
    try { await db.execAsync('ROLLBACK'); } catch { /* The repository discards failed connections. */ }
    throw error;
  }
}
