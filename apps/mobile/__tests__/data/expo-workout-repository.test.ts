/** @jest-environment node */
import { afterEach, jest, test } from '@jest/globals';
import assert from 'node:assert/strict';
import { openDatabaseAsync } from 'expo-sqlite';
import { createExpoWorkoutRepository } from '../../src/features/workouts/data/expo-workout-repository.ts';
import { sqliteFixture } from '../support/sqlite.ts';

// Only native opening is replaced. Migrations and all SQL use a real desktop SQLite file.
jest.mock('expo-sqlite', () => ({ openDatabaseAsync: jest.fn() }));
const open = jest.mocked(openDatabaseAsync);
afterEach(() => { open.mockReset(); });

test('Expo 工厂使用独立连接和固定本地文件，完成初始化前不声明可用', async () => {
  const f = sqliteFixture();
  try {
    const { connection, raw } = f.open();
    open.mockResolvedValue(connection as Awaited<ReturnType<typeof openDatabaseAsync>>);
    const repository = createExpoWorkoutRepository();
    assert.deepEqual(await repository.initialize(), { ok: true });
    assert.equal(open.mock.calls.length, 1);
    assert.equal(open.mock.calls[0][0], 'fitquest.db');
    assert.deepEqual(open.mock.calls[0][1], { useNewConnection: true });
    assert.equal(raw.prepare('PRAGMA user_version').get()?.user_version, 1);
  } finally { f.dispose(); }
});

test('Expo 打开文件失败不会向调用者泄漏原生路径或抛错', async () => {
  open.mockRejectedValue(new Error('native /synthetic/private/path open failed'));
  assert.deepEqual(await createExpoWorkoutRepository().initialize(), { ok: false, code: 'StorageUnavailable' });
});
