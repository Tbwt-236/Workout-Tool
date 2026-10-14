import { test, expect, jest, afterEach } from '@jest/globals';
import { mkdtempSync, readFileSync, writeFileSync, utimesSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import * as native from '../../src/features/data-control/data/native-export-files';
import { Paths, Directory, faults } from '../support/export-filesystem';
import * as Sharing from 'expo-sharing';
jest.mock('expo-file-system', () => jest.requireActual('../support/export-filesystem'));
jest.mock('expo-sharing', () => ({ isAvailableAsync: jest.fn(async () => true), shareAsync: jest.fn(async () => {}) }));
let root = '';
afterEach(() => { if (root) rmSync(root, { recursive: true, force: true }); root = ''; faults.write = faults.remove = false; faults.move = ''; jest.clearAllMocks(); });
function setup() {
  expect(native).toHaveProperty('createNativeExportFiles', expect.any(Function));
  root = mkdtempSync(join(tmpdir(), 'fitquest-export-')); Paths.cache = root;
  return native.createNativeExportFiles();
}
test('UTF8完整文件提交后才可分享，move后的partial对象不会误删完整文件', async () => {
  const files = setup(); const text = '{"动作":"深蹲 🏋️","重量":null}';
  const uri = await files.write(text); expect(uri.endsWith('.json')).toBe(true);
  expect(readFileSync(fileURLToPath(uri), 'utf8')).toBe(text);
  expect(readdirSync(join(root, 'fitquest-exports'))).toHaveLength(1);
  expect(await files.isSharingAvailable()).toBe(true);
  await files.share(uri, 'zh'); await files.release(uri, false);
  expect(Sharing.shareAsync).toHaveBeenCalledWith(uri, expect.objectContaining({ mimeType: 'application/json', dialogTitle: '导出训练' }));
  expect(readFileSync(fileURLToPath(uri), 'utf8')).toBe(text);
});
test('清理仅处理过期受控文件，保留活动/未来/未知文件，删除失败可再尝试', async () => {
  const files = setup(), active = await files.write('{}');
  const directory = new Directory(Paths.cache, 'fitquest-exports');
  const old = new Date(Date.now() - 48 * 60 * 60 * 1000), future = new Date(Date.now() + 60 * 60 * 1000);
  const seed = (name: string, time: Date) => { const p = join(fileURLToPath(directory.uri), name); writeFileSync(p, '{}'); utimesSync(p, time, time); return p; };
  seed('export-1000-1-abcd.json', old); seed('export-1001-1-abcd.partial', old);
  seed('export-1002-1-abcd.json', future); seed('my-workout.json', old);
  utimesSync(fileURLToPath(active), old, old);
  faults.remove = true; await files.cleanup(); expect(readdirSync(fileURLToPath(directory.uri))).toHaveLength(5);
  faults.remove = false; await files.cleanup();
  expect(readdirSync(fileURLToPath(directory.uri)).sort()).toEqual([active.split('/').pop()!, 'export-1002-1-abcd.json', 'my-workout.json'].sort());
  await files.release(active, false); await files.cleanup();
  expect(readdirSync(fileURLToPath(directory.uri)).sort()).toEqual(['export-1002-1-abcd.json', 'my-workout.json']);
});
test('写入失败不留下可分享部分文件，重试采用新文件；拒绝目录外文件', async () => {
  const files = setup(); faults.write = true;
  await expect(files.write('{}')).rejects.toThrow(); expect(readdirSync(join(root, 'fitquest-exports'))).toEqual([]);
  faults.write = false; const uri = await files.write('{}'); await files.release(uri, true);
  expect(readdirSync(join(root, 'fitquest-exports'))).toEqual([]);
  const outside = join(root, 'export-1000-1-abcd.json'); writeFileSync(outside, 'keep');
  await expect(files.share(pathToFileURL(outside).href, 'en')).rejects.toThrow();
  await expect(files.release(pathToFileURL(outside).href, true)).rejects.toThrow();
  expect(readFileSync(outside, 'utf8')).toBe('keep');
  expect(Sharing.shareAsync).not.toHaveBeenCalled();
});

test.each(['before', 'after'] as const)('移动阶段异常(%s)不残留可分享文件，随后可重试', async stage => {
  const files = setup(); faults.move = stage;
  await expect(files.write('{}')).rejects.toThrow();
  expect(readdirSync(join(root, 'fitquest-exports'))).toEqual([]);
  expect(Sharing.shareAsync).not.toHaveBeenCalled();
  faults.move = ''; const uri = await files.write('{"retry":true}');
  expect(readFileSync(fileURLToPath(uri), 'utf8')).toBe('{"retry":true}');
  await files.release(uri, true);
});

test('取消删除失败仍解除活动保护，过期后可由受控清理回收', async () => {
  const files = setup(), uri = await files.write('{"synthetic":true}');
  const old = new Date(Date.now() - 48 * 60 * 60 * 1000);
  utimesSync(fileURLToPath(uri), old, old);
  faults.remove = true;
  await expect(files.release(uri, true)).rejects.toThrow();
  expect(readFileSync(fileURLToPath(uri), 'utf8')).toBe('{"synthetic":true}');
  faults.remove = false; await files.cleanup();
  expect(readdirSync(join(root, 'fitquest-exports'))).toEqual([]);
  expect(Sharing.shareAsync).not.toHaveBeenCalled();
});
