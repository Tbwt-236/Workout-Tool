import { test } from '@jest/globals';
import assert from 'node:assert/strict';
import { buildHistoryCalendar, shiftCalendarMonth, type HistoryCalendarMonth,
  type CalendarMonth, type HistoryCalendarOptions } from '../../src/features/workouts/application/history-calendar.ts';

const september = { year: 2026, month: 9, timeZone: 'Asia/Hong_Kong' };
function entry(id: number, completedAt: string) { return { id, completedAt, label: `我的动作 ${id}` }; }
function idsAt(calendar: HistoryCalendarMonth<ReturnType<typeof entry>>, dateKey: string) {
  const day = calendar.cells.find(cell => cell?.dateKey === dateKey);
  assert.ok(day, `Missing date ${dateKey}`);
  return day.workouts.map(workout => workout.id);
}

test('按明确时区分日，跨UTC午夜及月界不能漏记录或改写完成时间', () => {
  const workouts = [
    entry(1, '2026-09-15T15:59:59.999Z'),
    entry(2, '2026-09-15T16:00:00.000Z'),
    entry(3, '2026-08-31T16:00:00.000Z'),
  ];
  const before = structuredClone(workouts);
  const hongKong = buildHistoryCalendar(workouts, september);
  assert.deepEqual(idsAt(hongKong, '2026-09-01'), [3]);
  assert.deepEqual(idsAt(hongKong, '2026-09-15'), [1]);
  assert.deepEqual(idsAt(hongKong, '2026-09-16'), [2]);
  const utc = buildHistoryCalendar(workouts, { ...september, timeZone: 'UTC' });
  assert.deepEqual(idsAt(utc, '2026-09-01'), []);
  assert.deepEqual(idsAt(utc, '2026-09-15'), [2, 1]);
  assert.deepEqual(workouts, before);
});

test('同日多场按完成时间倒序，同时间按ID倒序稳定排列并保留原内容', () => {
  const workouts = Object.freeze([
    Object.freeze(entry(7, '2026-09-15T01:00:00.000Z')),
    Object.freeze(entry(2, '2026-09-15T03:00:00.000Z')),
    Object.freeze(entry(4, '2026-09-15T03:00:00.000Z')),
  ]);
  const calendar = buildHistoryCalendar(workouts, september);
  assert.deepEqual(idsAt(calendar, '2026-09-15'), [4, 2, 7]);
  assert.deepEqual(workouts.map(w => w.id), [7, 2, 4]);
  const day = calendar.cells.find(cell => cell?.dateKey === '2026-09-15');
  assert.ok(day);
  assert.equal(day.workouts[0], workouts[2]);
  assert.equal(day.workouts[0].label, '我的动作 4');
});

test('周一或周日开头只改变月历占位，空日期仍是可选择的真实日期', () => {
  const monday = buildHistoryCalendar([], september);
  assert.equal(monday.weekStartsOn, 'monday');
  assert.equal(monday.cells.length, 35);
  assert.equal(monday.cells[0], null);
  assert.deepEqual(monday.cells[1], { dateKey: '2026-09-01', day: 1, workouts: [] });
  assert.deepEqual(monday.cells[30], { dateKey: '2026-09-30', day: 30, workouts: [] });
  assert.deepEqual(monday.cells.slice(31), [null, null, null, null]);
  const sunday = buildHistoryCalendar([], { ...september, weekStartsOn: 'sunday' });
  assert.equal(sunday.weekStartsOn, 'sunday');
  assert.deepEqual(sunday.cells.slice(0, 2), [null, null]);
  assert.equal(sunday.cells[2]?.dateKey, '2026-09-01');
  assert.deepEqual(monday.cells.filter(Boolean), sunday.cells.filter(Boolean));
});

test('月长与闰年正确，网格按需生成4至6周而不吞掉月末', () => {
  for (const [year, month, dayCount, cellCount] of [
    [2024, 2, 29, 35], [2025, 2, 28, 35], [2100, 2, 28, 28],
    [2000, 2, 29, 35], [2021, 2, 28, 28], [2026, 8, 31, 42],
  ]) {
    const calendar = buildHistoryCalendar([], { year, month, timeZone: 'UTC' });
    const days = calendar.cells.filter(cell => cell !== null);
    assert.equal(days.length, dayCount, `${year}-${month} days`);
    assert.equal(calendar.cells.length, cellCount, `${year}-${month} grid`);
    assert.equal(days[0].day, 1);
    assert.equal(days.at(-1)?.day, dayCount);
  }
});

test('切月使用年月运算，跨年且不受当前日31日溢出影响', () => {
  const december = Object.freeze({ year: 2026, month: 12 });
  assert.deepEqual(shiftCalendarMonth(december, 1), { year: 2027, month: 1 });
  assert.deepEqual(shiftCalendarMonth({ year: 2026, month: 1 }, -1), { year: 2025, month: 12 });
  assert.deepEqual(shiftCalendarMonth({ year: 2026, month: 3 }, -1), { year: 2026, month: 2 });
  assert.deepEqual(december, { year: 2026, month: 12 });
});

test('非法年月不能被自动纠正成另一个月份，切月不能越过支持边界', () => {
  const invalid: CalendarMonth[] = [
    { year: 0, month: 1 }, { year: 10000, month: 1 }, { year: 2026.5, month: 1 },
    { year: NaN, month: 1 }, { year: 2026, month: 0 }, { year: 2026, month: 13 },
    { year: 2026, month: 1.5 }, { year: 2026, month: Infinity },
  ];
  for (const month of invalid) {
    assert.throws(() => buildHistoryCalendar([], { ...month, timeZone: 'UTC' }), RangeError);
    assert.throws(() => shiftCalendarMonth(month, 1), RangeError);
  }
  assert.throws(() => shiftCalendarMonth({ year: 1, month: 1 }, -1), RangeError);
  assert.throws(() => shiftCalendarMonth({ year: 9999, month: 12 }, 1), RangeError);
  assert.throws(() => shiftCalendarMonth({ year: 2026, month: 9 }, 0 as 1), RangeError);
});

test('调用方必须提供有效时区与周起始，不能偷偷使用运行机器的时区', () => {
  for (const timeZone of [undefined, '', ' ', 'Mars/Olympus']) {
    assert.throws(() => buildHistoryCalendar([], { ...september, timeZone } as HistoryCalendarOptions), RangeError);
  }
  assert.throws(() => buildHistoryCalendar([], { ...september, weekStartsOn: 'tuesday' } as unknown as HistoryCalendarOptions), RangeError);
});

test('非规范或不存在的完成日期不能被悄悄纠正或忽略为无训练', () => {
  for (const completedAt of [
    '2026-02-30T10:00:00.000Z', '2026-09-15', '2026-09-15T10:00:00+08:00',
    'invalid', '0000-01-01T00:00:00.000Z', '+010000-01-01T00:00:00.000Z',
  ]) {
    assert.throws(() => buildHistoryCalendar([entry(1, completedAt)], september), RangeError);
  }
});

test('无效或重复记录ID不能生成不可正确打开的日期标记', () => {
  for (const id of [0, -1, 1.5, NaN, Number.MAX_SAFE_INTEGER + 1]) {
    assert.throws(() => buildHistoryCalendar([entry(id, '2026-09-15T10:00:00.000Z')], september), RangeError);
  }
  assert.throws(() => buildHistoryCalendar([
    entry(1, '2026-09-15T10:00:00.000Z'), entry(1, '2026-08-01T10:00:00.000Z'),
  ], september), RangeError);
});

test('夏令时回拨的两个同名钟点仍按真实完成时间排序，不把前一天并入', () => {
  const calendar = buildHistoryCalendar([
    entry(1, '2026-11-01T05:30:00.000Z'),
    entry(2, '2026-11-01T06:30:00.000Z'),
    entry(3, '2026-11-01T03:59:59.999Z'),
    entry(4, '2026-11-01T04:00:00.000Z'),
  ], { year: 2026, month: 11, timeZone: 'America/New_York' });
  assert.deepEqual(idsAt(calendar, '2026-11-01'), [2, 1, 4]);
});

test('删除后重新投影更新当天标记，其他日期和之前的日历快照不受影响', () => {
  const workouts = [
    entry(1, '2026-09-15T01:00:00.000Z'), entry(2, '2026-09-15T02:00:00.000Z'),
    entry(3, '2026-09-13T01:00:00.000Z'),
  ];
  const before = buildHistoryCalendar(workouts, september);
  const afterOne = buildHistoryCalendar(workouts.filter(w => w.id !== 1), september);
  const afterAll = buildHistoryCalendar(workouts.filter(w => w.id === 3), september);
  assert.deepEqual(idsAt(before, '2026-09-15'), [2, 1]);
  assert.deepEqual(idsAt(afterOne, '2026-09-15'), [2]);
  assert.deepEqual(idsAt(afterAll, '2026-09-15'), []);
  assert.deepEqual(idsAt(afterAll, '2026-09-13'), [3]);
});

test('小于100年的年份不被Date构造器改为1900年代，本地日期越界应明确拒绝', () => {
  const calendar = buildHistoryCalendar([entry(1, '0099-01-01T10:00:00.000Z')], { year: 99, month: 1, timeZone: 'UTC' });
  assert.deepEqual(idsAt(calendar, '0099-01-01'), [1]);
  assert.throws(() => buildHistoryCalendar([entry(1, '0001-01-01T00:00:00.000Z')], {
    year: 1, month: 12, timeZone: 'Etc/GMT+1',
  }), RangeError);
});
