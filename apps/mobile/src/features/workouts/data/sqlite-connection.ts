export type SqliteParameters = (string | number | null)[];

// A private connection owned by one repository. Do not also pass it to a UI provider.
export interface SqliteConnection {
  execAsync(sql: string): Promise<void>;
  runAsync(sql: string, params: SqliteParameters): Promise<{ lastInsertRowId: number; changes: number }>;
  getAllAsync<T>(sql: string): Promise<T[]>;
  getAllAsync<T>(sql: string, params: SqliteParameters): Promise<T[]>;
  closeAsync(): Promise<void>;
}
