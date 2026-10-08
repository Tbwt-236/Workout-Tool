/** @jest-environment node */
import { afterEach, test } from '@jest/globals';
import assert from 'node:assert/strict';
import { migrateDatabase } from '../../src/features/workouts/data/migrations.ts';
import { sqliteFixture } from '../support/sqlite.ts';

const fixtures: ReturnType<typeof sqliteFixture>[] = [];
function fixture() { const f = sqliteFixture(); fixtures.push(f); return f; }
afterEach(() => { for (const f of fixtures.splice(0)) f.dispose(); });

test('空数据库初始化为 v1，开启 WAL、外键并建立三张表和历史索引', async () => {
  const { raw, connection } = fixture().open();
  await migrateDatabase(connection);
  assert.equal(raw.prepare('PRAGMA user_version').get()?.user_version, 1);
  assert.equal(raw.prepare('PRAGMA journal_mode').get()?.journal_mode, 'wal');
  assert.equal(raw.prepare('PRAGMA foreign_keys').get()?.foreign_keys, 1);
  assert.deepEqual(Array.from(raw.prepare("SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name").all(),
    row => row.name), ['exercises', 'sets', 'workouts']);
  assert.ok(raw.prepare("SELECT name FROM sqlite_master WHERE type = 'index' AND tbl_name = 'workouts'").get());
});

test('重复初始化及重开连接不覆盖既有数据，外键对每个连接生效', async () => {
  const f = fixture();
  const first = f.open();
  await migrateDatabase(first.connection);
  first.raw.exec("INSERT INTO workouts VALUES (7, '2026-09-17T01:00:00.000Z', '2026-09-17T01:30:00.000Z', 1800)");
  await migrateDatabase(first.connection);
  await first.connection.closeAsync();
  const second = f.open();
  await migrateDatabase(second.connection);
  assert.equal(second.raw.prepare('SELECT duration_seconds FROM workouts WHERE id=7').get()?.duration_seconds, 1800);
  assert.equal(second.raw.prepare('PRAGMA foreign_keys').get()?.foreign_keys, 1);
});

test('迁移中途碰到不兼容表时回滚所有新表和版本，修正后可重新初始化', async () => {
  const { raw, connection } = fixture().open();
  raw.exec('CREATE TABLE exercises (legacy_value TEXT); INSERT INTO exercises VALUES (\'keep\')');
  await assert.rejects(migrateDatabase(connection));
  assert.equal(raw.prepare('PRAGMA user_version').get()?.user_version, 0);
  assert.equal(raw.prepare("SELECT name FROM sqlite_master WHERE name='workouts'").get(), undefined);
  assert.equal(raw.prepare('SELECT legacy_value FROM exercises').get()?.legacy_value, 'keep');
  raw.exec('DROP TABLE exercises');
  await migrateDatabase(connection);
  assert.equal(raw.prepare('PRAGMA user_version').get()?.user_version, 1);
});

test('不支持的更高版本禁止降级，不覆盖未来数据', async () => {
  const { raw, connection } = fixture().open();
  raw.exec('PRAGMA user_version=2; CREATE TABLE future_data(value TEXT); INSERT INTO future_data VALUES (\'keep\')');
  await assert.rejects(migrateDatabase(connection));
  assert.equal(raw.prepare('PRAGMA user_version').get()?.user_version, 2);
  assert.equal(raw.prepare('SELECT value FROM future_data').get()?.value, 'keep');
});

test('版本号为 v1 但缺少实体表时不能宣称初始化成功', async () => {
  const { raw, connection } = fixture().open();
  raw.exec('PRAGMA user_version=1');
  await assert.rejects(migrateDatabase(connection));
});

test('数据库约束拒绝孤儿、重复位置、越界及小数整数值，删除父记录级联清理', async () => {
  const { raw, connection } = fixture().open();
  await migrateDatabase(connection);
  raw.exec("INSERT INTO workouts VALUES (1, '2026-09-17T01:00:00.000Z', '2026-09-17T01:30:00.000Z', 1800)");
  const exercise = raw.prepare('INSERT INTO exercises (workout_id, name, position) VALUES (?, ?, ?)');
  assert.throws(() => exercise.run(999, 'orphan', 0));
  exercise.run(1, '深蹲', 0);
  for (const [name, position] of [['duplicate', 0], ['', 1], ['x'.repeat(81), 1], ['bad', -1], ['bad', 1.5]] as const) {
    assert.throws(() => exercise.run(1, name, position));
  }
  const set = raw.prepare('INSERT INTO sets (exercise_id, position, reps, weight_tenths_kg) VALUES (?, ?, ?, ?)');
  for (const [id, position, reps, weight] of [[999, 0, 8, null], [1, -1, 8, null], [1, 0.5, 8, null],
    [1, 0, 0, null], [1, 0, 1000, null], [1, 0, 8.5, null], [1, 0, 8, 0], [1, 0, 8, 10001], [1, 0, 8, 625.5]]) {
    assert.throws(() => set.run(id, position, reps, weight));
  }
  set.run(1, 0, 8, 625);
  assert.throws(() => set.run(1, 0, 9, null));
  raw.exec('DELETE FROM workouts WHERE id=1');
  assert.equal(raw.prepare('SELECT COUNT(*) AS n FROM exercises').get()?.n, 0);
  assert.equal(raw.prepare('SELECT COUNT(*) AS n FROM sets').get()?.n, 0);
});
