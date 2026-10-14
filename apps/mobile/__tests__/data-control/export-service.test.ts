import { test, expect, jest } from '@jest/globals';
import * as service from '../../src/features/data-control/application/export-service';
import type { ExportFiles } from '../../src/features/data-control/data/export-file-port';
import { createSqliteWorkoutRepository } from '../../src/features/workouts/data/sqlite-workout-repository';
import { sqliteFixture, deferred } from '../support/sqlite';
const at = '2026-10-12T03:00:00.000Z';
const draft = { startedAt: '2026-10-12T02:00:00.000Z', exercises: [{ localKey: 'e', name: '深蹲', position: 0,
  sets: [{ localKey: 's', position: 0, reps: 8, weightTenthsKg: null }] }] };
async function setup(seed = true) {
  expect(service).toHaveProperty('createExportService', expect.any(Function));
  const f = sqliteFixture(), repository = createSqliteWorkoutRepository(async () => f.open().connection);
  if (seed) await repository.saveCompletedWorkout(draft, at);
  let serial = 0;
  const files: ExportFiles = { cleanup: jest.fn(async () => {}), isSharingAvailable: async () => true,
    write: jest.fn(async () => 'file://synthetic/export-' + ++serial + '.json'),
    share: jest.fn(async () => {}), release: jest.fn(async () => {}) };
  const exporter = service.createExportService({ repository, files, now: () => at });
  return { f, files, repository, exporter };
}
test('完整快照生成一次文件，系统返回不表示保存成功；文件/分享不持仓储锁', async () => {
  const x = await setup();
  try {
    x.files.share = jest.fn(async () => { expect(await x.repository.deleteCompletedWorkout(1, true)).toEqual({ ok: true }); });
    expect(await x.exporter.start('zh')).toEqual({ ok: true });
    expect(JSON.parse(jest.mocked(x.files.write).mock.calls[0][0]).workouts[0].exercises[0].sets[0].weightTenthsKg).toBeNull();
    expect(x.files.share).toHaveBeenCalledWith('file://synthetic/export-1.json', 'zh');
    expect(x.files.release).toHaveBeenCalledWith('file://synthetic/export-1.json', false);
    expect(x.exporter.getState()).toEqual({ phase: 'idle' });
  } finally { x.f.dispose(); }
});
test('排队期间重复点击只有一个任务；关闭使迟到结果不能写文件或分享', async () => {
  const x = await setup(), wait = deferred();
  try {
    const pending = x.exporter.start('en', wait.promise);
    expect(await x.exporter.start('en')).toEqual({ ok: false, code: 'Busy' });
    x.exporter.cancelPending(); wait.resolve();
    expect(await pending).toEqual({ ok: false, code: 'Cancelled' });
    expect(x.files.write).not.toHaveBeenCalled(); expect(x.files.share).not.toHaveBeenCalled();
    expect(await x.exporter.start('zh')).toEqual({ ok: true });
  } finally { wait.resolve(); x.f.dispose(); }
});
test('写入中关闭仅清理自己的未交接文件，旧任务结束前不放开锁', async () => {
  const x = await setup(), writing = deferred(), finish = deferred();
  x.files.write = jest.fn(async () => { writing.resolve(); await finish.promise; return 'file://synthetic/own.json'; });
  try {
    const pending = x.exporter.start('zh'); await writing.promise; x.exporter.cancelPending();
    expect(await x.exporter.start('zh')).toEqual({ ok: false, code: 'Busy' });
    finish.resolve(); expect(await pending).toEqual({ ok: false, code: 'Cancelled' });
    expect(x.files.release).toHaveBeenCalledWith('file://synthetic/own.json', true);
    expect(x.files.share).not.toHaveBeenCalled();
  } finally { finish.resolve(); x.f.dispose(); }
});
test.each(['write', 'share'] as const)('%s故障可重新导出；交接后异常不立即删文件', async failure => {
  const x = await setup(); const operation = x.files[failure]; let first = true;
  if (failure === 'write') x.files.write = async value => { if (first) { first = false; throw new Error('private path'); } return (operation as ExportFiles['write'])(value); };
  else x.files.share = async (uri, locale) => { if (first) { first = false; throw new Error('native failure'); } await (operation as ExportFiles['share'])(uri, locale); };
  try {
    expect(await x.exporter.start('zh')).toEqual({ ok: false, code: failure === 'write' ? 'WriteFailed' : 'ShareFailed' });
    expect(x.exporter.getState().phase).toBe('error');
    if (failure === 'share') expect(x.files.release).toHaveBeenCalledWith('file://synthetic/export-1.json', false);
    expect(await x.exporter.start('en')).toEqual({ ok: true });
    expect((await x.repository.listCompletedWorkouts())).toMatchObject({ ok: true, workouts: [expect.any(Object)] });
  } finally { x.f.dispose(); }
});
test('空历史与读取失败不生成文件，也不冒充合法空导出', async () => {
  const x = await setup(false);
  try {
    expect(await x.exporter.start('zh')).toEqual({ ok: false, code: 'Empty' });
    x.repository.readExportSnapshot = async () => ({ ok: false, code: 'StorageUnavailable' });
    expect(await x.exporter.start('zh')).toEqual({ ok: false, code: 'ReadFailed' });
    expect(x.files.write).not.toHaveBeenCalled(); expect(x.files.share).not.toHaveBeenCalled();
  } finally { x.f.dispose(); }
});

test('等待分享能力时已取消，迟到的不可用结果不再发布错误', async () => {
  const x = await setup(), checking = deferred(), finish = deferred();
  const phases: string[] = [];
  x.files.isSharingAvailable = async () => { checking.resolve(); await finish.promise; return false; };
  const unsubscribe = x.exporter.subscribe(() => phases.push(x.exporter.getState().phase));
  try {
    const pending = x.exporter.start('zh'); await checking.promise;
    x.exporter.cancelPending(); finish.resolve();
    expect(await pending).toEqual({ ok: false, code: 'Cancelled' });
    expect(phases).not.toContain('error');
    expect(x.exporter.getState()).toEqual({ phase: 'idle' });
    expect(x.files.write).not.toHaveBeenCalled(); expect(x.files.share).not.toHaveBeenCalled();
    x.files.isSharingAvailable = async () => true;
    expect(await x.exporter.start('zh')).toEqual({ ok: true });
  } finally { finish.resolve(); unsubscribe(); x.f.dispose(); }
});

test.each(['unavailable', 'throws'] as const)('分享能力检查%s时不生成文件，恢复后可显式重试', async failure => {
  const x = await setup();
  try {
    const before = await x.repository.listCompletedWorkouts();
    x.files.isSharingAvailable = async () => { if (failure === 'throws') throw new Error('native check failed'); return false; };
    expect(await x.exporter.start('zh')).toEqual({ ok: false, code: 'SharingUnavailable' });
    expect(x.files.write).not.toHaveBeenCalled(); expect(x.files.share).not.toHaveBeenCalled();
    expect(x.files.release).not.toHaveBeenCalled();
    expect(await x.repository.listCompletedWorkouts()).toEqual(before);
    x.files.isSharingAvailable = async () => true;
    expect(await x.exporter.start('en')).toEqual({ ok: true });
  } finally { x.f.dispose(); }
});

test('缓存清理中关闭面板，清理完成后不写文件或迟到分享', async () => {
  const x = await setup(), cleaning = deferred(), finish = deferred();
  x.files.cleanup = async () => { cleaning.resolve(); await finish.promise; };
  try {
    const pending = x.exporter.start('zh'); await cleaning.promise; x.exporter.cancelPending();
    expect(await x.exporter.start('en')).toEqual({ ok: false, code: 'Busy' });
    finish.resolve(); expect(await pending).toEqual({ ok: false, code: 'Cancelled' });
    expect(x.files.write).not.toHaveBeenCalled(); expect(x.files.share).not.toHaveBeenCalled();
    expect(x.exporter.getState()).toEqual({ phase: 'idle' });
  } finally { finish.resolve(); x.f.dispose(); }
});

test('系统已接管后后台事件不删文件或重复分享，返回后可再导出', async () => {
  const x = await setup(), sharing = deferred(), finish = deferred();
  x.files.share = jest.fn(async () => { sharing.resolve(); await finish.promise; });
  try {
    const pending = x.exporter.start('zh'); await sharing.promise; x.exporter.cancelPending();
    expect(await x.exporter.start('en')).toEqual({ ok: false, code: 'Busy' });
    expect(x.files.release).not.toHaveBeenCalled();
    finish.resolve(); expect(await pending).toEqual({ ok: true });
    expect(x.files.share).toHaveBeenCalledTimes(1);
    expect(x.files.release).toHaveBeenCalledWith('file://synthetic/export-1.json', false);
    expect(await x.exporter.start('en')).toEqual({ ok: true });
    expect(x.files.share).toHaveBeenCalledTimes(2);
  } finally { finish.resolve(); x.f.dispose(); }
});

test('取消写入后释放迟到仍保持单任务，释放失败也能结束并重试', async () => {
  const x = await setup(), writing = deferred(), finishWrite = deferred(), releasing = deferred(), finishRelease = deferred();
  x.files.write = jest.fn(async () => { writing.resolve(); await finishWrite.promise; return 'file://synthetic/cancelled.json'; });
  x.files.release = jest.fn(async () => { releasing.resolve(); await finishRelease.promise; throw new Error('cleanup failed'); });
  try {
    const pending = x.exporter.start('zh'); await writing.promise; x.exporter.cancelPending();
    finishWrite.resolve(); await releasing.promise;
    expect(await x.exporter.start('en')).toEqual({ ok: false, code: 'Busy' });
    expect(x.files.share).not.toHaveBeenCalled();
    expect(x.files.release).toHaveBeenCalledWith('file://synthetic/cancelled.json', true);
    finishRelease.resolve(); expect(await pending).toEqual({ ok: false, code: 'Cancelled' });
    expect(x.exporter.getState()).toEqual({ phase: 'idle' });
    x.files.release = async () => {};
    expect(await x.exporter.start('zh')).toEqual({ ok: true });
  } finally { finishWrite.resolve(); finishRelease.resolve(); x.f.dispose(); }
});
