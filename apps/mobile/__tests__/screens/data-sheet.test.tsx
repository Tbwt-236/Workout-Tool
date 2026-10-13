import { test, expect, jest } from '@jest/globals';
import { useState } from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react-native';
import { AppState, type AppStateStatus } from 'react-native';
import { WorkoutProvider } from '../../src/features/workouts/application/workout-provider';
import { HistoryScreen } from '../../src/features/workouts/ui/history-screen';
import { WorkoutScreen } from '../../src/features/workouts/ui/workout-screen';
import { WorkoutSummary } from '../../src/features/workouts/ui/workout-summary';
import { Action } from '../../src/features/workouts/ui/primitives';
import type { ExportFiles } from '../../src/features/data-control/data/export-file-port';
import { createSqliteWorkoutRepository } from '../../src/features/workouts/data/sqlite-workout-repository';
import { sqliteFixture, deferred } from '../support/sqlite';
const at = '2026-10-12T03:00:00.000Z';
const draft = { startedAt: '2026-10-12T02:00:00.000Z', exercises: [{ localKey: 'e', name: '旧深蹲', position: 0,
  sets: [{ localKey: 's', position: 0, reps: 8, weightTenthsKg: null }] }] };
const files = (): ExportFiles => ({ cleanup: async () => {}, isSharingAvailable: async () => true,
  write: jest.fn(async () => 'file://synthetic/export.json'), share: jest.fn(async () => {}), release: jest.fn(async () => {}) });
const press = async (name: string) => fireEvent.press(await screen.findByRole('button', { name }));
test('空历史仍能打开数据说明，导出置灰，中英与关闭保持所选月份', async () => {
  const f = sqliteFixture(), port = files(), repo = createSqliteWorkoutRepository(async () => f.open().connection);
  let view: Awaited<ReturnType<typeof render>> | undefined;
  try {
    view = await render(<WorkoutProvider repository={repo} exportFiles={port} now={() => at}>
      <HistoryScreen onOpen={() => {}} onTrain={() => {}} /></WorkoutProvider>);
    await screen.findByText('还没有训练记录'); await press('上月'); await press('数据');
    expect(screen.getByRole('button', { name: '导出' }).props.accessibilityState.disabled).toBe(true);
    await press('数据说明'); expect(screen.getByText(/当前不支持导入恢复/)).toBeTruthy();
    await press('EN'); expect(screen.getByRole('button', { name: 'Export' }).props.accessibilityState.disabled).toBe(true);
    await press('Close'); expect(screen.getByText('September 2026')).toBeTruthy();
    expect(port.write).not.toHaveBeenCalled();
  } finally { await view?.unmount(); f.dispose(); }
});
test('带未提交输入打开面板、切语言与系统返回，原训练和日历保持', async () => {
  const f = sqliteFixture(), port = files(), repo = createSqliteWorkoutRepository(async () => f.open().connection);
  await repo.saveCompletedWorkout(draft, at);
  const sharing = deferred(), entered = deferred();
  port.share = jest.fn(async () => { entered.resolve(); await sharing.promise; });
  function Harness() { const [history, setHistory] = useState(false); return <>
    <Action onPress={() => setHistory(value => !value)}>切页</Action>
    {history ? <HistoryScreen onOpen={() => {}} onTrain={() => setHistory(false)} /> : <WorkoutScreen onSaved={() => {}} />}</>; }
  let view: Awaited<ReturnType<typeof render>> | undefined;
  try {
    view = await render(<WorkoutProvider repository={repo} exportFiles={port} now={() => at}><Harness /></WorkoutProvider>);
    await press('开始'); await press('＋ 动作'); await fireEvent.changeText(screen.getByLabelText('动作名称'), '未完成卧推'); await press('保存动作');
    await fireEvent.changeText(screen.getByLabelText('未完成卧推 次数'), '12');
    await fireEvent.changeText(screen.getByLabelText('未完成卧推 重量 · kg'), '42.5'); await press('切页');
    await press('2026-10-12 · 1 场训练'); await press('数据'); await press('导出'); await act(async () => entered.promise);
    expect(screen.getByText('准备中…')).toBeTruthy(); await press('EN');
    await act(async () => sharing.resolve());
    expect(await screen.findByRole('header', { name: 'Data' })).toBeTruthy();
    expect(screen.queryByText('Saved')).toBeNull(); expect(port.share).toHaveBeenCalledTimes(1);
    const document = JSON.parse(jest.mocked(port.write).mock.calls[0][0]);
    expect(document.workouts).toHaveLength(1); expect(document.workouts[0].exercises[0].name).toBe('旧深蹲');
    await press('Close'); expect(screen.getByRole('button', { name: '2026-10-12 · 1 workouts' }).props.accessibilityState.selected).toBe(true);
    await press('切页');
    expect(screen.getByLabelText('未完成卧推 Reps').props.value).toBe('12');
    expect(screen.getByLabelText('未完成卧推 Weight · kg').props.value).toBe('42.5');
  } finally { sharing.resolve(); await view?.unmount(); f.dispose(); }
});
test('文件写入期间退后台或关闭，迟到文件不会打开分享', async () => {
  const f = sqliteFixture(), port = files(), repo = createSqliteWorkoutRepository(async () => f.open().connection);
  await repo.saveCompletedWorkout(draft, at); const writing = deferred(), finish = deferred();
  port.write = jest.fn(async () => { writing.resolve(); await finish.promise; return 'file://synthetic/export.json'; });
  const listeners: ((state: AppStateStatus) => void)[] = [];
  // jest-expo already supplies a mock; mockRestore would erase its default subscription.
  const listenerMock = jest.mocked(AppState.addEventListener);
  const previousListener = listenerMock.getMockImplementation()!;
  listenerMock.mockImplementation((_event, listener) => { listeners.push(listener); return { remove: () => {} }; });
  let view: Awaited<ReturnType<typeof render>> | undefined;
  try {
    view = await render(<WorkoutProvider repository={repo} exportFiles={port} now={() => at}><HistoryScreen onOpen={() => {}} onTrain={() => {}} /></WorkoutProvider>);
    await screen.findByRole('button', { name: '2026-10-12 · 1 场训练' }); await press('数据'); await press('导出'); await act(async () => writing.promise);
    await act(async () => { listeners.forEach(listener => listener('background')); }); await press('关闭');
    await act(async () => finish.resolve());
    expect(port.share).not.toHaveBeenCalled(); expect(port.release).toHaveBeenCalledWith('file://synthetic/export.json', true);
    await press('数据'); expect(screen.getByRole('button', { name: '导出' }).props.accessibilityState.disabled).toBe(false);
  } finally { finish.resolve(); await view?.unmount(); listenerMock.mockImplementation(previousListener); f.dispose(); }
});

test('关闭时快照仍在读取，打开详情等待锁释放，不误报读取失败或迟到分享', async () => {
  const f = sqliteFixture(), port = files(), reading = deferred(), finish = deferred(); let hold = false;
  const repo = createSqliteWorkoutRepository(async () => {
    const { connection } = f.open();
    return { ...connection, async getAllAsync<T>(sql: string, params: (string | number | null)[] = []) {
      const rows = await connection.getAllAsync<T>(sql, params);
      if (hold && sql.includes('e.id AS exercise_id') && !sql.includes('WHERE w.id')) { reading.resolve(); await finish.promise; }
      return rows;
    } };
  });
  await repo.saveCompletedWorkout(draft, at);
  function Harness() { const [detail, setDetail] = useState(false); return <>
    <Action onPress={() => setDetail(true)}>模拟详情链接</Action>
    {detail ? <WorkoutSummary id={1} onBack={() => {}} /> : <HistoryScreen onOpen={() => {}} onTrain={() => {}} />}</>; }
  let view: Awaited<ReturnType<typeof render>> | undefined;
  try {
    view = await render(<WorkoutProvider repository={repo} exportFiles={port} now={() => at}><Harness /></WorkoutProvider>);
    await screen.findByRole('button', { name: '2026-10-12 · 1 场训练' }); hold = true;
    await press('数据'); await press('导出'); await act(async () => reading.promise); await press('关闭'); await press('模拟详情链接');
    expect(screen.getByText('读取中…')).toBeTruthy(); expect(screen.queryByText('暂时无法读取训练')).toBeNull();
    hold = false; await act(async () => finish.resolve());
    expect(await screen.findByText('旧深蹲')).toBeTruthy(); expect(port.write).not.toHaveBeenCalled(); expect(port.share).not.toHaveBeenCalled();
  } finally { hold = false; finish.resolve(); await view?.unmount(); f.dispose(); }
});
