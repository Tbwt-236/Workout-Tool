import type { WorkoutFeedback } from '../features/workouts/application/workout-reducer.ts';
import type { ValidationCode } from '../features/workouts/domain/types.ts';
export type WorkoutLocale = 'zh' | 'en';

const zh = {
  log: '记录', finish: '完成', start: '开始', continue: '继续', save: '保存',
  edit: '编辑', rename: '改名', remove: '删除', cancel: '取消', retry: '重试',
  history: '历史', exercise: '动作', addExercise: '＋ 动作', reps: '次数',
  weight: '重量 · kg', optionalWeight: '选填；留空表示未记录负重',
  confirmFinish: '完成训练？', confirmCancel: '取消训练？', confirmRemoveSet: '删除这组？',
  confirmRemoveWorkout: '删除这次训练？', noHistory: '还没有训练记录',
  exerciseNotFound: '动作不存在，请重新选择', setNotFound: '该组不存在，请重新选择',
  saveFailed: '尚未保存，当前训练仍保留，请重试',
} as const;

type WorkoutCopy = { readonly [K in keyof typeof zh]: string };
const en: WorkoutCopy = {
  log: 'Log', finish: 'Finish', start: 'Start', continue: 'Continue', save: 'Save',
  edit: 'Edit', rename: 'Rename', remove: 'Delete', cancel: 'Cancel', retry: 'Retry',
  history: 'History', exercise: 'Exercise', addExercise: '+ Exercise', reps: 'Reps',
  weight: 'Weight · kg', optionalWeight: 'Optional; blank means no weight recorded',
  confirmFinish: 'Finish workout?', confirmCancel: 'Cancel workout?', confirmRemoveSet: 'Delete this set?',
  confirmRemoveWorkout: 'Delete this workout?', noHistory: 'No workouts yet',
  exerciseNotFound: 'Exercise not found. Select another.', setNotFound: 'Set not found. Select another.',
  saveFailed: 'Not saved. Your workout is kept in this session. Retry.',
};

const validationCopy = {
  zh: {
    InvalidWorkout: '训练内容无效，请检查动作和组数',
    InvalidStartedAt: '开始时间无效，请重新开始训练',
    InvalidExercise: '动作内容无效，请检查该动作',
    InvalidExerciseKey: '无法识别该动作，请重试',
    InvalidExercisePosition: '动作顺序无效，请检查该动作',
    InvalidExerciseName: '动作名称须为 1–80 个字符',
    InvalidSet: '训练组内容无效，请检查该组',
    InvalidSetKey: '无法识别该组，请重试',
    InvalidSetPosition: '训练组顺序无效，请检查该组',
    InvalidReps: '次数须为 1–999 的整数',
    InvalidWeight: '重量须大于 0、不超过 1000 kg，最多一位小数；也可留空',
    EmptyWorkout: '至少记录一组后再完成',
    InvalidAttempt: '无法保存训练，请重试',
    InvalidCompletedAt: '完成时间无效，请重试',
  },
  en: {
    InvalidWorkout: 'Check the exercises and sets in this workout.',
    InvalidStartedAt: 'Invalid start time. Start the workout again.',
    InvalidExercise: 'Check this exercise.',
    InvalidExerciseKey: 'Cannot identify this exercise. Retry.',
    InvalidExercisePosition: 'Check the exercise order.',
    InvalidExerciseName: 'Enter an exercise name of 1–80 characters.',
    InvalidSet: 'Check this set.',
    InvalidSetKey: 'Cannot identify this set. Retry.',
    InvalidSetPosition: 'Check the set order.',
    InvalidReps: 'Enter a whole number from 1 to 999.',
    InvalidWeight: 'Use more than 0 and up to 1000 kg, with at most one decimal, or leave blank.',
    EmptyWorkout: 'Log at least one set before finishing.',
    InvalidAttempt: 'Cannot save this workout. Retry.',
    InvalidCompletedAt: 'Invalid finish time. Retry.',
  },
} as const satisfies Record<WorkoutLocale, Record<ValidationCode, string>>;

export function getWorkoutCopy(locale: WorkoutLocale = 'zh'): WorkoutCopy {
  return locale === 'zh' ? zh : en;
}

export function formatCount(locale: WorkoutLocale, kind: 'sets' | 'exercises', count: number): string {
  if (locale === 'zh') return `${count} ${kind === 'sets' ? '组' : '个动作'}`;
  return `${count} ${count === 1 ? (kind === 'sets' ? 'set' : 'exercise') : kind}`;
}

// Display-only projection: no workout events, state changes, or locale stored in the draft.
export function feedbackMessage(locale: WorkoutLocale, feedback: WorkoutFeedback | null): string {
  if (!feedback) return '';
  if (feedback.code === 'ValidationError') return validationCopy[locale][feedback.reason];
  const copy = getWorkoutCopy(locale);
  if (feedback.code === 'StorageUnavailable') return copy.saveFailed;
  return feedback.target === 'exercise' ? copy.exerciseNotFound : copy.setNotFound;
}
