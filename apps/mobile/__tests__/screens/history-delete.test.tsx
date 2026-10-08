import { test, expect, jest } from '@jest/globals';
import { render, screen, fireEvent, act } from '@testing-library/react-native';
import { WorkoutProvider } from '../../src/features/workouts/application/workout-provider';
import { WorkoutSummary } from '../../src/features/workouts/ui/workout-summary';
import type { WorkoutHistoryRepository, DeleteCompletedWorkoutResult } from '../../src/features/workouts/data/workout-repository';
const workout = { id: 7, startedAt: '2026-09-23T00:00:00.000Z', completedAt: '2026-09-23T01:00:00.000Z',
  durationSeconds: 3600, exerciseCount: 1, setCount: 1, exercises: [
    { id: 11, name: '自填深蹲', position: 0, sets: [{ id: 21, position: 0, reps: 8, weightTenthsKg: 625 }] }] };
function setup() {
  const remove = jest.fn<WorkoutHistoryRepository['deleteCompletedWorkout']>(async () => ({ ok: true }));
  const back = jest.fn();
  const repository: WorkoutHistoryRepository = {
    initialize: async () => ({ ok: true }), saveCompletedWorkout: async () => ({ ok: true, workoutId: 7 }),
    listCompletedWorkouts: async () => ({ ok: true, workouts: [workout] }),
    getCompletedWorkout: async id => ({ ok: true, workout: { ...workout, id } }),
    deleteCompletedWorkout: remove,
  };
  const Page = ({ id = 7 }: { id?: number }) => <WorkoutProvider repository={repository}>
    <WorkoutSummary id={id} deletable onBack={back} /></WorkoutProvider>;
  return { Page, back, remove, repository };
}
async function press(label: string) { await fireEvent.press(screen.getByRole('button', { name: label })); }
test('历史详情删除必须确认，取消不写库；确认中切英文保留目标且成功才返回', async () => {
  const h = setup(); await render(<h.Page />);
  await screen.findByText('自填深蹲');
  await press('删除'); expect(screen.getByText('删除这次训练？')).toBeTruthy();
  await press('取消'); expect(h.remove).not.toHaveBeenCalled();
  expect(screen.getByText('62.5 kg × 8')).toBeTruthy();
  await press('删除'); await press('EN');
  expect(screen.getByText('Delete this workout?')).toBeTruthy();
  expect(h.remove).not.toHaveBeenCalled();
  await press('Confirm delete');
  expect(h.remove).toHaveBeenCalledTimes(1);
  expect(h.remove).toHaveBeenCalledWith(7, true);
  expect(h.back).toHaveBeenCalledTimes(1);
});
test('删除等待时禁止重复提交和返回，失败保留详情；重试须再次确认', async () => {
  const h = setup();
  let release!: (result: DeleteCompletedWorkoutResult) => void;
  h.remove.mockImplementation(() => new Promise(done => { release = done; }));
  await render(<h.Page />); await screen.findByText('自填深蹲');
  await press('删除'); await press('确认删除');
  expect(screen.getByText('删除中…')).toBeTruthy();
  expect(screen.getByRole('button', { name: '返回' }).props.accessibilityState.disabled).toBe(true);
  await press('返回'); await press('删除');
  expect(h.remove).toHaveBeenCalledTimes(1); expect(h.back).not.toHaveBeenCalled();
  await act(async () => release({ ok: false, code: 'StorageUnavailable' }));
  expect(screen.getByText('尚未删除，请重试')).toBeTruthy();
  expect(screen.getByText('62.5 kg × 8')).toBeTruthy();
  await press('重试'); expect(h.remove).toHaveBeenCalledTimes(1); await press('取消');
  await press('重试'); await press('确认删除');
  expect(h.remove).toHaveBeenCalledTimes(2);
  await act(async () => release({ ok: true }));
  expect(h.back).toHaveBeenCalledTimes(1);
});
test('删除发现记录已不存在时显示缺失，不冒充本次成功，也不再提供删除', async () => {
  const h = setup(); h.remove.mockResolvedValue({ ok: false, code: 'NotFound' });
  await render(<h.Page />); await screen.findByText('自填深蹲');
  await press('删除'); await press('确认删除');
  expect(await screen.findByText('训练不存在')).toBeTruthy();
  expect(screen.queryByRole('button', { name: '删除' })).toBeNull();
  expect(h.back).not.toHaveBeenCalled();
});
test('同一帧连续确认只消费一次，不在删除等待中错误提示失败', async () => {
  const h = setup();
  let release!: (result: DeleteCompletedWorkoutResult) => void;
  h.remove.mockImplementation(() => new Promise(done => { release = done; }));
  await render(<h.Page />); await screen.findByText('自填深蹲'); await press('删除');
  // Call the same Pressability event before React can render the disabled state.
  const confirm = screen.getByRole('button', { name: '确认删除' }).props.onClick as () => void;
  await act(async () => { confirm(); confirm(); });
  expect(h.remove).toHaveBeenCalledTimes(1);
  expect(h.back).not.toHaveBeenCalled();
  expect(screen.getByText('删除中…')).toBeTruthy();
  expect(screen.queryByText('尚未删除，请重试')).toBeNull();
  await act(async () => release({ ok: true }));
  expect(h.back).toHaveBeenCalledTimes(1);
  expect(screen.queryByText('尚未删除，请重试')).toBeNull();
});
test('抛出存储错误时显示安全错误，保留内容', async () => {
  const h = setup(); h.remove.mockRejectedValue(new Error('/private/synthetic SQL'));
  await render(<h.Page />); await screen.findByText('自填深蹲');
  await press('删除'); await press('确认删除');
  expect(await screen.findByText('尚未删除，请重试')).toBeTruthy();
  expect(screen.queryByText('/private/synthetic SQL')).toBeNull();
  expect(screen.getByText('自填深蹲')).toBeTruthy(); expect(h.back).not.toHaveBeenCalled();
});
test('ID切换撤销旧确认，旧删除响应不让新详情误跳回历史', async () => {
  const h = setup();
  let release!: (result: DeleteCompletedWorkoutResult) => void;
  h.remove.mockImplementation(() => new Promise(done => { release = done; }));
  const view = await render(<h.Page id={7} />); await screen.findByText('自填深蹲');
  await press('删除');
  await view.rerender(<h.Page id={8} />); await screen.findByText('自填深蹲');
  expect(screen.queryByText('删除这次训练？')).toBeNull();
  await press('删除'); await press('确认删除');
  expect(h.remove).toHaveBeenCalledWith(8, true);
  await view.rerender(<h.Page id={9} />); await screen.findByText('自填深蹲');
  await act(async () => release({ ok: true }));
  expect(h.back).not.toHaveBeenCalled();
  expect(screen.getByText('自填深蹲')).toBeTruthy();
});
test('完成摘要仅查看，不出现历史详情的删除入口', async () => {
  const h = setup();
  await render(<WorkoutProvider repository={h.repository}><WorkoutSummary id={7} onBack={h.back} /></WorkoutProvider>);
  await screen.findByText('自填深蹲');
  expect(screen.queryByRole('button', { name: '删除' })).toBeNull();
});
