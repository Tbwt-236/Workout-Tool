import { test, expect, jest } from '@jest/globals';
import { render, screen, fireEvent, act } from '@testing-library/react-native';
import { ExpoRoot, router } from 'expo-router';
import { getMockContext } from 'expo-router/build/testing-library/mock-config';
import { createExpoWorkoutRepository } from '../../src/features/workouts/data/expo-workout-repository';
import { createSqliteWorkoutRepository } from '../../src/features/workouts/data/sqlite-workout-repository';
import { sqliteFixture } from '../support/sqlite';
import Layout from '../../src/app/_layout';
import Index from '../../src/app/index';
import Active from '../../src/app/workout/active';
import Complete from '../../src/app/workout/complete/[id]';
import History from '../../src/app/history/index';
import Detail from '../../src/app/history/[id]';
import * as intent from '../../src/app/+native-intent';
jest.mock('../../src/features/workouts/data/expo-workout-repository', () => ({ createExpoWorkoutRepository: jest.fn() }));

test('保存期间离开训练页，提交仍进历史，但旧页面不得把当前路由跳回摘要', async () => {
  const f = sqliteFixture();
  let view: Awaited<ReturnType<typeof render>> | undefined;
  let release!: () => void;
  const gate = new Promise<void>(done => { release = done; });
  try {
    const repository = createSqliteWorkoutRepository(async () => {
      const { connection } = f.open();
      return { ...connection, async runAsync(sql, params) {
        // Hold the real repository's transaction/Busy lock at its native I/O boundary.
        if (sql.startsWith('INSERT INTO workouts')) await gate;
        return connection.runAsync(sql, params);
      } };
    });
    const save = jest.fn(repository.saveCompletedWorkout);
    jest.mocked(createExpoWorkoutRepository).mockReturnValue({ ...repository, saveCompletedWorkout: save });
    const context = getMockContext({ _layout: Layout, index: Index, 'workout/active': Active,
      'workout/complete/[id]': Complete, 'history/index': History, 'history/[id]': Detail, '+native-intent': intent });
    view = await render(<ExpoRoot context={context} location="/" />);
    const press = async (name: string) => fireEvent.press(await screen.findByRole('button', { name }));
    await press('开始'); await press('＋ 动作');
    await fireEvent.changeText(screen.getByLabelText('动作名称'), '延迟保存'); await press('保存动作');
    await fireEvent.changeText(screen.getByLabelText('延迟保存 次数'), '8'); await press('延迟保存 记录');
    await press('完成'); await press('确认完成');
    expect(screen.getByText('保存中…')).toBeTruthy();
    expect(save).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: '历史' }).props.accessibilityState.disabled).toBe(true);
    // An accepted native link can change the route while the ordinary tabs are locked.
    expect(intent.redirectSystemPath({ path: 'fitquest://history', initial: false })).toBe('/history');
    await act(async () => router.replace('/history'));
    expect(await screen.findByRole('header', { name: '历史' })).toBeTruthy();
    expect(screen.getByText('读取中…')).toBeTruthy();
    expect(screen.queryByText('暂时无法读取历史')).toBeNull();
    expect(screen.queryByRole('button', { name: '重试' })).toBeNull();
    await act(async () => { release(); await save.mock.results[0].value; });
    expect(screen.getByRole('header', { name: '历史' })).toBeTruthy();
    expect(screen.queryByText('已保存')).toBeNull();
    expect(await screen.findByRole('button', { name: /^查看训练，/ })).toBeTruthy();
    const history = await repository.listCompletedWorkouts();
    expect(history.ok && history.workouts.length).toBe(1);
    const detail = await repository.getCompletedWorkout(1);
    expect(detail.ok && detail.workout.exercises[0]).toMatchObject({ name: '延迟保存', sets: [{ reps: 8, weightTenthsKg: null }] });
  } finally { release(); await view?.unmount(); f.dispose(); }
});

test('真实路由和SQLite：跨月返回保留选日，取消删除不变，逐场删除更新日历且不影响另一日', async () => {
  const f = sqliteFixture();
  let view: Awaited<ReturnType<typeof render>> | undefined;
  try {
    const repository = createSqliteWorkoutRepository(async () => f.open().connection);
    const day = new Date(); day.setDate(15); day.setMonth(day.getMonth() - 1); day.setHours(12, 0, 0, 0);
    const dateKey = (date: Date) => [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');
    const selected = dateKey(day), neighbor = new Date(day); neighbor.setDate(14);
    const draft = { startedAt: new Date(day.getTime() - 3600000).toISOString(), exercises: [
      { localKey: 'e', name: '合成深蹲', position: 0, sets: [{ localKey: 's', position: 0, reps: 8, weightTenthsKg: 625 }] }] };
    expect((await repository.saveCompletedWorkout(draft, day.toISOString())).ok).toBe(true);
    expect((await repository.saveCompletedWorkout(draft, day.toISOString())).ok).toBe(true);
    expect((await repository.saveCompletedWorkout({ ...draft, startedAt: new Date(neighbor.getTime() - 3600000).toISOString() }, neighbor.toISOString())).ok).toBe(true);
    jest.mocked(createExpoWorkoutRepository).mockReturnValue(repository);
    const context = getMockContext({ _layout: Layout, index: Index, 'workout/active': Active,
      'workout/complete/[id]': Complete, 'history/index': History, 'history/[id]': Detail, '+native-intent': intent });
    view = await render(<ExpoRoot context={context} location="/" />);
    const press = async (name: string) => fireEvent.press(await screen.findByRole('button', { name }));
    await press('开始'); await press('＋ 动作');
    await fireEvent.changeText(screen.getByLabelText('动作名称'), '进行中的卧推'); await press('保存动作');
    await fireEvent.changeText(screen.getByLabelText('进行中的卧推 次数'), '11'); await press('历史');
    await press('上月'); await press(selected + ' · 2 场训练');
    await fireEvent.press(screen.getAllByRole('button', { name: /^查看训练，/ })[0]);
    await screen.findByText('合成深蹲'); await press('删除'); await press('取消'); await press('返回');
    expect((await screen.findByRole('button', { name: selected + ' · 2 场训练' })).props.accessibilityState.selected).toBe(true);
    await fireEvent.press(screen.getAllByRole('button', { name: /^查看训练，/ })[0]);
    await press('删除'); await press('确认删除');
    expect((await screen.findByRole('button', { name: selected + ' · 1 场训练' })).props.accessibilityState.selected).toBe(true);
    expect(screen.getAllByRole('button', { name: /^查看训练，/ })).toHaveLength(1);
    expect(await repository.getCompletedWorkout(2)).toEqual({ ok: false, code: 'NotFound' });
    await press(selected + ' · 1 场训练'); await screen.findByText('合成深蹲');
    await press('删除'); await press('确认删除');
    expect((await screen.findByRole('button', { name: selected + ' · 0 场训练' })).props.accessibilityState.selected).toBe(true);
    expect(screen.getByText('当天无训练')).toBeTruthy();
    expect(screen.getByRole('button', { name: dateKey(neighbor) + ' · 1 场训练' })).toBeTruthy();
    const list = await repository.listCompletedWorkouts();
    expect(list.ok && list.workouts.map(w => w.id)).toEqual([3]);
    await press('继续');
    expect(screen.getByLabelText('进行中的卧推 次数').props.value).toBe('11');
  } finally { await view?.unmount(); f.dispose(); }
});

test('真实路由和SQLite：默认历史→训练→确认保存→已存摘要→历史，切页保留输入', async () => {
  const f = sqliteFixture();
  try {
    const repository = createSqliteWorkoutRepository(async () => f.open().connection);
    jest.mocked(createExpoWorkoutRepository).mockReturnValue(repository);
    const context = getMockContext({ _layout: Layout, index: Index, 'workout/active': Active,
      'workout/complete/[id]': Complete, 'history/index': History, 'history/[id]': Detail, '+native-intent': intent });
    const view = await render(<ExpoRoot context={context} location="/" />);
    expect(await screen.findByText('还没有训练记录')).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: '开始' }));
    await fireEvent.press(await screen.findByRole('button', { name: '＋ 动作' }));
    await fireEvent.changeText(screen.getByLabelText('动作名称'), '深蹲');
    await fireEvent.press(screen.getByRole('button', { name: '保存动作' }));
    await fireEvent.changeText(screen.getByLabelText('深蹲 次数'), '8');
    await fireEvent.changeText(screen.getByLabelText('深蹲 重量 · kg'), '62.5');
    await fireEvent.press(screen.getByRole('button', { name: '历史' }));
    await fireEvent.press(await screen.findByRole('button', { name: '继续' }));
    expect(screen.getByLabelText('深蹲 次数').props.value).toBe('8');
    await fireEvent.press(screen.getByRole('button', { name: '深蹲 记录' }));
    await fireEvent.press(screen.getByRole('button', { name: '完成' }));
    await fireEvent.press(screen.getByRole('button', { name: '确认完成' }));
    expect(await screen.findByText('已保存')).toBeTruthy();
    expect(screen.getByText('62.5 kg × 8')).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: '返回' }));
    expect(await screen.findByRole('button', { name: /^查看训练，/ })).toBeTruthy();
    const list = await repository.listCompletedWorkouts();
    expect(list.ok && list.workouts.length).toBe(1);
    await view.unmount();
  } finally { f.dispose(); }
});
