import { test, expect, jest } from '@jest/globals';
import { render, screen, fireEvent, act } from '@testing-library/react-native';
import { WorkoutProvider, useWorkout } from '../../src/features/workouts/application/workout-provider';
import { Action } from '../../src/features/workouts/ui/primitives';
import { HistoryScreen } from '../../src/features/workouts/ui/history-screen';
import { WorkoutSummary } from '../../src/features/workouts/ui/workout-summary';
import type { WorkoutHistoryRepository, CompletedWorkoutSummary } from '../../src/features/workouts/data/workout-repository';
const first = { id: 1, startedAt: '2026-09-23T00:00:00.000Z', completedAt: '2026-09-23T01:00:00.000Z',
  durationSeconds: 3600, exerciseCount: 1, setCount: 1 };
function repository(workouts: CompletedWorkoutSummary[] = []): WorkoutHistoryRepository {
  return { initialize: async () => ({ ok: true }), saveCompletedWorkout: async () => ({ ok: true, workoutId: 1 }),
    deleteCompletedWorkout: async () => ({ ok: false, code: 'NotFound' }),
    listCompletedWorkouts: async () => ({ ok: true, workouts }), getCompletedWorkout: async () => ({ ok: false, code: 'NotFound' }) };
}
test('空历史仍显示真实月历和开始入口，不能显示演示记录', async () => {
  const repo = repository(); const train = jest.fn();
  await render(<WorkoutProvider repository={repo} now={() => '2026-09-23T01:00:00.000Z'}>
    <HistoryScreen onOpen={() => {}} onTrain={train} /></WorkoutProvider>);
  expect(await screen.findByText('还没有训练记录')).toBeTruthy();
  await fireEvent.press(screen.getByRole('button', { name: '开始' }));
  expect(train).toHaveBeenCalledTimes(1);
});
test('同日历史读屏名称包含可见时间与训练量，切英文仍打开对应训练', async () => {
  const later = { ...first, id: 42, completedAt: '2026-09-23T02:00:00.000Z', exerciseCount: 2, setCount: 6, durationSeconds: 1800 };
  const open = jest.fn();
  await render(<WorkoutProvider repository={repository([first, later])} now={() => first.completedAt}>
    <HistoryScreen onOpen={open} onTrain={() => {}} /></WorkoutProvider>);
  await fireEvent.press(await screen.findByRole('button', { name: '2026-09-23 · 2 场训练' }));
  const timeZh = new Date(later.completedAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  await fireEvent.press(screen.getByRole('button', { name: `查看训练，${timeZh}，2 个动作，6 组，30 分钟` }));
  expect(open).toHaveBeenLastCalledWith(42);
  await fireEvent.press(screen.getByRole('button', { name: 'EN' }));
  const timeEn = new Date(first.completedAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  await fireEvent.press(screen.getByRole('button', { name: `View workout, ${timeEn}, 1 exercise, 1 set, 60 min` }));
  expect(open).toHaveBeenLastCalledWith(1);
  expect(screen.queryByRole('button', { name: /View workout [0-9]+$/ })).toBeNull();
});
test('单场日期直达详情，多场按倒序选择，切月后显示空日期', async () => {
  const repo = repository([first, { ...first, id: 2 }, { ...first, id: 3, completedAt: '2026-09-22T01:00:00.000Z' }]);
  const open = jest.fn();
  await render(<WorkoutProvider repository={repo} now={() => '2026-09-23T01:00:00.000Z'}>
    <HistoryScreen onOpen={open} onTrain={() => {}} /></WorkoutProvider>);
  await fireEvent.press(await screen.findByRole('button', { name: '2026-09-22 · 1 场训练' }));
  expect(open).toHaveBeenCalledWith(3);
  open.mockClear();
  await fireEvent.press(screen.getByRole('button', { name: '2026-09-23 · 2 场训练' }));
  expect(open).not.toHaveBeenCalled();
  const choices = screen.getAllByRole('button', { name: /查看训练/ });
  expect(choices).toHaveLength(2);
  await fireEvent.press(choices[0]); expect(open).toHaveBeenCalledWith(2);
  await fireEvent.press(choices[1]); expect(open).toHaveBeenLastCalledWith(1);
  await fireEvent.press(screen.getByRole('button', { name: '上月' }));
  await fireEvent.press(screen.getByRole('button', { name: '2026-08-01 · 0 场训练' }));
  expect(screen.getByText('当天无训练')).toBeTruthy();
});
test('历史读取错误显示重试而非空状态', async () => {
  const repo = repository();
  let failed = true;
  let attempts = 0;
  repo.listCompletedWorkouts = async () => {
    if (++attempts === 1) throw new Error('Synthetic read exception');
    return failed ? { ok: false, code: 'StorageUnavailable' } : { ok: true, workouts: [] };
  };
  await render(<WorkoutProvider repository={repo}><HistoryScreen onOpen={() => {}} onTrain={() => {}} /></WorkoutProvider>);
  expect(await screen.findByText('暂时无法读取历史')).toBeTruthy();
  expect(screen.queryByText('还没有训练记录')).toBeNull();
  await fireEvent.press(screen.getByRole('button', { name: '重试' }));
  expect(attempts).toBe(2);
  expect(await screen.findByText('暂时无法读取历史')).toBeTruthy();
  failed = false; await fireEvent.press(screen.getByRole('button', { name: '重试' }));
  expect(await screen.findByText('还没有训练记录')).toBeTruthy();
});

test('历史在写入等待时保留列表与选日，中英显示等待；失败释放后重新读取而非卡住', async () => {
  const repo = repository([first]);
  const list = jest.fn(repo.listCompletedWorkouts);
  repo.listCompletedWorkouts = list;
  let release!: (value: Awaited<ReturnType<WorkoutHistoryRepository['deleteCompletedWorkout']>>) => void;
  repo.deleteCompletedWorkout = async () => new Promise(done => { release = done; });
  function Harness() {
    const app = useWorkout();
    return <><Action onPress={() => { void app.removeWorkout(1, true); }}>启动删除等待</Action>
      <HistoryScreen onOpen={() => {}} onTrain={() => {}} /></>;
  }
  await render(<WorkoutProvider repository={repo} now={() => first.completedAt}><Harness /></WorkoutProvider>);
  await fireEvent.press(await screen.findByRole('button', { name: '2026-09-23 · 1 场训练' }));
  expect(list).toHaveBeenCalledTimes(1);
  await fireEvent.press(screen.getByRole('button', { name: '启动删除等待' }));
  expect(screen.getByText('读取中…')).toBeTruthy();
  expect(screen.queryByText('暂时无法读取历史')).toBeNull();
  expect(list).toHaveBeenCalledTimes(1);
  const day = screen.getByRole('button', { name: '2026-09-23 · 1 场训练' });
  expect(day.props.accessibilityState).toMatchObject({ selected: true, disabled: true });
  expect(screen.getByRole('button', { name: /^查看训练，/ }).props.accessibilityState.disabled).toBe(true);
  await fireEvent.press(screen.getByRole('button', { name: 'EN' }));
  expect(screen.getByText('Loading…')).toBeTruthy();
  expect(screen.queryByText('Could not load history')).toBeNull();
  expect(screen.queryByRole('button', { name: 'Retry' })).toBeNull();
  await act(async () => release({ ok: false, code: 'UnexpectedStorageError' }));
  const refreshed = await screen.findByRole('button', { name: '2026-09-23 · 1 workouts' });
  expect(refreshed.props.accessibilityState).toMatchObject({ selected: true, disabled: false });
  expect(list).toHaveBeenCalledTimes(2);
  expect(screen.queryByText('Loading…')).toBeNull();
  expect(screen.getByRole('button', { name: /^View workout,/ }).props.accessibilityState.disabled).toBe(false);
});
test('真实摘要内容包含空重量和动作名，切英文保持同一条记录', async () => {
  const repo = repository();
  repo.getCompletedWorkout = async id => ({ ok: true, workout: { ...first, id, exercises: [
    { id: 1, name: '自填深蹲', position: 0, sets: [{ id: 1, position: 0, reps: 8, weightTenthsKg: null }] }] } });
  await render(<WorkoutProvider repository={repo}><WorkoutSummary id={7} onBack={() => {}} /></WorkoutProvider>);
  expect(await screen.findByText('自填深蹲')).toBeTruthy();
  expect(screen.getByText('— × 8')).toBeTruthy();
  await fireEvent.press(screen.getByRole('button', { name: 'EN' }));
  expect(screen.getByText('Saved')).toBeTruthy();
  expect(screen.getByText('自填深蹲')).toBeTruthy();
  expect(screen.queryByText('0 kg × 8')).toBeNull();
});
test('摘要读取异常可重试，切换ID重新读取', async () => {
  const repo = repository();
  repo.getCompletedWorkout = async () => { throw new Error('synthetic SQL path'); };
  const Wrapper = ({ id }: { id: number }) => <WorkoutProvider repository={repo}><WorkoutSummary id={id} onBack={() => {}} /></WorkoutProvider>;
  const view = await render(<Wrapper id={1} />);
  expect(await screen.findByText('暂时无法读取训练')).toBeTruthy();
  repo.getCompletedWorkout = async () => ({ ok: false, code: 'NotFound' });
  await fireEvent.press(screen.getByRole('button', { name: '重试' }));
  expect(await screen.findByText('训练不存在')).toBeTruthy();
  await view.rerender(<Wrapper id={2} />);
  expect(await screen.findByText('训练不存在')).toBeTruthy();
});

test('旧ID读取晚到时不能覆盖新ID的已保存详情', async () => {
  const repo = repository();
  let release!: (value: Awaited<ReturnType<WorkoutHistoryRepository['getCompletedWorkout']>>) => void;
  repo.getCompletedWorkout = async id => id === 1 ? new Promise(done => { release = done; })
    : { ok: true, workout: { ...first, id: 2, exercises: [{ id: 2, name: '新的训练', position: 0,
      sets: [{ id: 2, position: 0, reps: 10, weightTenthsKg: null }] }] } };
  const Wrapper = ({ id }: { id: number }) => <WorkoutProvider repository={repo}><WorkoutSummary id={id} onBack={() => {}} /></WorkoutProvider>;
  const view = await render(<Wrapper id={1} />);
  await view.rerender(<Wrapper id={2} />);
  expect(await screen.findByText('新的训练')).toBeTruthy();
  await act(async () => release({ ok: false, code: 'NotFound' }));
  expect(screen.getByText('新的训练')).toBeTruthy();
  expect(screen.queryByText('训练不存在')).toBeNull();
});

test('已有历史重新读取失败时保留日期与已加载条目，重试后恢复', async () => {
  const repo = repository([first]);
  function Harness() {
    const app = useWorkout();
    return <><Action onPress={() => { void app.removeWorkout(999, true); }}>触发外部刷新</Action>
      <HistoryScreen onOpen={() => {}} onTrain={() => {}} /></>;
  }
  await render(<WorkoutProvider repository={repo} now={() => '2026-09-23T01:00:00.000Z'}><Harness /></WorkoutProvider>);
  await fireEvent.press(await screen.findByRole('button', { name: '2026-09-23 · 1 场训练' }));
  repo.listCompletedWorkouts = async () => ({ ok: false, code: 'StorageUnavailable' });
  await fireEvent.press(screen.getByRole('button', { name: '触发外部刷新' }));
  expect(await screen.findByText('暂时无法读取历史')).toBeTruthy();
  expect(screen.getByRole('button', { name: /^查看训练，/ })).toBeTruthy();
  expect(screen.getByRole('button', { name: '2026-09-23 · 1 场训练' }).props.accessibilityState.selected).toBe(true);
  expect(screen.queryByText('还没有训练记录')).toBeNull();
  repo.listCompletedWorkouts = async () => ({ ok: true, workouts: [first] });
  await fireEvent.press(screen.getByRole('button', { name: '重试' }));
  expect(screen.queryByText('暂时无法读取历史')).toBeNull();
  expect(screen.getByRole('button', { name: '2026-09-23 · 1 场训练' }).props.accessibilityState.disabled).toBe(false);
});
