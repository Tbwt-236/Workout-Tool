import { test } from '@jest/globals';
import assert from 'node:assert/strict';
import { parseExerciseName, parseReps, parseWeightKg } from '../../src/features/workouts/domain/validation.ts';
import type { ValidationResult } from '../../src/features/workouts/domain/types.ts';

function rejects(result: ValidationResult<unknown>, field: string, code: string) {
  assert.deepEqual(result, { ok: false, field, code });
}

test('动作名去除首尾空白，保留名称内部文字', () => {
  assert.deepEqual(parseExerciseName('  杠铃 深蹲  '), { ok: true, value: '杠铃 深蹲' });
});

test('动作名允许1和80个Unicode码点，拒绝空白、81字符及非文本', () => {
  for (const input of ['蹲', '蹲'.repeat(80), '🏋'.repeat(80)]) {
    assert.deepEqual(parseExerciseName(input), { ok: true, value: input });
  }
  for (const input of ['', ' \n\t ', '蹲'.repeat(81), '🏋'.repeat(81), null, 8, {}]) {
    rejects(parseExerciseName(input), 'name', 'InvalidExerciseName');
  }
});

test('次数接受1到999整数并规范化十进制表单输入', () => {
  for (const [input, expected] of [[1, 1], [999, 999], [' 08 ', 8], ['999', 999]] as const) {
    assert.deepEqual(parseReps(input), { ok: true, value: expected });
  }
});

test('次数拒绝零、负数、小数、溢出、非有限值和非十进制写法', () => {
  for (const input of [0, -1, 1.5, 1000, NaN, Infinity, '', ' ', '1.5', '1e2', '0x10', '8次', null, true, [], {}]) {
    rejects(parseReps(input), 'reps', 'InvalidReps');
  }
});

test('未填写重量表示未记录负重，不转为零', () => {
  for (const input of ['', '  ', null, undefined]) {
    assert.deepEqual(parseWeightKg(input), { ok: true, value: null });
  }
});

test('公斤精确转换为十分之一公斤整数并接受边界', () => {
  for (const [input, expected] of [['62.5', 625], [' 0.1 ', 1], ['.5', 5], ['1000.0', 10000], [8.2, 82], [1000, 10000]] as const) {
    assert.deepEqual(parseWeightKg(input), { ok: true, value: expected });
  }
});

test('重量拒绝零、负数、过大、两位小数及非有限/非十进制值', () => {
  for (const input of [0, -1, 1000.1, 62.55, NaN, Infinity, '0', '-1', '62.55', '1.00', '1e2', '0x10', '8kg', false, [], {}]) {
    rejects(parseWeightKg(input), 'weightKg', 'InvalidWeight');
  }
});
