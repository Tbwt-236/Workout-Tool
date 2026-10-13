import type { WorkoutLocale } from './workout-copy';
import type { ExportError } from '../features/data-control/application/export-service';
export function getDataCopy(locale: WorkoutLocale) {
  const zh = locale === 'zh';
  return {
    title: zh ? '数据' : 'Data', close: zh ? '关闭' : 'Close', completed: zh ? '已完成训练' : 'Completed workouts',
    unit: (n: number) => zh ? '场训练' : n === 1 ? 'workout' : 'workouts',
    all: zh ? '全部训练' : 'All workouts', scope: zh ? '明文 JSON · 不含进行中的训练与未记录输入。' : 'Plain-text JSON · Excludes your current workout and unlogged input.',
    export: zh ? '导出' : 'Export', preparing: zh ? '准备中…' : 'Preparing…', retry: zh ? '重试' : 'Retry',
    loading: zh ? '读取中…' : 'Loading…', loadFailed: zh ? '暂时无法读取训练数量' : 'Could not load workout count',
    empty: zh ? '完成一次训练后即可导出。' : 'Finish a workout to enable export.',
    local: zh ? '本机存储 · 无需账号' : 'On this device · No account', more: zh ? '数据说明' : 'Data details',
    details: zh ? [
      ['内容与用途', '日期、动作、组数、次数和重量，用于记录与回顾训练。'],
      ['本机与备份', '无需账号，数据保存在本机。系统备份取决于设备设置。'],
      ['删除', '在训练详情中删除。已保存或发出的副本不会随之撤回。'],
      ['文件', 'JSON 可自行保管，当前不支持导入恢复。保存结果请在接收应用确认。'],
      ['临时文件', '下次启动或导出时，尝试清理超过 24 小时的临时副本。系统也可能提前清除；需要时可重新导出。'],
    ] : [
      ['Content and use', 'Dates, exercises, sets, reps and weights, for logging and reviewing workouts.'],
      ['Storage and backup', 'Stored on this device. No account needed. System backups depend on device settings.'],
      ['Delete', 'Delete from workout details. Copies already saved or shared are not removed.'],
      ['File', 'Keep the JSON copy yourself. Import and restore are not supported yet. Check the receiving app to confirm saving.'],
      ['Temporary files', 'On the next launch or export, cleanup is attempted for copies older than 24 hours. The system may clear them earlier; export again if needed.'],
    ],
    error: (code: ExportError) => ({
      Busy: zh ? '数据正在处理中，请重试。' : 'Data is busy. Retry.',
      Empty: zh ? '还没有已完成训练。' : 'No completed workouts yet.',
      ReadFailed: zh ? '未能读取训练，请重试。' : 'Could not read workouts. Retry.',
      WriteFailed: zh ? '未能生成文件，请重试。' : 'Could not create the file. Retry.',
      SharingUnavailable: zh ? '此设备暂不支持分享。' : 'Sharing is unavailable on this device.',
      ShareFailed: zh ? '未能打开分享，请重试。仍失败可重启 App。' : 'Could not open sharing. Retry, or restart the app if it persists.',
    }[code]),
  };
}
