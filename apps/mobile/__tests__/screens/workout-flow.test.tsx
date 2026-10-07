import { test, expect, jest, afterEach } from '@jest/globals';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react-native';
import { Keyboard, Pressable, Text, TextInput, View, ScrollView } from 'react-native';
import { WorkoutProvider } from '../../src/features/workouts/application/workout-provider';
import { WorkoutScreen } from '../../src/features/workouts/ui/workout-screen';
import { WorkoutSummary } from '../../src/features/workouts/ui/workout-summary';
import type { WorkoutHistoryRepository, SaveCompletedWorkoutResult } from '../../src/features/workouts/data/workout-repository';
import { Children, cloneElement, isValidElement, useState, type ReactNode, type Ref } from 'react';

function setup(options: { failing?: boolean; pending?: boolean } = {}) {
  let release!: (value: SaveCompletedWorkoutResult) => void;
  const save = jest.fn<WorkoutHistoryRepository['saveCompletedWorkout']>(async () => {
    if (options.pending) return new Promise(done => { release = done; });
    return options.failing ? { ok: false, code: 'StorageUnavailable' } : { ok: true, workoutId: 7 };
  });
  const repository: WorkoutHistoryRepository = {
    initialize: async () => ({ ok: true }), saveCompletedWorkout: save,
    deleteCompletedWorkout: async () => ({ ok: false, code: 'NotFound' }),
    listCompletedWorkouts: async () => ({ ok: true, workouts: [] }),
    getCompletedWorkout: async () => ({ ok: false, code: 'NotFound' }),
  };
  const saved = jest.fn();
  const view = <WorkoutProvider repository={repository} now={() => '2026-09-23T01:00:00.000Z'}>
    <WorkoutScreen onSaved={saved} /></WorkoutProvider>;
  return { view, save, saved, release: (value: SaveCompletedWorkoutResult) => release(value), options, repository };
}
afterEach(() => { jest.restoreAllMocks(); });
async function press(label: string) { await fireEvent.press(screen.getByRole('button', { name: label })); }
async function enter(label: string, value: string) { await fireEvent.changeText(screen.getByLabelText(label), value); }
async function addFirst() {
  await press('开始'); await press('＋ 动作');
  await enter('动作名称', '深蹲'); await press('保存动作');
}
async function logFirst() {
  await addFirst();
  await enter('深蹲 重量 · kg', '62.5'); await enter('深蹲 次数', '8'); await press('深蹲 记录');
}

test('行内有效录组后收键盘，下一组保留数值；完成须确认且提交后才导航', async () => {
  const h = setup(); const dismiss = jest.spyOn(Keyboard, 'dismiss');
  await render(h.view); await logFirst();
  expect(dismiss).toHaveBeenCalled();
  expect(screen.getByLabelText('深蹲 重量 · kg').props.value).toBe('62.5');
  expect(screen.getByText('62.5 kg × 8')).toBeTruthy();
  await press('完成'); expect(h.save).not.toHaveBeenCalled();
  await press('继续'); expect(h.save).not.toHaveBeenCalled();
  await press('完成'); await press('确认完成');
  expect(h.save).toHaveBeenCalledTimes(1);
  expect(h.save.mock.calls[0][0].exercises[0].sets[0]).toMatchObject({ reps: 8, weightTenthsKg: 625 });
  expect(h.saved).toHaveBeenCalledWith(7);
});

test('非法次数保留输入并提示字段', async () => {
  const h = setup(); const dismiss = jest.spyOn(Keyboard, 'dismiss');
  await render(h.view); await addFirst(); dismiss.mockClear();
  await enter('深蹲 次数', '0'); await press('深蹲 记录');
  expect(screen.getByText('次数须为 1–999 的整数')).toBeTruthy();
  expect(screen.getByLabelText('深蹲 次数').props.value).toBe('0');
  expect(dismiss).not.toHaveBeenCalled();
  expect(h.save).not.toHaveBeenCalled();
});

test('失败保留组与输入；重新确认重试成功，等待时不提前导航', async () => {
  const h = setup({ failing: true });
  await render(h.view); await logFirst(); await press('完成'); await press('确认完成');
  expect(screen.getByText('尚未保存，当前训练仍保留，请重试')).toBeTruthy();
  expect(screen.getByText('62.5 kg × 8')).toBeTruthy();
  h.options.failing = false; h.options.pending = true;
  await press('重试'); await press('确认完成');
  expect(h.saved).not.toHaveBeenCalled();
  expect(screen.getByText('保存中…')).toBeTruthy();
  expect(h.save).toHaveBeenCalledTimes(2);
  await act(async () => h.release({ ok: true, workoutId: 9 }));
  expect(h.saved).toHaveBeenCalledWith(9);
});

test('切换语言保留未录输入、用户名称与确认状态，未录输入须明确处理', async () => {
  const h = setup();
  await render(h.view); await logFirst();
  await enter('深蹲 次数', '9'); await press('EN');
  expect(screen.getByLabelText('深蹲 Reps').props.value).toBe('9');
  await press('Finish');
  expect(screen.getByText('Unlogged input')).toBeTruthy();
  await press('Log first');
  expect(h.save).not.toHaveBeenCalled();
  await press('Finish'); await press('Discard input');
  await press('中文');
  expect(screen.getByText('完成训练？')).toBeTruthy();
  await press('确认完成');
  expect(h.save.mock.calls[0][0].exercises[0].sets[0].reps).toBe(8);
});

test('编辑与删除在原行操作，取消删除保留组，删除唯一组后不能完成', async () => {
  const h = setup();
  await render(h.view); await logFirst(); await press('深蹲 第1组 编辑');
  await enter('深蹲 次数', '0'); await press('深蹲 保存');
  expect(screen.getByText('次数须为 1–999 的整数')).toBeTruthy();
  expect(screen.getByLabelText('深蹲 次数').props.value).toBe('0');
  await enter('深蹲 次数', '10'); await press('深蹲 保存');
  expect(screen.getByText('62.5 kg × 10')).toBeTruthy();
  await press('深蹲 第1组 编辑'); await press('删除');
  await press('继续');
  expect(screen.getByLabelText('深蹲 次数').props.value).toBe('10');
  await press('删除'); await press('确认删除');
  await press('完成');
  expect(screen.getByText('至少记录一组后再完成')).toBeTruthy();
  expect(h.save).not.toHaveBeenCalled();
});

test('取消整场必须确认，未录名称也受保护，取消后不保存', async () => {
  const h = setup();
  await render(h.view); await addFirst(); await enter('深蹲 次数', '12');
  await press('取消训练'); await press('继续');
  expect(screen.getByLabelText('深蹲 次数').props.value).toBe('12');
  await press('取消训练'); await press('确认取消');
  expect(screen.getByRole('button', { name: '开始' })).toBeTruthy();
  expect(h.save).not.toHaveBeenCalled();
  await press('开始'); await press('＋ 动作'); await enter('动作名称', '未保存的深蹲');
  await press('取消训练'); await press('继续');
  expect(screen.getByLabelText('动作名称').props.value).toBe('未保存的深蹲');
  await press('取消训练'); await press('确认取消');
  expect(screen.getByRole('button', { name: '开始' })).toBeTruthy();
  expect(h.save).not.toHaveBeenCalled();
});

test('训练页卸载再回来保留未录值，不因页面导航重建草稿', async () => {
  const h = setup();
  function Harness() {
    const [visible, setVisible] = useState(true);
    return <WorkoutProvider repository={h.repository}>
      <Pressable accessibilityRole="button" accessibilityLabel="切页" onPress={() => setVisible(!visible)}><Text>切页</Text></Pressable>
      {visible && <WorkoutScreen onSaved={h.saved} />}
    </WorkoutProvider>;
  }
  await render(<Harness />); await addFirst(); await enter('深蹲 次数', '9');
  await press('切页'); await press('切页');
  expect(screen.getByLabelText('深蹲 次数').props.value).toBe('9');
});

test('摘要从仓储按ID读取，缺失和读取失败分别展示，不拿内存草稿冒充成功', async () => {
  const h = setup();
  await render(<WorkoutProvider repository={h.repository}><WorkoutSummary id={12} onBack={() => {}} /></WorkoutProvider>);
  expect(await screen.findByText('训练不存在')).toBeTruthy();
});

test('记录后短暂禁用按钮防连点，名称校验和改名不改变已录组', async () => {
  const h = setup();
  await render(h.view); await logFirst();
  expect(screen.getByRole('button', { name: '深蹲 记录' }).props.accessibilityState.disabled).toBe(true);
  await press('深蹲 记录');
  expect(screen.getAllByText('62.5 kg × 8')).toHaveLength(1);
  await press('深蹲 改名'); await enter('动作名称', ' '); await press('保存动作');
  expect(screen.getByText('动作名称须为 1–80 个字符')).toBeTruthy();
  await enter('动作名称', '前蹲'); await press('保存动作');
  expect(screen.getByText('前蹲')).toBeTruthy();
  expect(screen.getByText('62.5 kg × 8')).toBeTruthy();
});

test('修改已录组后保留手填的新组，即使数值恰好等于修改后的建议值也须先处理', async () => {
  const h = setup();
  await render(h.view); await logFirst(); await enter('深蹲 次数', '10');
  await press('深蹲 第1组 编辑'); await enter('深蹲 次数', '10'); await press('深蹲 保存');
  expect(screen.getByLabelText('深蹲 次数').props.value).toBe('10');
  await press('完成');
  expect(screen.getByText('有未记录的输入')).toBeTruthy();
  expect(h.save).not.toHaveBeenCalled();
});

test('保存失败后重试也必须先保存或取消动作名称，不能悄悄丢弃名称输入', async () => {
  const h = setup({ failing: true });
  await render(h.view); await logFirst(); await press('完成'); await press('确认完成');
  await press('＋ 动作'); await enter('动作名称', '还没保存的卧推');
  expect(screen.getByRole('button', { name: '重试' }).props.accessibilityState.disabled).toBe(true);
  await press('重试');
  expect(screen.queryByText('完成训练？')).toBeNull();
  expect(screen.getByLabelText('动作名称').props.value).toBe('还没保存的卧推');
  expect(h.save).toHaveBeenCalledTimes(1);
});

test('多动作先记录聚焦未录动作，键盘视口变化只补定位一次，隐藏时清除待定位', async () => {
  const h = setup();
  const focused: string[] = [];
  const keyboardVisible = jest.spyOn(Keyboard, 'isVisible').mockReturnValue(true);
  jest.spyOn(TextInput.prototype, 'focus').mockImplementation(function (this: TextInput) {
    focused.push(this.props.accessibilityLabel!);
  });
  // RN's Jest ScrollView omits forwarding innerViewRef to its existing inner View.
  // Restore only that native boundary; retain the mock's tree and native methods.
  const renderScroll = ScrollView.prototype.render;
  jest.spyOn(ScrollView.prototype, 'render').mockImplementation(function (this: ScrollView) {
    const tree = renderScroll.call(this);
    if (!isValidElement<{ children: ReactNode; testID?: string }>(tree)) throw new Error('Expected the RN ScrollView mock tree');
    return cloneElement(tree, { testID: 'workout-scroll-view' }, Children.map(tree.props.children, child =>
      isValidElement<{ ref?: Ref<View> }>(child) && child.type === View
        ? cloneElement(child, { ref: this.props.innerViewRef }) : child));
  });
  jest.spyOn(ScrollView.prototype, 'getInnerViewNode').mockReturnValue(42);
  // Fabric silently ignores numeric tags; only a host ref can supply layout.
  // This models the native boundary, not keyboard visibility on a phone.
  jest.spyOn(View.prototype, 'measureLayout').mockImplementation((parent, done) => {
    if (parent && typeof parent === 'object') done(0, 840, 280, 48);
  });
  const scroll = jest.spyOn(ScrollView.prototype, 'scrollTo');
  async function resizeViewport(height: number) {
    // A native layout event does not bubble to KeyboardAvoidingView.
    await act(async () => {
      screen.getByTestId('workout-scroll-view').props.onLayout?.({
        nativeEvent: { layout: { x: 0, y: 0, width: 320, height } },
      });
    });
  }
  await render(h.view); await logFirst();
  await press('＋ 动作'); await enter('动作名称', '卧推'); await press('保存动作');
  await enter('卧推 次数', '10');
  await press('完成'); await press('先记录');
  await waitFor(() => expect(focused).toEqual(['卧推 次数']));
  expect(scroll).toHaveBeenCalledWith({ y: 816, animated: false });
  const initialLocations = scroll.mock.calls.length;
  // Reopening the keyboard shrinks the viewport after the initial scroll.
  await resizeViewport(345.2);
  expect(scroll).toHaveBeenCalledTimes(initialLocations + 1);
  expect(scroll).toHaveBeenLastCalledWith({ y: 816, animated: false });
  await resizeViewport(300);
  expect(scroll).toHaveBeenCalledTimes(initialLocations + 1);
  expect(screen.getByLabelText('卧推 次数').props.value).toBe('10');
  keyboardVisible.mockReturnValue(false);
  await press('完成'); await press('先记录');
  await waitFor(() => expect(focused).toEqual(['卧推 次数', '卧推 次数']));
  const reopenedLocations = scroll.mock.calls.length;
  expect(reopenedLocations).toBe(initialLocations + 2);
  // A hidden-keyboard layout consumes the pending request without scrolling.
  await resizeViewport(506.8);
  expect(scroll).toHaveBeenCalledTimes(reopenedLocations);
  keyboardVisible.mockReturnValue(true);
  await resizeViewport(345.2);
  expect(scroll).toHaveBeenCalledTimes(reopenedLocations);
  expect(h.save).not.toHaveBeenCalled();
});

test('字段错误只关联提交过的动作，切换语言保留输入，纠正后清除错误', async () => {
  const h = setup();
  await render(h.view); await addFirst();
  await press('＋ 动作'); await enter('动作名称', '卧推'); await press('保存动作');
  expect(screen.queryByText('次数须为 1–999 的整数')).toBeNull();
  await enter('深蹲 次数', '0'); await press('深蹲 记录');
  expect(screen.getByLabelText('深蹲 次数').props.accessibilityHint).toBe('次数须为 1–999 的整数');
  expect(screen.getByLabelText('卧推 次数').props.accessibilityHint).toBeUndefined();
  expect(screen.getAllByText('次数须为 1–999 的整数')).toHaveLength(1);
  await press('EN');
  expect(screen.getByLabelText('深蹲 Reps').props.value).toBe('0');
  expect(screen.getByLabelText('深蹲 Reps').props.accessibilityHint).toBe('Enter a whole number from 1 to 999.');
  await enter('深蹲 Reps', '8');
  expect(screen.getByLabelText('深蹲 Reps').props.accessibilityHint).toBeUndefined();
  expect(screen.queryByText('Enter a whole number from 1 to 999.')).toBeNull();
  expect(h.save).not.toHaveBeenCalled();
});

test('重量错误与该字段关联，改为空恢复选填提示且仍需显式记录', async () => {
  const h = setup(); await render(h.view); await addFirst();
  await enter('深蹲 次数', '8'); await enter('深蹲 重量 · kg', '62.55'); await press('深蹲 记录');
  expect(screen.getByLabelText('深蹲 重量 · kg').props.accessibilityHint)
    .toBe('重量须大于 0、不超过 1000 kg，最多一位小数；也可留空');
  expect(screen.getByLabelText('深蹲 次数').props.accessibilityHint).toBeUndefined();
  await enter('深蹲 重量 · kg', '');
  expect(screen.getByLabelText('深蹲 重量 · kg').props.accessibilityHint).toBe('选填；留空表示未记录负重');
  expect(screen.queryByText('重量须大于 0、不超过 1000 kg，最多一位小数；也可留空')).toBeNull();
  expect(screen.queryByText('— × 8')).toBeNull();
  await press('深蹲 记录'); expect(screen.getByText('— × 8')).toBeTruthy();
});

test('动作名称错误在名称输入旁关联并随语言更新，纠正前不收键盘', async () => {
  const h = setup(); const dismiss = jest.spyOn(Keyboard, 'dismiss');
  await render(h.view); await press('开始'); await press('＋ 动作');
  await enter('动作名称', ' '); await press('保存动作');
  expect(screen.getByLabelText('动作名称').props.accessibilityHint).toBe('动作名称须为 1–80 个字符');
  expect(dismiss).not.toHaveBeenCalled();
  await press('EN');
  expect(screen.getByLabelText('Exercise name').props.accessibilityHint).toBe('Enter an exercise name of 1–80 characters.');
  await enter('Exercise name', '自填卧推');
  expect(screen.getByLabelText('Exercise name').props.accessibilityHint).toBeUndefined();
  expect(screen.queryByText('Enter an exercise name of 1–80 characters.')).toBeNull();
  await press('Save exercise'); expect(screen.getByText('自填卧推')).toBeTruthy();
});

test('未录字段错误随输入跨页面保留，修改已录组的错误取消后不污染下一组', async () => {
  const h = setup();
  function Harness() {
    const [visible, setVisible] = useState(true);
    return <WorkoutProvider repository={h.repository}>
      <Pressable accessibilityRole="button" accessibilityLabel="切页" onPress={() => setVisible(!visible)}><Text>切页</Text></Pressable>
      {visible && <WorkoutScreen onSaved={h.saved} />}
    </WorkoutProvider>;
  }
  await render(<Harness />); await addFirst();
  await enter('深蹲 次数', '0'); await press('深蹲 记录'); await press('切页'); await press('切页');
  expect(screen.getByLabelText('深蹲 次数').props.accessibilityHint).toBe('次数须为 1–999 的整数');
  await enter('深蹲 次数', '8'); await press('深蹲 记录');
  await press('深蹲 第1组 编辑'); await enter('深蹲 次数', '0'); await press('深蹲 保存');
  expect(screen.getByLabelText('深蹲 次数').props.accessibilityHint).toBe('次数须为 1–999 的整数');
  await press('取消');
  expect(screen.getByLabelText('深蹲 次数').props.value).toBe('8');
  expect(screen.getByLabelText('深蹲 次数').props.accessibilityHint).toBeUndefined();
  expect(screen.queryByText('次数须为 1–999 的整数')).toBeNull();
});
