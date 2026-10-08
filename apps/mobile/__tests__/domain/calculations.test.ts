import { test } from '@jest/globals';
import assert from 'node:assert/strict';
import { calculateDurationSeconds, summarizeWorkout } from '../../src/features/workouts/domain/calculations.ts';

test('空草稿汇总为0，有空动作时仍计入动作数，只统计已保存的组', () => {
  assert.deepEqual(summarizeWorkout({ exercises: [] }), { exerciseCount: 0, setCount: 0 });
  assert.deepEqual(summarizeWorkout({ exercises: [{ sets: [] }, { sets: [{}, {}] }] }), { exerciseCount: 2, setCount: 2 });
});

test('时长按秒向下取整，设备时钟回拨返回0，不修改原时间', () => {
  assert.equal(calculateDurationSeconds('2026-09-12T10:00:00.000Z', '2026-09-12T10:01:30.999Z'), 90);
  assert.equal(calculateDurationSeconds('2026-09-12T10:00:00.000Z', '2026-09-12T09:59:00.000Z'), 0);
});

test('无效时间不能转成NaN或虚假训练时长', () => {
  assert.throws(() => calculateDurationSeconds('invalid', '2026-09-12T10:00:00.000Z'), RangeError);
  assert.throws(() => calculateDurationSeconds('2026-09-12T10:00:00.000Z', ''), RangeError);
});

test('不存在的日历日期或非规范UTC时间不能被自动纠正为时长', () => {
  const valid = '2026-02-28T10:00:00.000Z';
  for (const invalid of ['2026-02-30T10:00:00.000Z', '2026-02-28', '2026-02-28T10:00:00+08:00']) {
    assert.throws(() => calculateDurationSeconds(valid, invalid), RangeError);
    assert.throws(() => calculateDurationSeconds(invalid, valid), RangeError);
  }
});
